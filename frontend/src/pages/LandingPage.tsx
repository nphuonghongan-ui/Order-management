import { useNavigate, Link } from "react-router";
import {
  Boxes,
  LogIn,
  Package,
  ClipboardList,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: Package,
    title: "Inventory Management",
    description:
      "Track stock levels, manage SKUs, and keep your supply chain in sync with real-time inventory CRUD.",
  },
  {
    icon: ClipboardList,
    title: "Packing Lists",
    description:
      "Create and manage packing lists with customer details, item counts, and shipment status tracking.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    description:
      "Tailored dashboards for PO, Sales, and Manufacturing teams — each role sees exactly what they need.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="h-14 flex items-center justify-between px-6 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Boxes size={22} className="text-primary" />
          <span className="font-semibold text-sm text-foreground">
            Order Management
          </span>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium text-primary-foreground bg-primary hover:bg-primary-light transition-colors"
        >
          <LogIn size={15} />
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground mb-6">
            Supply Chain Operations Platform
          </span>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground mb-5 leading-tight">
            Streamline your order &amp; inventory operations
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            A unified dashboard for your PO, Sales, and Manufacturing teams.
            Manage inventory, track packing lists, and keep every role aligned
            with real-time data.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium text-primary-foreground bg-primary hover:bg-primary-light transition-colors"
            >
              Get Started
              <ArrowRight size={16} />
            </button>
            <Link
              to="/login"
              className="flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium text-foreground border border-border bg-card hover:bg-muted transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-lg border border-border bg-card p-6 text-left"
              >
                <div className="w-10 h-10 rounded-md bg-accent flex items-center justify-center mb-4">
                  <Icon size={20} className="text-accent-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="h-12 flex items-center justify-center px-6 border-t border-border bg-card">
        <p className="text-xs text-muted-foreground">
          Order Management &middot; Built for supply chain teams
        </p>
      </footer>
    </div>
  );
}
