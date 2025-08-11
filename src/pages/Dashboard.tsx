import SEO from "@/components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

const series = {
  "1D": [
    { t: "10:00", v: 100 },
    { t: "11:00", v: 102 },
    { t: "12:00", v: 101 },
    { t: "13:00", v: 103 },
    { t: "14:00", v: 104 },
  ],
  "1M": [
    { t: "01", v: 95 },
    { t: "07", v: 98 },
    { t: "14", v: 101 },
    { t: "21", v: 104 },
    { t: "28", v: 107 },
  ],
  "1A": [
    { t: "JAN", v: 80 },
    { t: "MAR", v: 90 },
    { t: "MAI", v: 95 },
    { t: "AGO", v: 105 },
    { t: "NOV", v: 120 },
  ],
};

const pieData = [
  { name: "Ações", value: 55, color: "hsl(var(--primary))" },
  { name: "FIIs", value: 25, color: "hsl(var(--accent))" },
  { name: "Renda Fixa", value: 20, color: "hsl(var(--muted-foreground))" },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen">
      <SEO title="Dashboard — investorion.com.br" description="Resumo do seu patrimônio e desempenho." />
      <section className="container py-10 md:py-14">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Patrimônio</CardTitle>
              <p className="text-sm text-muted-foreground">Hoje: +1,8%</p>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs defaultValue="1M">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="text-3xl font-semibold">R$ 128.450</div>
                    <TabsList className="sm:ml-auto">
                      <TabsTrigger value="1D">1D</TabsTrigger>
                      <TabsTrigger value="1M">1M</TabsTrigger>
                      <TabsTrigger value="1A">1A</TabsTrigger>
                    </TabsList>
                  </div>
                {(["1D","1M","1A"] as const).map((k) => (
                  <TabsContent key={k} value={k} className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={series[k]} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="pv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="t" tickLine={false} axisLine={false} />
                        <YAxis hide />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                        <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" fill="url(#pv)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Composição</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={70} paddingAngle={3}>
                    {pieData.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                {pieData.map((e) => (
                  <div key={e.name} className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded" style={{ background: e.color }} />
                    {e.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
