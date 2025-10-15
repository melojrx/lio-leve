export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AssetType = "STOCK" | "FII" | "CRYPTO" | "ETF" | "RENDA_FIXA" | "FUND" | "BDR" | "OTHER";
export type TransactionType = "BUY" | "SELL" | "TRANSFER";

export interface Database {
  public: {
    Tables: {
      assets: {
        Row: {
          id: string
          user_id: string
          ticker: string
          name: string
          asset_type: AssetType
          sector: string | null
          quantity: number
          average_price: number
          is_active: boolean
          created_at: string
          updated_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          ticker: string
          name: string
          asset_type: AssetType
          sector?: string | null
          notes?: string | null
        }
        Update: {
          notes?: string | null
          sector?: string | null
          name?: string
          ticker?: string
          asset_type?: AssetType
        }
      }
      transactions: {
        Row: {
          id: string
          asset_id: string
          user_id: string
          transaction_type: TransactionType
          quantity: number
          unit_price: number
          fees: number
          date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          asset_id: string
          user_id: string
          transaction_type: TransactionType
          quantity: number
          unit_price: number
          fees?: number
          date: string
        }
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          cpf: string | null
          phone: string | null
          birth_date: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          cpf?: string | null
          phone?: string | null
          birth_date?: string | null
        }
      }
    }
    Views: {
      portfolio_summary: {
        Row: {
          user_id: string | null
          total_assets: number | null
          total_invested: number | null
          total_transactions: number | null
        }
      }
      portfolio_allocation: {
        Row: {
          user_id: string | null
          asset_type: string | null
          asset_count: number | null
          type_total: number | null
          percentage: number | null
        }
      }
    }
    Functions: {}
  }
}