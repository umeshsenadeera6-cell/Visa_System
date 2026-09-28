import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowRight, Loader2, Lock, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ApplicationTimeline } from "@/components/shared/ApplicationWidgets";
import { useLookups, useStore } from "@/store/store";
import { appProgress } from "@/lib/domain";
import { formatDate } from "@/lib/utils";

export default function Track() {
  const store = useStore();
  const { customer, country, visaType } = useLookups();
  const [params, setParams] = useSearchParams();
  const [value, setValue] = useState(params.get("id") ?? "");
  const [query, setQuery] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const search = (id: string) => {
    const clean = id.trim().toUpperCase();
    if (!clean) return;
    setLoading(true);
    setParams({ id: clean }, { replace: true });
    setTimeout(() => {
      setQuery(clean);
      setLoading(false);
    }, 700);
  };
  useEffect(() => {
    const id = params.get("id");
    if (id) search(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const app = query ? store.applications.find((a) => a.id.toUpperCase() === query) : undefined;
  const c = customer(app?.customerId);
  const vt = visaType(app?.visaTypeId);

  return (
    <div className="relative min-h-[80vh] overflow-hidden bg-[#fbfaf7]">
      <div className="absolute inset-x-0 top-0 h-[340px] bg-forest">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute -top-20 left-1/2 size-96 -translate-x-1/2 rounded-full bg-[#14815d] opacity-50 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-3xl px-4 pt-14 pb-20 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#e2c47c] uppercase">Application tracking</p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Track Your Visa Application</h1>
          <p className="mt-3 text-white/70">Enter the application number from your receipt or confirmation email.</p>
        </div>

        <Card className="mt-8 p-4 shadow-2xl sm:p-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              search(value);
            }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. SVS-UK-2026-00125" className="h-12 pl-11 font-mono text-[15px] tracking-wide uppercase placeholder:normal-case placeholder:tracking-normal" aria-label="Application number" />
            </div>
            <Button type="submit" size="lg" className="h-12" disabled={loading || !value.trim()}>
              {loading ? <Loader2 className="animate-spin" /> : null} Track Application
            </Button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            Try the example:{" "}
            <button onClick={() => (setValue("SVS-UK-2026-00125"), search("SVS-UK-2026-00125"))} className="font-mono font-medium text-primary hover:underline">
              SVS-UK-2026-00125
            </button>
          </p>
        </Card>

        {query && !loading && !app && (
          <Card className="mt-6 flex items-start gap-3 border-[#f7d4ce] bg-[#fff8f6] p-5 page-enter">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-[#b4321f]" />
            <div>
              <p className="font-semibold">We couldn't find that application</p>
              <p className="mt-1 text-sm text-muted-foreground">Please check the number and try again. Format: SVS-XX-YYYY-00000. If you need help, contact your consultant.</p>
            </div>
          </Card>
        )}

        {app && !loading && (
          <Card className="mt-6 overflow-hidden page-enter">
            <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{app.id}</p>
                <h2 className="mt-1 text-xl font-bold">Hello, {c?.firstName} 👋</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {country(app.countryCode)?.flag} {country(app.countryCode)?.name} · {vt?.category} Visa
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs text-muted-foreground">Current status</p>
                <div className="mt-1 flex items-center gap-2 sm:justify-end">
                  <StatusBadge status={app.status} className="text-[13px]" />
                  {app.decision && <StatusBadge status={app.decision} />}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Last updated {formatDate(app.updatedAt)}</p>
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <div className="mb-6 flex items-center gap-3">
                <Progress value={appProgress(app.status)} className="h-2.5" />
                <span className="font-display text-lg font-bold text-primary tabular">{appProgress(app.status)}%</span>
              </div>
              <ApplicationTimeline app={app} publicMode />
            </div>
            <div className="flex flex-col gap-3 border-t border-border bg-[#f8faf9] p-5 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-muted-foreground">
                <Lock className="size-4" /> Personal details are hidden for your privacy.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">
                  Sign in for full details <ArrowRight />
                </Link>
              </Button>
            </div>
          </Card>
        )}

        <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-primary" /> Visa decisions are made solely by the relevant immigration authority.
        </p>
      </div>
    </div>
  );
}
