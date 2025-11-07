import { TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface PredictedLowProps {
  lowHour?: string;
  lowDemand?: number;
  sparklineData?: number[];
}

export default function PredictedLow({ lowHour, lowDemand, sparklineData }: PredictedLowProps) {
  const chartData = sparklineData?.map(value => ({ value })) || [];

  return (
    <Card className="p-6 md:p-8 rounded-xl bg-card border-card-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg md:text-xl font-medium text-card-foreground">
          Predicted Low
        </h2>
        <TrendingDown className="w-6 h-6 text-blue-400" />
      </div>

      <div className="space-y-4">
        <div data-testid="metric-low-hour">
          <p className="text-xs text-muted-foreground mb-1">Low Hour</p>
          <p className="text-4xl font-bold text-blue-400">
            {lowHour || '--'}
          </p>
        </div>

        <div data-testid="metric-low-demand">
          <p className="text-xs text-muted-foreground mb-1">Low Demand</p>
          <p className="text-2xl font-semibold text-card-foreground">
            {lowDemand !== undefined ? lowDemand.toLocaleString() : '--'}
            {lowDemand !== undefined && <span className="text-sm text-muted-foreground ml-2">MW</span>}
          </p>
        </div>

        {sparklineData && sparklineData.length > 0 && (
          <div className="h-16 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#60A5FA" 
                  strokeWidth={2}
                  fill="url(#colorLow)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  );
}

