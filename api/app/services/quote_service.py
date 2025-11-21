"""Serviço para buscar cotações externas."""
from __future__ import annotations

import asyncio
from typing import Any

import httpx

from app.schema.quote import QuoteAssetType, QuoteInput, QuoteResult

BRAPI_URL = "https://brapi.dev/api/quote/{ticker}?range=1d&interval=1d&fundamental=false"
COINGECKO_URL = "https://api.coingecko.com/api/v3/simple/price"
AWESOMEAPI_URL = "https://economia.awesomeapi.com.br/last/{pair}"

CRYPTO_ID_MAP: dict[str, str] = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
}


async def _fetch_stock(client: httpx.AsyncClient, ticker: str) -> QuoteResult | None:
    try:
        resp = await client.get(BRAPI_URL.format(ticker=ticker))
        resp.raise_for_status()
        data = resp.json()
        result = (data or {}).get("results", [{}])[0]
        if not result:
            return None
        return QuoteResult(
            symbol=result.get("symbol", ticker).upper(),
            name=result.get("shortName") or result.get("longName"),
            price=float(result.get("regularMarketPrice")),
            change_percent=float(result.get("regularMarketChangePercent", 0)),
            type=QuoteAssetType.STOCK,
        )
    except Exception:
        return None


async def _fetch_crypto(client: httpx.AsyncClient, ticker: str) -> QuoteResult | None:
    crypto_id = CRYPTO_ID_MAP.get(ticker.upper())
    if not crypto_id:
        return None
    params = {"ids": crypto_id, "vs_currencies": "brl"}
    try:
        resp = await client.get(COINGECKO_URL, params=params)
        resp.raise_for_status()
        data = resp.json()
        price = (data.get(crypto_id) or {}).get("brl")
        if price is None:
            return None
        return QuoteResult(
            symbol=ticker.upper(),
            name=crypto_id.capitalize(),
            price=float(price),
            change_percent=None,
            type=QuoteAssetType.CRYPTO,
        )
    except Exception:
        return None


async def _fetch_fx(client: httpx.AsyncClient, pair: str) -> QuoteResult | None:
    try:
        resp = await client.get(AWESOMEAPI_URL.format(pair=pair))
        resp.raise_for_status()
        data = resp.json()
        key = pair.replace("-", "")
        result: dict[str, Any] | None = data.get(key)
        if not result:
            return None
        return QuoteResult(
            symbol=pair.replace("-", "/"),
            name=result.get("name"),
            price=float(result.get("bid")),
            change_percent=float(result.get("pctChange", 0)),
            type=QuoteAssetType.FX,
        )
    except Exception:
        return None


async def fetch_quotes(assets: list[QuoteInput]) -> list[QuoteResult]:
    if not assets:
        return []

    async with httpx.AsyncClient(timeout=10.0) as client:
        tasks = []
        for asset in assets:
            if asset.type == QuoteAssetType.STOCK:
                tasks.append(_fetch_stock(client, asset.ticker))
            elif asset.type == QuoteAssetType.CRYPTO:
                tasks.append(_fetch_crypto(client, asset.ticker))
            elif asset.type == QuoteAssetType.FX:
                tasks.append(_fetch_fx(client, asset.ticker))
        results = await asyncio.gather(*tasks)

    return [quote for quote in results if quote is not None]
