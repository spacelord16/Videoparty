from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True


class RoomCreate(BaseModel):
    name: str
    video_url: str


class RoomUpdate(BaseModel):
    is_playing: Optional[bool] = None
    current_time: Optional[float] = None
    video_url: Optional[str] = None


class RoomResponse(BaseModel):
    id: int
    name: str
    code: str
    host_id: Optional[int] = None
    video_url: str
    is_playing: bool
    current_time: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[int] = None
