from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db import get_session
from app.models import Article
from app.schemas import ArticleCard, ArticleDetail

router = APIRouter(prefix="/api/v1/learn", tags=["learn"])


@router.get("", response_model=list[ArticleCard])
def list_articles(session: Session = Depends(get_session)) -> list[ArticleCard]:
    articles = session.exec(select(Article).order_by(Article.order_index)).all()
    return [ArticleCard(slug=a.slug, title=a.title, summary=a.summary) for a in articles]


@router.get("/{slug}", response_model=ArticleDetail)
def get_article(slug: str, session: Session = Depends(get_session)) -> ArticleDetail:
    article = session.exec(select(Article).where(Article.slug == slug)).first()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    return ArticleDetail(slug=article.slug, title=article.title, summary=article.summary, content_markdown=article.content_markdown)
