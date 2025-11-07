import { TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface PeakForecastProps {
  peakHour?: string;
  peakDemand?: number;
  sparklineData?: number[];
}

export default function PeakForecast({ peakHour, peakDemand, sparklineData }: PeakForecastProps) {
  const chartData = sparklineData?.map(value => ({ value })) || [];

  return (
    <Card className="p-6 md:p-8 rounded-xl bg-card border-card-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg md:text-xl font-medium text-card-foreground">
          Predicted Peak
        </h2>
        <TrendingUp className="w-6 h-6 text-cyan-400" />
      </div>

      <div className="space-y-4">
        <div data-testid="metric-peak-hour">
          <p className="text-xs text-muted-foreground mb-1">Peak Hour</p>
          <p className="text-4xl font-bold text-cyan-400">
            {peakHour || '--'}
          </p>
        </div>

        <div data-testid="metric-peak-demand">
          <p className="text-xs text-muted-foreground mb-1">Peak Demand</p>
          <p className="text-2xl font-semibold text-card-foreground">
            {peakDemand !== undefined ? peakDemand.toLocaleString() : '--'}
            {peakDemand !== undefined && <span className="text-sm text-muted-foreground ml-2">MW</span>}
          </p>
        </div>

        {sparklineData && sparklineData.length > 0 && (
          <div className="h-16 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPeak" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FFFF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00FFFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#00FFFF" 
                  strokeWidth={2}
                  fill="url(#colorPeak)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  );
}
