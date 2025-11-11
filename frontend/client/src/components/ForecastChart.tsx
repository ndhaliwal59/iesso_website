import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';

interface ForecastData {
  hour: string;
  predicted: number;
  actual: number | null;
}

interface ForecastChartProps {
  data: ForecastData[];
  timestamp?: string;
}

export default function ForecastChart({ data, timestamp = "12:00 AM" }: ForecastChartProps) {
  // Calculate min and max values from the data to set a tighter y-axis range
  const allValues = data.flatMap(d => [d.predicted, d.actual].filter(v => v !== null && v !== undefined)) as number[];
  const minValue = allValues.length > 0 ? Math.min(...allValues) : 0;
  const maxValue = allValues.length > 0 ? Math.max(...allValues) : 10000;
  const range = maxValue - minValue;
  // Add 5% padding on top and bottom for better visualization
  const padding = range > 0 ? range * 0.05 : maxValue * 0.1;
  // Round to nearest thousand: round min down, max up
  const yAxisMin = Math.max(0, Math.floor((minValue - padding) / 1000) * 1000);
  const yAxisMax = Math.ceil((maxValue + padding) / 1000) * 1000;
  
  // Generate ticks every 1,000 for visual marks, but only label every 2,000
  const yAxisTicks: number[] = [];
  for (let i = yAxisMin; i <= yAxisMax; i += 1000) {
    yAxisTicks.push(i);
  }

  return (
    <Card className="p-6 md:p-8 rounded-xl bg-card border-card-border">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-medium text-card-foreground mb-2">
          24-Hour Energy Demand Forecast
        </h2>
        <p className="text-sm text-muted-foreground">
          Predicted vs. Actual demand in megawatts (MW)
        </p>
      </div>

      <div className="h-80 md:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="hour" 
              stroke="#9CA3AF"
              style={{ fontSize: '16px', fill: '#9CA3AF' }}
              ticks={['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00']}
              tickMargin={10}
              tickFormatter={(value) => {
                // Extract just the hour part (e.g., "00:00" -> "00", "03:00" -> "03")
                if (!value) return '';
                const [hours] = value.split(':');
                return hours;
              }}
            />
            <YAxis 
              domain={[yAxisMin, yAxisMax]}
              ticks={yAxisTicks}
              stroke="#9CA3AF"
              style={{ fontSize: '12px', fill: '#9CA3AF' }}
              label={{ value: 'MW', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }}
              tickFormatter={(value) => {
                // Only show labels for multiples of 2,000, hide labels for odd thousands
                if (value % 2000 === 0) {
                  return Math.round(value).toLocaleString();
                }
                return '';
              }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: 'none', 
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value: any, name: string) => {
                if (value === null || value === undefined) {
                  return ['N/A', name];
                }
                return [typeof value === 'number' ? value.toLocaleString() : value, name];
              }}
            />
            <Legend wrapperStyle={{ color: '#9CA3AF' }} />
            <Line 
              type="monotone" 
              dataKey="predicted" 
              stroke="#00FFFF" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Predicted Demand"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#FF9800" 
              strokeWidth={2}
              name="Actual Demand"
              dot={false}
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
