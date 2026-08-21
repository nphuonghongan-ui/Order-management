// Strategy-pattern resolver for OAuth provider configuration.
//
// Each provider gets its own dedicated `VITE_<PROVIDER>_CLIENT_ID` env key.
// To add a new provider (e.g., Facebook), add a `case` here AND register the
// backend strategy in `backend/src/oauth/index.js`. The browser only needs
// the public `client_id` per provider; client secrets never leave the
// backend.

export type OAuthIntent = "google" | "github";

export interface OAuthProviderConfig {
  intent: OAuthIntent;
  label: string;
  clientId: string;
}

const envClientId = (key: string): string =>
  String((import.meta.env as Record<string, string | undefined>)[key] ?? "");

export function resolveProviderConfig(
  intent: OAuthIntent,
): OAuthProviderConfig {
  switch (intent) {
    case "google":
      return {
        intent: "google",
        label: "Sign in with Google",
        clientId: envClientId("VITE_GOOGLE_CLIENT_ID")
      };
    case "github":
      return {
        intent: "github",
        label: "Sign in with GitHub",
        clientId: envClientId("VITE_GITHUB_CLIENT_ID")
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
];
