import { useId } from "react";
import { cn } from "@/lib/utils";

type AnimatedTruckProps = {
  className?: string;
};

const WHEEL_CENTERS = [118, 184, 250, 468, 574];

function Wheel({ cx }: { cx: number }) {
  return (
    <g className="animated-truck__wheel">
      <circle cx={cx} cy="181" r="27" fill="#050A13" stroke="#213451" strokeWidth="3" />
      <circle cx={cx} cy="181" r="20" fill="#111C2C" stroke="#8291A8" strokeWidth="2" />
      <circle cx={cx} cy="181" r="12" fill="#66768B" stroke="#AEB9C8" strokeWidth="2" />
      <circle cx={cx} cy="181" r="4" fill="#172235" />
      <g stroke="#25364E" strokeWidth="3" strokeLinecap="round">
        <path d={`M ${cx} 164 V 171`} />
        <path d={`M ${cx} 191 V 198`} />
        <path d={`M ${cx - 17} 181 H ${cx - 10}`} />
        <path d={`M ${cx + 10} 181 H ${cx + 17}`} />
        <path d={`M ${cx - 12} 169 L ${cx - 7} 174`} />
        <path d={`M ${cx + 7} 188 L ${cx + 12} 193`} />
        <path d={`M ${cx + 12} 169 L ${cx + 7} 174`} />
        <path d={`M ${cx - 7} 188 L ${cx - 12} 193`} />
      </g>
      <circle cx={cx} cy="181" r="24" fill="none" stroke="#07101D" strokeWidth="4" strokeDasharray="6 5" />
    </g>
  );
}

const styles = `
  @keyframes animated-truck-wheel-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes animated-truck-road-scroll {
    to { stroke-dashoffset: -60; }
  }
  @keyframes animated-truck-suspension {
    0%, 100% { transform: translateY(0); }
    30% { transform: translateY(-1.8px); }
    65% { transform: translateY(0.8px); }
  }
  @keyframes animated-truck-cab-vibration {
    0%, 100% { transform: translate(0, 0); }
    25% { transform: translate(0.4px, -0.5px); }
    75% { transform: translate(-0.35px, 0.35px); }
  }
  @keyframes animated-truck-shadow-pulse {
    0%, 100% { transform: scaleX(1); opacity: 0.48; }
    50% { transform: scaleX(0.97); opacity: 0.36; }
  }
  @keyframes animated-truck-speed-line {
    0% { transform: translateX(18px); opacity: 0; }
    20%, 75% { opacity: 0.45; }
    100% { transform: translateX(-26px); opacity: 0; }
  }

  .animated-truck__vehicle {
    animation: animated-truck-suspension 0.72s ease-in-out infinite;
    transform-origin: center bottom;
  }
  .animated-truck__cab {
    animation: animated-truck-cab-vibration 0.18s linear infinite;
  }
  .animated-truck__wheel {
    animation: animated-truck-wheel-spin 0.62s linear infinite;
    transform-box: fill-box;
    transform-origin: center;
  }
  .animated-truck__road {
    animation: animated-truck-road-scroll 0.62s linear infinite;
  }
  .animated-truck__shadow {
    animation: animated-truck-shadow-pulse 0.72s ease-in-out infinite;
    transform-box: fill-box;
    transform-origin: center;
  }
  .animated-truck__speed-line {
    animation: animated-truck-speed-line 1.15s linear infinite;
  }
  .animated-truck__speed-line:nth-child(2) { animation-delay: -0.38s; }
  .animated-truck__speed-line:nth-child(3) { animation-delay: -0.76s; }

  @media (prefers-reduced-motion: reduce) {
    .animated-truck__vehicle,
    .animated-truck__cab,
    .animated-truck__wheel,
    .animated-truck__road,
    .animated-truck__shadow,
    .animated-truck__speed-line {
      animation: none;
    }
  }
`;

