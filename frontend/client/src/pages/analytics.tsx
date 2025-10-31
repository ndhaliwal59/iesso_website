import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ForecastChart from '@/components/ForecastChart';
import HourlyTable from '@/components/HourlyTable';
import SupplyBreakdown from '@/components/SupplyBreakdown';
import ImportsExports from '@/components/ImportsExports';
import PeakForecast from '@/components/PeakForecast';
import PredictedLow from '@/components/PredictedLow';

const forecastData = [
  { hour: '00:00', predicted: 13850, actual: 13810 },
  { hour: '01:00', predicted: 14020, actual: 13990 },
  { hour: '02:00', predicted: 13680, actual: 13720 },
  { hour: '03:00', predicted: 13450, actual: 13480 },
  { hour: '04:00', predicted: 13290, actual: 13310 },
  { hour: '05:00', predicted: 13420, actual: 13450 },
  { hour: '06:00', predicted: 14100, actual: 14120 },
  { hour: '07:00', predicted: 14890, actual: 14850 },
  { hour: '08:00', predicted: 15420, actual: 15390 },
  { hour: '09:00', predicted: 15680, actual: 15710 },
  { hour: '10:00', predicted: 15550, actual: 15520 },
  { hour: '11:00', predicted: 15480, actual: 15500 },
  { hour: '12:00', predicted: 15390, actual: 15410 },
  { hour: '13:00', predicted: 15320, actual: 15300 },
  { hour: '14:00', predicted: 15450, actual: 15480 },
  { hour: '15:00', predicted: 15620, actual: 15590 },
  { hour: '16:00', predicted: 15710, actual: 15740 },
  { hour: '17:00', predicted: 15740, actual: 15720 },
  { hour: '18:00', predicted: 15650, actual: 15680 },
  { hour: '19:00', predicted: 15380, actual: 15410 },
  { hour: '20:00', predicted: 15120, actual: 15090 },
  { hour: '21:00', predicted: 14780, actual: 14810 },
  { hour: '22:00', predicted: 14420, actual: 14390 },
  { hour: '23:00', predicted: 14050, actual: 14080 },
];

const hourlyData = forecastData.map(item => ({
  hour: item.hour,
  predicted: item.predicted,
  actual: item.actual,
  error: ((item.predicted - item.actual) / item.actual) * 100
}));

const supplyData = [
  { source: 'Nuclear', mw: 7320, color: '#8B5CF6' },
  { source: 'Gas', mw: 5215, color: '#EF4444' },
  { source: 'Wind', mw: 2782, color: '#10B981' },
  { source: 'Hydro', mw: 2788, color: '#3B82F6' },
  { source: 'Solar', mw: 82, color: '#FBBF24' },
  { source: 'Biofuel', mw: 20, color: '#84CC16' },
];

const sparklineData = forecastData.map(item => item.predicted);

// Calculate low demand
const lowData = forecastData.reduce((min, item) => 
  item.predicted < min.predicted ? item : min
);

export default function Analytics() {
  const lastUpdated = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-4 md:pt-6 pb-8 md:pb-12">
        <div className="mb-4 text-center">
          <p className="text-muted-foreground text-sm">
            Last Updated: <span className="text-cyan-400 font-medium">{lastUpdated}</span>
          </p>
        </div>

        <div className="space-y-8">
          <div className="grid md:grid-cols-3 gap-6">
            <PeakForecast 
              peakHour="17:00" 
              peakDemand={15740} 
              sparklineData={sparklineData}
            />
            <PredictedLow 
              lowHour={lowData.hour}
              lowDemand={lowData.predicted}
              sparklineData={sparklineData}
            />
            <ImportsExports imports={173} exports={1668} />
          </div>

          <ForecastChart data={forecastData} timestamp="12:00 AM" />
          
          <HourlyTable data={hourlyData} currentHour={9} />

          <SupplyBreakdown data={supplyData} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
