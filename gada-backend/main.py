from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Body, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os, uuid, shutil, secrets, time
from datetime import datetime, timedelta
from dotenv import load_dotenv
from pathlib import Path
import re
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import logging

# Load environment variables from .env next to this file
load_dotenv(dotenv_path=Path(__file__).parent / '.env')

import auth, models, schemas, database

# Optional automatic table creation (disable with AUTO_CREATE=0 when migrations in place)
if os.getenv("AUTO_CREATE", "1") == "1":
    models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

logger = logging.getLogger("gada")
logging.basicConfig(level=logging.INFO)

# Ensure uploads directory exists and mount static
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount('/uploads', StaticFiles(directory=UPLOAD_DIR), name='uploads')

# CORS Middleware
FRONTEND_ORIGINS = os.getenv("FRONTEND_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET","POST","PUT","PATCH","DELETE"],
    allow_headers=["Authorization","Content-Type"],
)

@app.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    if not user.email:
        raise HTTPException(status_code=400, detail="Email is required")
    db_user = db.query(models.User).filter((models.User.username == user.username) | (models.User.email == user.email)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    pw_errors = auth.password_strength_errors(user.password)
    if pw_errors:
        raise HTTPException(status_code=400, detail=f"Weak password, need: {', '.join(pw_errors)}")
    hashed_password = auth.get_password_hash(user.password)
    # Auto-approve admins; regular users require approval
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role,
        approved=(user.role == 'admin')
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

LOGIN_SCOPE = "login"
VERIFY_SCOPE = "verify"
RESET_SCOPE = "reset"
RATE_LIMIT_DEFS = {
    LOGIN_SCOPE: {"window_sec": 60, "max": 5},            # 5 login attempts / 60s per ip+username
    VERIFY_SCOPE: {"window_sec": 3600, "max": 6},         # 6 verification requests / hour
    RESET_SCOPE: {"window_sec": 3600, "max": 3},          # 3 password reset requests / hour
}

def _rate_limit(db: Session, scope: str, identifier: str):
    cfg = RATE_LIMIT_DEFS[scope]
    window = cfg["window_sec"]
    max_allowed = cfg["max"]
    now_dt = datetime.utcnow()
    window_start = now_dt - timedelta(seconds=window)
    row = db.query(models.RateLimit).filter(
        models.RateLimit.scope == scope,
        models.RateLimit.identifier == identifier,
        models.RateLimit.window_start >= window_start
    ).order_by(models.RateLimit.id.desc()).first()
    if row and row.count >= max_allowed:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    if not row or row.window_start < window_start:
        row = models.RateLimit(scope=scope, identifier=identifier, window_start=now_dt, count=1)
        db.add(row)
    else:
        row.count += 1
    db.commit()

REFRESH_COOKIE_NAME = "refresh_token"
REFRESH_COOKIE_PATH = "/token"
REFRESH_COOKIE_SECURE = False  # set True when using HTTPS

EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS = 24
PASSWORD_RESET_TOKEN_EXPIRE_HOURS = 24

# --- Email (SMTP) configuration ---
SMTP_HOST = os.getenv('SMTP_HOST')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SMTP_USER = os.getenv('SMTP_USER')
SMTP_PASS = os.getenv('SMTP_PASS')
SMTP_FROM = os.getenv('SMTP_FROM', SMTP_USER or 'no-reply@example.com')
SMTP_SSL = os.getenv('SMTP_SSL', '0') == '1'  # if 1, use SMTPS (port 465)

def _send_email(to_email: str, subject: str, body: str):
    if not SMTP_HOST or not SMTP_USER or not SMTP_PASS:
        logger.warning("SMTP not configured; skipping email to %s: %s", to_email, subject)
        return
    import smtplib
    from email.message import EmailMessage
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = SMTP_FROM
    msg['To'] = to_email
    msg.set_content(body)
    try:
        if SMTP_SSL:
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=20) as server:
                server.login(SMTP_USER, SMTP_PASS)
                server.send_message(msg)
        else:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as server:
                server.ehlo()
                try:
                    server.starttls()
                    server.ehlo()
                except smtplib.SMTPException:
                    # If STARTTLS not supported, continue without TLS (some local dev servers)
                    pass
                server.login(SMTP_USER, SMTP_PASS)
                server.send_message(msg)
        logger.info("Sent email to %s: %s", to_email, subject)
    except Exception as e:
        logger.error("Failed to send email: %s", e)

