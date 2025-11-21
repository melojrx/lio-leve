"""Coalesce nulls in portfolio_allocation view to avoid validation errors."""
from __future__ import annotations

from alembic import op

# revision identifiers, used by Alembic.
revision = "20251120_0004"
down_revision = "20251120_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE OR REPLACE VIEW portfolio_allocation AS
        WITH user_totals AS (
          SELECT user_id, SUM(quantity * average_price) AS user_total
          FROM assets
          WHERE is_active = TRUE
          GROUP BY user_id
        )
        SELECT
          a.user_id,
          a.asset_type,
          COUNT(a.id) AS asset_count,
          COALESCE(SUM(a.quantity * a.average_price), 0) AS type_total,
          COALESCE(ROUND((SUM(a.quantity * a.average_price) / NULLIF(ut.user_total, 0)) * 100, 2), 0) AS percentage
        FROM assets a
        JOIN user_totals ut ON ut.user_id = a.user_id
        WHERE a.is_active = TRUE
        GROUP BY a.user_id, a.asset_type, ut.user_total;
        """
    )


def downgrade() -> None:
    op.execute(
        """
        CREATE OR REPLACE VIEW portfolio_allocation AS
        WITH user_totals AS (
          SELECT user_id, SUM(quantity * average_price) AS user_total
          FROM assets
          WHERE is_active = TRUE
          GROUP BY user_id
        )
        SELECT
          a.user_id,
          a.asset_type,
          COUNT(a.id) AS asset_count,
          SUM(a.quantity * a.average_price) AS type_total,
          ROUND((SUM(a.quantity * a.average_price) / NULLIF(ut.user_total, 0)) * 100, 2) AS percentage
        FROM assets a
        JOIN user_totals ut ON ut.user_id = a.user_id
        WHERE a.is_active = TRUE
        GROUP BY a.user_id, a.asset_type, ut.user_total;
        """
    )