export default function AnimatedTruck({ className }: AnimatedTruckProps) {
  const uid = useId().replace(/:/g, "");
  const containerGradient = `${uid}-container`;
  const containerEdge = `${uid}-container-edge`;
  const cabGradient = `${uid}-cab`;
  const cabSide = `${uid}-cab-side`;
  const windowGradient = `${uid}-window`;
  const metalGradient = `${uid}-metal`;
  const lightGlow = `${uid}-light-glow`;
  const shadowBlur = `${uid}-shadow-blur`;

  return (
    <svg
      viewBox="0 0 680 245"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      className={cn("overflow-visible", className)}
    >
      <style>{styles}</style>
      <defs>
        <linearGradient id={containerGradient} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#164887" />
          <stop offset="0.16" stopColor="#0D3974" />
          <stop offset="0.72" stopColor="#082B60" />
          <stop offset="1" stopColor="#061C43" />
        </linearGradient>
        <linearGradient id={containerEdge} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3574BE" />
          <stop offset="0.5" stopColor="#153F79" />
          <stop offset="1" stopColor="#051B41" />
        </linearGradient>
        <linearGradient id={cabGradient} x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#2166AC" />
          <stop offset="0.32" stopColor="#0B4288" />
          <stop offset="0.72" stopColor="#062B62" />
          <stop offset="1" stopColor="#041A42" />
        </linearGradient>
        <linearGradient id={cabSide} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#041A3B" />
          <stop offset="0.4" stopColor="#0D4387" />
          <stop offset="1" stopColor="#195B9E" />
        </linearGradient>
        <linearGradient id={windowGradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#A7D2F4" />
          <stop offset="0.22" stopColor="#3B719E" />
          <stop offset="0.6" stopColor="#102B49" />
          <stop offset="1" stopColor="#071522" />
        </linearGradient>
        <linearGradient id={metalGradient} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D3DAE3" />
          <stop offset="0.4" stopColor="#6C7785" />
          <stop offset="1" stopColor="#303A48" />
        </linearGradient>
        <radialGradient id={lightGlow}>
          <stop offset="0" stopColor="#FFF9D4" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#FCD34D" stopOpacity="0.6" />
          <stop offset="1" stopColor="#FCD34D" stopOpacity="0" />
        </radialGradient>
        <filter id={shadowBlur} x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      <g className="animated-truck__speed-lines" stroke="#528CE5" strokeWidth="2" strokeLinecap="round">
        <path className="animated-truck__speed-line" d="M24 92 H72" />
        <path className="animated-truck__speed-line" d="M10 119 H54" />
        <path className="animated-truck__speed-line" d="M31 146 H83" />
      </g>

      <ellipse
        className="animated-truck__shadow"
        cx="338"
        cy="207"
        rx="296"
        ry="10"
        fill="#020612"
        filter={`url(#${shadowBlur})`}
      />

      <g className="animated-truck__vehicle">
        <g>
          <rect x="37" y="29" width="398" height="137" rx="3" fill={`url(#${containerGradient})`} />
          <rect x="37" y="29" width="398" height="8" rx="2" fill="#1D5A9E" />
          <rect x="37" y="158" width="398" height="8" fill="#041733" />
          <rect x="37" y="29" width="8" height="137" fill={`url(#${containerEdge})`} />
          <rect x="427" y="29" width="8" height="137" fill="#06182F" />
          <path d="M43 38 H428" stroke="#4D7EB5" strokeWidth="1.4" opacity="0.65" />

          {Array.from({ length: 25 }, (_, i) => {
            const x = 52 + i * 15;
            return (
              <g key={x}>
                <path d={`M${x} 39 V155`} stroke="#164C88" strokeWidth="4" />
                <path d={`M${x + 2} 39 V155`} stroke="#071E49" strokeWidth="1.2" opacity="0.85" />
              </g>
            );
          })}

          <g fill="#E8EDF5">
            <path d="M143 76 164 64l21 12v24l-21 12-21-12Zm7 4v16l14 8 14-8V80l-14-8Z" fillRule="evenodd" />
            <path d="m147 78 17 10 17-10M164 88v20" fill="none" stroke="#E8EDF5" strokeWidth="3" strokeLinejoin="round" />
            <text
              x="198"
              y="91"
              fontFamily="'Inter Variable', Inter, sans-serif"
              fontSize="25"
              fontWeight="700"
              letterSpacing="1.5"
            >
              AXONLOG
            </text>
            <text
              x="202"
              y="107"
              fontFamily="'Inter Variable', Inter, sans-serif"
              fontSize="6.8"
              fontWeight="500"
              letterSpacing="5"
              opacity="0.75"
            >
              LOGISTICS
            </text>
          </g>

          <g fill="#F3A81D">
            <rect x="39" y="35" width="4" height="12" rx="1" />
            <rect x="39" y="149" width="4" height="9" rx="1" />
            <rect x="429" y="34" width="4" height="11" rx="1" />
            <rect x="429" y="149" width="4" height="9" rx="1" />
          </g>
          <g fill="#ACC5E5" opacity="0.55">
            <rect x="48" y="34" width="2" height="7" />
            <rect x="414" y="34" width="2" height="7" />
          </g>
        </g>

        <g>
          <path d="M49 166 H449 L459 177 H55Z" fill="#06101F" />
          <rect x="58" y="166" width="403" height="10" rx="2" fill="#101D2B" />
          <rect x="278" y="174" width="130" height="8" rx="2" fill="#9AA6B5" />
          <rect x="283" y="177" width="120" height="4" fill="#243246" />
          <path d="M277 174v21M409 174v21" stroke="#697789" strokeWidth="5" />
          <rect x="96" y="162" width="175" height="7" rx="2" fill="#020913" />
          <rect x="438" y="166" width="126" height="10" rx="2" fill="#152334" />
        </g>

        <g className="animated-truck__cab">
          <path
            d="M444 71 465 49h77c20 0 37 8 49 23l29 39c6 8 10 19 10 30v30l-12 9H446Z"
            fill={`url(#${cabGradient})`}
            stroke="#08204A"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M446 75 466 52h15l-4 112h-31Z" fill="#04152F" opacity="0.88" />
          <path d="M482 56h55c18 0 31 5 43 18l12 15H484Z" fill={`url(#${windowGradient})`} stroke="#1D5B91" strokeWidth="2" />
          <path d="m545 58 5 31M484 92h109" stroke="#061A32" strokeWidth="3" />
          <path d="M484 96h109l19 31v37H480Z" fill={`url(#${cabSide})`} />
          <path d="M491 101h48v42h-48Z" fill="#0A3770" stroke="#2A5A91" strokeWidth="1.5" />
          <path d="M546 101h48l16 27v17h-64Z" fill="#0A3267" stroke="#2A5A91" strokeWidth="1.5" />
          <path d="M482 148h131M542 95v68" stroke="#05182F" strokeWidth="2" opacity="0.75" />
          <path d="M513 108h17" stroke="#527FB1" strokeWidth="2" strokeLinecap="round" />
          <rect x="475" y="89" width="7" height="70" rx="2" fill="#061326" />

          <path d="M590 83h15l11 7-5 6-20-5Z" fill="#080E17" />
          <path d="M605 89 618 84" stroke="#64748B" strokeWidth="3" />
          <rect x="615" y="82" width="13" height="7" rx="2" fill="#111827" />

          <path d="M610 125h17l4 8v21h-20Z" fill="#0D3C76" />
          <rect x="618" y="132" width="11" height="13" rx="2" fill="#DCEBFB" />
          <ellipse cx="626" cy="138" rx="18" ry="14" fill={`url(#${lightGlow})`} opacity="0.75" />
          <rect x="620" y="158" width="12" height="9" rx="2" fill="#E04E35" />
          <path d="M621 169h14v9h-28Z" fill="#8A96A5" />
          <rect x="444" y="172" width="189" height="9" rx="2" fill="#101A27" />

          <g>
            <rect x="411" y="139" width="54" height="34" rx="5" fill={`url(#${metalGradient})`} stroke="#111D2D" strokeWidth="3" />
            <path d="M425 142v28M448 142v28" stroke="#4A5564" strokeWidth="2" />
            <rect x="401" y="151" width="14" height="18" rx="2" fill="#202E3E" />
            <rect x="404" y="154" width="7" height="4" fill="#E6A52D" />
          </g>
        </g>

        {WHEEL_CENTERS.map((cx) => (
          <Wheel key={cx} cx={cx} />
        ))}

        <g fill="#121F30">
          <path d="M84 165q34-31 68 0h-8q-26-22-52 0Z" />
          <path d="M151 165q33-31 66 0h-8q-25-22-50 0Z" />
          <path d="M217 165q33-31 66 0h-8q-25-22-50 0Z" />
          <path d="M436 165q32-30 64 0h-8q-24-21-48 0Z" />
          <path d="M541 165q34-31 68 0h-8q-26-22-52 0Z" />
        </g>
      </g>

      <line
        className="animated-truck__road"
        x1="15"
        y1="224"
        x2="665"
        y2="224"
        stroke="#4B78CC"
        strokeWidth="2"
        strokeDasharray="18 22"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
}
