from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import schemas, security
from .database import engine, get_db, User, Room, RoomParticipant, PlaylistItem
from .video_utils import detect_video_platform, get_video_info
from jose import JWTError, jwt
import random
import string

from .database import Base

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://videoparty.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(security.oauth2_scheme)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, security.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
        token_data = schemas.TokenData(user_id=user_id)
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if user is None:
        raise credentials_exception
    return user


@app.post("/api/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    hashed_password = security.get_password_hash(user.password)
    db_user = User(username=user.username, password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.post("/api/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not security.verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.create_access_token(data={"user_id": db_user.id})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/user", response_model=schemas.UserResponse)
def get_user(current_user: User = Depends(get_current_user)):
    return current_user


@app.put("/api/user", response_model=schemas.UserResponse)
def update_user(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if user_update.username:
        current_user.username = user_update.username
    if user_update.password:
        current_user.password = security.get_password_hash(user_update.password)
    db.commit()
    db.refresh(current_user)
    return current_user


def generate_room_code(length=6):
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=length))


@app.post("/api/video/analyze")
def analyze_video_url(video_data: dict):
    """Analyze a video URL and return platform information"""
    url = video_data.get("url", "")
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    video_info = get_video_info(url)
    return {
        "original_url": url,
        "platform": video_info["platform"],
        "embed_url": video_info["embed_url"],
        "thumbnail": video_info.get("thumbnail"),
        "supports_sync": video_info.get("supports_sync", True),
        "video_id": video_info.get("video_id"),
    }


@app.post("/api/rooms", response_model=schemas.RoomResponse)
def create_room(room: schemas.RoomCreate, db: Session = Depends(get_db)):
    room_code = generate_room_code()

    # Process video URL to get platform info
    video_info = get_video_info(room.video_url)
    processed_url = video_info.get("embed_url", room.video_url)

    # Create a temporary host_id for no-auth rooms
    db_room = Room(**room.dict(), code=room_code, host_id=1, video_url=processed_url)
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room


@app.get("/api/rooms/{code}", response_model=schemas.RoomResponse)
def get_room(code: str, db: Session = Depends(get_db)):
    db_room = db.query(Room).filter(Room.code == code).first()
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")
    return db_room


@app.post("/api/rooms/{code}/join", response_model=schemas.RoomResponse)
def join_room(code: str, db: Session = Depends(get_db)):
    db_room = db.query(Room).filter(Room.code == code).first()
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")
    # For now, just return the room without tracking participants
    return db_room


@app.put("/api/rooms/{code}/state", response_model=schemas.RoomResponse)
def update_room_state(
    code: str, room_update: schemas.RoomUpdate, db: Session = Depends(get_db)
):
    db_room = db.query(Room).filter(Room.code == code).first()
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")
    # Allow anyone to update room state for now (no auth)
    if hasattr(room_update, "is_playing") and room_update.is_playing is not None:
        db_room.is_playing = room_update.is_playing
    if hasattr(room_update, "current_time") and room_update.current_time is not None:
        db_room.current_time = room_update.current_time
    if hasattr(room_update, "video_url") and room_update.video_url is not None:
        db_room.video_url = room_update.video_url
    db.commit()
    db.refresh(db_room)
    return db_room
