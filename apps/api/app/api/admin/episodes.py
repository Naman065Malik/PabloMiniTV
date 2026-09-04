"""Admin episodes router."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.episode import EpisodeCreate, EpisodeResponse, EpisodeUpdate
from app.services import episode_service

router = APIRouter(tags=["Admin Episodes"])


@router.get("/seasons/{season_id}/episodes", response_model=list[EpisodeResponse])
def list_episodes(season_id: int, db: Session = Depends(get_db)):
    episodes = episode_service.list_for_season(db, season_id)
    return [EpisodeResponse.model_validate(e) for e in episodes]


@router.post(
    "/seasons/{season_id}/episodes",
    response_model=EpisodeResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_episode(season_id: int, data: EpisodeCreate, db: Session = Depends(get_db)):
    try:
        episode = episode_service.create(db, season_id, data)
    except ValueError as e:
        msg = str(e)
        if msg == "season_not_found":
            raise HTTPException(status_code=404, detail="Season not found")
        if msg == "conflict":
            raise HTTPException(status_code=409, detail="Content group + language conflict")
        raise HTTPException(status_code=400, detail=str(msg))
    return episode


@router.get("/episodes/{episode_id}", response_model=EpisodeResponse)
def get_episode(episode_id: int, db: Session = Depends(get_db)):
    episode = episode_service.get(db, episode_id)
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")
    return episode


@router.patch("/episodes/{episode_id}", response_model=EpisodeResponse)
def update_episode(episode_id: int, data: EpisodeUpdate, db: Session = Depends(get_db)):
    try:
        episode = episode_service.update(db, episode_id, data)
    except ValueError as e:
        msg = str(e)
        if msg == "not_found":
            raise HTTPException(status_code=404, detail="Episode not found")
        if msg == "conflict":
            raise HTTPException(status_code=409, detail="Conflict")
        raise HTTPException(status_code=400, detail=str(msg))
    return episode


@router.delete("/episodes/{episode_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_episode(episode_id: int, db: Session = Depends(get_db)):
    try:
        episode_service.delete(db, episode_id)
    except ValueError as e:
        msg = str(e)
        if msg == "not_found":
            raise HTTPException(status_code=404, detail="Episode not found")
        raise HTTPException(status_code=400, detail=str(msg))
