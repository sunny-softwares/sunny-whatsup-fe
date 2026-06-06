import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  accent?: 'default' | 'success' | 'warning' | 'destructive';
}

const accentMap = {
  default: 'text-primary',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  destructive: 'text-destructive',
};

export function StatCard({ label, value, hint, icon: Icon, accent = 'default' }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        {Icon ? <Icon className={`h-4 w-4 ${accentMap[accent]}`} /> : null}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${accentMap[accent]}`}>{value}</div>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
