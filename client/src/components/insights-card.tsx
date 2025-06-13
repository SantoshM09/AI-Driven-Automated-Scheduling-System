import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface InsightsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'amber' | 'purple';
  progress?: number;
}

export default function InsightsCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  color = 'blue',
  progress
}: InsightsCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return {
          iconBg: 'bg-green-50',
          iconColor: 'text-green-600',
          trendColor: 'text-green-600 border-green-600'
        };
      case 'red':
        return {
          iconBg: 'bg-red-50',
          iconColor: 'text-red-600',
          trendColor: 'text-red-600 border-red-600'
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-50',
          iconColor: 'text-amber-600',
          trendColor: 'text-amber-600 border-amber-600'
        };
      case 'purple':
        return {
          iconBg: 'bg-purple-50',
          iconColor: 'text-purple-600',
          trendColor: 'text-purple-600 border-purple-600'
        };
      default:
        return {
          iconBg: 'bg-blue-50',
          iconColor: 'text-blue-600',
          trendColor: 'text-blue-600 border-blue-600'
        };
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3" />;
      case 'down':
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 border-green-600';
      case 'down':
        return 'text-red-600 border-red-600';
      default:
        return 'text-slate-600 border-slate-600';
    }
  };

  const colors = getColorClasses();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-full ${colors.iconBg}`}>
            <div className={colors.iconColor}>
              {icon}
            </div>
          </div>
          {trend && trendValue && (
            <Badge variant="outline" className={`${getTrendColor()} flex items-center gap-1`}>
              {getTrendIcon()}
              {trendValue}
            </Badge>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          <p className="text-sm text-slate-600">{subtitle}</p>
        </div>

        {typeof progress === 'number' && (
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
