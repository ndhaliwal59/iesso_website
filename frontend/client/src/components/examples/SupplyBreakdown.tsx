import SupplyBreakdown from '../SupplyBreakdown'

const mockData = [
  { source: 'Nuclear', mw: 7320, color: '#8B5CF6' },
  { source: 'Gas', mw: 5215, color: '#EF4444' },
  { source: 'Wind', mw: 2782, color: '#10B981' },
  { source: 'Hydro', mw: 2788, color: '#3B82F6' },
  { source: 'Solar', mw: 82, color: '#FBBF24' },
  { source: 'Biofuel', mw: 20, color: '#84CC16' },
];

export default function SupplyBreakdownExample() {
  return <SupplyBreakdown data={mockData} />
}
