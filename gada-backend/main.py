from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os, uuid, shutil
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

import auth, models, schemas, database

# Optional automatic table creation (disable with AUTO_CREATE=0 when migrations in place)
if os.getenv("AUTO_CREATE", "1") == "1":
    models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# Ensure uploads directory exists and mount static
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount('/uploads', StaticFiles(directory=UPLOAD_DIR), name='uploads')

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Adjust this to your frontend's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    if not user.email:
        raise HTTPException(status_code=400, detail="Email is required")
    db_user = db.query(models.User).filter((models.User.username == user.username) | (models.User.email == user.email)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password, role=user.role, approved=False)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account not yet approved",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.username, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.get("/")
def read_root():
    return {"message": "Gada Backend API is running!"}


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
    current_user.hashed_password = auth.get_password_hash(payload.new_password)
    db.commit()
    return {"detail": "Password updated"}

@app.get("/posts/{post_id}", response_model=schemas.Post)
def get_post(post_id: int, db: Session = Depends(database.get_db)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

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
    # Attempt to delete image file if local and in uploads
    if post.image and post.image.startswith('/uploads/'):
        fname = post.image.split('/uploads/')[-1]
        fpath = os.path.join(UPLOAD_DIR, fname)
        if os.path.isfile(fpath):
            try:
                os.remove(fpath)
            except OSError:
                pass
    db.delete(post)
    db.commit()
    return {"detail": "Post deleted"}
