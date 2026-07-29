"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "radix-ui";
import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react";

import { cn } from "@/lib/utils/utils";
import { getStrictContext } from "@/lib/get-strict-context";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

type SheetContextType = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const [SheetProvider, useSheet] =
  getStrictContext<SheetContextType>("SheetContext");

type SheetProps = React.ComponentProps<typeof SheetPrimitive.Root>;

function Sheet(props: SheetProps) {
  const isOpen = props.open ?? false;
  const setIsOpen = (props.onOpenChange ?? (() => {})) as (open: boolean) => void;

  return (
    <SheetProvider value={{ isOpen, setIsOpen }}>
      <SheetPrimitive.Root data-slot="sheet" {...props} />
    </SheetProvider>
  );
}

type SheetTriggerProps = React.ComponentProps<typeof SheetPrimitive.Trigger>;

function SheetTrigger(props: SheetTriggerProps) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

type SheetCloseProps = React.ComponentProps<typeof SheetPrimitive.Close>;

function SheetClose(props: SheetCloseProps) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

type SheetPortalProps = React.ComponentProps<typeof SheetPrimitive.Portal>;

function SheetPortal(props: SheetPortalProps) {
  const { isOpen } = useSheet();

  return (
    <AnimatePresence>
      {isOpen && (
        <SheetPrimitive.Portal
          forceMount
          data-slot="sheet-portal"
          {...props}
        />
      )}
    </AnimatePresence>
  );
}

type SheetOverlayProps = Omit<
  React.ComponentProps<typeof SheetPrimitive.Overlay>,
  "asChild" | "forceMount"
> &
  HTMLMotionProps<"div">;

function SheetOverlay({
  transition = { duration: 0.2, ease: "easeInOut" },
  className,
  ...props
}: SheetOverlayProps) {
  return (
    <SheetPrimitive.Overlay asChild forceMount>
      <motion.div
        key="sheet-overlay"
        data-slot="sheet-overlay"
        initial={{ opacity: 0, filter: "blur(4px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(4px)" }}
        transition={transition}
        className={cn("fixed inset-0 z-50 bg-black/40", className)}
        {...props}
      />
    </SheetPrimitive.Overlay>
  );
}

type Side = "top" | "bottom" | "left" | "right";

type SheetContentProps = React.ComponentProps<
  typeof SheetPrimitive.Content
> &
  HTMLMotionProps<"div"> & {
    side?: Side;
    showCloseButton?: boolean;
  };

function SheetContent({
  side = "right",
  transition = { type: "spring", stiffness: 150, damping: 22 },
  showCloseButton = true,
  className,
  style,
  children,
  ...props
}: SheetContentProps) {
  const { isOpen } = useSheet();
  const axis = side === "left" || side === "right" ? "x" : "y";

  const offscreen: Record<Side, { x?: string; y?: string; opacity: number }> = {
    right: { x: "100%", opacity: 0 },
    left: { x: "-100%", opacity: 0 },
    top: { y: "-100%", opacity: 0 },
    bottom: { y: "100%", opacity: 0 },
  };

  const positionStyle: Record<Side, React.CSSProperties> = {
    right: { insetBlock: 0, right: 0 },
    left: { insetBlock: 0, left: 0 },
    top: { insetInline: 0, top: 0 },
    bottom: { insetInline: 0, bottom: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <SheetPrimitive.Portal forceMount data-slot="sheet-portal">
          <SheetOverlay />
          <SheetPrimitive.Content asChild forceMount {...props}>
            <motion.div
              key="sheet-content"
              data-slot="sheet-content"
              data-side={side}
              initial={offscreen[side]}
              animate={{ [axis]: 0, opacity: 1 }}
              exit={offscreen[side]}
              style={{
                position: "fixed",
                ...positionStyle[side],
                ...style,
              }}
              transition={transition}
              className={cn(
                "fixed z-50 bg-background gap-4 shadow-lg outline-none",
                side === "right" && "h-full w-full border-l sm:max-w-sm",
                side === "left" && "h-full w-full border-r sm:max-w-sm",
                side === "top" && "w-full border-b",
                side === "bottom" && "w-full border-t",
                className,
              )}
            >
              {children}
              {showCloseButton && (
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="absolute top-2 right-2"
                    size="icon-sm"
                  >
                    <XIcon />
                    <span className="sr-only">Close</span>
                  </Button>
                </SheetClose>
              )}
            </motion.div>
          </SheetPrimitive.Content>
        </SheetPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

type SheetHeaderProps = React.ComponentProps<"div">;

function SheetHeader({ className, ...props }: SheetHeaderProps) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

type SheetFooterProps = React.ComponentProps<"div">;

function SheetFooter({ className, ...props }: SheetFooterProps) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

type SheetTitleProps = React.ComponentProps<typeof SheetPrimitive.Title>;

function SheetTitle({ className, ...props }: SheetTitleProps) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("font-heading text-base leading-none font-medium", className)}
      {...props}
    />
  );
}

type SheetDescriptionProps = React.ComponentProps<
  typeof SheetPrimitive.Description
>;

function SheetDescription({ className, ...props }: SheetDescriptionProps) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  type SheetProps,
  type SheetTriggerProps,
  type SheetCloseProps,
  type SheetPortalProps,
  type SheetOverlayProps,
  type SheetContentProps,
  type SheetHeaderProps,
  type SheetFooterProps,
  type SheetTitleProps,
  type SheetDescriptionProps,
};
