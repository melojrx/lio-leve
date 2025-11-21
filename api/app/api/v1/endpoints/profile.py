"""Endpoints relacionados ao perfil do usuário."""
from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.settings import settings
from app.api.deps import get_current_user, get_db
from app.models import Profile, User
from app.schema.profile import ProfileRead, ProfileUpdate

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/me", response_model=ProfileRead)
def read_my_profile(current_user: User = Depends(get_current_user)) -> Profile:
    return current_user.profile


@router.patch("/me", response_model=ProfileRead)
def update_my_profile(
    profile_in: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Profile:
    profile = current_user.profile
    updates = profile_in.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(profile, field, value)

    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.post("/me/avatar", status_code=status.HTTP_200_OK)
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    if file.content_type not in {"image/png", "image/jpeg", "image/webp"}:
        raise HTTPException(status_code=400, detail="Formato de arquivo não suportado")

    data = await file.read()
    if len(data) > 2 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Arquivo excede 2MB")

    media_root = Path(settings.media_root) / "avatars"
    media_root.mkdir(parents=True, exist_ok=True)

    extension = Path(file.filename or "").suffix or ".jpg"
    filename = f"{current_user.id}-{uuid.uuid4().hex}{extension}"
    save_path = media_root / filename
    save_path.write_bytes(data)

    public_url = f"{settings.media_url}/avatars/{filename}"

    profile = current_user.profile
    profile.avatar_url = public_url
    db.add(profile)
    db.commit()
    db.refresh(profile)

    return {"avatar_url": public_url}
