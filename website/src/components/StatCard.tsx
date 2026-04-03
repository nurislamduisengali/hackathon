import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: LucideIcon;
}

export default function StatCard({ title, value, subtitle, change, changeType = "neutral", icon: Icon }: StatCardProps) {
  const changeColor =
    changeType === "positive"
      ? "text-stat-green"
      : changeType === "negative"
      ? "text-stat-red"
      : "text-muted-foreground";

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1 text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          {change && <p className={`text-xs mt-1 font-medium ${changeColor}`}>{change}</p>}
        </div>
        {Icon && (
          <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
            <Icon size={18} className="text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
