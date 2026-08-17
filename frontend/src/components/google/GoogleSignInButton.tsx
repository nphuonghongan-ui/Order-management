import { useEffect, useMemo, useRef, useState } from "react";
import {
  initGoogleAccounts,
  renderGoogleButton,
} from "@/lib/google/oneTap";
import { GOOGLE_DEFAULT_BUTTON_STYLE, GOOGLE_SCOPES } from "@/lib/google/constants";
import type { GoogleCredentialResponse } from "@/lib/google/types";

type Status = "loading" | "ready" | "error" | "disabled";

interface GoogleSignInButtonProps {
  onCredential: (response: GoogleCredentialResponse) => void;
  disabled?: boolean;
}

export function GoogleSignInButton({
  onCredential,
  disabled = false,
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);

  const clientId = useMemo(() => import.meta.env.VITE_GOOGLE_CLIENT_ID, []);
  const [status, setStatus] = useState<Status>(
    clientId ? "loading" : "disabled",
  );

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!clientId) return;

    let cancelled = false;

    initGoogleAccounts(
      clientId,
      (response) => callbackRef.current(response),
      {
        scope: GOOGLE_SCOPES.ONE_TAP,
        cancel_on_tap_outside: true,
      },
    )
      .then(() => {
        if (cancelled || !containerRef.current) return;
        renderGoogleButton(containerRef.current, GOOGLE_DEFAULT_BUTTON_STYLE);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  return (
    <div className="flex flex-col items-center gap-2">
      {status === "disabled" && (
        <p className="text-xs text-muted-foreground">
          Google sign-in is not configured for this environment.
        </p>
      )}
      {status === "error" && (
        <p className="text-xs text-muted-foreground">
          Could not load Google sign-in. Try again later.
        </p>
      )}
      <div
        ref={containerRef}
        aria-disabled={disabled || status !== "ready"}
        style={{
          visibility: status === "ready" ? "visible" : "hidden",
          minHeight: 40,
          pointerEvents: disabled ? "none" : "auto",
        }}
      />
    </div>
  );
}
