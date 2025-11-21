"""Endpoints do mural de sugestões."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models import Suggestion, SuggestionVote, User
from app.schema.suggestion import SuggestionCreate, SuggestionRead

router = APIRouter(prefix="/suggestions", tags=["suggestions"])


@router.get("/", response_model=list[SuggestionRead])
def list_suggestions(db: Session = Depends(get_db)) -> list[SuggestionRead]:
    vote_count = func.count(SuggestionVote.user_id).label("votes")
    stmt = (
        select(Suggestion, vote_count)
        .select_from(Suggestion)
        .outerjoin(SuggestionVote, SuggestionVote.suggestion_id == Suggestion.id)
        .group_by(Suggestion.id)
        .order_by(vote_count.desc(), Suggestion.created_at.desc())
    )
    rows = db.execute(stmt).all()

    return [
        SuggestionRead(
            id=suggestion.id,
            user_id=suggestion.user_id,
            title=suggestion.title,
            description=suggestion.description,
            kind=suggestion.kind,
            created_at=suggestion.created_at,
            votes=int(votes or 0),
        )
        for suggestion, votes in rows
    ]


@router.post("/", response_model=SuggestionRead, status_code=status.HTTP_201_CREATED)
def create_suggestion(
    suggestion_in: SuggestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SuggestionRead:
    kind_value = suggestion_in.kind.value if hasattr(suggestion_in.kind, "value") else suggestion_in.kind
    suggestion = Suggestion(
        user_id=current_user.id,
        title=suggestion_in.title,
        description=suggestion_in.description,
        kind=kind_value,  # força persistir o valor do enum compatível com o tipo do banco
    )
    db.add(suggestion)
    db.commit()
    db.refresh(suggestion)

    return SuggestionRead(
        id=suggestion.id,
        user_id=suggestion.user_id,
        title=suggestion.title,
        description=suggestion.description,
        kind=suggestion.kind,
        created_at=suggestion.created_at,
        votes=0,
    )


@router.post("/{suggestion_id}/vote", status_code=status.HTTP_204_NO_CONTENT)
def vote_suggestion(
    suggestion_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    suggestion = db.get(Suggestion, suggestion_id)
    if not suggestion:
        raise HTTPException(status_code=404, detail="Sugestão não encontrada")

    already_voted = (
        db.execute(
            select(SuggestionVote).where(
                SuggestionVote.suggestion_id == suggestion_id,
                SuggestionVote.user_id == current_user.id,
            )
        )
        .scalars()
        .first()
        is not None
    )
    if already_voted:
        raise HTTPException(status_code=400, detail="Você já votou nesta sugestão.")

    vote = SuggestionVote(suggestion_id=suggestion_id, user_id=current_user.id)
    db.add(vote)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Você já votou nesta sugestão.")
