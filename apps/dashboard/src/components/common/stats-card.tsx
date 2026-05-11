import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  variant?: 'blue' | 'green' | 'amber' | 'red' | 'violet';
  className?: string;
}

const variantMap = {
  blue:   { icon: 'bg-blue-50 text-blue-600',   border: 'border-l-blue-500' },
  green:  { icon: 'bg-emerald-50 text-emerald-600', border: 'border-l-emerald-500' },
  amber:  { icon: 'bg-amber-50 text-amber-600',  border: 'border-l-amber-500' },
  red:    { icon: 'bg-red-50 text-red-600',       border: 'border-l-red-500' },
  violet: { icon: 'bg-violet-50 text-violet-600', border: 'border-l-violet-500' },
};

export function StatsCard({ title, value, icon: Icon, trend, variant = 'blue', className }: StatsCardProps) {
  const styles = variantMap[variant];
  const isPositive = trend && trend.value >= 0;

  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md',
      'border-l-4', styles.border,
      className,
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {trend && (
            <div className={cn(
              'mt-2 flex items-center gap-1 text-xs font-medium',
              isPositive ? 'text-emerald-600' : 'text-red-500',
            )}>
              {isPositive
                ? <TrendingUp className="h-3 w-3" />
                : <TrendingDown className="h-3 w-3" />}
              <span>{isPositive ? '+' : ''}{trend.value}% {trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', styles.icon)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
