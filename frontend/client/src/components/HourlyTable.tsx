import { Card } from '@/components/ui/card';

interface HourlyData {
  hour: string;
  predicted: number;
  actual: number;
  error: number;
}

interface HourlyTableProps {
  data: HourlyData[];
  currentHour?: number;
}

export default function HourlyTable({ data, currentHour }: HourlyTableProps) {
  // Split data into two halves: first 12 hours and last 12 hours
  const firstHalf = data.slice(0, 12);
  const secondHalf = data.slice(12, 24);

  const renderTable = (tableData: HourlyData[], startIndex: number) => (
    <div className="overflow-x-auto flex-1">
      <table className="w-full" data-testid={`table-hourly-${startIndex === 0 ? 'left' : 'right'}`}>
        <thead>
          <tr className="bg-muted/30 border-b border-border">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Hour
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Predicted (MW)
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Actual (MW)
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Error (%)
            </th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, localIndex) => {
            const globalIndex = startIndex + localIndex;
            return (
              <tr
                key={row.hour}
                className={`border-b border-border/50 ${
                  globalIndex === currentHour
                    ? "bg-cyan-500/10 border-l-4 border-l-cyan-400"
                    : localIndex % 2 === 0
                    ? "bg-transparent"
                    : "bg-muted/10"
                }`}
                data-testid={`row-hour-${globalIndex}`}
              >
                <td className="px-4 py-3 text-sm text-card-foreground font-medium">
                  {row.hour}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground text-right">
                  {row.predicted.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground text-right">
                  {row.actual.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground text-right">
                  {row.error.toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <Card className="p-6 md:p-8 rounded-xl bg-card border-card-border">
      <h2 className="text-xl md:text-2xl font-medium text-card-foreground mb-6">
        Hourly Breakdown
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {renderTable(firstHalf, 0)}
        {renderTable(secondHalf, 12)}
      </div>
    </Card>
  );
}
