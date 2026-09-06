"""Show service."""

from __future__ import annotations

import re

from sqlalchemy.orm import Session

from app.models.show import Show, ShowStatus
from app.schemas.show import ShowCreate, ShowListResponse, ShowResponse, ShowUpdate


def _generate_slug(title: str) -> str:
    slug = re.sub(r"[^\w\s-]", "", title.lower())
    slug = re.sub(r"[-\s]+", "-", slug).strip("-")
    return slug or "show"


def _slug_exists(db: Session, slug: str) -> bool:
    return db.query(Show).filter(Show.slug == slug).first() is not None


def _make_unique_slug(db: Session, base: str) -> str:
    slug = base
    counter = 1
    while _slug_exists(db, slug):
        slug = f"{base}-{counter}"
        counter += 1
    return slug


def create(db: Session, data: ShowCreate) -> Show:
    slug = _make_unique_slug(db, _generate_slug(data.title))
    show = Show(
        title=data.title,
        slug=slug,
        description=data.description,
        section=data.section,
        category=data.category,
        status=ShowStatus.DRAFT,
    )
    db.add(show)
    db.commit()
    db.refresh(show)
    return show


def list_shows(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    search: str | None = None,
    section: str | None = None,
    status: str | None = None,
) -> ShowListResponse:
    query = db.query(Show)
    if search:
        query = query.filter(Show.title.ilike(f"%{search}%"))
    if section:
        query = query.filter(Show.section == section)
    if status:
        query = query.filter(Show.status == status)

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return ShowListResponse(
        items=[ShowResponse.model_validate(i) for i in items],
        page=page,
        page_size=page_size,
        total=total,
    )


def get(db: Session, show_id: int) -> Show | None:
    return db.query(Show).filter(Show.id == show_id).first()


def update(db: Session, show_id: int, data: ShowUpdate) -> Show:
    show = get(db, show_id)
    if not show:
        raise ValueError("not_found")
    if data.title is not None:
        show.title = data.title
        # Regenerate slug if title changed
        new_slug = _make_unique_slug(db, _generate_slug(data.title))
        show.slug = new_slug
    if data.description is not None:
        show.description = data.description
    if data.section is not None:
        show.section = data.section
    if data.category is not None:
        show.category = data.category
    if data.status is not None:
        show.status = data.status
    db.commit()
    db.refresh(show)
    return show


def delete(db: Session, show_id: int) -> None:
    from app.models.publish_run import PublishRunShow

    show = get(db, show_id)
    if not show:
        raise ValueError("not_found")
    # Remove publish-run join rows first. Their FK to shows.id has no ON DELETE
    # CASCADE, so deleting a show that has ever been part of a publish run would
    # otherwise raise an integrity error. This only clears the historical
    # association rows; it does not alter publishing behaviour.
    db.query(PublishRunShow).filter(PublishRunShow.show_id == show_id).delete(
        synchronize_session=False
    )
    db.delete(show)
    db.commit()
