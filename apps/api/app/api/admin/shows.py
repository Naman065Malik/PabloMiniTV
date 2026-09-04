"""Admin shows router."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.show import ShowCreate, ShowListResponse, ShowResponse, ShowUpdate
from app.services import show_service

router = APIRouter(tags=["Admin Shows"])


@router.get("/shows", response_model=ShowListResponse)
def list_shows(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    section: str | None = Query(None),
    status: str | None = Query(None),
    db: Session = Depends(get_db),
):
    return show_service.list_shows(
        db, page=page, page_size=page_size, search=search, section=section, status=status
    )


@router.post("/shows", response_model=ShowResponse, status_code=status.HTTP_201_CREATED)
def create_show(data: ShowCreate, db: Session = Depends(get_db)):
    try:
        show = show_service.create(db, data)
    except ValueError as e:
        msg = str(e)
        if msg == "conflict":
            raise HTTPException(status_code=409, detail="Slug conflict")
        raise HTTPException(status_code=400, detail=str(msg))
    return show


@router.get("/shows/{show_id}", response_model=ShowResponse)
def get_show(show_id: int, db: Session = Depends(get_db)):
    show = show_service.get(db, show_id)
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")
    return show


@router.patch("/shows/{show_id}", response_model=ShowResponse)
def update_show(show_id: int, data: ShowUpdate, db: Session = Depends(get_db)):
    try:
        show = show_service.update(db, show_id, data)
    except ValueError as e:
        msg = str(e)
        if msg == "not_found":
            raise HTTPException(status_code=404, detail="Show not found")
        if msg == "conflict":
            raise HTTPException(status_code=409, detail="Conflict")
        raise HTTPException(status_code=400, detail=str(msg))
    return show


@router.delete("/shows/{show_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_show(show_id: int, db: Session = Depends(get_db)):
    try:
        show_service.delete(db, show_id)
    except ValueError as e:
        msg = str(e)
        if msg == "not_found":
            raise HTTPException(status_code=404, detail="Show not found")
        raise HTTPException(status_code=400, detail=str(msg))
