import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GoogleSignInButton } from "@/components/google/GoogleSignInButton";
import { useAuthStore } from "@/stores/authStore";
import type { GoogleCredentialResponse } from "@/lib/google/oneTap";

interface GoogleLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onSuccessNavigateTo?: string;
  passwordHref?: string;
}

export function GoogleLoginDialog({
  open,
  onOpenChange,
  title = "Sign in to AxonLog",
  description = "Use your Google account for one-tap sign-in.",
  onSuccessNavigateTo = "/dashboard",
  passwordHref = "/login",
}: GoogleLoginDialogProps) {
  const navigate = useNavigate();
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const [submitting, setSubmitting] = useState(false);

  const handleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (submitting) return;
      setSubmitting(true);
      try {
        const ok = await loginWithGoogle(response.credential);
        if (ok) {
          onOpenChange(false);
          navigate(onSuccessNavigateTo);
        }
      } catch (err) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || "Google sign-in failed";
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    },
    [loginWithGoogle, navigate, onOpenChange, onSuccessNavigateTo, submitting],
  );

  const handlePasswordClick = useCallback(() => {
    onOpenChange(false);
    navigate(passwordHref);
  }, [navigate, onOpenChange, passwordHref]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <GoogleSignInButton
            onCredential={handleCredential}
            disabled={submitting}
          />
          <div className="flex w-full items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              or
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <button
            type="button"
            onClick={handlePasswordClick}
            className="text-sm font-medium text-primary hover:underline"
          >
            Sign in with password
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
