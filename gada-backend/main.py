from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os, uuid, shutil

import auth, models, schemas, database

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
    db_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password, role=user.role)
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
        image=post.image
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

@app.post('/upload-image')
def upload_image(
    file: UploadFile = File(...),
    current_admin: models.User = Depends(auth.get_current_admin)
):
    # Basic content-type check
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail='Only image uploads allowed')
    ext = os.path.splitext(file.filename)[1].lower() or '.img'
    filename = f"{uuid.uuid4().hex}{ext}"
    dest_path = os.path.join(UPLOAD_DIR, filename)
    with open(dest_path, 'wb') as out_file:
        shutil.copyfileobj(file.file, out_file)
    # Return relative URL path
    return { 'filename': filename, 'url': f"/uploads/{filename}" }

@app.get("/posts", response_model=list[schemas.Post])
def read_posts(
    db: Session = Depends(database.get_db),
    skip: int = 0,
    limit: int = 50,
    search: str | None = None
):
    query = db.query(models.Post)
    if search:
        like = f"%{search}%"
        query = query.filter(models.Post.title.ilike(like) | models.Post.details.ilike(like))
    posts = query.order_by(models.Post.id.desc()).offset(skip).limit(min(limit, 100)).all()
    return posts

@app.get("/users", response_model=list[schemas.User])
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
    return query.order_by(models.User.id.desc()).offset(skip).limit(min(limit, 100)).all()

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

@app.get("/posts/{post_id}", response_model=schemas.Post)
def get_post(post_id: int, db: Session = Depends(database.get_db)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@app.put("/posts/{post_id}", response_model=schemas.Post)
def update_post(
    post_id: int,
    payload: schemas.PostCreate,
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
    db.delete(post)
    db.commit()
    return {"detail": "Post deleted"}
