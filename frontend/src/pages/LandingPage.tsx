import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Tag, Sparkles, X } from "lucide-react";
import Logo from "@/components/Logo";

const sansFont = { fontFamily: "'Inter', sans-serif" };
const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

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

const Chip = ({ label }: { label: string }) => (
  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-700 shadow-sm">
    <X size={14} className="text-red-500" />
    {label}
  </span>
);

const SolutionCard = ({
  title,
  description,
  image,
  alt,
}: {
  title: string;
  description: string;
  image: string;
  alt: string;
}) => (
  <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm flex flex-col">
    <div className="p-6">
      <h3
        className="text-base sm:text-lg font-semibold"
        style={{ color: "#0D1F3C" }}
      >
        {title}
      </h3>
      <p
        className="mt-2 text-sm"
        style={{ color: "#6B7280", lineHeight: 1.6 }}
      >
        {description}
      </p>
    </div>
    <img
      src={image}
      alt={alt}
      className="w-full h-52 md:h-56 object-cover mt-auto"
    />
  </div>
);

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

const XBrandIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function App() {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative bg-black" style={sansFont}>
      {/* ══════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════ */}
      <div className="relative min-h-screen overflow-hidden">
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
          <Logo variant="light" />
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

        {/* ── SCROLL INDICATOR ─────────────────────────── */}
        <style>{scrollWheelKeyframes}</style>
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none"
          aria-hidden="true"
        >
          <span
            className="text-[10px] font-medium tracking-[0.2em] uppercase"
            style={{ ...monoFont, color: "rgba(255,255,255,0.55)" }}
          >
            Scroll
          </span>
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex flex-col items-center pt-2 gap-0.5">
            {/* The scroll wheel — a thin horizontal bar in the middle */}
            <span className="block w-2 h-0.5 rounded-full bg-white/50" />
            {/* The animated scroll dot below the wheel */}
            <span className="block w-1 h-1.5 rounded-full bg-white/80 animate-scroll-wheel" />
          </div>
        </div>
      </div>
      
      {/* ══════════════════════════════════════════════════
          PROBLEM SECTION
      ══════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center">
          {/* Pill */}
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            What's the problem?
          </span>

          {/* Heading */}
          <h2
            className="mt-6 text-3xl sm:text-4xl md:text-5xl font-bold text-center"
            style={{
              color: "#0D1F3C",
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
            }}
          >
            Manual workflows cause
            <br />
            <span style={{ color: "#0052CC" }}>delays and errors</span>
          </h2>

          {/* Image cards */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
              <img
                src="/assets/warehouse-1.png"
                alt="Warehouse disorganized shelves"
                className="w-full h-64 md:h-72 object-cover"
              />
              <div className="p-5 flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Tag size={16} />
                </span>
                <span
                  className="text-sm sm:text-base font-semibold"
                  style={{ color: "#0D1F3C" }}
                >
                  Inaccurate Order Fulfillment
                </span>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
              <img
                src="/assets/warehouse-2.png"
                alt="Worker scanning inventory"
                className="w-full h-64 md:h-72 object-cover"
              />
              <div className="p-5 flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Sparkles size={16} />
                </span>
                <span
                  className="text-sm sm:text-base font-semibold"
                  style={{ color: "#0D1F3C" }}
                >
                  Lack of Real-Time Visibility
                </span>
              </div>
            </div>
          </div>

          {/* Chip cluster (1-2-3 stagger) */}
          <div className="mt-16 flex flex-col items-center gap-3">
            {/* row 1 — 1 chip */}
            <div className="flex justify-center gap-3 flex-wrap">
              <Chip label="Inefficiency in Processes" />
            </div>

            {/* row 2 — 2 chips */}
            <div className="flex justify-center gap-3 flex-wrap">
              <Chip label="Human Errors" />
              <Chip label="Missed Deadlines" />
            </div>

            {/* row 3 — 3 chips */}
            <div className="flex justify-center gap-3 flex-wrap">
              <Chip label="Lack of Transparency" />
              <Chip label="Difficulty in Scaling" />
              <Chip label="Inconsistent Communication" />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SOLUTIONS SECTION
      ══════════════════════════════════════════════════ */}
      <section className="bg-gray-50 py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center">
          {/* Pill */}
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            Solutions
          </span>

          {/* Heading */}
          <h2
            className="mt-6 text-3xl sm:text-4xl md:text-5xl font-bold text-center"
            style={{
              color: "#0D1F3C",
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
            }}
          >
            All-in-One Solution
            <br />
            for Everyone
          </h2>

          {/* Subhead */}
          <p
            className="mt-5 text-sm sm:text-base text-center max-w-2xl"
            style={{ color: "#6B7280", lineHeight: 1.6 }}
          >
            Automate repetitive tasks, integrate seamlessly with your tools, and
            access real-time insights to optimize every step of your process.
          </p>

          {/* Cards — single row of 3 */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <SolutionCard
              title="Fulfillment"
              description="Tech-driven fulfillment services that streamline the flow from manufacturer to customer, with added benefits like repackaging."
              image="/assets/solution-1.png"
              alt="Fulfillment center with organized inventory"
            />
            <SolutionCard
              title="Bonded & FTZ Warehouses"
              description="Secure storage and cost-saving solutions for import and export activities through bonded and Free Trade Zone (FTZ) warehouses."
              image="/assets/solution-2.png"
              alt="Bonded warehouse with customs signage"
            />
            <SolutionCard
              title="Transportation"
              description="A reliable transportation network with 2,500+ trucks, ensuring fast, efficient deliveries through key ports and logistics hubs."
              image="/assets/solution-3.png"
              alt="Highway with freight trucks"
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TESTIMONIAL + CURVED LINE (bridges Solutions → CTA)
      ══════════════════════════════════════════════════ */}
      <div className="relative bg-gray-50 pt-16 pb-32">
        {/* Curved SVG line from testimonial down to the conveyor image */}
        <svg
          className="absolute left-0 right-0 bottom-0 w-full h-24 pointer-events-none"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M720,0 Q1100,100 1100,80"
            stroke="#3B82F6"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="4 4"
          />
        </svg>
      </div>

      {/* ══════════════════════════════════════════════════
          CTA SECTION
      ══════════════════════════════════════════════════ */}
      <section
        className="relative pt-32 pb-20 md:pt-40 md:pb-24"
        style={{
          background: "linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%)",
        }}
      >
        {/* Conveyor image — sits on top of the section */}
        <div className="absolute left-1/2 -top-16 -translate-x-1/2 w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-xl z-10">
          <img
            src="/assets/cta-conveyor.png"
            alt="Logistics worker scanning packages on a conveyor belt"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative max-w-3xl mx-auto px-6 text-center pt-20">
          {/* Heading */}
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white"
            style={{ letterSpacing: "-0.025em", lineHeight: 1.1 }}
          >
            Start using AxonLog today.
          </h2>

          {/* Subhead */}
          <p
            className="mt-4 text-sm sm:text-base text-white/80 max-w-xl mx-auto"
            style={{ lineHeight: 1.6 }}
          >
            Automates your repetitive tasks, integrates seamlessly with your existing tools.
          </p>

          {/* CTA button */}
          <button
            onClick={() => navigate("/login")}
            className="mt-8 inline-flex items-center px-7 py-3 rounded-full bg-white text-sm font-semibold transition-colors hover:bg-gray-100 cursor-pointer"
            style={{ color: "#1D4ED8" }}
          >
            Explore AxonLog
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FOOTER
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
