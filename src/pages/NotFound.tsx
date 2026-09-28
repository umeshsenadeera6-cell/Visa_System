import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound({ inApp }: { inApp?: boolean }) {
  return (
    <div className={inApp ? "py-20" : "flex min-h-dvh items-center justify-center bg-background px-6"}>
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#e7f4ee] text-primary">
          <Compass className="size-7" />
        </div>
        <p className="mt-6 text-sm font-semibold tracking-widest text-gold uppercase">404</p>
        <h1 className="mt-2 text-2xl font-bold">This page took a different flight</h1>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or has moved.</p>
        <Button asChild className="mt-6">
          <Link to={inApp ? "/app" : "/"}>{inApp ? "Back to dashboard" : "Go home"}</Link>
        </Button>
      </div>
    </div>
  );
}
