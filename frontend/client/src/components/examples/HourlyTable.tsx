import HourlyTable from '../HourlyTable'

const mockData = [
  { hour: '00:00', predicted: 13850, actual: 13810, error: 0.3 },
  { hour: '01:00', predicted: 14020, actual: 13990, error: 0.2 },
  { hour: '02:00', predicted: 13680, actual: 13720, error: -0.3 },
  { hour: '03:00', predicted: 13450, actual: 13480, error: -0.2 },
  { hour: '04:00', predicted: 13290, actual: 13310, error: -0.2 },
  { hour: '05:00', predicted: 13420, actual: 13450, error: -0.2 },
  { hour: '06:00', predicted: 14100, actual: 14120, error: -0.1 },
  { hour: '07:00', predicted: 14890, actual: 14850, error: 0.3 },
  { hour: '08:00', predicted: 15420, actual: 15390, error: 0.2 },
  { hour: '09:00', predicted: 15680, actual: 15710, error: -0.2 },
];

export default function HourlyTableExample() {
  return <HourlyTable data={mockData} currentHour={3} />
}
