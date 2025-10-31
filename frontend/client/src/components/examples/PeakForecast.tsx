import PeakForecast from '../PeakForecast'

const mockSparklineData = [13850, 14020, 13680, 13450, 13290, 13420, 14100, 14890, 15420, 15680, 15550, 15480, 15390, 15320, 15450, 15620, 15710, 15740, 15650, 15380, 15120, 14780, 14420, 14050];

export default function PeakForecastExample() {
  return <PeakForecast peakHour="17:00" peakDemand={15740} sparklineData={mockSparklineData} />
}
