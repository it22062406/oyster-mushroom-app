"""Account routes used by the farm login and registration screens."""
import hashlib
import secrets

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select

from db import get_session
from models import User

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterIn(BaseModel):
    name: str
    email: str
    phone: str | None = None
    password: str


class LoginIn(BaseModel):
    email: str
    password: str


class ResetPasswordIn(BaseModel):
    email: str
    new_password: str


def _hash_password(password: str, salt: str | None = None) -> tuple[str, str]:
    if salt is None:
        salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120_000)
    return salt, digest.hex()


def _find_user(session: Session, email: str) -> User | None:
    return session.exec(select(User).where(User.email == email.strip().lower())).first()


@router.post("/register")
def register(body: RegisterIn, session: Session = Depends(get_session)):
    name = body.name.strip()
    email = body.email.strip().lower()
    if not name or not email or not body.password:
        raise HTTPException(status_code=400, detail="Please fill all required fields")

    if _find_user(session, email):
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    salt, password_hash = _hash_password(body.password)
    user = User(
        name=name,
        email=email,
        phone=(body.phone or "").strip() or None,
        password_hash=password_hash,
        password_salt=salt,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"name": user.name, "email": user.email, "phone": user.phone}


@router.post("/login")
def login(body: LoginIn, session: Session = Depends(get_session)):
    user = _find_user(session, body.email)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    _, password_hash = _hash_password(body.password, user.password_salt)
    if not secrets.compare_digest(password_hash, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {
        "name": user.name,
        "email": user.email,
        "farm_name": user.farm_name,
    }


@router.post("/reset-password")
def reset_password(body: ResetPasswordIn, session: Session = Depends(get_session)):
    user = _find_user(session, body.email)
    if user is None:
        raise HTTPException(status_code=404, detail="No account found for that email")
    if not body.new_password:
        raise HTTPException(status_code=400, detail="Enter a new password")
    salt, password_hash = _hash_password(body.new_password)
    user.password_salt = salt
    user.password_hash = password_hash
    session.add(user)
    session.commit()
    return {"ok": True}
