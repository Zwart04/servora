import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border bg-white dark:bg-zinc-900 shadow-sm", className)}>{children}</div>
  );
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("p-4", className)}>{children}</div>;
}

export function CardHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b">
      <h2 className="font-semibold">{title}</h2>
      {action}
    </div>
  );
}

export function Button({ children, onClick, variant = "default", className, type = "button" }: {
  children: ReactNode; onClick?: () => void; variant?: "default" | "ghost" | "danger" | "outline"; className?: string; type?: "button" | "submit";
}) {
  const styles = {
    default: "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90",
    outline: "border hover:bg-zinc-100 dark:hover:bg-zinc-800",
    ghost: "hover:bg-zinc-100 dark:hover:bg-zinc-800",
    danger: "bg-red-600 text-white hover:bg-red-700",
  }[variant];
  return (
    <button type={type} onClick={onClick} className={cn("px-3 py-1.5 rounded-md text-sm font-medium", styles, className)}>
      {children}
    </button>
  );
}

export function Input({ value, onChange, placeholder, type = "text", className, readOnly, step }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; className?: string; readOnly?: boolean; step?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      readOnly={readOnly}
      step={step}
      onChange={(e) => onChange(e.target.value)}
      className={cn("border rounded px-3 py-2 text-sm bg-white dark:bg-zinc-950", className)}
    />
  );
}

export function Select({ value, onChange, options, className }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn("border rounded px-3 py-2 text-sm bg-white dark:bg-zinc-950", className)}
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border">{children}</span>;
}
