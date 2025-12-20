import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-border",
        accent: "border-transparent bg-accent text-accent-foreground hover:bg-accent/80",
        success: "border-transparent bg-success text-success-foreground hover:bg-success/80",
        dealer: "border-transparent bg-gradient-to-r from-accent to-primary text-primary-foreground shadow-md",
        verified: "border-transparent bg-success/10 text-success border border-success/20",
        pending: "border-transparent bg-accent/10 text-accent border border-accent/20",
        featured: "border-transparent bg-gradient-to-r from-primary via-purple-500 to-accent text-white shadow-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
