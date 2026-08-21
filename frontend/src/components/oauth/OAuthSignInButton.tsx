import { useMemo, type CSSProperties, type MouseEvent, type ReactElement } from "react";
import { resolveProviderConfig, type OAuthIntent } from "@/lib/oauth/providerEnv";
import {  DiscordMark, GitHubMark, GoogleMark  } from '@/components/oauth/icons';

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

const buildStartUrl = (intent: OAuthIntent): string => {
  const params = new URLSearchParams({ intent });
  return `${API_BASE}/auth/oauth?${params.toString()}`;
};

interface OAuthSignInButtonProps {
  intent: OAuthIntent;
  disabled?: boolean;
  className?: string;
  label?: string;
}

const PROVIDER_ICONS: Record<OAuthIntent, (size: number) => ReactElement> = {
  google: (size) => <GoogleMark size={size} />,
  github: (size) => <GitHubMark size={size} />,
  discord: (size) => <DiscordMark size={size} />,
};

export function OAuthSignInButton({
  intent,
  disabled = false,
  className,
  label,
}: OAuthSignInButtonProps) {
  const config = useMemo(() => resolveProviderConfig(intent), [intent]);
  const href = useMemo(() => buildStartUrl(intent), [intent]);
  const resolvedLabel = label ?? config.label;

  const applyHover = (event: MouseEvent<HTMLAnchorElement>) => {
    event.currentTarget.style.backgroundColor = config.brand.hoverBg;
  };

  const clearHover = (event: MouseEvent<HTMLAnchorElement>) => {
    event.currentTarget.style.backgroundColor = config.brand.bg;
  };

  return (
    <a
      href={disabled ? undefined : href}
      aria-disabled={disabled}
      onClick={(event) => {
        if (disabled) event.preventDefault();
      }}
      className={
        "inline-flex h-10 items-center justify-center gap-3 rounded-md border px-4 " +
        "text-sm shadow-sm transition-colors focus:outline-none " +
        "focus-visible:ring-2 focus-visible:ring-offset-0 " +
        "cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 " +
        (className ?? "")
      }
      style={
        {
          backgroundColor: config.brand.bg,
          borderColor: config.brand.border,
          color: config.brand.textColor,
          fontWeight: config.brand.textWeight,
          "--tw-ring-color": config.brand.focusRing,
        } as CSSProperties
      }
      onMouseEnter={disabled ? undefined : applyHover}
      onMouseLeave={disabled ? undefined : clearHover}
    >
      {PROVIDER_ICONS[config.intent](config.brand.iconSize)}
      <span>{resolvedLabel}</span>
    </a>
  );
}