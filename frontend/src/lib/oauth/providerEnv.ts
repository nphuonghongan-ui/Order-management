// Strategy-pattern resolver for OAuth provider configuration.
//
// Each provider gets its own dedicated `VITE_<PROVIDER>_CLIENT_ID` env key.
// To add a new provider (e.g., Facebook), add a `case` here AND register the
// backend strategy in `backend/src/oauth/index.js`. The browser only needs
// the public `client_id` per provider; client secrets never leave the
// backend.

export type OAuthIntent = "google" | "github" | "discord";

export interface OAuthBrandSpec {
  bg: string;
  border: string;
  textColor: string;
  textWeight: number;
  hoverBg: string;
  focusRing: string;
  iconSize: number;
}

interface OAuthProviderConfig {
  intent: OAuthIntent;
  label: string;
  clientId: string;
  brand: OAuthBrandSpec;
}

const envClientId = (key: string): string =>
  String((import.meta.env as Record<string, string | undefined>)[key] ?? "");

const GOOGLE_BRAND: OAuthBrandSpec = {
  bg: "#FFFFFF",
  border: "#747775",
  textColor: "#1F1F1F",
  textWeight: 500,
  hoverBg: "#F8F9FA",
  focusRing: "rgba(66, 133, 244, 0.4)",
  iconSize: 18,
};

const GITHUB_BRAND: OAuthBrandSpec = {
  bg: "#24292F",
  border: "#24292F",
  textColor: "#FFFFFF",
  textWeight: 600,
  hoverBg: "#1F2328",
  focusRing: "rgba(36, 41, 47, 0.4)",
  iconSize: 20,
};

const DISCORD_BRAND: OAuthBrandSpec = {
  bg: "#5865F2",
  border: "#5865F2",
  textColor: "#FFFFFF",
  textWeight: 600,
  hoverBg: "#4752C4",
  focusRing: "rgba(88, 101, 242, 0.4)",
  iconSize: 20,
};

export function resolveProviderConfig(
  intent: OAuthIntent,
): OAuthProviderConfig {
  switch (intent) {
    case "google":
      return {
        intent: "google",
        label: "Sign in with Google",
        clientId: envClientId("VITE_GOOGLE_CLIENT_ID"),
        brand: GOOGLE_BRAND
      };
    case "github":
      return {
        intent: "github",
        label: "Sign in with GitHub",
        clientId: envClientId("VITE_GITHUB_CLIENT_ID"),
        brand: GITHUB_BRAND
      };
    case "discord":
      return {
        intent: "discord",
        label: "Sign in with Discord",
        clientId: envClientId("VITE_DISCORD_CLIENT_ID"),
        brand: DISCORD_BRAND
      };
    default: {
      const exhaustive: never = intent;
      throw new Error(`Unknown OAuth provider: ${exhaustive}`);
    }
  }
}

export const SUPPORTED_OAUTH_INTENTS: readonly OAuthIntent[] = [
  "google",
  "github",
  "discord",
];
