import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ArrowRight, EyeOff, Eye } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import Logo from "@/components/Logo";

const sansFont = { fontFamily: "'Inter', sans-serif" };

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [usernameFocus, setUsernameFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const ok = await login(username, password);
    setSubmitting(false);
    if (ok) {
      navigate("/dashboard");
    } else {
      toast.error("Invalid username or password");
    }
  };

  const inputBorder = (focused: boolean) => ({
    border: `1.5px solid ${focused ? "#0052CC" : "#D6DCE4"}`,
    borderRadius: "6px",
    background: "#fff",
    boxShadow: focused ? "0 0 0 3px rgba(0,82,204,0.1)" : "none",
    transition: "all 0.15s ease",
  });

  return (
    <div
      className="flex w-full min-h-screen"
      style={{ background: "#F0F4FA", ...sansFont }}
    >
      {/* ══════════════════════════════════════════════════
          LEFT — illustration panel (full background image)
      ══════════════════════════════════════════════════ */}
      <div
        className="hidden lg:block flex-1 relative overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/login-scene.png')" }}
      >
        {/* Soft tint overlay for legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(245,250,255,0.25) 0%, rgba(245,250,255,0) 35%, rgba(15,40,90,0.55) 100%)",
          }}
        />

        {/* Logo — top left */}
        <div className="relative z-10 px-10 pt-8">
          <Logo />
        </div>

        {/* Bottom copy */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-10 pb-10 text-center">
          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: "#FFFFFF", letterSpacing: "-0.02em", textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}
          >
            Move smarter. Deliver faster.
          </h2>
          <p
            className="text-sm mb-5"
            style={{ color: "rgba(255,255,255,0.9)", lineHeight: 1.6, textShadow: "0 1px 6px rgba(0,0,0,0.3)" }}
          >
            Real-time visibility across 180+ countries — from the warehouse floor to the customer's door.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          RIGHT — login form panel
      ══════════════════════════════════════════════════ */}
      <div
        className="flex flex-col justify-center w-full lg:w-[40%] flex-shrink-0 px-10 xl:px-14"
        style={{ background: "#ffffff", boxShadow: "-4px 0 32px rgba(0,30,80,0.07)" }}
      >
        {/* Mobile logo */}
        <div className="mb-10 lg:hidden">
          <Logo variant="light" />
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1.5" style={{ color: "#0D1F3C", letterSpacing: "-0.02em" }}>
            Sign in
          </h1>
          <p className="text-sm" style={{ color: "#7A8BA0", lineHeight: 1.6 }}>
            We help to create your logistics connection. Reliable and seamless experience.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#4A5568" }}>
              Username
            </label>
            <input
              type="text"
              placeholder="Username (po / sale / mfg)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setUsernameFocus(true)}
              onBlur={() => setUsernameFocus(false)}
              className="w-full px-4 py-3 text-sm outline-none"
              style={{ ...inputBorder(usernameFocus), color: "#0D1F3C" }}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#4A5568" }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPassFocus(true)}
                onBlur={() => setPassFocus(false)}
                className="w-full px-4 py-3 text-sm outline-none pr-10"
                style={{ ...inputBorder(passFocus), color: "#0D1F3C" }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#A0AEC0" }}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all mt-2"
              style={{ background: "#0052CC", borderRadius: "6px", border: "none" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#003B9A";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,82,204,0.35)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#0052CC";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              {submitting ? "Signing in..." : "Sign in"}
              {!submitting && <ArrowRight size={14} />}
            </button>
        </form>
      </div>
    </div>
  );
}
