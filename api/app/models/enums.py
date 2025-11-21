"""Enums usados pelas entidades do domínio."""
from enum import Enum


class AssetType(str, Enum):
    STOCK = "STOCK"
    FII = "FII"
    CRYPTO = "CRYPTO"
    FIXED_INCOME = "FIXED_INCOME"
    ETF = "ETF"
    RENDA_FIXA = "RENDA_FIXA"
    FUND = "FUND"
    BDR = "BDR"
    OTHER = "OTHER"


class TransactionType(str, Enum):
    BUY = "BUY"
    SELL = "SELL"


class SuggestionKind(str, Enum):
    IDEIA = "ideia"
    BUG = "bug"
