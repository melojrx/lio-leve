import type { Asset, Movement } from "@/types/asset";

const ASSETS_KEY = "portfolio_assets";
const MOVEMENTS_PREFIX = "asset_movements:"; // + assetId

function safeParse<T>(value: string | null, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getAssets(): Asset[] {
  return safeParse<Asset[]>(localStorage.getItem(ASSETS_KEY), []);
}

export function saveAssets(list: Asset[]) {
  localStorage.setItem(ASSETS_KEY, JSON.stringify(list));
}

export function getMovements(assetId: string): Movement[] {
  return safeParse<Movement[]>(localStorage.getItem(MOVEMENTS_PREFIX + assetId), []);
}

export function saveMovements(assetId: string, list: Movement[]) {
  localStorage.setItem(MOVEMENTS_PREFIX + assetId, JSON.stringify(list));
}

export function deleteAsset(assetId: string) {
  const assets = getAssets().filter((a) => a.id !== assetId);
  saveAssets(assets);
  localStorage.removeItem(MOVEMENTS_PREFIX + assetId);
}
