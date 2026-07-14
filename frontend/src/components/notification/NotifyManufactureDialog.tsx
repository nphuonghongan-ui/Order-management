import { useEffect, useState } from "react";
import { Bell, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  listManufactureRecipients,
  sendUrgeUpdate,
} from "@/lib/notificationApi";
import type { ManufactureRecipient } from "./types";

interface NotifyManufactureDialogProps {
  trigger?: React.ReactNode;
}

export function NotifyManufactureDialog({ trigger }: NotifyManufactureDialogProps) {
  const [open, setOpen] = useState(false);
  const [recipients, setRecipients] = useState<ManufactureRecipient[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [selected, setSelected] = useState<string>("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const load = async () => {
      setLoadingRecipients(true);
      try {
        const items = await listManufactureRecipients();
        if (cancelled) return;
        setRecipients(items);
        if (items.length === 1) {
          setSelected(items[0].customerCustId);
        }
      } catch {
        if (!cancelled) toast.error("Failed to load Manufacture accounts");
      } finally {
        if (!cancelled) setLoadingRecipients(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const reset = () => {
    setSelected("");
    setMessage("");
  };

  const handleSend = async () => {
    if (!selected) {
      toast.error("Pick a Manufacture account to notify");
      return;
    }
    setSending(true);
    try {
      await sendUrgeUpdate({
        recipientCustomerCustId: selected,
        message: message.trim() || undefined,
      });
      const recipient = recipients.find((r) => r.customerCustId === selected);
      toast.success(`Notification sent to ${recipient?.userName ?? selected}`);
      reset();
      setOpen(false);
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to send notification";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" variant="default" size="sm">
            <Bell />
            Notify Manufacture
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notify Manufacture</DialogTitle>
          <DialogDescription>
            Send an "urge" to a Manufacture account to update pending orders.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Recipient
            </label>
            <Select
              value={selected}
              onValueChange={setSelected}
              disabled={loadingRecipients || recipients.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    loadingRecipients
                      ? "Loading…"
                      : recipients.length === 0
                      ? "No Manufacture accounts found"
                      : "Select a Manufacture account"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {recipients.map((r) => (
                  <SelectItem
                    key={r.customerCustId}
                    value={r.customerCustId}
                  >
                    {r.userName} ({r.customerCustId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Message <span className="opacity-60">(optional)</span>
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Please update ExWorkDate and Qty per Cont for the AIG orders."
              rows={4}
              maxLength={2000}
            />
          </div>
        </div>

        <DialogFooter showCloseButton={false}>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={!selected || sending}
          >
            {sending ? <Loader2 className="animate-spin" /> : <Send />}
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
