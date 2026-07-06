import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col p-4 bg-card rounded-lg border border-border transition-colors",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className="p-2 bg-primary/10 rounded-md">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className="mt-3">
        <span className="text-2xl font-bold">{value}</span>
        {trend && (
          <span
            className={cn(
              "mr-2 text-sm font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}
          >
            {trend.isPositive ? "+" : "-"}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </div>
  );
}