@app.post("/token", response_model=schemas.AccessToken)
def login_for_access_token(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db), request: Request = None):
    client_ip = request.client.host if request and request.client else 'ip'
    _rate_limit(db, LOGIN_SCOPE, f"{client_ip}:{form_data.username}")
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.approved:
        raise HTTPException(status_code=403, detail="Account not yet approved")
    if not user.email_verified:
        # Auto-fail with clear message
        raise HTTPException(status_code=403, detail="Email not verified")
    access_token = auth.create_access_token(data={"sub": user.username, "role": user.role})
    refresh_raw = auth.generate_refresh_token()
    rt = models.RefreshToken(user_id=user.id, token=auth.hash_refresh_token(refresh_raw), expires_at=datetime.utcnow() + timedelta(days=auth.REFRESH_TOKEN_EXPIRE_DAYS))
    db.add(rt)
    db.commit()
    # HttpOnly cookie for refresh
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_raw,
        httponly=True,
        secure=REFRESH_COOKIE_SECURE,
        samesite="lax",
        path=REFRESH_COOKIE_PATH,
        max_age=auth.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post('/token/refresh', response_model=schemas.AccessToken)
def refresh_token(response: Response, request: Request, db: Session = Depends(database.get_db)):
    refresh_raw = request.cookies.get(REFRESH_COOKIE_NAME)
    if not refresh_raw:
        raise HTTPException(status_code=401, detail='Missing refresh token cookie')
    hashed = auth.hash_refresh_token(refresh_raw)
    token_row = db.query(models.RefreshToken).filter(models.RefreshToken.token == hashed, models.RefreshToken.revoked == False).first()
    if not token_row or token_row.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail='Invalid refresh token')
    user = db.query(models.User).filter(models.User.id == token_row.user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail='Invalid refresh token')
    access_token = auth.create_access_token(data={"sub": user.username, "role": user.role})
    # rotate refresh
    token_row.revoked = True
    new_refresh = auth.generate_refresh_token()
    db.add(models.RefreshToken(user_id=user.id, token=auth.hash_refresh_token(new_refresh), expires_at=datetime.utcnow() + timedelta(days=auth.REFRESH_TOKEN_EXPIRE_DAYS)))
    db.commit()
    # Set rotated cookie
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=new_refresh,
        httponly=True,
        secure=REFRESH_COOKIE_SECURE,
        samesite="lax",
        path=REFRESH_COOKIE_PATH,
        max_age=auth.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post('/token/logout')
def logout(response: Response, request: Request, db: Session = Depends(database.get_db)):
    refresh_raw = request.cookies.get(REFRESH_COOKIE_NAME)
    if refresh_raw:
        hashed = auth.hash_refresh_token(refresh_raw)
        row = db.query(models.RefreshToken).filter(models.RefreshToken.token == hashed, models.RefreshToken.revoked == False).first()
        if row:
            row.revoked = True
            db.commit()
    response.delete_cookie(REFRESH_COOKIE_NAME, path=REFRESH_COOKIE_PATH)
    return {"detail": "Logged out"}

@app.post('/email/send-verification')
def send_email_verification(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db), request: Request = None):
    if request and request.client:
        _rate_limit(db, VERIFY_SCOPE, f"{request.client.host}:{current_user.id}")
    if current_user.email_verified:
        return {"detail": "Already verified"}
    # Generate a 6-digit code instead of a long token
    current_user.email_verification_token = f"{secrets.randbelow(900000) + 100000}"
    current_user.email_verification_sent_at = datetime.utcnow()
    db.commit()
    # Send email with code
    _send_email(
        to_email=current_user.email,
        subject="Verify your email",
        body=f"Your verification code is: {current_user.email_verification_token}\nIt expires in {EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS} hours."
    )
    resp = {"detail": "Verification email sent"}
    # In local dev without SMTP configured, expose code to unblock testing
    if not SMTP_HOST or not SMTP_USER or not SMTP_PASS:
        resp["dev_code"] = current_user.email_verification_token
    return resp

