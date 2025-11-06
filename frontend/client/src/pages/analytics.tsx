import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ForecastChart from '@/components/ForecastChart';
import HourlyTable from '@/components/HourlyTable';
import SupplyBreakdown from '@/components/SupplyBreakdown';
import ImportsExports from '@/components/ImportsExports';
import PeakForecast from '@/components/PeakForecast';
import PredictedLow from '@/components/PredictedLow';

interface ForecastDataPoint {
  hour: string;
  predicted: number;
  actual: number;
}

interface ForecastResponse {
  forecast_data: ForecastDataPoint[];
  peak: {
    hour: string;
    demand: number;
  };
  low: {
    hour: string;
    demand: number;
  };
  timestamp: string;
  total_hours: number;
}

interface SupplySource {
  source: string;
  mw: number;
  color: string;
}

interface HourlyDataResponse {
  supply_breakdown: SupplySource[];
  imports: number;
  exports: number;
  fetched_at: string;
  file_key: string;
}

// Fallback supply data
const fallbackSupplyData: SupplySource[] = [
  { source: 'Nuclear', mw: 7320, color: '#8B5CF6' },
  { source: 'Gas', mw: 5215, color: '#EF4444' },
  { source: 'Wind', mw: 2782, color: '#10B981' },
  { source: 'Hydro', mw: 2788, color: '#3B82F6' },
  { source: 'Solar', mw: 82, color: '#FBBF24' },
  { source: 'Biofuel', mw: 20, color: '#84CC16' },
];

export default function Analytics() {
  const { data: forecastResponse, isLoading: isLoadingForecast, error: forecastError } = useQuery<ForecastResponse>({
    queryKey: ['http://localhost:8000/api/forecast/latest'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8000/api/forecast/latest');
      if (!response.ok) {
        throw new Error('Failed to fetch forecast data');
      }
      return response.json();
    },
  });

  const { data: hourlyDataResponse, isLoading: isLoadingHourly, error: hourlyError } = useQuery<HourlyDataResponse>({
    queryKey: ['http://localhost:8000/api/hourly-data/latest'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8000/api/hourly-data/latest');
      if (!response.ok) {
        throw new Error('Failed to fetch hourly data');
      }
      return response.json();
    },
  });

  const lastUpdated = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Use fallback data if loading or error
  const forecastData: ForecastDataPoint[] = forecastResponse?.forecast_data || [];
  
  // Sort forecast data by hour to ensure proper ordering
  const sortedForecastData = [...forecastData].sort((a, b) => {
    const [aHour, aMin] = a.hour.split(':').map(Number);
    const [bHour, bMin] = b.hour.split(':').map(Number);
    return aHour * 60 + aMin - (bHour * 60 + bMin);
  });
  
  // Map to hourly data format for the table
  const hourlyData = sortedForecastData.map(item => ({
    hour: item.hour,
    predicted: item.predicted,
    actual: item.actual,
    // Calculate error percentage, handling division by zero
    error: item.actual !== 0 
      ? ((item.predicted - item.actual) / item.actual) * 100 
      : 0
  }));

  // Use sorted data for charts and calculations
  const sparklineData = sortedForecastData.map(item => item.predicted);
  
  // Calculate low demand from actual data or use API response
  const lowData = forecastResponse?.low 
    ? { hour: forecastResponse.low.hour, predicted: forecastResponse.low.demand }
    : (sortedForecastData.length > 0 
        ? sortedForecastData.reduce((min, item) => item.predicted < min.predicted ? item : min)
        : { hour: '00:00', predicted: 0 });

  const peakHour = forecastResponse?.peak?.hour || '17:00';
  const peakDemand = forecastResponse?.peak?.demand || 15740;
  const timestamp = forecastResponse?.timestamp || '12:00 AM';

  // Get supply breakdown and import/export data from API or use fallbacks
  const supplyData = hourlyDataResponse?.supply_breakdown || fallbackSupplyData;
  const imports = hourlyDataResponse?.imports || 173;
  const exports = hourlyDataResponse?.exports || 1668;
  
  const isLoading = isLoadingForecast || isLoadingHourly;
  const error = forecastError || hourlyError;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-4 md:pt-6 pb-8 md:pb-12">
        <div className="mb-4 text-center">
          <p className="text-muted-foreground text-sm">
            Last Updated: <span className="text-cyan-400 font-medium">{lastUpdated}</span>
          </p>
          {error && (
            <p className="text-red-400 text-sm mt-2">
              Error loading data. Using fallback data.
            </p>
          )}
          {isLoading && (
            <p className="text-muted-foreground text-sm mt-2">
              Loading data...
            </p>
          )}
        </div>

        <div className="space-y-8">
          <div className="grid md:grid-cols-3 gap-6">
            <PeakForecast 
              peakHour={peakHour} 
              peakDemand={peakDemand} 
              sparklineData={sparklineData}
            />
            <PredictedLow 
              lowHour={lowData.hour}
              lowDemand={lowData.predicted}
              sparklineData={sparklineData}
            />
            <ImportsExports imports={imports} exports={exports} />
          </div>

          <ForecastChart data={sortedForecastData} timestamp={timestamp} />
          
          <HourlyTable data={hourlyData} currentHour={9} />

          <SupplyBreakdown data={supplyData} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
