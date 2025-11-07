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
  actual: number | null;
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
    // Calculate error percentage, handling division by zero and null values
    error: item.actual !== null && item.actual !== 0 
      ? ((item.predicted - item.actual) / item.actual) * 100 
      : null
  }));

  // Use sorted data for charts and calculations
  const sparklineData = sortedForecastData.map(item => item.predicted);
  
  // Calculate low demand from actual data or use API response
  const lowData = forecastResponse?.low 
    ? { hour: forecastResponse.low.hour, predicted: forecastResponse.low.demand }
    : (sortedForecastData.length > 0 
        ? sortedForecastData.reduce((min, item) => item.predicted < min.predicted ? item : min)
        : { hour: undefined, predicted: undefined });

  const peakHour = forecastResponse?.peak?.hour;
  const peakDemand = forecastResponse?.peak?.demand;
  const timestamp = forecastResponse?.timestamp;

  // Get supply breakdown and import/export data from API
  const supplyData = hourlyDataResponse?.supply_breakdown;
  const imports = hourlyDataResponse?.imports;
  const exports = hourlyDataResponse?.exports;
  
  const isLoading = isLoadingForecast || isLoadingHourly;
  const error = forecastError || hourlyError;

  // Calculate the current hour to highlight (one hour behind)
  // If current time is 00:00, nothing will be highlighted
  const getCurrentHourIndex = (): number | undefined => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // If it's 00:00, return undefined so nothing is highlighted
    if (currentHour === 0) {
      return undefined;
    }
    
    // Calculate previous hour (one hour behind)
    const previousHour = currentHour - 1;
    
    // Find the index in sortedForecastData that matches this hour
    // Match by extracting the hour part from the hour string (e.g., "01:00" -> 1, "23:00" -> 23)
    const index = sortedForecastData.findIndex(item => {
      const itemHour = parseInt(item.hour.split(':')[0], 10);
      return itemHour === previousHour;
    });
    
    // Return the index if found, otherwise undefined
    return index >= 0 ? index : undefined;
  };

  const currentHourIndex = getCurrentHourIndex();

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
              Error loading data.
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

          <ForecastChart data={sortedForecastData} timestamp={timestamp || '--'} />
          
          <HourlyTable data={hourlyData} currentHour={currentHourIndex} />

          <SupplyBreakdown data={supplyData} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
