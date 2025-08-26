from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import secrets, hashlib, re
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import models, database
import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env from backend directory to ensure SECRET_KEY is found even when cwd differs
load_dotenv(dotenv_path=Path(__file__).parent / '.env')

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY environment variable not set")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def generate_refresh_token() -> str:
    return secrets.token_urlsafe(64)

def hash_refresh_token(raw: str) -> str:
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()

def verify_refresh_token(raw: str, stored_hash: str) -> bool:
    return hash_refresh_token(raw) == stored_hash

PASSWORD_MIN_LENGTH = 8
_PASSWORD_REGEXES = [
    (re.compile(r"[a-z]"), "lowercase letter"),
    (re.compile(r"[A-Z]"), "uppercase letter"),
    (re.compile(r"\d"), "digit"),
    (re.compile(r"[^A-Za-z0-9]"), "symbol")
]

def password_strength_errors(pw: str) -> list[str]:
    errors = []
    if len(pw) < PASSWORD_MIN_LENGTH:
        errors.append(f"at least {PASSWORD_MIN_LENGTH} characters")
    for regex, desc in _PASSWORD_REGEXES:
        if not regex.search(pw):
            errors.append(f"at least one {desc}")
    return errors

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_user_optional(request: Request, db: Session = Depends(database.get_db)):
    """Return current user if Authorization header present and valid; else None."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.lower().startswith("bearer "):
        return None
    token = auth_header.split()[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
    except JWTError:
        return None
    user = db.query(models.User).filter(models.User.username == username).first()
    return user

# Dependency to check if current user is admin
from fastapi import Security
def get_current_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    if not current_user.email_verified:
        raise HTTPException(status_code=403, detail="Email not verified")
    return current_user
