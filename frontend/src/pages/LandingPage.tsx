import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowRight,
  Box,
  Check,
  Globe,
  Mail,
  Pause,
  Phone,
  Play,
  ShoppingCart,
  Truck,
  Warehouse,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TRUSTED_LOGOS = [
  { name: "Maersk", slug: "maersk" },
  { name: "DHL", slug: "dhl" },
  { name: "Flexport", slug: "flexport" },
  { name: "FedEx", slug: "fedex" },
  { name: "Kuehne+Nagel", slug: "kuehnenagel" },
  { name: "DSV", slug: "dsv" },
  { name: "DB Schenker", slug: "dbschenker" },
  { name: "UPS", slug: "ups" },
];

const PRICING_PLANS = [
  {
    name: "Basic Plan",
    price: 19,
    description:
      "For small ops teams getting started with consolidated freight visibility.",
    features: [
      { text: "Up to 100 packing lists / month", included: true },
      { text: "Standard email support", included: true },
      { text: "Carrier & port integrations", included: false },
      { text: "Custom roles & permissions", included: false },
      { text: "Dedicated account manager", included: false },
    ],
  },
  {
    name: "Enterprise Plan",
    price: 29,
    description:
      "For high-volume shippers running bonded, FTZ, and multi-port operations.",
    features: [
      { text: "Unlimited packing lists", included: true },
      { text: "Priority 24/7 support", included: true },
      { text: "Carrier & port integrations", included: true },
      { text: "Custom roles & permissions", included: true },
      { text: "Dedicated account manager", included: true },
    ],
  },
] as const;

// TODO: replace with the final AxonLog demo MP4 (or self-hosted URL)
const DEMO_VIDEO_URL = "/assets/demo.mp4";

const EASE = [0.16, 1, 0.3, 1] as const;

const LinkedInIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const scrollWheelKeyframes = `
  @keyframes scroll-wheel {
    0%   { transform: translateY(0);    opacity: 0; }
    20%  { transform: translateY(0);    opacity: 1; }
    80%  { transform: translateY(10px); opacity: 1; }
    100% { transform: translateY(14px); opacity: 0; }
  }
  .animate-scroll-wheel {
    animation: scroll-wheel 1.8s cubic-bezier(0.65, 0, 0.35, 1) infinite;
  }
`;

