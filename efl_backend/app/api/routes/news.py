import re
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.core.database import get_db
from app.models.news import News, NewsCategory
from app.models.user import User
from app.schemas.news import NewsCreate, NewsListItem, NewsRead, NewsUpdate

router = APIRouter(prefix="/news", tags=["news"])


_CYRILLIC_TO_LATIN = {
    "а": "a", "б": "b", "в": "v", "г": "h", "ґ": "g", "д": "d", "е": "e", "є": "ie",
    "ж": "zh", "з": "z", "и": "y", "і": "i", "ї": "i", "й": "i", "к": "k", "л": "l",
    "м": "m", "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
    "ф": "f", "х": "kh", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "shch", "ь": "",
    "ю": "iu", "я": "ia", "ё": "e", "ы": "y", "э": "e", "ъ": "",
}


def _transliterate(text: str) -> str:
    return "".join(_CYRILLIC_TO_LATIN.get(ch, ch) for ch in text)


def _slugify(title: str) -> str:
    slug = _transliterate(title.strip().lower())
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    slug = slug.strip("-")
    return slug or f"news-{uuid.uuid4().hex[:8]}"


def _unique_slug(title: str, db: Session, exclude_id: uuid.UUID | None = None) -> str:
    base_slug = _slugify(title)
    slug = base_slug
    suffix = 2
    while True:
        query = select(News).where(News.slug == slug)
        if exclude_id is not None:
            query = query.where(News.id != exclude_id)
        if db.scalar(query) is None:
            return slug
        slug = f"{base_slug}-{suffix}"
        suffix += 1


def _unset_other_featured(db: Session, exclude_id: uuid.UUID | None = None) -> None:
    query = select(News).where(News.is_featured.is_(True))
    if exclude_id is not None:
        query = query.where(News.id != exclude_id)
    for item in db.scalars(query).all():
        item.is_featured = False


def _get_news_or_404(news_id: uuid.UUID, db: Session) -> News:
    news = db.get(News, news_id)
    if news is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News not found")
    return news


@router.get("", response_model=list[NewsListItem])
def list_news(
    category: NewsCategory | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    query = select(News)
    if category is not None:
        query = query.where(News.category == category)
    query = query.order_by(News.published_at.desc()).offset(offset).limit(limit)
    return db.scalars(query).all()


@router.get("/featured", response_model=NewsRead)
def get_featured_news(db: Session = Depends(get_db)):
    news = db.scalar(select(News).where(News.is_featured.is_(True)))
    if news is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No featured news set")
    return news


@router.post("", response_model=NewsRead, status_code=status.HTTP_201_CREATED)
def create_news(
    payload: NewsCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    data = payload.model_dump()
    if data["published_at"] is None:
        data.pop("published_at")

    news = News(**data, slug=_unique_slug(payload.title, db), author_id=admin.id)
    db.add(news)

    if news.is_featured:
        db.flush()
        _unset_other_featured(db, exclude_id=news.id)

    db.commit()
    db.refresh(news)
    return news


@router.get("/{news_id}", response_model=NewsRead)
def get_news(news_id: uuid.UUID, db: Session = Depends(get_db)):
    return _get_news_or_404(news_id, db)


@router.put("/{news_id}", response_model=NewsRead)
def update_news(
    news_id: uuid.UUID, payload: NewsUpdate, db: Session = Depends(get_db), _admin=Depends(get_current_admin)
):
    news = _get_news_or_404(news_id, db)
    data = payload.model_dump(exclude_unset=True)

    if "title" in data and data["title"] != news.title:
        news.slug = _unique_slug(data["title"], db, exclude_id=news.id)

    for field, value in data.items():
        setattr(news, field, value)

    if news.is_featured:
        _unset_other_featured(db, exclude_id=news.id)

    db.commit()
    db.refresh(news)
    return news


@router.delete("/{news_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_news(news_id: uuid.UUID, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    news = _get_news_or_404(news_id, db)
    db.delete(news)
    db.commit()


@router.get("/{news_id}/related", response_model=list[NewsListItem])
def get_related_news(
    news_id: uuid.UUID, limit: int = Query(default=4, ge=1, le=20), db: Session = Depends(get_db)
):
    news = _get_news_or_404(news_id, db)
    query = (
        select(News)
        .where(News.category == news.category, News.id != news.id)
        .order_by(News.published_at.desc())
        .limit(limit)
    )
    return db.scalars(query).all()
