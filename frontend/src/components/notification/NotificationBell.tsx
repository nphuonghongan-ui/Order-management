import { useEffect, useRef, useState } from "react";
import { Bell, Inbox as InboxIcon, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useNotificationStore } from "@/stores/notificationStore";
import {
  deleteNotification,
  listMyNotifications,
  markAllRead,
} from "@/lib/notificationApi";
import type { NotificationItem } from "./types";
import { cn } from "@/lib/utils";
import { getAvatarColor, getInitials } from "./avatar";

const SWIPE_THRESHOLD = 100;
const SWIPE_MAX = 140;
const EXIT_ANIM_MS = 220;

const formatRelative = (iso: string) => {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} mins ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hours ago`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "Yesterday";
  if (day < 7) return `${day} days ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

function NotificationRow({
  n,
  onDelete,
}: {
  n: NotificationItem;
  onDelete: (id: string) => void;
}) {
  const palette = getAvatarColor(n.fromUserName);
  const initials = getInitials(n.fromUserName);
  const description = (n.title || n.message || "").trim();

  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exiting, setExiting] = useState(false);
  const startXRef = useRef<number | null>(null);
  const pointerIdRef = useRef<number | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (exiting) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    startXRef.current = e.clientX;
    pointerIdRef.current = e.pointerId;
    setDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startXRef.current === null) return;
    const delta = e.clientX - startXRef.current;
    if (delta > 0) {
      setDragX(0);
      return;
    }
    const damped = delta < -SWIPE_MAX
      ? -SWIPE_MAX + (delta + SWIPE_MAX) * 0.3
      : delta;
    setDragX(damped);
  };

  const finishSwipe = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startXRef.current === null) return;
    startXRef.current = null;
    if (pointerIdRef.current !== null && e.currentTarget.hasPointerCapture(pointerIdRef.current)) {
      try {
        e.currentTarget.releasePointerCapture(pointerIdRef.current);
      } catch {
        // ignore
      }
    }
    pointerIdRef.current = null;
    setDragging(false);

    if (dragX < -SWIPE_THRESHOLD) {
      setExiting(true);
      setDragX(-1000);
      window.setTimeout(() => onDelete(n._id), EXIT_ANIM_MS);
    } else {
      setDragX(0);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-destructive flex items-center justify-end pr-6"
      >
        <Trash2 className="size-5 text-destructive-foreground" />
        <span className="ml-2 text-sm font-medium text-destructive-foreground">
          Delete
        </span>
      </div>

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishSwipe}
        onPointerCancel={finishSwipe}
        style={{ transform: `translateX(${dragX}px)` }}
        className={cn(
          "relative flex items-start gap-3 px-4 py-4 cursor-pointer select-none",
          !dragging && "transition-transform duration-200 ease-out",
          exiting && "transition-transform duration-200 ease-in",
          n.read ? "bg-card" : "bg-primary/5"
        )}
      >
        <div className="relative shrink-0">
          <div
            className={cn(
              "size-10 rounded-full flex items-center justify-center text-sm font-semibold",
              palette.bg,
              palette.fg
            )}
          >
            {initials}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground truncate">
            {n.fromUserName}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2 break-words">
            {description}
            {n.context?.poNum && (
              <>
                {" "}
                <span className="font-mono text-xs">PO {n.context.poNum}</span>
              </>
            )}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
          {!n.read && (
            <span
              aria-hidden
              className="size-2 rounded-full bg-primary"
            />
          )}
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatRelative(n.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

function NotificationList({
  loading,
  items,
  emptyText,
  onDelete,
}: {
  loading: boolean;
  items: NotificationItem[];
  emptyText: string;
  onDelete: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
        <InboxIcon className="opacity-40" />
        <p className="text-sm">{emptyText}</p>
      </div>
    );
  }
  return (
    <div>
      {items.map((n) => (
        <NotificationRow key={n._id} n={n} onDelete={onDelete} />
      ))}
    </div>
  );
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [tabItems, setTabItems] = useState<Record<"all" | "unread", NotificationItem[]>>({
    all: [],
    unread: [],
  });

  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const setAll = useNotificationStore((s) => s.setAll);
  const markAllReadLocal = useNotificationStore((s) => s.markAllReadLocal);
  const removeOne = useNotificationStore((s) => s.removeOne);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const result = await listMyNotifications({
          limit: 50,
          unreadOnly: tab === "unread",
        });
        if (cancelled) return;
        setTabItems((prev) => ({ ...prev, [tab]: result.items }));
        if (tab === "all") {
          setAll(result.items, result.unreadCount);
        }
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
  }, [open, tab, setAll]);

  const handleMarkAll = async () => {
    if (unreadCount === 0) return;
    setMarkingAll(true);
    markAllReadLocal();
    setTabItems((prev) => ({
      all: prev.all.map((n) => ({ ...n, read: true })),
      unread: [],
    }));
    try {
      await markAllRead();
    } catch {
      toast.error("Failed to mark all as read");
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = (id: string) => {
    setTabItems((prev) => ({
      all: prev.all.filter((n) => n._id !== id),
      unread: prev.unread.filter((n) => n._id !== id),
    }));
    removeOne(id);
    deleteNotification(id).catch(() => {
      toast.error("Failed to delete notification");
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
          className="relative cursor-pointer"
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
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[420px] p-0 flex flex-col gap-0"
      >
        <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            Notifications
          </h2>
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={unreadCount === 0 || markingAll}
            className="text-xs hover:underline disabled:text-muted-foreground disabled:no-underline cursor-pointer"
          >
            <span className="text-primary-light">Mark all as read</span>
          </button>
        </div>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "all" | "unread")}
          className="flex flex-col"
        >
          <TabsList className="px-2 border-b border-border shrink-0">
            <TabsTrigger value="all" className="cursor-pointer py-3">All</TabsTrigger>
            <TabsTrigger value="unread" className="cursor-pointer py-3">Unread ({unreadCount})</TabsTrigger>
          </TabsList>
          <div className="max-h-[60vh] overflow-y-auto">
            <TabsContent value="all" className="m-0 outline-none">
              <NotificationList
                loading={loading}
                items={tabItems.all}
                emptyText="No notifications yet"
                onDelete={handleDelete}
              />
            </TabsContent>
            <TabsContent value="unread" className="m-0 outline-none">
              <NotificationList
                loading={loading}
                items={tabItems.unread}
                emptyText="No unread notifications"
                onDelete={handleDelete}
              />
            </TabsContent>
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
