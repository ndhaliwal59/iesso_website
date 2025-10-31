import ForecastChart from '../ForecastChart'

const mockData = [
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

export default function ForecastChartExample() {
  return <ForecastChart data={mockData} timestamp="12:00 AM" />
}
