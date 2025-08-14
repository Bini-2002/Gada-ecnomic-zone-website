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
