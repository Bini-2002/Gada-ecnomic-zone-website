from sqlalchemy import Column, Integer, String, Boolean, DateTime, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)
    approved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    email_verified = Column(Boolean, default=False)
    email_verification_token = Column(String, nullable=True)
    email_verification_sent_at = Column(DateTime, nullable=True)
    password_reset_token = Column(String, nullable=True)
    password_reset_sent_at = Column(DateTime, nullable=True)

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    date = Column(String)
    details = Column(String)
    image = Column(String)  # stores filename (served from /uploads)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default='draft', nullable=False)  # draft | scheduled | published
    publish_at = Column(DateTime, nullable=True)  # when scheduled to go live
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)

class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, index=True)
    user_id = Column(Integer, index=True)
    content = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class PostLike(Base):
    __tablename__ = "post_likes"
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, index=True)
    user_id = Column(Integer, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    __table_args__ = (
        UniqueConstraint('post_id', 'user_id', name='uq_post_like_user'),
    )

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    token = Column(String, unique=True, index=True)  # opaque random string (jti)
    expires_at = Column(DateTime, index=True)
    revoked = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class RateLimit(Base):
    __tablename__ = "rate_limits"
    id = Column(Integer, primary_key=True)
    scope = Column(String, index=True)
    identifier = Column(String, index=True)  # e.g. ip:user or ip:email
    window_start = Column(DateTime, index=True)
    count = Column(Integer, default=0)
