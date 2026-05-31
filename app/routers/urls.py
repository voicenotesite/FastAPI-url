import secrets
import string
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import URL, User
from app.schemas import URLOut, URLStats
from app.auth import get_current_user

router = APIRouter(prefix="/urls", tags=["urls"])

def gen_short() -> str:
    chars = string.ascii_letters + string.digits
    return ''.join(secrets.choice(chars) for _ in range(6))

@router.post("/shorten", response_model=URLOut)
def shorten(target_url: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    short = gen_short()
    while db.query(URL).filter(URL.short_code == short).first():
        short = gen_short()
    url = URL(short_code=short, target_url=target_url, owner_id=user.id)
    db.add(url)
    db.commit()
    db.refresh(url)
    return URLOut(id=url.id, short_code=url.short_code, target_url=url.target_url, clicks=url.clicks, is_active=url.is_active)

@router.get("/my", response_model=list[URLOut])
def my_urls(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    urls = db.query(URL).filter(URL.owner_id == user.id).order_by(URL.created_at.desc()).all()
    return [URLOut(id=u.id, short_code=u.short_code, target_url=u.target_url, clicks=u.clicks, is_active=u.is_active) for u in urls]

@router.get("/{short_code}/stats", response_model=URLStats)
def stats(short_code: str, db: Session = Depends(get_db)):
    url = db.query(URL).filter(URL.short_code == short_code).first()
    if not url:
        raise HTTPException(status_code=404)
    return URLStats(short_code=url.short_code, target_url=url.target_url, clicks=url.clicks, total=url.clicks)

@router.delete("/{short_code}", status_code=204)
def delete(short_code: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    url = db.query(URL).filter(URL.short_code == short_code, URL.owner_id == user.id).first()
    if not url:
        raise HTTPException(status_code=404)
    db.delete(url)
    db.commit()

@router.get("/r/{short_code}")
def redirect(short_code: str, db: Session = Depends(get_db)):
    url = db.query(URL).filter(URL.short_code == short_code, URL.is_active == True).first()
    if not url:
        raise HTTPException(status_code=404, detail="URL not found")
    url.clicks += 1
    db.commit()
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=url.target_url, status_code=302)
