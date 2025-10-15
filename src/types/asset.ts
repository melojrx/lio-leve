export type AssetType = "POUPANÇA" | "CONTA_CORRENTE" | "CRIPTO";

export interface Asset {
  id: string;
  type: AssetType;
  // For bancos/poupança/conta: institution name. For cripto: we'll store the coin name here for list rendering.
  institution: string;
  date: string; // ISO date of initial application or purchase date
  amount: number; // Total aplicado em BRL (para cripto: quantidade * preço unitário)
  cdiPercent?: number; // Optional: % over CDI (for Conta Corrente)

  // Campos opcionais para cripto
  coinId?: string; // CoinGecko id
  coinSymbol?: string; // e.g., BTC
  coinName?: string; // e.g., Bitcoin
  coinThumb?: string; // optional thumbnail URL
  quantity?: number; // quantidade comprada
  unitPriceBRL?: number; // preço unitário em BRL no momento da compra
}

export type MovementKind = "APLICACAO" | "RESGATE" | "TRANSFERENCIA";

export interface Movement {
  id: string;
  assetId: string;
  kind: MovementKind;
  date: string; // ISO
  amount: number;
  note?: string;
}