@app.post('/email/send-verification-login')
def send_email_verification_login(payload: schemas.EmailVerificationAuthRequest, db: Session = Depends(database.get_db), request: Request = None):
    user = db.query(models.User).filter(models.User.username == payload.username).first()
    # Validate credentials silently
    if not user or not auth.verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail='Invalid credentials')
    if user.email_verified:
        return {"detail": "Already verified"}
    if request and request.client:
        _rate_limit(db, VERIFY_SCOPE, f"{request.client.host}:{user.id}")
    user.email_verification_token = f"{secrets.randbelow(900000) + 100000}"
    user.email_verification_sent_at = datetime.utcnow()
    db.commit()
    _send_email(
        to_email=user.email,
        subject="Verify your email",
        body=f"Your verification code is: {user.email_verification_token}\nIt expires in {EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS} hours."
    )
    resp = {"detail": "Verification email sent"}
    if not SMTP_HOST or not SMTP_USER or not SMTP_PASS:
        resp["dev_code"] = user.email_verification_token
    return resp

@app.post('/email/verify')
def verify_email(payload: schemas.EmailVerificationRequest, db: Session = Depends(database.get_db), request: Request = None):
    # Optional: rate limit verification attempts per IP
    if request and request.client:
        _rate_limit(db, VERIFY_SCOPE, f"{request.client.host}:verify")
    # Optionally narrow by username/email to avoid matching a reused code across different users
    query = db.query(models.User).filter(models.User.email_verification_token == payload.token)
    if payload.username:
        query = query.filter(models.User.username == payload.username)
    if payload.email:
        query = query.filter(models.User.email == payload.email)
    user = query.first()
    if not user:
        raise HTTPException(status_code=400, detail='Invalid token')
    if user.email_verified:
        return {"detail": "Already verified"}
    if not user.email_verification_sent_at or user.email_verification_sent_at + timedelta(hours=EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS) < datetime.utcnow():
        raise HTTPException(status_code=400, detail='Verification token expired, request a new one')
    user.email_verified = True
    user.email_verification_token = None
    user.email_verification_sent_at = None
    db.commit()
    return {"detail": "Email verified"}

@app.post('/password/reset-request')
def password_reset_request(payload: schemas.PasswordResetRequest, db: Session = Depends(database.get_db), request: Request = None):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if request and request.client:
        ident = f"{request.client.host}:{payload.email}"
        _rate_limit(db, RESET_SCOPE, ident)
    if not user:
        # Do not reveal existence
        return {"detail": "If that email exists, a reset was created"}
    user.password_reset_token = secrets.token_urlsafe(48)
    user.password_reset_sent_at = datetime.utcnow()
    db.commit()
    return {"detail": "Reset token generated", "token": user.password_reset_token}

@app.post('/password/reset-perform')
def password_reset_perform(payload: schemas.PasswordResetPerform, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.password_reset_token == payload.token).first()
    if not user:
        raise HTTPException(status_code=400, detail='Invalid token')
    if not user.password_reset_sent_at or user.password_reset_sent_at + timedelta(hours=PASSWORD_RESET_TOKEN_EXPIRE_HOURS) < datetime.utcnow():
        raise HTTPException(status_code=400, detail='Password reset token expired, request a new one')
    pw_errors = auth.password_strength_errors(payload.new_password)
    if pw_errors:
        raise HTTPException(status_code=400, detail=f"Weak password, need: {', '.join(pw_errors)}")
    user.hashed_password = auth.get_password_hash(payload.new_password)
    user.password_reset_token = None
    user.password_reset_sent_at = None
    db.commit()
    return {"detail": "Password reset successful"}

@app.get("/users/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.get("/")
def read_root():
    return {"message": "Gada Backend API is running!"}

@app.get('/health')
def health():
    return {"status": "ok"}


# --- POST endpoint for admin to create posts ---
@app.post("/posts", response_model=schemas.Post)
def create_post(
    post: schemas.PostCreate,
    db: Session = Depends(database.get_db),
    current_admin: models.User = Depends(auth.get_current_admin)
):
    db_post = models.Post(
        title=post.title,
        date=post.date,
        details=post.details,
        image=post.image,
        status=post.status or 'draft'
    )
    # optional publish_at string to datetime
    if post.publish_at:
        try:
            from datetime import datetime
            db_post.publish_at = datetime.fromisoformat(post.publish_at)
        except ValueError:
            raise HTTPException(status_code=400, detail='Invalid publish_at format (use ISO8601)')
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

ALLOWED_EXTS = {'.png', '.jpg', '.jpeg', '.gif', '.webp'}
MAX_IMAGE_BYTES = 4 * 1024 * 1024  # 4MB

@app.post('/upload-image')
def upload_image(
    file: UploadFile = File(...),
    current_admin: models.User = Depends(auth.get_current_admin)
):
    # Basic content-type check
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail='Only image uploads allowed')
    ext = os.path.splitext(file.filename)[1].lower() or '.img'
    if ext not in ALLOWED_EXTS:
        raise HTTPException(status_code=400, detail='Extension not allowed')
    # Read first bytes to enforce size (stream copy with limit)
    size = 0
    filename = f"{uuid.uuid4().hex}{ext}"
    dest_path = os.path.join(UPLOAD_DIR, filename)
    with open(dest_path, 'wb') as out_file:
        chunk = file.file.read(1024 * 1024)
        while chunk:
            size += len(chunk)
            if size > MAX_IMAGE_BYTES:
                out_file.close()
                os.remove(dest_path)
                raise HTTPException(status_code=400, detail='File too large (max 4MB)')
            out_file.write(chunk)
            chunk = file.file.read(1024 * 1024)
    # Return relative URL path
    return { 'filename': filename, 'url': f"/uploads/{filename}" }