const FooterColumn = ({
  title,
  items,
}: {
  title: string;
  items: string[];
}) => (
  <div className="text-right">
    <h4
      className="text-sm font-medium mb-4"
      style={{ color: "#9CA3AF" }}
    >
      {title}
    </h4>
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item}>
          <a
            href="#"
            className="text-sm transition-colors hover:text-foreground"
            style={{ color: "#374151" }}
          >
            {item}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedWord({ text, className }: { text: string; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className={cn("inline-block whitespace-nowrap", className)}
      aria-label={text}
      style={{
        backgroundImage:
          "linear-gradient(90deg, #93C5FD 0%, #60A5FA 50%, #93C5FD 100%)",
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
      animate={reduce ? undefined : { backgroundPositionX: ["0%", "200%"] }}
      transition={
        reduce
          ? undefined
          : { duration: 4, repeat: Infinity, ease: "linear" }
      }
    >
      {text.split("").map((char, i) => (
        <span key={i} aria-hidden="true" className="inline-block">
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </motion.span>
  );
}

function LogoMarquee() {
  const reduce = useReducedMotion();
  const items = [...TRUSTED_LOGOS, ...TRUSTED_LOGOS];

  return (
    <div
      aria-label="Trusted by global freight operators"
      className="relative overflow-hidden border-y border-border bg-surface-container-low"
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-surface-container-low to-transparent z-10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-surface-container-low to-transparent z-10"
        aria-hidden="true"
      />
      <motion.div
        className="flex w-max items-center gap-14 py-6 px-6"
        animate={reduce ? undefined : { x: ["0%", "-50%"] }}
        transition={
          reduce
            ? undefined
            : { duration: 32, repeat: Infinity, ease: "linear" }
        }
        aria-hidden="true"
      >
        {items.map((logo, i) => (
          <div
            key={`${logo.slug}-${i}`}
            className="flex items-center gap-2 text-slate"
            title={logo.name}
          >
            <img
              src={`https://cdn.simpleicons.org/${logo.slug}`}
              alt={logo.name}
              className="h-5 w-5 opacity-60 grayscale"
              loading="lazy"
            />
            <span className="font-mono text-xs uppercase tracking-[0.18em]">
              {logo.name}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function BentoCell({
  className,
  children,
  tone = "default",
}: {
  className?: string;
  children: React.ReactNode;
  tone?: "default" | "tint" | "accent";
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-xl p-6 ring-1 ring-foreground/10 min-h-[220px]",
        tone === "default" && "bg-card",
        tone === "tint" && "bg-primary-fixed/60",
        tone === "accent" && "bg-accent",
        className
      )}
    >
      {children}
    </div>
  );
}

function StatNumber({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-mono text-3xl md:text-4xl text-foreground tracking-tight">
        {value}
      </span>
      <span className="text-xs text-slate">{label}</span>
    </div>
  );
}

function PricingCard({
  name,
  price,
  description,
  features,
  onCta,
}: {
  name: string;
  price: number;
  description: string;
  features: readonly { text: string; included: boolean }[];
  onCta: () => void;
}) {
  return (
    <div className="flex h-full flex-col rounded-xl bg-card p-6 ring-1 ring-foreground/10">
      <h3 className="font-heading text-lg font-semibold text-primary">{name}</h3>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-heading text-5xl font-semibold tracking-tight text-foreground">
          ${price}
        </span>
        <span className="text-sm text-foreground-muted">/month</span>
      </div>
      <p
        className="mt-3 text-sm text-foreground-muted"
        style={{ lineHeight: 1.6 }}
      >
        {description}
      </p>
      <div className="my-5 h-px bg-border" />
      <ul className="space-y-2.5">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2.5 text-sm">
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                f.included
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-container-high text-slate"
              )}
            >
              <Check size={12} strokeWidth={3} />
            </span>
            <span className={f.included ? "text-foreground" : "text-slate"}>
              {f.text}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-6">
        <Button
          onClick={onCta}
          className="h-11 w-full rounded-full bg-primary-light text-white hover:bg-primary-light/90 hover:text-white cursor-pointer"
        >
          Add To Cart
          <ShoppingCart size={16} className="ml-1.5" />
        </Button>
      </div>
    </div>
  );
}

function DemoVideoPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  return (
    <div
      className="group relative aspect-video w-full overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10"
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          setCurrentTime(v.currentTime);
          if (v.duration) setProgress((v.currentTime / v.duration) * 100);
        }}
      />

      {/* Dark scrim while paused, fades on play */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-foreground/30 transition-opacity duration-300",
          isPlaying ? "opacity-0" : "opacity-100"
        )}
        aria-hidden="true"
      />

      {/* Center play button — only visible when paused */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
        aria-label="Play demo"
        className={cn(
          "absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary-light text-white shadow-[0_8px_24px_rgba(0,82,204,0.45)] transition-all duration-300",
          isPlaying
            ? "pointer-events-none scale-75 opacity-0"
            : "scale-100 opacity-100 hover:scale-105"
        )}
      >
        <Play size={28} fill="currentColor" className="ml-1" />
      </button>

      {/* Bottom control bar — visible while paused, fades in on hover while playing */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-foreground/70 to-transparent px-4 py-3 text-xs text-white transition-opacity duration-300",
          isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
        )}
      >
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
        >
          {isPlaying ? (
            <Pause size={14} fill="currentColor" />
          ) : (
            <Play size={14} fill="currentColor" />
          )}
        </button>
        <div
          className="h-1 flex-1 overflow-hidden rounded-full bg-white/20"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-primary-light transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="font-mono text-[11px] tabular-nums text-white/80">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}

function formatTime(s: number) {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const goToLogin = () => navigate("/login");

  return (
    <div className="bg-background text-foreground">
      {/* ══════════════════════════════════════════════════
          0. TOP NAV — sticky glossy glass pill
      ══════════════════════════════════════════════════ */}
      <header className="fixed top-2 inset-x-0 z-50 flex justify-center px-4 lg:px-12 pt-3 pb-3">
        <div
          className="glass-nav flex w-full max-w-3xl items-center justify-between gap-2 rounded-full border border-white/45 px-4 py-2 ring-1 ring-white/20 sm:px-5 sm:py-2.5"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.62) 50%, rgba(255,255,255,0.72) 100%)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            boxShadow:
              "0 10px 32px rgba(9, 30, 66, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.75), inset 0 -1px 0 rgba(0, 0, 0, 0.06)",
          }}
        >
          <a href="#top" className="flex items-center gap-2 shrink-0" aria-label="AxonLog home">
            <Logo variant="dark" />
          </a>

          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-7 text-sm text-foreground"
          >
            <a
              href="#top"
              className="relative pb-1 border-b-2 border-transparent transition-colors duration-200 ease-in hover:text-foreground hover:border-nav-accent"
            >
              Home
            </a>
            <a
              href="#about"
              className="relative pb-1 border-b-2 border-transparent transition-colors duration-200 ease-in hover:text-foreground hover:border-nav-accent"
            >
              About Us
            </a>
            <a
              href="#solutions"
              className="relative pb-1 border-b-2 border-transparent transition-colors duration-200 ease-in hover:text-foreground hover:border-nav-accent"
            >
              Services
            </a>
            <a
              href="#pricing"
              className="relative pb-1 border-b-2 border-transparent transition-colors duration-200 ease-in hover:text-foreground hover:border-nav-accent"
            >
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="default"
              onClick={goToLogin}
              className="h-10 px-5 text-sm rounded-full cursor-pointer"
            >
              Book a demo
            </Button>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════
          1. HERO — full-bleed video, dark overlay, floating cards
      ══════════════════════════════════════════════════ */}
      <section id="top" className="relative min-h-[100dvh] overflow-hidden flex items-center justify-center">
        {/* Video background — logistics footage */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          style={{ opacity: 0.95 }}
        >
          {/* Container port aerial / logistics footage */}
          <source
            src="/assets/herovid.mp4"
            type="video/mp4"
          />
        </video>

        {/* ── OVERLAY ───────────────────────────────────── */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(4,9,22,0.6) 10%, rgba(4,9,22,0.65) 35%, rgba(4,9,22,0.75) 100%)",
          }}
        />

        {/* Subtle vignette edges */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: "inset 0 0 120px 40px rgba(4,9,22,0.7)",
          }}
        />

        {/* Main content — anchored to bottom, centered */}
        <main className="relative z-10 w-full px-6">
          <div className="mx-auto w-full max-w-3xl  text-center">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8 font-mono"
              style={{
                background: "rgba(0,82,204,0.28)",
                border: "1px solid rgba(0,82,204,0.5)",
                color: "#93C5FD",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "#3B82F6" }}
              />
              Global logistics platform
            </div>
            <h1
              className="mt-5 font-heading text-4xl font-semibold text-white sm:text-5xl lg:text-6xl"
              style={{
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
              }}
            >
              A <AnimatedWord text="Packing List" className="text-white" /> transformation solution
            </h1>
            <Reveal delay={0.1}>
              <p
                className="mt-5 text-base text-white text-center"
                style={{ lineHeight: 1.65, hyphens: "auto" }}
              >
                End-to-end freight visibility from origin to door — ocean, air, road, and customs in one platform.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-col flex-wrap items-center justify-center gap-3">
                <Button
                  size="lg"
                  onClick={goToLogin}
                  className="h-11 px-5 text-sm bg-white text-primary-light hover:bg-white/90 hover:text-primary cursor-pointer"
                >
                  Get started
                  <ArrowRight />
                </Button>

                <span className="font-mono text-xs text-white/50 mt-2">
                  No credit card required · Cancel anytime
                </span>
              </div>
            </Reveal>
          </div>
        </main>

        {/* ── SCROLL INDICATOR ─────────────────────────── */}
        <style>{scrollWheelKeyframes}</style>
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none"
          aria-hidden="true"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex flex-col items-center pt-2 gap-0.5">
            {/* The scroll wheel — a thin horizontal bar in the middle */}
            <span className="block w-2 h-0.5 rounded-full bg-white/50" />
            {/* The animated scroll dot below the wheel */}
            <span className="block w-1 h-1.5 rounded-full bg-white/80 animate-scroll-wheel" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          2. TRUSTED-BY LOGO WALL — single marquee
      ══════════════════════════════════════════════════ */}
      <LogoMarquee />

      {/* ══════════════════════════════════════════════════
          3. ABOUT — short editorial block + inline stat tiles
      ══════════════════════════════════════════════════ */}
      <section id="about" className="">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            <Reveal className="lg:col-span-5">
              <h2
                className="font-heading text-3xl font-semibold text-foreground sm:text-4xl md:text-5xl"
                style={{ letterSpacing: "-0.025em", lineHeight: 1.1 }}
              >
                Built for freight that has to move.
              </h2>
            </Reveal>
            <div className="lg:col-span-7 space-y-5 text-base text-foreground-muted md:text-lg">
              <Reveal delay={0.05}>
                <p style={{ lineHeight: 1.7 }}>
                  AxonLog is a logistics platform for sales, manufacturing, and
                  the loading floor. We replace re-keyed spreadsheets with one
                  source of truth for every order, packing list, and container.
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <p style={{ lineHeight: 1.7 }}>
                  Our operators run bonded and free-trade-zone warehouses,
                  coordinate carrier moves through key ports, and audit every
                  line item from pick to door.
                </p>
              </Reveal>
            </div>
          </div>

          <Reveal delay={0.15}>
            <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-border pt-10 md:grid-cols-3">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate">
                  Headquartered
                </dt>
                <dd className="mt-2 text-base text-foreground">
                  Manchester, Kentucky
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate">
                  Coverage
                </dt>
                <dd className="mt-2 text-base text-foreground">
                  180+ countries
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate">
                  Carrier network
                </dt>
                <dd className="mt-2 text-base text-foreground">
                  2,500+ trucks
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          4. STATS STRIP — floating band between About and Solutions
      ══════════════════════════════════════════════════ */}
      <section
        className="border-y border-border"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.55) 100%)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.75), inset 0 -1px 0 rgba(0,0,0,0.04), 0 4px 12px rgba(9, 30, 66, 0.06)",
        }}
      >
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-14">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <StatNumber value="12,400+" label="Shipments this month" />
            <StatNumber value="180+" label="Countries served" />
            <StatNumber value="0.4%" label="Manifest error rate" />
            <StatNumber value="< 2s" label="Average sync time" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          5. SOLUTIONS — bento grid (4 cells, asymmetric)
      ══════════════════════════════════════════════════ */}
      <section id="solutions" className="bg-surface-container-low">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <Reveal>
            <div className="max-w-2xl">
              <h2
                className="font-heading text-3xl font-semibold text-foreground sm:text-4xl md:text-5xl"
                style={{ letterSpacing: "-0.025em", lineHeight: 1.1 }}
              >
                One platform, every stage of the load.
              </h2>
              <p
                className="mt-4 max-w-prose text-base text-foreground-muted"
                style={{ lineHeight: 1.6 }}
              >
                Sales, manufacturing, and the loading floor work from the same
                source of truth.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Cell 1 — Fulfillment (col-span-2) with image */}
            <Reveal className="md:col-span-2" delay={0.05}>
              <BentoCell className="p-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 h-full">
                  <div className="flex flex-col justify-between p-6">
                    <div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-fixed text-primary">
                        <Box size={18} />
                      </div>
                      <h3 className="mt-5 font-heading text-lg font-semibold text-foreground">
                        Fulfillment
                      </h3>
                      <p
                        className="mt-2 text-sm text-foreground-muted"
                        style={{ lineHeight: 1.6 }}
                      >
                        Connect sales orders to packing lists, pick lists, and
                        loading manifests without re-keying a single SKU.
                      </p>
                    </div>
                    <span className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-slate">
                      Order &rarr; Packing
                    </span>
                  </div>
                  <div className="relative min-h-[200px] overflow-hidden">
                    <img
                      src="/assets/solution-1.png"
                      alt="Organized fulfillment center inventory"
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </BentoCell>
            </Reveal>

            {/* Cell 2 — Bonded & FTZ (col-span-1) on tinted bg */}
            <Reveal className="md:col-span-1" delay={0.1}>
              <BentoCell tone="tint">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-card text-primary">
                  <Warehouse size={18} />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">
                    Bonded &amp; FTZ
                  </h3>
                  <p
                    className="mt-2 text-sm text-foreground-muted"
                    style={{ lineHeight: 1.6 }}
                  >
                    Track duty status, lot numbers, and customs holds alongside
                    standard inventory.
                  </p>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate">
                  Customs &middot; Duty
                </span>
              </BentoCell>
            </Reveal>

            {/* Cell 3 — Transportation (col-span-1) on accent bg */}
            <Reveal className="md:col-span-1" delay={0.15}>
              <BentoCell tone="accent">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-card text-primary">
                  <Truck size={18} />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">
                    Transportation
                  </h3>
                  <p
                    className="mt-2 text-sm text-foreground-muted"
                    style={{ lineHeight: 1.6 }}
                  >
                    Coordinate 2,500+ carrier moves through key ports and
                    inland hubs in one queue.
                  </p>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate">
                  Port &rarr; Door
                </span>
              </BentoCell>
            </Reveal>

            {/* Cell 4 — Real-time visibility (col-span-2) with image + stat */}
            <Reveal className="md:col-span-2" delay={0.2}>
              <BentoCell className="p-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 h-full">
                  <div className="relative min-h-[200px] overflow-hidden order-2 sm:order-1">
                    <img
                      src="/assets/warehouse-1.png"
                      alt="Logistics operations floor"
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-col justify-between p-6 order-1 sm:order-2">
                    <div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-fixed text-primary">
                        <Globe size={18} />
                      </div>
                      <h3 className="mt-5 font-heading text-lg font-semibold text-foreground">
                        Real-time visibility
                      </h3>
                      <p
                        className="mt-2 text-sm text-foreground-muted"
                        style={{ lineHeight: 1.6 }}
                      >
                        Every stage, from pick to port, on one timeline.
                      </p>
                    </div>
                    <div className="mt-6 flex items-baseline gap-3 border-t border-border/60 pt-4">
                      <span className="font-mono text-2xl text-foreground tracking-tight">
                        400+
                      </span>
                      <span className="text-xs text-slate">
                        shipments processed this month
                      </span>
                    </div>
                  </div>
                </div>
              </BentoCell>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          6. PRICING — intro column + two plan cards
      ══════════════════════════════════════════════════ */}
      <section id="pricing" className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-12">
            {/* Left intro column */}
            <div className="lg:col-span-4">
              <Reveal>
                <span className="inline-flex items-center px-3 py-1 rounded-full font-mono text-xs font-medium bg-primary-fixed text-on-primary-fixed border border-primary-fixed">
                  Our Pricing
                </span>
              </Reveal>
              <Reveal delay={0.05}>
                <h2
                  className="mt-6 font-heading text-3xl font-semibold text-foreground sm:text-4xl md:text-5xl"
                  style={{ letterSpacing: "-0.025em", lineHeight: 1.1 }}
                >
                  The most honest pricing in the world.
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p
                  className="mt-5 max-w-prose text-base text-foreground-muted"
                  style={{ lineHeight: 1.65 }}
                >
                  Transparent pricing that scales with the load you move — not
                  the seats you add. Every plan covers ocean, air, road, and
                  customs on a single timeline.
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <ul className="mt-8 space-y-3 text-sm">
                  <li className="flex items-center gap-3 text-foreground">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-fixed text-on-primary-fixed">
                      <Mail size={16} />
                    </span>
                    <a
                      href="mailto:hello@axonlog.com"
                      className="hover:text-primary transition-colors"
                    >
                      hello@axonlog.com
                    </a>
                  </li>
                  <li className="flex items-center gap-3 text-foreground">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-fixed text-on-primary-fixed">
                      <Phone size={16} />
                    </span>
                    <span>+1 606 555 0123</span>
                  </li>
                </ul>
              </Reveal>
            </div>

            {/* Right cards column */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {PRICING_PLANS.map((plan, i) => (
                  <Reveal key={plan.name} delay={i * 0.05}>
                    <PricingCard
                      name={plan.name}
                      price={plan.price}
                      description={plan.description}
                      features={plan.features}
                      onCta={goToLogin}
                    />
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          7. DEMO — embedded product walkthrough
      ══════════════════════════════════════════════════ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <Reveal>
            <div className="max-w-2xl">
              <h2
                className="font-heading text-3xl font-semibold text-foreground sm:text-4xl md:text-5xl"
                style={{ letterSpacing: "-0.025em", lineHeight: 1.1 }}
              >
                Watch the demo.
              </h2>
              <p
                className="mt-4 max-w-prose text-base text-foreground-muted"
                style={{ lineHeight: 1.6 }}
              >
                A two-minute walkthrough of how AxonLog consolidates sales,
                manufacturing, and the loading floor into one timeline.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10">
              <DemoVideoPlayer src={DEMO_VIDEO_URL} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          8. FOOTER
      ══════════════════════════════════════════════════ */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <Logo />
              <p
                className="mt-4 text-sm"
                style={{ color: "#6B7280", lineHeight: 1.6 }}
              >
                4517 Washington Ave.
                <br />
                Manchester, Kentucky
                <br />
                39495
              </p>
            </div>

            <FooterColumn
              title="Services"
              items={[
                "Warehousing",
                "Fulfillment",
                "Transloading",
                "Bonded & FTZ",
              ]}
            />
            <FooterColumn
              title="Industries"
              items={[
                "Ecommerce",
                "Footwear & Apparel",
                "Cold Chain Logistics",
                "Hazmat",
              ]}
            />
            <FooterColumn
              title="About"
              items={[
                "Company",
                "Newsroom",
                "Terms of service",
                "Privacy policy",
              ]}
            />
          </div>

          {/* Divider + bottom row */}
          <div className="mt-12 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm" style={{ color: "#9CA3AF" }}>
              © AxonLog 2026
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-sm flex items-center gap-2 transition-colors hover:text-foreground"
                style={{ color: "#6B7280" }}
              >
                <LinkedInIcon size={16} /> LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
