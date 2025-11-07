import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';

interface SupplySource {
  source: string;
  mw: number;
  color: string;
}

interface SupplyBreakdownProps {
  data?: SupplySource[];
}

export default function SupplyBreakdown({ data }: SupplyBreakdownProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-6 md:p-8 rounded-xl bg-card border-card-border">
        <h2 className="text-xl md:text-2xl font-medium text-card-foreground mb-6">
          Supply Breakdown
        </h2>
        <div className="text-center text-muted-foreground py-8">
          No data available
        </div>
      </Card>
    );
  }

  const total = data.reduce((sum, item) => sum + item.mw, 0);
  const chartData = data.map(item => ({
    name: item.source,
    value: item.mw,
    percentage: ((item.mw / total) * 100).toFixed(1)
  }));

  return (
    <Card className="p-6 md:p-8 rounded-xl bg-card border-card-border">
      <h2 className="text-xl md:text-2xl font-medium text-card-foreground mb-6">
        Supply Breakdown
      </h2>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="table-supply">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Source
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  MW
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => {
                const percentage = ((row.mw / total) * 100).toFixed(1);
                return (
                  <tr
                    key={row.source}
                    className={index % 2 === 0 ? "bg-transparent" : "bg-muted/10"}
                    data-testid={`row-supply-${index}`}
                  >
                    <td className="px-4 py-3 text-sm text-card-foreground font-medium flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: row.color }} />
                      {row.source}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground text-right">
                      {row.mw.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground text-right">
                      {percentage}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="h-80 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={130}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
                itemStyle={{ color: '#ffffff' }}
                labelStyle={{ color: '#ffffff' }}
                formatter={(value: number, name: string, props: any) => [
                  `${value.toLocaleString()} MW (${props.payload.percentage}%)`,
                  name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
