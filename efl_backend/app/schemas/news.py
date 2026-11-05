import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.news import NewsCategory


class AuthorBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    username: str


class NewsCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    content: str = Field(min_length=1)
    category: NewsCategory
    cover_image_url: str | None = None
    is_featured: bool = False
    published_at: datetime | None = None


class NewsUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=200)
    content: str | None = Field(default=None, min_length=1)
    category: NewsCategory | None = None
    cover_image_url: str | None = None
    is_featured: bool | None = None
    published_at: datetime | None = None


class NewsRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    slug: str
    content: str
    category: NewsCategory
    cover_image_url: str | None
    is_featured: bool
    author: AuthorBrief | None
    published_at: datetime
    created_at: datetime


class NewsListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    slug: str
    category: NewsCategory
    cover_image_url: str | None
    is_featured: bool
    published_at: datetime
