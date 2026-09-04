from pydantic import BaseModel, ConfigDict, Field
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    EDITOR = "editor"

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class CurrentUserResponse(BaseModel):
    id: int
    email: str
    role: UserRole
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
