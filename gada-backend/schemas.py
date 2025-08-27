from pydantic import BaseModel
from datetime import datetime

# ----- User Schemas -----
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str

class User(BaseModel):
    id: int
    username: str
    email: str
    role: str
    approved: bool | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    email_verified: bool | None = None

    model_config = {"from_attributes": True}

# ----- Post Schemas -----
class PostCreate(BaseModel):
    title: str
    date: str
    details: str
    image: str
    status: str | None = None
    publish_at: str | None = None

class Post(BaseModel):
    id: int
    title: str
    date: str
    details: str
    image: str
    created_at: datetime
    status: str
    publish_at: datetime | None = None

    model_config = {"from_attributes": True}

class PostList(BaseModel):
    total: int
    items: list[Post]

class PostUpdate(BaseModel):
    title: str
    date: str
    details: str
    image: str
    status: str | None = None
    publish_at: str | None = None

class PostStatusChange(BaseModel):
    status: str
    publish_at: str | None = None

class UserList(BaseModel):
    total: int
    items: list[User]

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

class UserApprove(BaseModel):
    approved: bool

class TokenPair(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"

class AccessToken(BaseModel):
    access_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

class EmailVerificationRequest(BaseModel):
    token: str

class EmailVerificationAuthRequest(BaseModel):
    username: str
    password: str

class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetPerform(BaseModel):
    token: str
    new_password: str

