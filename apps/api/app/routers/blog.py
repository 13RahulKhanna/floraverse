from fastapi import APIRouter, Depends, HTTPException, Query, status
from slugify import slugify
from sqlmodel import Session, func, select

from app.db import get_session
from app.models import BlogPost, Plant, User
from app.schemas import BlogListResponse, BlogPostCard, BlogPostCreate, BlogPostDetail
from app.security import get_current_user, get_current_user_optional
from app.serializers import to_blog_card, to_blog_detail

router = APIRouter(prefix="/api/v1/blog", tags=["blog"])


def _unique_slug(session: Session, title: str) -> str:
    base = slugify(title) or "post"
    slug = base
    suffix = 2
    while session.exec(select(BlogPost).where(BlogPost.slug == slug)).first():
        slug = f"{base}-{suffix}"
        suffix += 1
    return slug


@router.get("", response_model=BlogListResponse)
def list_posts(
    progress_only: bool = Query(default=False),
    mine: bool = Query(default=False),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    user: User | None = Depends(get_current_user_optional),
    session: Session = Depends(get_session),
) -> BlogListResponse:
    statement = select(BlogPost)
    if progress_only:
        statement = statement.where(BlogPost.is_progress_update == True)  # noqa: E712
    if mine:
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Login to view your own posts")
        statement = statement.where(BlogPost.author_id == user.id)

    total = session.exec(select(func.count()).select_from(statement.subquery())).one()
    statement = statement.order_by(BlogPost.created_at.desc()).offset((page - 1) * page_size).limit(page_size)  # type: ignore[attr-defined]
    posts = session.exec(statement).all()

    items = []
    for post in posts:
        author = session.get(User, post.author_id)
        linked_plant = session.get(Plant, post.linked_plant_id) if post.linked_plant_id else None
        items.append(to_blog_card(post, author, linked_plant))  # type: ignore[arg-type]

    return BlogListResponse(items=items, total=total, page=page, page_size=page_size)


@router.get("/{slug}", response_model=BlogPostDetail)
def get_post(slug: str, user: User | None = Depends(get_current_user_optional), session: Session = Depends(get_session)) -> BlogPostDetail:
    post = session.exec(select(BlogPost).where(BlogPost.slug == slug)).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    author = session.get(User, post.author_id)
    linked_plant = session.get(Plant, post.linked_plant_id) if post.linked_plant_id else None
    is_mine = bool(user and user.id == post.author_id)
    return to_blog_detail(post, author, linked_plant, is_mine)  # type: ignore[arg-type]


@router.post("", response_model=BlogPostDetail, status_code=status.HTTP_201_CREATED)
def create_post(payload: BlogPostCreate, user: User = Depends(get_current_user), session: Session = Depends(get_session)) -> BlogPostDetail:
    linked_plant = None
    if payload.linked_plant_id is not None:
        linked_plant = session.get(Plant, payload.linked_plant_id)
        if not linked_plant:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Linked plant not found")

    post = BlogPost(
        author_id=user.id,  # type: ignore[arg-type]
        slug=_unique_slug(session, payload.title),
        title=payload.title,
        excerpt=payload.excerpt,
        content_markdown=payload.content_markdown,
        is_progress_update=payload.is_progress_update,
        linked_plant_id=payload.linked_plant_id,
    )
    session.add(post)
    session.commit()
    session.refresh(post)
    return to_blog_detail(post, user, linked_plant, is_mine=True)


@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(slug: str, user: User = Depends(get_current_user), session: Session = Depends(get_session)) -> None:
    post = session.exec(select(BlogPost).where(BlogPost.slug == slug)).first()
    if not post or post.author_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    session.delete(post)
    session.commit()
