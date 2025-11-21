"""Expand assettype enum with supabase-compatible values."""
from __future__ import annotations

from alembic import op

# revision identifiers, used by Alembic.
revision = "20251120_0002"
down_revision = "20250219_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
  # Inclusão dos tipos usados no frontend/supabase; IF NOT EXISTS evita falha em ambientes já ajustados
  for value in ("ETF", "RENDA_FIXA", "FUND", "BDR", "OTHER"):
    op.execute(f"ALTER TYPE assettype ADD VALUE IF NOT EXISTS '{value}';")


def downgrade() -> None:
  # Não há remoção segura de enums individuais; downgrade é no-op.
  pass
