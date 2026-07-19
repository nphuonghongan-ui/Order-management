import { cn } from "@/lib/utils";

type LoadingScreenProps = {
  isLoading?: boolean;
  variant?: "fullscreen" | "inline";
  label?: string;
  className?: string;
};

/* ------------------------------------------------------------------ */
/*  Logo mark (hexagon cube)                                          */
/* ------------------------------------------------------------------ */
const LogoMark = ({ x, y, size }: { x: number; y: number; size: number }) => {
  const h = size / 2;
  const cx = x + h;
  const cy = y + h;
  const top = cy - h * 0.95;
  const midY = cy - h * 0.42;
  const botY = cy + h * 0.42;
  const bottom = cy + h * 0.95;
  const left = cx - h * 0.86;
  const right = cx + h * 0.86;
  return (
    <g>
      {/* outer hexagon */}
      <path
        d={`M ${cx} ${top} L ${right} ${midY} L ${right} ${botY} L ${cx} ${bottom} L ${left} ${botY} L ${left} ${midY} Z`}
        fill="#fff"
      />
      {/* inner cube (3 faces) */}
      <g transform={`translate(${cx}, ${cy}) scale(${size / 44})`}>
        <path d="M0 -11 L9.5 -5.5 L0 0 L-9.5 -5.5 Z" fill="#0a1530" />
        <path d="M-9.5 -5.5 L0 0 L0 11 L-9.5 5.5 Z" fill="#0a1530" opacity="0.75" />
        <path d="M9.5 -5.5 L0 0 L0 11 L9.5 5.5 Z" fill="#0a1530" opacity="0.5" />
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ */
/*  Detailed truck                                                    */
/* ------------------------------------------------------------------ */
const TruckAnimation = () => (
  <svg
    viewBox="0 0 620 300"
    width="620"
    height="300"
    role="presentation"
    aria-hidden="true"
    className="overflow-visible max-w-[92vw] h-auto"
  >
    <defs>
      <linearGradient id="container-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2E7CF6" />
        <stop offset="55%" stopColor="#1E6BFF" />
        <stop offset="100%" stopColor="#0B4FCE" />
      </linearGradient>
      <linearGradient id="container-rim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1B55C4" />
        <stop offset="100%" stopColor="#0A3C9E" />
      </linearGradient>
      <linearGradient id="cab-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3A82F7" />
        <stop offset="60%" stopColor="#1E6BFF" />
        <stop offset="100%" stopColor="#0B4FCE" />
      </linearGradient>
      <linearGradient id="visor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F8FAFC" />
        <stop offset="100%" stopColor="#C7D4EA" />
      </linearGradient>
      <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.55" />
        <stop offset="45%" stopColor="#1E293B" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#0F172A" />
      </linearGradient>
      <linearGradient id="chassis" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2A3342" />
        <stop offset="100%" stopColor="#161C26" />
      </linearGradient>
      <radialGradient id="hub" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#CBD5E1" />
        <stop offset="70%" stopColor="#64748B" />
        <stop offset="100%" stopColor="#334155" />
      </radialGradient>
      <filter id="soft-glow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="7" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* soft glow under truck */}
    <ellipse cx="300" cy="252" rx="290" ry="20" fill="#1E6BFF" opacity="0.08" />

    {/* ------------------------------------------------ road dashes */}
    <g className="road-scroll">
      {[0, 42, 84, 126, 168, 210, 252, 294, 336, 378, 420, 462, 504, 546, 588].map(
        (x) => (
          <line
            key={x}
            x1={x}
            y1="252"
            x2={x + 22}
            y2="252"
            stroke="#3B82F6"
            strokeOpacity="0.45"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )
      )}
    </g>

    {/* ================================================= TRUCK */}
    <g className="truck-bob">
      {/* ---------- trailer ---------- */}
      <g>
        {/* main body */}
        <rect x="30" y="66" width="380" height="150" rx="3" fill="url(#container-body)" />
        {/* top & bottom rims */}
        <rect x="28" y="60" width="384" height="10" rx="2" fill="url(#container-rim)" />
        <rect x="28" y="212" width="384" height="8" rx="2" fill="url(#container-rim)" />
        {/* corrugation */}
        {Array.from({ length: 23 }, (_, i) => 46 + i * 15.5).map((x) => (
          <line
            key={x}
            x1={x}
            y1="72"
            x2={x}
            y2="210"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="1.4"
          />
        ))}
        {/* left rear door seam */}
        <line x1="36" y1="72" x2="36" y2="210" stroke="rgba(0,0,0,0.3)" strokeWidth="2" />
        {/* logo */}
        <LogoMark x={105} y={108} size={58} />
        <text
          x="178"
          y="146"
          fontFamily="Inter, sans-serif"
          fontSize="30"
          fontWeight="800"
          fill="#ffffff"
          letterSpacing="1.5"
        >
          AXONLOG
        </text>
        <text
          x="179"
          y="168"
          fontFamily="Inter, sans-serif"
          fontSize="12"
          fontWeight="600"
          fill="rgba(255,255,255,0.75)"
          letterSpacing="4.5"
        >
          LOGISTICS
        </text>
      </g>

      {/* ---------- chassis / undercarriage ---------- */}
      <rect x="36" y="220" width="500" height="16" rx="3" fill="url(#chassis)" />
      {/* fuel tanks */}
      <rect x="432" y="224" width="58" height="20" rx="3" fill="#11161f" stroke="#2A3342" strokeWidth="1" />
      <rect x="498" y="224" width="58" height="20" rx="3" fill="#11161f" stroke="#2A3342" strokeWidth="1" />

      {/* ---------- cab ---------- */}
      <g>
        {/* roof visor */}
        <path
          d="M 428 66 C 428 54 436 48 450 48 L 520 48 C 542 48 556 58 560 76 L 560 84 L 428 84 Z"
          fill="url(#visor)"
        />
        {/* cab main */}
        <path
          d="M 424 84 L 560 84 L 560 216 L 424 216 Z"
          fill="url(#cab-body)"
        />
        {/* slanted nose */}
        <path d="M 560 84 L 604 118 L 604 216 L 560 216 Z" fill="url(#cab-body)" />
        {/* windshield */}
        <path
          d="M 428 92 L 556 92 L 556 140 L 428 140 Z"
          fill="url(#glass)"
        />
        <path
          d="M 560 92 L 596 120 L 596 140 L 560 140 Z"
          fill="url(#glass)"
        />
        {/* windshield divider */}
        <line x1="492" y1="92" x2="492" y2="140" stroke="#0B4FCE" strokeWidth="3" />
        {/* door seam + handle */}
        <line x1="470" y1="146" x2="470" y2="206" stroke="rgba(0,0,0,0.35)" strokeWidth="1.6" />
        <rect x="478" y="168" width="18" height="5" rx="2.5" fill="#0B3AA8" />
        {/* step */}
        <rect x="430" y="206" width="60" height="9" rx="2" fill="#10151d" />
        {/* front grille */}
        <rect x="578" y="148" width="26" height="34" rx="3" fill="#0d2340" />
        {[154, 162, 170].map((y) => (
          <line key={y} x1="581" y1={y} x2="601" y2={y} stroke="#2E5FBF" strokeWidth="2" />
        ))}
        {/* headlights */}
        <rect x="588" y="188" width="14" height="11" rx="2" fill="#FBBF24" filter="url(#soft-glow)" />
        <rect x="588" y="201" width="14" height="7" rx="2" fill="#E2E8F0" opacity="0.85" />
        {/* bumper */}
        <rect x="560" y="210" width="46" height="12" rx="3" fill="#0A1530" />
        {/* mirrors */}
        <rect x="414" y="88" width="7" height="26" rx="2.5" fill="#10151d" />
        <rect x="406" y="94" width="10" height="16" rx="2" fill="#1E293B" />
      </g>

      {/* ---------- wheels ---------- */}
      {/* trailer: 3 axles */}
      {[88, 148, 208].map((cx) => (
        <g key={cx} className="wheel-spin" style={{ transformOrigin: `${cx}px 238px` }}>
          <circle cx={cx} cy="238" r="24" fill="#0B0F16" stroke="#1F2937" strokeWidth="2" />
          <circle cx={cx} cy="238" r="12" fill="url(#hub)" />
          <circle cx={cx} cy="238" r="4" fill="#1E293B" />
          {[0, 60, 120].map((deg) => (
            <line
              key={deg}
              x1={cx}
              y1={238 - 11}
              x2={cx}
              y2={238 + 11}
              stroke="#0F172A"
              strokeWidth="2"
              transform={`rotate(${deg} ${cx} 238)`}
            />
          ))}
        </g>
      ))}
      {/* cab wheel */}
      <g className="wheel-spin" style={{ transformOrigin: "556px 238px" }}>
        <circle cx="556" cy="238" r="24" fill="#0B0F16" stroke="#1F2937" strokeWidth="2" />
        <circle cx="556" cy="238" r="12" fill="url(#hub)" />
        <circle cx="556" cy="238" r="4" fill="#1E293B" />
        {[0, 60, 120].map((deg) => (
          <line
            key={deg}
            x1="556"
            y1="227"
            x2="556"
            y2="249"
            stroke="#0F172A"
            strokeWidth="2"
            transform={`rotate(${deg} 556 238)`}
          />
        ))}
      </g>
    </g>
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Dot spinner                                                       */
/* ------------------------------------------------------------------ */
const DotSpinner = () => (
  <div className="relative h-9 w-9" aria-hidden="true">
    {Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * 360;
      return (
        <span
          key={i}
          className="spinner-dot absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3B82F6]"
          style={{
            transform: `rotate(${angle}deg) translateY(-14px)`,
            animationDelay: `${(i / 8) * 0.9}s`,
          }}
        />
      );
    })}
  </div>
);

/* ------------------------------------------------------------------ */
/*  Floating decorations                                              */
/* ------------------------------------------------------------------ */
const MapPin = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const Cube = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="M3.27 6.96 12 12.01l8.73-5.05" />
    <path d="M12 22.08V12" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Keyframes                                                         */
/* ------------------------------------------------------------------ */
const keyframes = `
  @keyframes wheel-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes truck-bob {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-2.5px); }
  }
  @keyframes road-scroll {
    from { transform: translateX(0); }
    to   { transform: translateX(-42px); }
  }
  @keyframes float-y {
    0%, 100% { transform: translateY(0);    opacity: 0.55; }
    50%      { transform: translateY(-14px); opacity: 0.9; }
  }
  @keyframes spinner-fade {
    0%, 100% { opacity: 0.15; }
    50%      { opacity: 1; }
  }
  @keyframes loading-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .truck-bob { animation: truck-bob 1.1s ease-in-out infinite; }
  .wheel-spin { animation: wheel-spin 0.7s linear infinite; transform-box: view-box; }
  .road-scroll { animation: road-scroll 0.9s linear infinite; }
  .float-a { animation: float-y 3.2s ease-in-out infinite; }
  .float-b { animation: float-y 3.8s ease-in-out 0.6s infinite; }
  .float-c { animation: float-y 3.5s ease-in-out 1.1s infinite; }
  .float-d { animation: float-y 4.1s ease-in-out 0.3s infinite; }
  .spinner-dot { animation: spinner-fade 0.9s ease-in-out infinite; }
  .loading-fade-in { animation: loading-fade-in 0.25s ease-out; }

  @media (prefers-reduced-motion: reduce) {
    .truck-bob, .wheel-spin, .road-scroll,
    .float-a, .float-b, .float-c, .float-d, .spinner-dot {
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
          "loading-fade-in relative flex flex-col items-center justify-center gap-7 overflow-hidden",
          isFullscreen
            ? "fixed inset-0 z-50 bg-[#050e1f]"
            : "w-full h-full min-h-[200px] bg-[#050e1f] rounded-lg border border-border",
          className
        )}
      >
        {/* ambient radial glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(30,107,255,0.14) 0%, rgba(30,107,255,0.05) 40%, transparent 70%)",
          }}
        />

        {/* floating decorations */}
        <MapPin className="float-a absolute left-[24%] top-[20%] text-[#3B82F6]/70" />
        <Cube className="float-b absolute right-[24%] top-[22%] text-[#3B82F6]/70" />
        <Cube className="float-c absolute left-[21%] bottom-[22%] text-[#3B82F6]/70" />
        <MapPin className="float-d absolute right-[26%] bottom-[20%] text-[#3B82F6]/70" />

        <TruckAnimation />

        <div
          className="text-base font-normal tracking-wide text-white/85"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {label}&hellip;
        </div>

        <DotSpinner />
      </div>
    </>
  );
}