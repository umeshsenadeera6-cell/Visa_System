import { useEffect, useRef, useState } from "react";
import { Paperclip, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useLookups, useStore } from "@/store/store";
import { cn, relativeTime } from "@/lib/utils";

export function MessageThread({ customerId, as }: { customerId: string; as: "staff" | "customer" }) {
  const store = useStore();
  const { staffName, customerName } = useLookups();
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const msgs = store.messages.filter((m) => m.customerId === customerId).sort((a, b) => a.time.localeCompare(b.time));

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [msgs.length]);

  const send = () => {
    if (!text.trim()) return;
    store.sendMessage(customerId, text.trim(), as);
    setText("");
    toast.success("Message sent.");
  };

  return (
    <div className="flex h-[520px] flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex-1 space-y-4 overflow-y-auto bg-[#f8faf9] p-4 scrollbar-thin sm:p-5">
        {msgs.length === 0 && <p className="py-16 text-center text-sm text-muted-foreground">No messages yet. Start the conversation below.</p>}
        {msgs.map((m) => {
          const mine = m.from === as;
          const name = m.from === "staff" ? staffName(m.staffId) : customerName(m.customerId);
          return (
            <div key={m.id} className={cn("flex items-end gap-2.5 page-enter", mine && "flex-row-reverse")}>
              <UserAvatar name={name} className="size-7 text-[10px]" />
              <div className={cn("max-w-[78%]", mine && "text-right")}>
                <div
                  className={cn(
                    "inline-block rounded-2xl px-3.5 py-2.5 text-left text-sm leading-relaxed shadow-xs",
                    mine ? "rounded-br-md bg-primary text-white" : "rounded-bl-md border border-border bg-white",
                  )}
                >
                  {m.text}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {name} · {relativeTime(m.time)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="icon" aria-label="Attach file" onClick={() => toast.info("Attachments in chat will be available after backend integration.")}>
            <Paperclip />
          </Button>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Write a message…"
            className="min-h-10 resize-none"
          />
          <Button size="icon" onClick={send} aria-label="Send message" disabled={!text.trim()}>
            <Send />
          </Button>
        </div>
      </div>
    </div>
  );
}
