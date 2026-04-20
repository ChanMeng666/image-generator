import * as React from "react";
import { cn } from "@/lib/utils";

const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("skeleton bg-gray-200 rounded-lg", className)}
    {...props}
  />
));
Skeleton.displayName = "Skeleton";

export { Skeleton };
