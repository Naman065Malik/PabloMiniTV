"""Admin seasons router."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.season import SeasonCreate, SeasonResponse, SeasonUpdate
from app.services import season_service

router = APIRouter(tags=["Admin Seasons"])


@router.get("/shows/{show_id}/seasons", response_model=list[SeasonResponse])
def list_seasons(show_id: int, db: Session = Depends(get_db)):
    seasons = season_service.list_for_show(db, show_id)
    return [SeasonResponse.model_validate(s) for s in seasons]


@router.post(
    "/shows/{show_id}/seasons", response_model=SeasonResponse, status_code=status.HTTP_201_CREATED
)
def create_season(show_id: int, data: SeasonCreate, db: Session = Depends(get_db)):
    try:
        season = season_service.create(db, show_id, data)
    except ValueError as e:
        msg = str(e)
        if msg == "show_not_found":
            raise HTTPException(status_code=404, detail="Show not found")
        if msg == "conflict":
            raise HTTPException(status_code=409, detail="Season number conflict for this show")
        raise HTTPException(status_code=400, detail=str(msg))
    return season


@router.get("/seasons/{season_id}", response_model=SeasonResponse)
def get_season(season_id: int, db: Session = Depends(get_db)):
    season = season_service.get(db, season_id)
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")
    return season


@router.patch("/seasons/{season_id}", response_model=SeasonResponse)
def update_season(season_id: int, data: SeasonUpdate, db: Session = Depends(get_db)):
    try:
        season = season_service.update(db, season_id, data)
    except ValueError as e:
        msg = str(e)
        if msg == "not_found":
            raise HTTPException(status_code=404, detail="Season not found")
        if msg == "conflict":
            raise HTTPException(status_code=409, detail="Conflict")
        raise HTTPException(status_code=400, detail=str(msg))
    return season


@router.delete("/seasons/{season_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_season(season_id: int, db: Session = Depends(get_db)):
    try:
        season_service.delete(db, season_id)
    except ValueError as e:
        msg = str(e)
        if msg == "not_found":
            raise HTTPException(status_code=404, detail="Season not found")
        raise HTTPException(status_code=400, detail=str(msg))
