"""Endpoints para gerenciar ativos."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models import Asset, User
from app.schema.asset import AssetCreate, AssetRead, AssetUpdate

router = APIRouter(prefix="/assets", tags=["assets"])


@router.get("/", response_model=list[AssetRead])
def list_assets(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> list[Asset]:
    stmt = select(Asset).where(Asset.user_id == current_user.id).order_by(Asset.ticker)
    return db.execute(stmt).scalars().all()


@router.post("/", response_model=AssetRead, status_code=status.HTTP_201_CREATED)
def create_asset(
    asset_in: AssetCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> Asset:
    asset = Asset(user_id=current_user.id, **asset_in.model_dump())
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset


def _get_owned_asset(db: Session, asset_id: uuid.UUID, user_id: uuid.UUID) -> Asset:
    asset = db.get(Asset, asset_id)
    if not asset or asset.user_id != user_id:
        raise HTTPException(status_code=404, detail="Ativo não encontrado")
    return asset


@router.get("/{asset_id}", response_model=AssetRead)
def retrieve_asset(
    asset_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> Asset:
    return _get_owned_asset(db, asset_id, current_user.id)


@router.patch("/{asset_id}", response_model=AssetRead)
def update_asset(
    asset_id: uuid.UUID,
    asset_in: AssetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Asset:
    asset = _get_owned_asset(db, asset_id, current_user.id)
    updates = asset_in.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(asset, field, value)
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset


@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_asset(
    asset_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> None:
    asset = _get_owned_asset(db, asset_id, current_user.id)
    db.delete(asset)
    db.commit()
