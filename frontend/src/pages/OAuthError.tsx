import { Link, useSearchParams } from "react-router";
import { useNavigation } from "@/lib/hooks/useNavigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";

const FRIENDLY_ERROR: Record<string, string> = {
  access_denied: "You declined the provider's permission prompt.",
  invalid_request: "The provider rejected the sign-in request.",
  invalid_state: "Sign-in session expired or was tampered with. Please try again.",
  invalid_grant: "Authorization code was invalid or already used.",
  token_exchange_failed: "We could not exchange the authorization code with the provider.",
  id_token_invalid: "The provider did not return a valid identity token.",
  missing_id_token: "The provider did not return the required identity token.",
  unknown_provider: "This sign-in provider is not configured on the server.",
  forbidden: "Your account isn't allowed to sign in here.",
  missing_return_to:
    "Sign-in could not start because no destination was provided. Please try again from the sign-in page.",
  invalid_return_to:
    "Sign-in could not start because the destination URL is not allowed. Please return to the sign-in page and try again.",
  missing_token:
    "No access token was returned from the provider. Please try again.",
  server_error: "Something went wrong on our side. Please try again.",
  restore_failed: "Could not load your session. Please sign in again.",
};

const friendly = (code: string | null): string => {
  if (!code) return "Sign-in failed.";
  return FRIENDLY_ERROR[code] ?? `Sign-in failed (${code}).`;
};

export default function OAuthError() {
  const backToSignIn = useNavigation("/login", {}, { replace: true });
  const [params] = useSearchParams();
  const error = params.get("error");
  const description = params.get("error_description");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F0F4FA] px-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-600" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#0D1F3C]">
              Sign-in could not be completed
            </h1>
            <p className="text-xs text-[#7A8BA0]">
              No authorization code or AxonLog token was exposed on this page.
            </p>
          </div>
        </div>

        <p className="mb-4 text-sm text-[#0D1F3C]">{friendly(error)}</p>

        {description ? (
          <pre className="mb-4 max-h-32 overflow-auto rounded-md bg-[#F0F4FA] p-3 text-xs text-[#5A6B82]">
            {description}
          </pre>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={backToSignIn}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#003d9b] px-4 text-sm font-medium text-white hover:bg-[#003087]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to sign-in
          </button>
          <Link
            to="/"
            replace
            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-[#c3c6d6] px-4 text-sm font-medium text-[#0D1F3C] hover:bg-[#F0F4FA]"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
