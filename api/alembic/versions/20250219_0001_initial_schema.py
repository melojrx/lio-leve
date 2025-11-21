"""Esquema inicial migrado do Supabase"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20250219_0001"
down_revision = None
branch_labels = None
depends_on = None

# Define explicit enums and avoid auto-creating during table creation (we create them manually first)
asset_type_enum = postgresql.ENUM(
    "STOCK",
    "FII",
    "CRYPTO",
    "FIXED_INCOME",
    "ETF",
    "RENDA_FIXA",
    "FUND",
    "BDR",
    "OTHER",
    name="assettype",
    create_type=False,
)
transaction_type_enum = postgresql.ENUM("BUY", "SELL", name="transactiontype", create_type=False)


def upgrade() -> None:
    bind = op.get_bind()
    asset_type_enum.create(bind, checkfirst=True)
    transaction_type_enum.create(bind, checkfirst=True)
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')

    op.create_table(
        "users",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255)),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("is_superuser", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("last_login_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )

    op.create_table(
        "profiles",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            primary_key=True,
            nullable=False,
        ),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True),
        sa.Column("full_name", sa.String(length=255)),
        sa.Column("avatar_url", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )

    op.create_table(
        "assets",
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
        sa.Column("ticker", sa.String(length=16), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("asset_type", asset_type_enum, nullable=False),
        sa.Column("sector", sa.String(length=255)),
        sa.Column("quantity", sa.Numeric(20, 8), nullable=False, server_default=sa.text("0")),
        sa.Column("average_price", sa.Numeric(20, 8), nullable=False, server_default=sa.text("0")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )
    op.create_index("idx_assets_user_id", "assets", ["user_id"])
    op.create_index("idx_assets_ticker", "assets", ["ticker"])
    op.create_index("idx_assets_type", "assets", ["asset_type"])

    op.create_table(
        "transactions",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "asset_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("assets.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("transaction_type", transaction_type_enum, nullable=False),
        sa.Column("quantity", sa.Numeric(20, 8), nullable=False),
        sa.Column("unit_price", sa.Numeric(20, 8), nullable=False),
        sa.Column("fees", sa.Numeric(20, 8), nullable=False, server_default=sa.text("0")),
        sa.Column("date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("notes", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )
    op.create_index("idx_transactions_asset_id", "transactions", ["asset_id"])
    op.create_index("idx_transactions_user_id", "transactions", ["user_id"])
    op.execute("CREATE INDEX idx_transactions_date ON transactions(date DESC)")

    op.create_table(
        "blog_posts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "author_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
        ),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False, unique=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("excerpt", sa.Text()),
        sa.Column("category", sa.String(length=64), nullable=False),
        sa.Column("cover_image", sa.String(length=255)),
        sa.Column("published", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("published_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )
    op.create_index("idx_blog_posts_slug", "blog_posts", ["slug"], unique=True)
    op.create_index(
        "idx_blog_posts_published", "blog_posts", ["published"], postgresql_where=sa.text("published = TRUE")
    )

    op.execute(
        """
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        """
    )

    for table in ("profiles", "assets", "blog_posts"):
        op.execute(
            f"""
            CREATE TRIGGER update_{table}_updated_at
            BEFORE UPDATE ON {table}
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
            """
        )

    op.execute(
        """
        CREATE OR REPLACE FUNCTION recalculate_average_price()
        RETURNS TRIGGER AS $$
        DECLARE
          v_asset_id UUID;
          total_quantity NUMERIC;
          total_cost NUMERIC;
          avg_price NUMERIC;
        BEGIN
          v_asset_id := COALESCE(NEW.asset_id, OLD.asset_id);

          SELECT COALESCE(SUM(quantity), 0), COALESCE(SUM(quantity * unit_price), 0)
          INTO total_quantity, total_cost
          FROM transactions
          WHERE asset_id = v_asset_id
            AND transaction_type = 'BUY';

          SELECT total_quantity - COALESCE(SUM(quantity), 0)
          INTO total_quantity
          FROM transactions
          WHERE asset_id = v_asset_id
            AND transaction_type = 'SELL';

          IF total_quantity > 0 THEN
            avg_price := total_cost / total_quantity;
          ELSE
            avg_price := 0;
          END IF;

          UPDATE assets
          SET quantity = total_quantity,
              average_price = avg_price,
              updated_at = NOW()
          WHERE id = v_asset_id;

          RETURN COALESCE(NEW, OLD);
        END;
        $$ LANGUAGE plpgsql;
        """
    )

    op.execute(
        """
        CREATE TRIGGER update_asset_average_price
        AFTER INSERT OR UPDATE OR DELETE ON transactions
        FOR EACH ROW EXECUTE FUNCTION recalculate_average_price();
        """
    )

    op.execute(
        """
        CREATE OR REPLACE VIEW portfolio_summary AS
        SELECT
          a.user_id,
          COUNT(DISTINCT a.id) AS total_assets,
          SUM(a.quantity * a.average_price) AS total_invested,
          COUNT(DISTINCT t.id) AS total_transactions
        FROM assets a
        LEFT JOIN transactions t ON t.asset_id = a.id
        WHERE a.is_active = TRUE
        GROUP BY a.user_id;
        """
    )

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
          ROUND((SUM(a.quantity * a.average_price) / ut.user_total) * 100, 2) AS percentage
        FROM assets a
        JOIN user_totals ut ON ut.user_id = a.user_id
        WHERE a.is_active = TRUE
        GROUP BY a.user_id, a.asset_type, ut.user_total;
        """
    )


def downgrade() -> None:
    op.execute("DROP VIEW IF EXISTS portfolio_allocation")
    op.execute("DROP VIEW IF EXISTS portfolio_summary")
    op.execute("DROP TRIGGER IF EXISTS update_asset_average_price ON transactions")
    op.execute("DROP FUNCTION IF EXISTS recalculate_average_price")
    for table in ("profiles", "assets", "blog_posts"):
        op.execute(f"DROP TRIGGER IF EXISTS update_{table}_updated_at ON {table}")
    op.execute("DROP FUNCTION IF EXISTS update_updated_at_column")

    op.drop_index("idx_blog_posts_published", table_name="blog_posts")
    op.drop_index("idx_blog_posts_slug", table_name="blog_posts")
    op.drop_table("blog_posts")

    op.execute("DROP INDEX IF EXISTS idx_transactions_date")
    op.drop_index("idx_transactions_user_id", table_name="transactions")
    op.drop_index("idx_transactions_asset_id", table_name="transactions")
    op.drop_table("transactions")

    op.drop_index("idx_assets_type", table_name="assets")
    op.drop_index("idx_assets_ticker", table_name="assets")
    op.drop_index("idx_assets_user_id", table_name="assets")
    op.drop_table("assets")

    op.drop_table("profiles")
    op.drop_table("users")

    transaction_type_enum.drop(op.get_bind(), checkfirst=True)
    asset_type_enum.drop(op.get_bind(), checkfirst=True)
