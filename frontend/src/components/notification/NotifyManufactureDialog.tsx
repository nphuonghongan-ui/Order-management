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
  notifyManufactureQtyMismatch,
} from "@/lib/apis/notificationApi";
import type {
  ManufactureRecipient,
  NotificationRiskLine,
} from "./types";

interface NotifyManufactureDialogProps {
  trigger?: React.ReactNode;
  riskLines?: NotificationRiskLine[];
  affectedOrderIds?: string[];
  onSent?: (info: { flaggedOrderIds?: string[] }) => void;
}

const buildDefaultMessage = (riskLines: NotificationRiskLine[]): string => {
  if (riskLines.length === 0) return "";
  const parts = riskLines.map(
    (r) =>
      `PO ${r.poNum ?? "?"} ${r.partNum ?? ""} (picked ${r.pickedQty}, Qty per Cont ${r.quantityPerCont})`
  );
  return `Please adjust Qty per Cont for: ${parts.join("; ")}.`;
};

export function NotifyManufactureDialog({
  trigger,
  riskLines,
  affectedOrderIds,
  onSent,
}: NotifyManufactureDialogProps) {
  const [open, setOpen] = useState(false);
  const [recipients, setRecipients] = useState<ManufactureRecipient[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [selected, setSelected] = useState<string>("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const isQtyMismatch = Array.isArray(riskLines) && riskLines.length > 0;

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

  useEffect(() => {
    if (!open) return;
    if (isQtyMismatch) {
      setMessage(buildDefaultMessage(riskLines));
    }
  }, [open, isQtyMismatch, riskLines]);

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
      if (isQtyMismatch) {
        const ids =
          affectedOrderIds ??
          Array.from(
            new Set(
              riskLines.map((r) => r.lineId).filter((v): v is string => !!v)
            )
          );
        if (ids.length === 0) {
          toast.error("No order ids to flag");
          setSending(false);
          return;
        }
        const result = await notifyManufactureQtyMismatch({
          affectedOrderIds: ids,
          riskLines,
          message: message.trim() || undefined,
        });
        const recipient = recipients.find(
          (r) => r.customerCustId === selected
        );
        toast.success(
          `Notification sent to ${recipient?.userName ?? selected}. ${result.flaggedOrderIds.length} order(s) flagged for Manufacture update.`
        );
        onSent?.({ flaggedOrderIds: result.flaggedOrderIds });
      } else {
        await sendUrgeUpdate({
          recipientCustomerCustId: selected,
          message: message.trim() || undefined,
        });
        const recipient = recipients.find(
          (r) => r.customerCustId === selected
        );
        toast.success(`Notification sent to ${recipient?.userName ?? selected}`);
        onSent?.({});
      }
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
          <DialogTitle>
            {isQtyMismatch
              ? "Notify Manufacture: Qty per Cont"
              : "Notify Manufacture"}
          </DialogTitle>
          <DialogDescription>
            {isQtyMismatch
              ? "Manufacture will be asked to adjust Qty per Cont so the picked qty produces a full container. The flagged order(s) will be disabled for picking until Manufacture updates them."
              : "Send an \"urge\" to a Manufacture account to update pending orders."}
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
              placeholder={
                isQtyMismatch
                  ? "Auto-filled from the offending line(s). Edit if needed."
                  : "e.g. Please update ExWorkDate and Qty per Cont for the AIG orders."
              }
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
