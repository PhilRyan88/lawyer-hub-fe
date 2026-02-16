import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type{ ReactNode } from "react";

interface CustomTooltipProps {
  children: ReactNode;
  content: string | ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function CustomTooltip({ children, content, side = "top", className }: CustomTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side} className={cn(className)}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
