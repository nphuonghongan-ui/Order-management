import type { ComponentProps } from "react";
import { Tabs as TabsPrimitive } from "radix-ui";

import { cn } from "@/lib/utils/utils";

function Tabs({ className, ...props }: ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "relative flex items-center text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex items-center justify-center px-3 py-2 text-sm transition-colors outline-none hover:text-foreground focus-visible:text-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground data-[state=active]:font-medium",
        "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-transparent after:transition-colors data-[state=active]:after:bg-primary",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
