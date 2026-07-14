import { useEffect, useState } from "react";
import { Bell, Check, Inbox as InboxIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useNotificationStore } from "@/stores/notificationStore";
import {
  listMyNotifications,
  markAllRead,
  markRead,
} from "@/lib/notificationApi";
import type { NotificationItem } from "./types";
import { cn } from "@/lib/utils";

const formatRelative = (iso: string) => {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return d.toLocaleDateString();
};

function NotificationRow({ n }: { n: NotificationItem }) {
  const markReadLocal = useNotificationStore((s) => s.markRead);
  const handleClick = async () => {
    if (n.read) return;
    markReadLocal(n._id);
    try {
      await markRead(n._id);
    } catch {
      toast.error("Failed to mark notification as read");
    }
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "w-full text-left px-4 py-3 border-b border-border transition-colors",
        n.read ? "bg-card" : "bg-primary/5 hover:bg-primary/10"
      )}
    >
      <div className="flex items-start gap-2">
        {!n.read && (
          <span
            aria-hidden
            className="mt-1.5 inline-block size-2 shrink-0 rounded-full bg-primary"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium truncate">{n.title}</p>
            <span className="text-xs text-muted-foreground shrink-0">
              {formatRelative(n.createdAt)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            from {n.fromUserName} ({n.fromCustomerCustId})
          </p>
          {n.message && (
            <p className="text-sm mt-1.5 whitespace-pre-wrap break-words">
              {n.message}
            </p>
          )}
          {n.context?.poNum && (
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              PO {n.context.poNum}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const loaded = useNotificationStore((s) => s.loaded);
  const setAll = useNotificationStore((s) => s.setAll);
  const markAllReadLocal = useNotificationStore((s) => s.markAllReadLocal);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const result = await listMyNotifications({ limit: 50 });
        if (cancelled) return;
        setAll(result.items, result.unreadCount);
      } catch {
        if (!cancelled) toast.error("Failed to load notifications");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [open, setAll]);

  const handleMarkAll = async () => {
    if (unreadCount === 0) return;
    setMarkingAll(true);
    markAllReadLocal();
    try {
      await markAllRead();
    } catch {
      toast.error("Failed to mark all as read");
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
          className="relative"
        >
          <Bell />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold flex items-center justify-center"
              aria-hidden
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-0 p-0">
        <SheetHeader className="px-4 py-3 border-b border-border flex-row items-center justify-between gap-2 space-y-0">
          <div>
            <SheetTitle>Notifications</SheetTitle>
            <SheetDescription>
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "All caught up"}
            </SheetDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleMarkAll}
            disabled={unreadCount === 0 || markingAll}
          >
            <Check />
            Mark all
          </Button>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {loading && !loaded ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
              <InboxIcon className="opacity-40" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div>
              {notifications.map((n) => (
                <NotificationRow key={n._id} n={n} />
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
