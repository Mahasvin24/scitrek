from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone

import jwt
import sqlite3
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
import bcrypt
from pydantic import BaseModel, Field

from crypto_rsa import decrypt_password, get_public_key_pem
from database import get_db, init_db
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY must be set in the environment")

ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 30
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in CORS_ORIGINS if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_token(username: str) -> str:
    payload = {
        "sub": username,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


class AuthRequest(BaseModel):
    username: str = Field(min_length=3, max_length=64)
    password: str = Field(
        description="RSA-OAEP encrypted password (base64), not plaintext"
    )


@app.get("/")
def read_root():
    return {"message": "Hi. Route works."}


@app.get("/auth/public-key")
def public_key():
    return {"public_key": get_public_key_pem()}


@app.post("/register")
def register(body: AuthRequest):
    try:
        plain_password = decrypt_password(body.password)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid encrypted password")

    if len(plain_password) < 8:
        raise HTTPException(
            status_code=400, detail="Password must be at least 8 characters"
        )

    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO users (username, password_hash) VALUES (?, ?)",
            (body.username, hash_password(plain_password)),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Username already taken")
    finally:
        conn.close()
    return {"message": "User registered successfully"}


@app.post("/login")
def login(body: AuthRequest):
    try:
        plain_password = decrypt_password(body.password)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    conn = get_db()
    user = conn.execute(
        "SELECT * FROM users WHERE username = ?", (body.username,)
    ).fetchone()
    conn.close()

    if not user or not verify_password(plain_password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(user["username"])
    return {"access_token": token, "token_type": "bearer"}


@app.get("/me")
def get_me(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"username": payload["sub"]}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