@app.get("/posts", response_model=schemas.PostList)
def read_posts(
    db: Session = Depends(database.get_db),
    skip: int = 0,
    limit: int = 50,
    search: str | None = None,
    status: str | None = None,
    sort: str | None = None,
    current_user: models.User | None = Depends(auth.get_current_user_optional)
):
    # Non-admin users see only published posts (status=published and publish_at <= now OR no publish_at but status=published)
    from datetime import datetime
    query = db.query(models.Post)
    if not current_user or current_user.role != 'admin':
        now = datetime.utcnow()
        query = query.filter(
            (models.Post.status == 'published') & (
                (models.Post.publish_at == None) | (models.Post.publish_at <= now)
            )
        )
    if status and status != 'all':
        query = query.filter(models.Post.status == status)
    if search:
        like = f"%{search}%"
        query = query.filter(models.Post.title.ilike(like) | models.Post.details.ilike(like))
    total = query.count()
    # Sorting: created_at desc (default), or created_at asc, or publish_at asc/desc
    if sort == 'created_asc':
        query = query.order_by(models.Post.id.asc())
    elif sort == 'publish_at_asc':
        from sqlalchemy import asc
        query = query.order_by(models.Post.publish_at.asc().nullslast(), models.Post.id.desc())
    elif sort == 'publish_at_desc':
        from sqlalchemy import desc
        query = query.order_by(models.Post.publish_at.desc().nullslast(), models.Post.id.desc())
    else:
        query = query.order_by(models.Post.id.desc())
    posts = query.offset(skip).limit(min(limit, 100)).all()
    return {"total": total, "items": posts}

@app.post('/tasks/publish-scheduled')
def publish_scheduled(db: Session = Depends(database.get_db), current_admin: models.User = Depends(auth.get_current_admin)):
    """Flip scheduled posts whose publish_at <= now to published. Returns count updated."""
    from datetime import datetime
    now = datetime.utcnow()
    q = db.query(models.Post).filter(models.Post.status == 'scheduled', models.Post.publish_at != None, models.Post.publish_at <= now)
    count = 0
    for post in q.all():
        post.status = 'published'
        count += 1
    db.commit()
    return {"updated": count}

@app.post('/tasks/backfill-post-status')
def backfill_post_status(db: Session = Depends(database.get_db), current_admin: models.User = Depends(auth.get_current_admin)):
    """Set status='published' for posts with NULL status (legacy rows)."""
    q = db.query(models.Post).filter(models.Post.status == None)
    count = 0
    for post in q.all():
        post.status = 'published'
        count += 1
    db.commit()
    return {"updated": count}

# --- Scheduler for auto-publishing scheduled posts ---
_scheduler: BackgroundScheduler | None = None

def _auto_publish_job():
    from datetime import datetime
    db = next(database.get_db())
    try:
        now = datetime.utcnow()
        q = db.query(models.Post).filter(models.Post.status == 'scheduled', models.Post.publish_at != None, models.Post.publish_at <= now)
        changed = 0
        for post in q.all():
            post.status = 'published'
            changed += 1
        if changed:
            db.commit()
            logger.info("Auto-published %d scheduled posts", changed)
    finally:
        db.close()

