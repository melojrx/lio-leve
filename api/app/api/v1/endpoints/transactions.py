"""Endpoints para transações."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models import Asset, Transaction, User
from app.schema.transaction import TransactionCreate, TransactionRead, TransactionUpdate

router = APIRouter(prefix="/transactions", tags=["transactions"])


def _get_owned_transaction(db: Session, transaction_id: uuid.UUID, user_id: uuid.UUID) -> Transaction:
    transaction = db.get(Transaction, transaction_id)
    if not transaction or transaction.user_id != user_id:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    return transaction


@router.get("/", response_model=list[TransactionRead])
def list_transactions(
    asset_id: uuid.UUID | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Transaction]:
    stmt = select(Transaction).where(Transaction.user_id == current_user.id)
    if asset_id:
        stmt = stmt.where(Transaction.asset_id == asset_id)
    stmt = stmt.order_by(Transaction.date.desc())
    return db.execute(stmt).scalars().all()


@router.post("/", response_model=TransactionRead, status_code=status.HTTP_201_CREATED)
def create_transaction(
    transaction_in: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Transaction:
    asset = db.get(Asset, transaction_in.asset_id)
    if not asset or asset.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Ativo não encontrado para esta transação")

    transaction = Transaction(user_id=current_user.id, **transaction_in.model_dump())
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


@router.get("/{transaction_id}", response_model=TransactionRead)
def retrieve_transaction(
    transaction_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Transaction:
    return _get_owned_transaction(db, transaction_id, current_user.id)


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    transaction = _get_owned_transaction(db, transaction_id, current_user.id)
    db.delete(transaction)
    db.commit()


@router.patch("/{transaction_id}", response_model=TransactionRead)
def update_transaction(
    transaction_id: uuid.UUID,
    transaction_in: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Transaction:
    transaction = _get_owned_transaction(db, transaction_id, current_user.id)

    if transaction_in.asset_id and transaction_in.asset_id != transaction.asset_id:
        asset = db.get(Asset, transaction_in.asset_id)
        if not asset or asset.user_id != current_user.id:
            raise HTTPException(status_code=404, detail="Ativo não encontrado para esta transação")
        transaction.asset_id = transaction_in.asset_id

    updates = transaction_in.model_dump(exclude_unset=True, exclude={"asset_id"})
    for field, value in updates.items():
        setattr(transaction, field, value)

    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction
