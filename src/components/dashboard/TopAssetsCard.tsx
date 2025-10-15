import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Asset } from "@/lib/api";

interface TopAssetsCardProps {
  assets: Asset[];
  totalInvested: number;
}

function formatCurrencyBRL(value: number) {
  if (isNaN(value)) return "R$ 0,00";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export const TopAssetsCard = ({ assets, totalInvested }: TopAssetsCardProps) => {
  if (!assets || assets.length === 0) {
    return null; // Não renderiza nada se não houver ativos
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Ativos (em sua carteira)</CardTitle>
        <CardDescription>Seus maiores investimentos por valor aplicado.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {assets.map((asset) => {
            const assetValue = asset.quantity * asset.average_price;
            const percentage = totalInvested > 0 ? (assetValue / totalInvested) * 100 : 0;

            return (
              <div key={asset.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium">{asset.ticker}</span>
                  <span className="text-muted-foreground">{formatCurrencyBRL(assetValue)}</span>
                </div>
                <Progress value={percentage} aria-label={`${percentage.toFixed(1)}% do total`} />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};