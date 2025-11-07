import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ImportsExportsProps {
  imports?: number;
  exports?: number;
}

export default function ImportsExports({ imports, exports }: ImportsExportsProps) {
  const netFlow = (exports !== undefined && imports !== undefined) ? exports - imports : 0;

  return (
    <Card className="p-6 md:p-8 rounded-xl bg-card border-card-border">
      <h2 className="text-lg md:text-xl font-medium text-card-foreground mb-10">
        Imports & Exports
      </h2>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div data-testid="metric-imports">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownCircle className="w-5 h-5 text-green-500" />
            <span className="text-xs text-muted-foreground font-medium">Hourly Imports</span>
          </div>
          <p className="text-2xl md:text-3xl font-semibold text-card-foreground">
            {imports !== undefined ? imports.toLocaleString() : '--'}
            {imports !== undefined && <span className="text-sm text-muted-foreground ml-2">MW</span>}
          </p>
        </div>

        <div data-testid="metric-exports">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpCircle className="w-5 h-5 text-red-500" />
            <span className="text-xs text-muted-foreground font-medium">Hourly Exports</span>
          </div>
          <p className="text-2xl md:text-3xl font-semibold text-card-foreground">
            {exports !== undefined ? exports.toLocaleString() : '--'}
            {exports !== undefined && <span className="text-sm text-muted-foreground ml-2">MW</span>}
          </p>
        </div>
      </div>

      <div className="pt-6 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Net Flow</span>
          <span className={`text-xl md:text-2xl font-bold ${netFlow > 0 ? 'text-red-500' : 'text-green-500'}`}>
            {imports !== undefined && exports !== undefined ? (
              <>
                {netFlow > 0 ? '-' : '+'}{Math.abs(netFlow).toLocaleString()} MW
              </>
            ) : (
              '--'
            )}
          </span>
        </div>
      </div>
    </Card>
  );
}
