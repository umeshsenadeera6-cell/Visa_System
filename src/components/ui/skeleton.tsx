import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("animate-pulse rounded-lg bg-[#e9eeeb]", className)} {...props} />;
}
export { Skeleton };
