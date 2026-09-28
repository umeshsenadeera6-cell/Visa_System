import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, Briefcase, Eye, EyeOff, FileCheck2, Loader2, Lock, Mail, ShieldCheck, UserCog, UserRound, Wallet, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/shared/Logo";
import { TravelArt } from "@/components/shared/TravelArt";
import { Field, emailRule } from "@/components/shared/Form";
import { DEMO_ROLES } from "@/components/layout/nav";
import { useStore } from "@/store/store";
import { cn } from "@/lib/utils";
import type { Role } from "@/data/types";

const roleIcons: Record<Role, typeof Crown> = {
  Admin: Crown,
  Manager: UserCog,
  "Visa Consultant": Briefcase,
  "Documentation Officer": FileCheck2,
  "Finance Officer": Wallet,
  Customer: UserRound,
};

export default function Login() {
  const store = useStore();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<{ email: string; password: string; remember: boolean }>({
    defaultValues: { email: "admin@serendibvisa.lk", password: "demo1234", remember: true },
  });
  const e = formState.errors;

  const enter = (role: Role, email?: string) => {
    const r = DEMO_ROLES.find((x) => x.role === role)!;
    setLoading(role);
    setTimeout(() => {
      if (role === "Customer") {
        const c = store.customers.find((x) => x.id === r.customerId) ?? store.customers[0];
        store.signIn({ role, customerId: c.id, name: `${c.firstName} ${c.lastName}`, email: c.email });
        navigate("/portal");
      } else {
        store.signIn({ role, staffId: r.staffId, name: r.name, email: email ?? r.email });
        navigate("/app");
      }
      toast.success(`Welcome back, ${r.name.split(" ")[0]}!`, { description: `Signed in as ${role} (demo).` });
    }, 650);
  };

  const onSubmit = (v: { email: string }) => {
    const isCustomer = !v.email.toLowerCase().includes("serendibvisa");
    enter(isCustomer ? "Customer" : "Admin", v.email);
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Left: visual */}
      <aside className="relative hidden overflow-hidden bg-forest lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute -top-40 -left-40 size-[520px] rounded-full bg-[#14815d] opacity-40 blur-[120px]" />
        <div className="absolute right-[-120px] bottom-[-120px] size-[420px] rounded-full bg-[#c9a14a] opacity-20 blur-[120px]" />
        <div className="relative z-10 flex items-center p-10">
          <Logo light />
        </div>
        <div className="relative z-10 flex flex-1 items-center justify-center px-10">
          <TravelArt className="w-full max-w-[520px] animate-float drop-shadow-2xl" />
        </div>
        <div className="relative z-10 p-10 pt-0">
          <blockquote className="max-w-md">
            <p className="font-display text-2xl leading-snug font-semibold text-white">“Every approved visa starts with an organised file.”</p>
            <p className="mt-3 text-sm text-white/60">Manage leads, documents, payments and embassy timelines — in one calm workspace.</p>
          </blockquote>
          <div className="mt-8 flex gap-8 text-white">
            {[
              ["12k+", "Applications processed"],
              ["92%", "Approval rate"],
              ["7", "Destinations"],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="font-display text-2xl font-bold text-[#e2c47c]">{v}</p>
                <p className="text-xs text-white/55">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Right: form */}
      <main className="flex flex-col bg-background">
        <div className="flex items-center p-5 lg:hidden">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-10">
          <div className="w-full max-w-[440px] page-enter">
            <div className="mb-8 hidden lg:block">
              <Logo />
            </div>
            <h1 className="text-[28px] font-bold">Welcome Back</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Sign in to manage your visa applications</p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
              <Field label="Email" error={e.email?.message} htmlFor="email">
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" autoComplete="email" className="h-11 pl-10" {...register("email", { required: "Email is required", ...emailRule })} aria-invalid={!!e.email} />
                </div>
              </Field>
              <Field label="Password" error={e.password?.message} htmlFor="password">
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    className="h-11 pr-10 pl-10"
                    {...register("password", { required: "Password is required", minLength: { value: 4, message: "Use at least 4 characters" } })}
                    aria-invalid={!!e.password}
                  />
                  <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPw ? "Hide password" : "Show password"}>
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </Field>
              <div className="flex items-center justify-between">
                <Label className="font-normal text-muted-foreground">
                  <Checkbox defaultChecked /> Remember me
                </Label>
                <button type="button" onClick={() => toast.info("Password reset emails will be available after backend integration.")} className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={!!loading}>
                {loading && loading !== "demo" ? <Loader2 className="animate-spin" /> : null}
                Login <ArrowRight />
              </Button>
            </form>

            <div className="my-7 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              or explore with a demo account
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {DEMO_ROLES.map((r) => {
                const Icon = roleIcons[r.role];
                return (
                  <button
                    key={r.role}
                    onClick={() => enter(r.role)}
                    disabled={!!loading}
                    className={cn(
                      "group flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-soft)] disabled:opacity-60",
                      r.role === "Admin" && "border-primary/30 bg-[#f4faf7]",
                    )}
                  >
                    <span className={cn("flex size-8 items-center justify-center rounded-lg transition", r.role === "Customer" ? "bg-gold-soft text-[#8a6412]" : "bg-[#e7f4ee] text-primary")}>
                      {loading === r.role ? <Loader2 className="size-4 animate-spin" /> : <Icon className="size-4" />}
                    </span>
                    <span>
                      <span className="block text-[13px] leading-tight font-semibold">Demo {r.role === "Visa Consultant" ? "Consultant" : r.role === "Documentation Officer" ? "Docs Officer" : r.role}</span>
                      <span className="mt-0.5 line-clamp-1 block text-[11px] text-muted-foreground">{r.name}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" /> Frontend demo — no real authentication or data is sent.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
