import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Package, Truck } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { SectionCard } from "@/components/Detail/SectionCard";
import { Button } from "@/components/ui/button";

export default function LoadingToContainer() {
  const { plId } = useParams<{ plId: string }>();
  const navigate = useNavigate();

  return (
    <PageShell className="items-center justify-center py-16 px-4">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <button
            type="button"
            onClick={() => navigate("/dashboard/packing-list")}
            className="inline-flex items-center gap-1.5 text-xs hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Packing Lists
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-6 py-5 bg-gradient-to-r from-[#0a1530] to-[#1E6BFF]/70">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white/10 p-2 ring-1 ring-white/20">
                <Truck size={20} className="text-white" />
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-white/70">
                  Loading to Container
                </div>
                <div className="font-mono text-lg font-semibold text-white">
                  {plId ?? "—"}
                </div>
              </div>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-200 ring-1 ring-amber-300/40">
              Coming soon
            </span>
          </div>

          <div className="p-6 flex flex-col gap-6">
            <SectionCard title="Container Assignment" icon={Package}>
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="rounded-full bg-muted p-3">
                  <Package size={28} className="text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground max-w-sm">
                  The &ldquo;Loading to Container&rdquo; workflow is under
                  construction. Soon you will be able to assign this packing
                  list to a container, track its loading progress, and confirm
                  dispatch — all from here.
                </p>
              </div>
            </SectionCard>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard/packing-list")}
              >
                <ArrowLeft size={14} className="mr-1.5" />
                Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}