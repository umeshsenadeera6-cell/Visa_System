import type { ReactNode } from "react";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function Field({
  label,
  error,
  required,
  children,
  className,
  hint,
  htmlFor,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  hint?: string;
  htmlFor?: string;
}) {
  const labelText = (
    <>
      {label}
      {required && <span className="text-[#b4321f]">*</span>}
    </>
  );
  const help = error ? <p className="text-xs text-[#b4321f]">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null;
  if (htmlFor)
    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        <Label htmlFor={htmlFor}>{labelText}</Label>
        {children}
        {help}
      </div>
    );
  // Wrapping label associates the text with the control for screen readers and click-to-focus.
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="flex items-center gap-1 text-[13px] leading-none font-medium text-foreground/90 select-none">{labelText}</span>
      {children}
      {help}
    </label>
  );
}

export function RHFSelect<T extends FieldValues>({
  control,
  name,
  options,
  placeholder = "Select…",
  rules,
  onValueChange,
  disabled,
}: {
  control: Control<T>;
  name: Path<T>;
  options: (string | { value: string; label: ReactNode })[];
  placeholder?: string;
  rules?: object;
  onValueChange?: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <Select
          value={field.value ?? ""}
          onValueChange={(v) => {
            field.onChange(v);
            onValueChange?.(v);
          }}
          disabled={disabled}
        >
          <SelectTrigger aria-invalid={!!fieldState.error} onBlur={field.onBlur}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => {
              const v = typeof o === "string" ? o : o.value;
              return (
                <SelectItem key={v} value={v}>
                  {typeof o === "string" ? o : o.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      )}
    />
  );
}

export function FormGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", className)}>{children}</div>;
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{title}</p>
      {children}
    </div>
  );
}

export const emailRule = { pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" } };
