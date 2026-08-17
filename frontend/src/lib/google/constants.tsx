import type { GoogleButtonOptions } from "./types";

export const GOOGLE_DEFAULT_BUTTON_STYLE: GoogleButtonOptions = {
    type: "standard",
    theme: "outline",
    size: "large",
    text: "signin_with",
    shape: "rectangular",
    width: 320,
}

export const GOOGLE_SCOPES = {
  ONE_TAP:
    "openid email profile",
  FUTURE_DRIVER:
    "https://www.googleapis.com/auth/youtube.readonly",
} as const;