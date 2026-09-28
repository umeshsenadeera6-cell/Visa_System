import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHero } from "./PublicLayout";
import { FaqList } from "./content";

export default function Faq() {
  return (
    <>
      <PageHero eyebrow="FAQ" title="Frequently asked questions" subtitle="Straight answers about fees, timelines, documents and tracking." />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <FaqList />
        <div className="mt-10 rounded-2xl border border-border bg-card p-6 text-center">
          <p className="font-semibold">Still have questions?</p>
          <p className="mt-1 text-sm text-muted-foreground">Our consultants reply within one business day.</p>
          <Button className="mt-4" asChild>
            <Link to="/contact">Contact us</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
