import { cn } from "@/lib/utils";

type LoadingScreenProps = {
  isLoading?: boolean;
  variant?: "fullscreen" | "inline";
  label?: string;
  className?: string;
};

const TruckAnimation = () => (
  <svg
    viewBox="0 0 220 110"
    width="220"
    height="110"
    role="presentation"
    aria-hidden="true"
    className="overflow-visible"
  >
    <defs>
      <linearGradient id="container-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1E6BFF" />
        <stop offset="100%" stopColor="#003D9B" />
      </linearGradient>
      <linearGradient id="cab-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#374151" />
        <stop offset="100%" stopColor="#1F2937" />
      </linearGradient>
    </defs>

    {/* Road */}
    <line
      x1="0"
      y1="98"
      x2="220"
      y2="98"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeDasharray="8 8"
      className="road-line text-white/30"
    />

    {/* Truck group (bobs) */}
    <g className="truck-bob">
      {/* Container body */}
      <rect
        x="30"
        y="22"
        width="130"
        height="58"
        rx="2"
        fill="url(#container-body)"
      />
      {/* Corrugated lines */}
      {[40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150].map((x) => (
        <line
          key={x}
          x1={x}
          y1="24"
          x2={x}
          y2="78"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1"
        />
      ))}
      {/* Rear doors */}
      <line
        x1="32"
        y1="22"
        x2="32"
        y2="80"
        stroke="rgba(0,0,0,0.35)"
        strokeWidth="1.5"
      />
      <line
        x1="36"
        y1="26"
        x2="36"
        y2="76"
        stroke="rgba(0,0,0,0.25)"
        strokeWidth="1"
      />
      {/* AxonLog label on container */}
      <text
        x="95"
        y="56"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontSize="10"
        fontWeight="700"
        fill="rgba(255,255,255,0.92)"
        letterSpacing="1.2"
      >
        AXONLOG
      </text>

      {/* Cab */}
      <path
        d="M 160 36 L 188 36 L 198 52 L 198 80 L 160 80 Z"
        fill="url(#cab-body)"
      />
      {/* Window */}
      <path
        d="M 164 40 L 186 40 L 193 52 L 164 52 Z"
        fill="#60A5FA"
        opacity="0.85"
      />
      {/* Bumper / headlight */}
      <rect x="194" y="66" width="6" height="8" rx="1" fill="#FBBF24" />
    </g>

    {/* Wheels (spin) */}
    <g className="wheel-spin" style={{ transformOrigin: "58px 86px" }}>
      <circle cx="58" cy="86" r="11" fill="#111827" />
      <circle cx="58" cy="86" r="5" fill="#6B7280" />
      <line x1="58" y1="76" x2="58" y2="96" stroke="#111827" strokeWidth="1.5" />
      <line x1="48" y1="86" x2="68" y2="86" stroke="#111827" strokeWidth="1.5" />
    </g>
    <g className="wheel-spin" style={{ transformOrigin: "178px 86px" }}>
      <circle cx="178" cy="86" r="11" fill="#111827" />
      <circle cx="178" cy="86" r="5" fill="#6B7280" />
      <line x1="178" y1="76" x2="178" y2="96" stroke="#111827" strokeWidth="1.5" />
      <line x1="168" y1="86" x2="188" y2="86" stroke="#111827" strokeWidth="1.5" />
    </g>
  </svg>
);

const Dots = () => (
  <span className="loading-dots inline-flex" aria-hidden="true">
    <span>.</span>
    <span>.</span>
    <span>.</span>
  </span>
);

const keyframes = `
  @keyframes wheel-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes truck-bob {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-1.5px); }
  }
  @keyframes road-scroll {
    from { stroke-dashoffset: 0; }
    to   { stroke-dashoffset: -32; }
  }
  @keyframes loading-dot {
    0%, 20%   { opacity: 0.2; }
    50%       { opacity: 1; }
    80%, 100% { opacity: 0.2; }
  }
  @keyframes loading-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .truck-bob { animation: truck-bob 0.8s ease-in-out infinite; }
  .wheel-spin { animation: wheel-spin 0.6s linear infinite; transform-box: fill-box; }
  .road-line { animation: road-scroll 0.8s linear infinite; }
  .loading-dots > span {
    animation: loading-dot 1.4s ease-in-out infinite;
  }
  .loading-dots > span:nth-child(2) { animation-delay: 0.2s; }
  .loading-dots > span:nth-child(3) { animation-delay: 0.4s; }
  .loading-fade-in { animation: loading-fade-in 0.2s ease-out; }

  @media (prefers-reduced-motion: reduce) {
    .truck-bob, .wheel-spin, .road-line, .loading-dots > span {
      animation: none;
    }
  }
`;

export default function LoadingScreen({
  isLoading = true,
  variant = "fullscreen",
  label = "Loading",
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
        aria-label={label}
        className={cn(
          "loading-fade-in flex flex-col items-center justify-center gap-5",
          isFullscreen
            ? "fixed inset-0 z-50 bg-[#0a1530]"
            : "w-full h-full min-h-[160px] bg-background/80 backdrop-blur-sm rounded-lg border border-border",
          className
        )}
      >
        <TruckAnimation />
        <div
          className={cn(
            "text-sm font-medium tracking-wide",
            isFullscreen ? "text-white/90" : "text-foreground"
          )}
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {label}
          <Dots />
        </div>
      </div>
    </>
  );
}
