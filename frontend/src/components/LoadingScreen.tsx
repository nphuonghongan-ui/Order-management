import { useState } from "react";
import { Box, MapPin } from "lucide-react";
import { cn } from "@/lib/utils/utils";

type LoadingScreenProps = {
  isLoading?: boolean;
  variant?: "fullscreen" | "inline";
  label?: string;
  className?: string;
};

const BG = "#08122C";

const DotSpinner = ({ className }: { className?: string }) => {
  const dots = Array.from({ length: 8 }, (_, i) => i);
  return (
    <div
      className={cn("dot-spinner relative size-8", className)}
      aria-hidden="true"
    >
      {dots.map((i) => {
        const angle = (i / dots.length) * 360;
        const opacity = 0.25 + (i / (dots.length - 1)) * 0.75;
        return (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 size-1.5 rounded-full bg-white"
            style={{
              opacity,
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-12px)`,
            }}
          />
        );
      })}
    </div>
  );
};

const DecorativeIcons = ({ compact }: { compact?: boolean }) => {
  const iconClass = cn(
    "absolute text-[#3B6FD9]/40",
    compact ? "size-5" : "size-6 sm:size-7"
  );

  const [positions] = useState(() => {
    const rng = () => 5 + Math.random() * 80;
    return Array.from({ length: 4 }, () => ({
      top: `${rng()}%`,
      left: `${rng()}%`,
    }));
  });

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <MapPin className={iconClass} strokeWidth={1.5} style={positions[0]} />
      <Box className={iconClass} strokeWidth={1.5} style={positions[1]} />
      <Box className={iconClass} strokeWidth={1.5} style={positions[2]} />
      <MapPin className={iconClass} strokeWidth={1.5} style={positions[3]} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Keyframes                                                         */
/* ------------------------------------------------------------------ */
const keyframes = `
  @keyframes loading-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes dot-spinner-rotate {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .loading-fade-in { animation: loading-fade-in 0.25s ease-out; }
  .dot-spinner { animation: dot-spinner-rotate 0.9s steps(8) infinite; }

  @media (prefers-reduced-motion: reduce) {
    .loading-fade-in,
    .dot-spinner {
      animation: none;
    }
  }
`;

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export default function LoadingScreen({
  isLoading = true,
  variant = "fullscreen",
  label = "Preparing",
  className,
}: LoadingScreenProps) {
  if (!isLoading) return null;

  const isFullscreen = variant === "fullscreen";

  return (
    <>
      <style>{keyframes}</style>
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label={`${label}...`}
        className={cn(
          "loading-fade-in relative flex flex-col items-center justify-center overflow-hidden",
          isFullscreen
            ? "fixed inset-0 z-50 gap-5 px-6"
            : "h-full w-full min-h-[200px] gap-4 rounded-lg border border-border px-4 py-6 backdrop-blur-sm",
          className
        )}
        style={{
          background: isFullscreen
            ? BG
            : `color-mix(in srgb, ${BG} 92%, transparent)`,
        }}
      >
        <DecorativeIcons compact={!isFullscreen} />

        <img
          src="/svgs/truck.png"
          alt=""
          aria-hidden="true"
          draggable={false}
          className={cn(
            "relative z-10 h-auto select-none",
            isFullscreen
              ? "w-[min(100%,28rem)] sm:w-[min(100%,34rem)]"
              : "w-[min(100%,16rem)]"
          )}
        />

        <div
          className={cn(
            "relative z-10 flex flex-col items-center",
            isFullscreen ? "gap-4" : "gap-3"
          )}
        >
          <p
            className={cn(
              "font-medium tracking-wide text-white",
              isFullscreen ? "text-sm sm:text-base" : "text-sm"
            )}
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {label}
            <span aria-hidden="true">...</span>
          </p>
          <DotSpinner />
        </div>
      </div>
    </>
  );
}