import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Package, ArrowRight } from "lucide-react";

const sansFont = { fontFamily: "'Inter', sans-serif" };
const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

export default function App() {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="relative w-full min-h-screen overflow-hidden bg-black"
      style={sansFont}
    >
      {/* ── VIDEO BACKGROUND ──────────────────────────── */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        style={{ opacity: 0.55 }}
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
            "linear-gradient(to bottom, rgba(4,9,22,0.55) 0%, rgba(4,9,22,0.42) 40%, rgba(4,9,22,0.72) 100%)",
        }}
      />
      {/* Subtle vignette edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: "inset 0 0 120px 40px rgba(4,9,22,0.7)",
        }}
      />

      {/* ── TOP BAR ───────────────────────────────────── */}
      <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-8 lg:px-12 py-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 flex items-center justify-center"
            style={{
              background: "#0052CC",
              borderRadius: "4px",
            }}
          >
            <Package size={14} color="#fff" />
          </div>
          <span className="text-sm font-semibold text-white tracking-tight">
            Axon<span style={{ color: "#60A5FA" }}>Log</span>
          </span>
        </div>
      </header>

      {/* ── CENTERED HERO CONTENT ─────────────────────── */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div
          className="flex flex-col items-center transition-all duration-700"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "none" : "translateY(20px)",
          }}
        >
          {/* Eyebrow tag */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8"
            style={{
              background: "rgba(0,82,204,0.28)",
              border: "1px solid rgba(0,82,204,0.5)",
              color: "#93C5FD",
              ...monoFont,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#3B82F6" }}
            />
            Global logistics platform
          </div>

          {/* Title */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6"
            style={{
              letterSpacing: "-0.035em",
              lineHeight: 1.08,
              maxWidth: "14ch",
            }}
          >
            A <span
              style={{
                background:
                  "linear-gradient(90deg, #60A5FA 0%, #818CF8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              packing list
            </span> transformation solution.
          </h1>

          {/* Description */}
          <p
            className="text-base sm:text-lg mb-10"
            style={{
              color: "rgba(255,255,255,0.58)",
              maxWidth: "34ch",
              lineHeight: 1.65,
            }}
          >
            End-to-end freight visibility from origin to door —
            ocean, air, road, and customs in one platform.
          </p>

          {/* CTA */}
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2.5 text-sm font-semibold px-8 py-3.5 text-white transition-all"
            style={{
              background: "#0052CC",
              borderRadius: "5px",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={(e) => {
              (
                e.currentTarget as HTMLElement
              ).style.background = "#003B9A";
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(-1px)";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 8px 24px rgba(0,82,204,0.45)";
            }}
            onMouseLeave={(e) => {
              (
                e.currentTarget as HTMLElement
              ).style.background = "#0052CC";
              (e.currentTarget as HTMLElement).style.transform =
                "none";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "none";
            }}
          >
            Opt in <ArrowRight size={15} />
          </button>

          {/* Trust note */}
          <p
            className="mt-5 text-xs"
            style={{
              color: "rgba(255,255,255,0.3)",
              ...monoFont,
            }}
          >
            No credit card required · Cancel anytime
          </p>
        </div>
      </main>

      {/* ── BOTTOM FADE ───────────────────────────────── */}
      <div
        className="absolute bottom-0 inset-x-0 h-24 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(4,9,22,0.8), transparent)",
        }}
      />
    </div>
  );
}