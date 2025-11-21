"""Cria tabelas de sugestões e votos."""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20251120_0005"
down_revision = "20251120_0004"
branch_labels = None
depends_on = None

suggestion_kind_enum = postgresql.ENUM(
    "ideia",
    "bug",
    name="suggestionkind",
    create_type=False,
)


def upgrade() -> None:
    bind = op.get_bind()
    suggestion_kind_enum.create(bind, checkfirst=True)

    op.create_table(
        "suggestions",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("kind", suggestion_kind_enum, nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )
    op.create_index("idx_suggestions_user_id", "suggestions", ["user_id"])
    op.create_index("idx_suggestions_kind", "suggestions", ["kind"])
    op.create_index("idx_suggestions_created_at", "suggestions", ["created_at"])

    op.create_table(
        "suggestion_votes",
        sa.Column(
            "suggestion_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("suggestions.id", ondelete="CASCADE"),
            primary_key=True,
            nullable=False,
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            primary_key=True,
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )
    op.create_index(
        "idx_suggestion_votes_suggestion_id", "suggestion_votes", ["suggestion_id"]
    )
    op.create_index("idx_suggestion_votes_user_id", "suggestion_votes", ["user_id"])


def downgrade() -> None:
    op.drop_index("idx_suggestion_votes_user_id", table_name="suggestion_votes")
    op.drop_index("idx_suggestion_votes_suggestion_id", table_name="suggestion_votes")
    op.drop_table("suggestion_votes")

    op.drop_index("idx_suggestions_created_at", table_name="suggestions")
    op.drop_index("idx_suggestions_kind", table_name="suggestions")
    op.drop_index("idx_suggestions_user_id", table_name="suggestions")
    op.drop_table("suggestions")

    suggestion_kind_enum.drop(op.get_bind(), checkfirst=True)
