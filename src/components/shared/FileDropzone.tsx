import { useEffect, useRef, useState } from "react";
import { CheckCircle2, FileText, Image as ImageIcon, Loader2, UploadCloud, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn, formatBytes } from "@/lib/utils";

export interface QueuedFile {
  key: string;
  file: File;
  progress: number;
  status: "uploading" | "done";
  previewUrl?: string;
}

/** Drag & drop area with simulated upload progress (frontend only). */
export function FileDropzone({
  files,
  onChange,
  multiple = true,
  compact,
}: {
  files: QueuedFile[];
  onChange: (updater: (prev: QueuedFile[]) => QueuedFile[]) => void;
  multiple?: boolean;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const addFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const incoming = Array.from(list).slice(0, multiple ? 10 : 1).map<QueuedFile>((file) => ({
      key: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 6)}`,
      file,
      progress: 0,
      status: "uploading",
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
    }));
    onChange((prev) => (multiple ? [...prev, ...incoming] : incoming));
  };

  // simulate progress
  useEffect(() => {
    if (!files.some((f) => f.status === "uploading")) return;
    const t = setInterval(() => {
      onChange((prev) =>
        prev.map((f) => {
          if (f.status !== "uploading") return f;
          const next = Math.min(100, f.progress + 8 + Math.random() * 22);
          return { ...f, progress: next, status: next >= 100 ? "done" : "uploading" };
        }),
      );
    }, 180);
    return () => clearInterval(t);
  }, [files, onChange]);

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#cfdcd5] bg-gradient-to-b from-[#fbfcfb] to-[#f3f8f5] text-center transition-all duration-200 outline-none hover:border-primary/50 hover:bg-[#f0f7f3] focus-visible:ring-[3px] focus-visible:ring-primary/20",
          compact ? "px-4 py-6" : "px-6 py-10",
          drag && "scale-[1.01] border-primary bg-[#e8f3ed]",
        )}
      >
        <div className={cn("mb-3 flex size-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5", drag && "-translate-y-1")}>
          <UploadCloud className="size-6" />
        </div>
        <p className="text-sm font-semibold">Drag &amp; drop files here</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          or <span className="font-medium text-primary underline-offset-2 group-hover:underline">browse from your computer</span>
        </p>
        <p className="mt-2 text-[11.5px] text-muted-foreground">PDF, JPG or PNG · up to 10 MB each</p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f) => {
            const isImg = f.file.type.startsWith("image/");
            return (
              <li key={f.key} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 page-enter">
                {f.previewUrl ? (
                  <img src={f.previewUrl} alt="" className="size-10 rounded-lg object-cover" />
                ) : (
                  <div className={cn("flex size-10 items-center justify-center rounded-lg", isImg ? "bg-[#ebf2fe] text-[#2856b8]" : "bg-[#fdeeec] text-[#b4321f]")}>
                    {isImg ? <ImageIcon className="size-5" /> : <FileText className="size-5" />}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{f.file.name}</p>
                    <span className="shrink-0 text-xs text-muted-foreground tabular">{formatBytes(f.file.size)}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Progress value={f.progress} className="h-1.5" indicatorClassName={f.status === "done" ? "bg-[#1f9d5b]" : undefined} />
                    <span className="flex w-20 shrink-0 items-center justify-end gap-1 text-[11.5px] font-medium tabular">
                      {f.status === "done" ? (
                        <>
                          <CheckCircle2 className="size-3.5 text-[#1f9d5b]" /> Uploaded
                        </>
                      ) : (
                        <>
                          <Loader2 className="size-3.5 animate-spin text-primary" /> {Math.round(f.progress)}%
                        </>
                      )}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onChange((prev) => prev.filter((x) => x.key !== f.key))}
                  className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  aria-label={`Remove ${f.file.name}`}
                >
                  <X className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