def _cleanup_refresh_tokens_job():
    db = next(database.get_db())
    try:
        now = datetime.utcnow()
        q = db.query(models.RefreshToken).filter((models.RefreshToken.expires_at < now) | (models.RefreshToken.revoked == True))
        # Limit deletion batch to avoid long locks
        stale = q.limit(500).all()
        if stale:
            for row in stale:
                db.delete(row)
            db.commit()
            logger.info("Cleanup removed %d stale refresh tokens", len(stale))
    finally:
        db.close()

@app.on_event("startup")
def _start_scheduler():
    global _scheduler
    if os.getenv('DISABLE_SCHEDULER') == '1':
        return
    if _scheduler is None:
        _scheduler = BackgroundScheduler()
        _scheduler.start()
        _scheduler.add_job(_auto_publish_job, IntervalTrigger(minutes=1), id='auto_publish', replace_existing=True)
    _scheduler.add_job(_cleanup_refresh_tokens_job, IntervalTrigger(minutes=30), id='cleanup_refresh_tokens', replace_existing=True)

@app.on_event("shutdown")
def _stop_scheduler():
    global _scheduler
    if os.getenv('DISABLE_SCHEDULER') == '1':
        return
    if _scheduler:
        _scheduler.shutdown(wait=False)
        _scheduler = None

@app.get("/users", response_model=schemas.UserList)
def read_users(
    db: Session = Depends(database.get_db),
    current_admin: models.User = Depends(auth.get_current_admin),
    skip: int = 0,
    limit: int = 50,
    search: str | None = None
):
    query = db.query(models.User)
    if search:
        like = f"%{search}%"
        query = query.filter(models.User.username.ilike(like) | models.User.email.ilike(like))
    total = query.count()
    users = query.order_by(models.User.id.desc()).offset(skip).limit(min(limit, 100)).all()
    return {"total": total, "items": users}

@app.put("/users/{user_id}/role", response_model=schemas.User)
def update_user_role(
    user_id: int,
    role: str,
    db: Session = Depends(database.get_db),
    current_admin: models.User = Depends(auth.get_current_admin)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = role
    db.commit()
    db.refresh(user)
    return user

@app.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_admin: models.User = Depends(auth.get_current_admin)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"detail": "User deleted"}

