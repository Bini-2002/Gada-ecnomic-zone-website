
# Post schemas
from typing import Optional
from pydantic import BaseModel

class PostCreate(BaseModel):
    title: str
    date: str
    details: str
    image: str

class Post(BaseModel):
    id: int
    title: str
    date: str
    details: str
    image: str
    created_at: Optional[str] = None

    model_config = {
        "from_attributes": True
    }
from pydantic import BaseModel


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

    model_config = {
        "from_attributes": True
    }
