import { useEffect, useMemo, useRef, useState } from "react";
import {
  GOOGLE_SCOPES,
  cancelGoogleOneTap,
  initGoogleAccounts,
  promptGoogleOneTap,
  type GoogleCredentialResponse,
  type GooglePromptMomentNotification,
} from "@/lib/google/oneTap";

export type OneTapStatus =
  | "idle"
  | "loading"
  | "ready"
  | "dismissed"
  | "unavailable"
  | "error";

interface UseGoogleOneTapOptions {
  onCredential: (response: GoogleCredentialResponse) => void | Promise<void>;
  onFallback?: () => void;
  enabled?: boolean;
}

export function useGoogleOneTap({
  onCredential,
  onFallback,
  enabled = true,
}: UseGoogleOneTapOptions): { status: OneTapStatus } {
  const clientId = useMemo(() => import.meta.env.VITE_GOOGLE_CLIENT_ID, []);
  const [status, setStatus] = useState<OneTapStatus>(() => {
    if (!clientId) return "unavailable";
    return enabled ? "loading" : "unavailable";
  });

  const callbackRef = useRef(onCredential);
  const fallbackRef = useRef(onFallback);
  const cancelledRef = useRef(false);

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    fallbackRef.current = onFallback;
  }, [onFallback]);

  useEffect(() => {
    if (!clientId || !enabled) return;

    cancelledRef.current = false;
    let cancelled = false;

    initGoogleAccounts(
      clientId,
      (response) => {
        callbackRef.current(response);
      },
      {
        scope: GOOGLE_SCOPES.ONE_TAP,
        cancel_on_tap_outside: true,
        auto_select: true,
        itp_support: true,
        use_fedcm_for_prompt: true,
      },
    )
      .then(() => {
        if (cancelled || cancelledRef.current) return;

        promptGoogleOneTap((notification: GooglePromptMomentNotification) => {
          if (cancelled) return;

          if (notification.isNotDisplayed()) {
            cancelledRef.current = true;
            setStatus("unavailable");
            fallbackRef.current?.();
            return;
          }

          if (
            notification.isDismissedMoment() ||
            notification.isSkippedMoment()
          ) {
            cancelledRef.current = true;
            setStatus("dismissed");
            return;
          }

          if (notification.isDisplayed()) {
            setStatus("ready");
          }
        });

        if (!cancelled) setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });

    return () => {
      cancelled = true;
      cancelGoogleOneTap();
    };
  }, [clientId, enabled]);

  return { status };
}
