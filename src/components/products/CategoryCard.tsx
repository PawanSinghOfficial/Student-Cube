import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  name: string;
  icon: LucideIcon;
  count: number;
  color: string;
  href: string;
}

export function CategoryCard({ name, icon: Icon, count, color, href }: CategoryCardProps) {
  return (
    <Link
      to={href}
      className="group flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${color}`}
      >
        <Icon className="w-8 h-8 text-primary-foreground" />
      </div>
      <h3 className="font-semibold text-foreground text-center mb-1">{name}</h3>
      <p className="text-sm text-muted-foreground">{count} items</p>
    </Link>
  );
}
