import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { User, Lock, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const ok = login(username);
    if (ok) {
      navigate("/dashboard");
    } else {
      toast.error("Invalid username. Use: po, sale, or mfg");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-[420px] rounded-lg border border-border bg-card shadow-custom-md overflow-hidden">
        <div className="bg-primary px-10 py-12 text-center text-primary-foreground">
          <h1 className="text-2xl font-semibold tracking-tight mb-3">
            Order Management
          </h1>
          <p className="text-sm opacity-80">
            Sign in to continue to your dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-10 py-10">
          <h2 className="text-center text-sm font-semibold tracking-widest text-muted-foreground mb-8">
            USER LOGIN
          </h2>

          <div className="flex items-center border border-border rounded-md px-3 py-2.5 mb-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 transition-colors">
            <User className="text-muted-foreground mr-2.5" size={18} />
            <input
              type="text"
              placeholder="Username (po / sale / mfg)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-transparent outline-none w-full text-sm text-foreground placeholder:text-muted-foreground/60"
            />
          </div>

          <div className="flex items-center border border-border rounded-md px-3 py-2.5 mb-6 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 transition-colors">
            <Lock className="text-muted-foreground mr-2.5" size={18} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent outline-none w-full text-sm text-foreground placeholder:text-muted-foreground/60"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium text-primary-foreground bg-primary hover:bg-primary-light transition-colors"
          >
            <LogIn size={16} />
            LOGIN
          </button>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Demo: use <span className="font-mono font-medium">po</span>,{" "}
            <span className="font-mono font-medium">sale</span>, or{" "}
            <span className="font-mono font-medium">mfg</span> as username
          </p>
        </form>
      </div>
    </div>
  );
}
