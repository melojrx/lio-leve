"""Endpoints públicos de blog."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import BlogPost
from app.schema.blog import BlogPostDetail, BlogPostSummary

router = APIRouter(prefix="/blog", tags=["blog"])


@router.get("/", response_model=list[BlogPostSummary])
def list_blog_posts(db: Session = Depends(get_db)) -> list[BlogPost]:
    stmt = (
        select(BlogPost)
        .where(BlogPost.published.is_(True))
        .order_by(BlogPost.published_at.desc().nullslast())
        .limit(20)
    )
    return db.execute(stmt).scalars().all()


@router.get("/{slug}", response_model=BlogPostDetail)
def get_blog_post(slug: str, db: Session = Depends(get_db)) -> BlogPost:
    stmt = select(BlogPost).where(BlogPost.slug == slug, BlogPost.published.is_(True))
    blog = db.execute(stmt).scalar_one_or_none()
    if not blog:
        raise HTTPException(status_code=404, detail="Post não encontrado")
    return blog