@app.patch("/users/{user_id}/approve", response_model=schemas.User)
def approve_user(
    user_id: int,
    body: schemas.UserApprove,
    db: Session = Depends(database.get_db),
    current_admin: models.User = Depends(auth.get_current_admin)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.approved = body.approved
    db.commit()
    db.refresh(user)
    return user

@app.post('/users/password-change')
def change_password(
    payload: schemas.PasswordChange,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if not auth.verify_password(payload.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail='Old password incorrect')
    pw_errors = auth.password_strength_errors(payload.new_password)
    if pw_errors:
        raise HTTPException(status_code=400, detail=f"Weak password, need: {', '.join(pw_errors)}")
    current_user.hashed_password = auth.get_password_hash(payload.new_password)
    db.commit()
    return {"detail": "Password updated"}

@app.get("/posts/{post_id}", response_model=schemas.Post)
def get_post(post_id: int, db: Session = Depends(database.get_db)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@app.get("/posts/{post_id}/comments", response_model=schemas.CommentList)
def list_comments(post_id: int, db: Session = Depends(database.get_db), skip: int = 0, limit: int = 50):
    q = db.query(models.Comment).filter(models.Comment.post_id == post_id)
    total = q.count()
    items = q.order_by(models.Comment.id.asc()).offset(skip).limit(min(limit, 200)).all()
    return {"total": total, "items": items}

@app.post("/posts/{post_id}/comments", response_model=schemas.Comment)
def add_comment(post_id: int, payload: schemas.CommentCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Ensure post exists and is visible (published) for non-admins
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail='Post not found')
    if current_user.role != 'admin':
        from datetime import datetime
        now = datetime.utcnow()
        if not (post.status == 'published' and (post.publish_at is None or post.publish_at <= now)):
            raise HTTPException(status_code=403, detail='Cannot comment on unpublished post')
    if not payload.content or not payload.content.strip():
        raise HTTPException(status_code=400, detail='Content required')
    comment = models.Comment(post_id=post_id, user_id=current_user.id, content=payload.content.strip())
    db.add(comment)
    # increment post.comments_count
    post.comments_count = (post.comments_count or 0) + 1
    db.commit()
    db.refresh(comment)
    return comment

@app.delete("/posts/{post_id}/comments/{comment_id}")
def delete_comment(post_id: int, comment_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    c = db.query(models.Comment).filter(models.Comment.id == comment_id, models.Comment.post_id == post_id).first()
    if not c:
        raise HTTPException(status_code=404, detail='Comment not found')
    if current_user.role != 'admin' and c.user_id != current_user.id:
        raise HTTPException(status_code=403, detail='Forbidden')
    db.delete(c)
    # decrement post.comments_count (not below 0)
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if post and (post.comments_count or 0) > 0:
        post.comments_count = post.comments_count - 1
    db.commit()
    return {"detail": "Comment deleted"}

@app.get("/posts/{post_id}/likes", response_model=schemas.LikeStatus)
def like_status(post_id: int, db: Session = Depends(database.get_db), current_user: models.User | None = Depends(auth.get_current_user_optional)):
    likes_count = db.query(models.PostLike).filter(models.PostLike.post_id == post_id).count()
    liked = False
    if current_user:
        liked = db.query(models.PostLike).filter(models.PostLike.post_id == post_id, models.PostLike.user_id == current_user.id).first() is not None
    return {"liked": liked, "likes_count": likes_count}

@app.post("/posts/{post_id}/likes/toggle", response_model=schemas.LikeStatus)
def toggle_like(post_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    existing = db.query(models.PostLike).filter(models.PostLike.post_id == post_id, models.PostLike.user_id == current_user.id).first()
    if existing:
        db.delete(existing)
        # decrement
        post = db.query(models.Post).filter(models.Post.id == post_id).first()
        if post and (post.likes_count or 0) > 0:
            post.likes_count = post.likes_count - 1
        db.commit()
    else:
        like = models.PostLike(post_id=post_id, user_id=current_user.id)
        try:
            db.add(like)
            # increment
            post = db.query(models.Post).filter(models.Post.id == post_id).first()
            if post:
                post.likes_count = (post.likes_count or 0) + 1
            db.commit()
        except Exception:
            db.rollback()
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    likes_count = post.likes_count if post and post.likes_count is not None else db.query(models.PostLike).filter(models.PostLike.post_id == post_id).count()
    liked = db.query(models.PostLike).filter(models.PostLike.post_id == post_id, models.PostLike.user_id == current_user.id).first() is not None
    return {"liked": liked, "likes_count": int(likes_count)}

@app.put("/posts/{post_id}", response_model=schemas.Post)
def update_post(
    post_id: int,
    payload: schemas.PostUpdate,
    db: Session = Depends(database.get_db),
    current_admin: models.User = Depends(auth.get_current_admin)
):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.title = payload.title
    post.date = payload.date
    post.details = payload.details
    post.image = payload.image
    if payload.status:
        post.status = payload.status
    if payload.publish_at is not None:
        if payload.publish_at == '':
            post.publish_at = None
        else:
            from datetime import datetime
            try:
                post.publish_at = datetime.fromisoformat(payload.publish_at)
            except ValueError:
                raise HTTPException(status_code=400, detail='Invalid publish_at format (use ISO8601)')
    db.commit()
    db.refresh(post)
    return post

@app.patch('/posts/{post_id}/status', response_model=schemas.Post)
def change_post_status(
    post_id: int,
    payload: schemas.PostStatusChange,
    db: Session = Depends(database.get_db),
    current_admin: models.User = Depends(auth.get_current_admin)
):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail='Post not found')
    post.status = payload.status
    if payload.publish_at is not None:
        if payload.publish_at == '':
            post.publish_at = None
        else:
            from datetime import datetime
            try:
                post.publish_at = datetime.fromisoformat(payload.publish_at)
            except ValueError:
                raise HTTPException(status_code=400, detail='Invalid publish_at format (use ISO8601)')
    db.commit()
    db.refresh(post)
    return post

@app.delete("/posts/{post_id}")
def delete_post(
    post_id: int,
    db: Session = Depends(database.get_db),
    current_admin: models.User = Depends(auth.get_current_admin)
):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    # Attempt to delete image file(s) if local and in uploads
    if post.image:
        parts = [p.strip() for p in re.split(r"[;,\s]+", post.image) if p and p.strip()]
        for p in parts:
            if p.startswith('/uploads/'):
                fname = p.split('/uploads/')[-1]
                fpath = os.path.join(UPLOAD_DIR, fname)
                if os.path.isfile(fpath):
                    try:
                        os.remove(fpath)
                    except OSError:
                        pass
    db.delete(post)
    db.commit()
    return {"detail": "Post deleted"}
