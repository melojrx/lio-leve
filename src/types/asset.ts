export type AssetType = "POUPANÇA";

export interface Asset {
  id: string;
  type: AssetType;
  institution: string; // Bank full name
  date: string; // ISO date of initial application
  amount: number; // Initial applied amount (BRL)
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
