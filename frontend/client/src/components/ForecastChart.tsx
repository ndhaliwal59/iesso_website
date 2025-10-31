import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';

interface ForecastData {
  hour: string;
  predicted: number;
  actual: number;
}

interface ForecastChartProps {
  data: ForecastData[];
  timestamp?: string;
}

export default function ForecastChart({ data, timestamp = "12:00 AM" }: ForecastChartProps) {
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
              style={{ fontSize: '12px', fill: '#9CA3AF' }}
            />
            <YAxis 
              domain={[10000, 'auto']}
              stroke="#9CA3AF"
              style={{ fontSize: '12px', fill: '#9CA3AF' }}
              label={{ value: 'MW', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: 'none', 
                borderRadius: '8px',
                color: '#fff'
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
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-sm text-muted-foreground text-center mt-4">
        Prediction generated at: {timestamp}
      </p>
    </Card>
  );
}
