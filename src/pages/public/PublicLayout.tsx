import { Suspense, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Menu, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/utils";

export const PUBLIC_NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Visa Services" },
  { to: "/destinations", label: "Countries" },
  { to: "/visa-requirements", label: "Requirements" },
  { to: "/eligibility", label: "Eligibility Checker" },
  { to: "/track", label: "Track Application" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
];

export function PublicLayout() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = location.pathname === "/";
  useEffect(() => window.scrollTo({ top: 0 }), [location.pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const dark = isHome && !scrolled;

  return (
    <div className="min-h-dvh bg-[#fbfaf7]">
      <header className={cn("fixed inset-x-0 top-0 z-40 transition-all duration-300", dark ? "bg-transparent" : "border-b border-black/5 bg-white/85 shadow-sm backdrop-blur-xl")}>
        <div className="mx-auto flex h-18 max-w-7xl items-center gap-6 px-4 sm:px-6">
          <Link to="/" aria-label="Serendib Visa Services home">
            <Logo light={dark} />
          </Link>
          <nav className="ml-4 hidden items-center gap-0.5 xl:flex" aria-label="Main">
            {PUBLIC_NAV.filter((n) => n.to !== "/").map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  cn(
                    "whitespace-nowrap rounded-lg px-2 py-2 text-[13.5px] font-medium transition",
                    dark ? "text-white/75 hover:text-white" : "text-foreground/70 hover:text-foreground",
                    isActive && (dark ? "text-white" : "text-primary"),
                  )
                }
              >
                {n.label.replace(" Checker", "").replace(" Application", "")}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" asChild className={cn("hidden sm:inline-flex", dark && "text-white hover:bg-white/10 hover:text-white")}>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button variant="gold" asChild className="hidden sm:inline-flex">
              <Link to="/contact">Book a Consultation</Link>
            </Button>
            <Button variant="ghost" size="icon" className={cn("xl:hidden", dark && "text-white hover:bg-white/10")} onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </div>
        </div>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[300px]">
          <SheetTitle className="px-5 pt-5">
            <Logo />
          </SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
          <nav className="mt-6 flex flex-col px-3">
            {PUBLIC_NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) => cn("rounded-lg px-3 py-2.5 text-[15px] font-medium", isActive ? "bg-[#eef6f2] text-primary" : "text-foreground/80 hover:bg-muted")}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto grid gap-2 p-5">
            <Button variant="outline" asChild onClick={() => setOpen(false)}>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button variant="gold" asChild onClick={() => setOpen(false)}>
              <Link to="/contact">Book a Consultation</Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <main className={cn(!isHome && "pt-18")}>
        <div key={location.pathname} className="page-enter">
          <Suspense fallback={<div className="h-[60vh]" />}>
            <Outlet />
          </Suspense>
        </div>
      </main>

      <footer className="relative overflow-hidden bg-forest text-white/70">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
            <div>
              <Logo light />
              <p className="mt-4 max-w-xs text-sm leading-relaxed">Professional visa consultation and application support for Sri Lankan travellers, students and professionals since 2019.</p>
              <div className="mt-5 flex gap-2">
                {[Facebook, Instagram, Linkedin].map((I, i) => (
                  <a key={i} href="#" onClick={(e) => e.preventDefault()} className="flex size-9 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white" aria-label="Social link">
                    <I className="size-4" />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Services</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {["Tourist visas", "Student visas", "Work permits", "Business visas", "Family visit visas"].map((s) => (
                  <li key={s}>
                    <Link to="/services" className="transition hover:text-white">
                      {s}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Company</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {PUBLIC_NAV.slice(1).filter((n) => ["/about", "/eligibility", "/track", "/faq", "/contact"].includes(n.to)).map((n) => (
                  <li key={n.to}>
                    <Link to={n.to} className="transition hover:text-white">
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Visit us</p>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-[#e2c47c]" /> No. 45, Galle Road, Colombo 03, Sri Lanka
                </li>
                <li className="flex gap-2.5">
                  <Phone className="mt-0.5 size-4 shrink-0 text-[#e2c47c]" /> +94 11 234 5678
                </li>
                <li className="flex gap-2.5">
                  <Mail className="mt-0.5 size-4 shrink-0 text-[#e2c47c]" /> hello@serendibvisa.lk
                </li>
              </ul>
              <Link to="/track" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#e2c47c] hover:text-[#f0d894]">
                Track your application <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row sm:justify-between">
            <p>© {new Date().getFullYear()} Serendib Visa Services (Pvt) Ltd. Fictional company — demo website.</p>
            <p>We are an independent consultancy. Visa decisions are made solely by the relevant immigration authorities.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function PageHero({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-forest">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute -top-32 right-0 size-96 rounded-full bg-[#14815d] opacity-40 blur-3xl" />
      <div className="absolute -bottom-40 left-10 size-80 rounded-full bg-[#c9a14a] opacity-15 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-xs font-semibold tracking-[0.2em] text-[#e2c47c] uppercase">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold text-balance text-white sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-base text-white/70 sm:text-lg">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
