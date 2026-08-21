import { useEffect, useRef } from "react";
import { useNavigation } from "@/lib/hooks/useNavigation";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const isSafePath = (value: string): boolean =>
  value.startsWith("/") && !value.startsWith("//");

export default function OAuthSuccess() {
  const goToOAuthError = useNavigation(
    "/oauth/error",
    {
      error: "missing_token",
      error_description:
        "No access token was returned from the provider. Please try again.",
    },
    { replace: true },
  );
  const goToReturn = useNavigation("/", {}, { replace: true });
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const fragmentParams = new URLSearchParams(
      window.location.hash.replace(/^#/, ""),
    );
    const accessToken = fragmentParams.get("access_token");
    const returnTo = fragmentParams.get("returnTo") || "/";
    const provider = fragmentParams.get("provider");

    if (!accessToken || !provider) {
      goToOAuthError();
      return;
    }

    useAuthStore.setState({ accessToken });

    toast.success(`Signed in with ${provider}`);

    const safeTarget = isSafePath(returnTo) ? returnTo : "/";
    goToReturn(safeTarget);
  }, [goToOAuthError, goToReturn]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F0F4FA]">
      <div className="flex flex-col items-center gap-3 text-[#0D1F3C]">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        <p className="text-sm">Finishing sign-in…</p>
      </div>
    </div>
  );
}
