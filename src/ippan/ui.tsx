"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  FormEvent,
} from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  ArrowUpRight,
  Search,
  Download,
  ChevronRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Snapshot } from "./model";
import { useLanguage } from "./i18n";
export type Data = Snapshot;
export type Action = (
  action: string,
  data?: Record<string, unknown>,
) => Promise<any>;
export const Context = createContext<{
  data: Data;
  refresh: () => Promise<void>;
  act: Action;
  notify: (s: string) => void;
}>(null!);
export const usePlatform = () => useContext(Context);
export const money = (n: number) => "NPR " + n.toLocaleString("en-IN");
export const date = (s: string) =>
  new Date(s).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kathmandu",
  });
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={"brand " + (light ? "light" : "")}
      aria-label="IPPAN home"
    >
      <span className="brand-symbol">
        <img src="/ippan/logo.png" alt="IPPAN" />
      </span>
      <span className="brand-words">
        Independent Power Producers’
        <br />
        Association, Nepal
      </span>
    </Link>
  );
}
export function Badge({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const s = String(children);
  return (
    <span
      className={
        "badge " +
        (/Active|Published|Approved|successful|Completed|Free|Operational|Reconciled/.test(
          s,
        )
          ? "green"
          : /Pending|Draft|construction|Correction|Open|review/.test(s)
            ? "amber"
            : /Expired|Rejected|Failed|Reversed/.test(s)
              ? "red"
              : "neutral")
      }
    >
      {typeof children === "string" ? t(children) : children}
    </span>
  );
}
export function Panel({
  title,
  sub,
  action,
  children,
  className = "",
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const { t } = useLanguage();
  return (
    <section className={"panel " + className}>
      <div className="panel-head">
        <div>
          <h3>{t(title)}</h3>
          {sub && <p>{t(sub)}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
export function Empty({
  text = "No records match your search.",
}: {
  text?: string;
}) {
  return (
    <div className="empty">
      <Search size={28} />
      <h3>{text}</h3>
      <p>Try another filter or add your first record.</p>
    </div>
  );
}
export function Field({
  name,
  label,
  type = "text",
  options,
  value,
  required = true,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  options?: string[];
  value?: string | number;
  required?: boolean;
  placeholder?: string;
}) {
  const { t } = useLanguage();
  return (
    <label className="field">
      <span>{t(label)}</span>
      {options ? (
        <select name={name} defaultValue={value} required={required}>
          {options.map((o) => (
            <option key={o} value={o}>
              {t(o)}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          name={name}
          defaultValue={value}
          required={required}
          rows={4}
          maxLength={20000}
        />
      ) : (
        <input
          name={name}
          type={type}
          defaultValue={value}
          required={required}
          placeholder={placeholder}
          maxLength={type === "password" ? 200 : 1000}
          min={type === "number" ? "0" : undefined}
          step={type === "number" ? "any" : undefined}
        />
      )}
    </label>
  );
}
export function Form({
  children,
  onSubmit,
  label = "Save changes",
  className = "",
}: {
  children: ReactNode;
  onSubmit: (
    d: Record<string, string>,
    form: HTMLFormElement,
  ) => Promise<unknown>;
  label?: string;
  className?: string;
}) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      className={"form " + className}
      onSubmit={async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        setBusy(true);
        setError("");
        try {
          await onSubmit(
            Object.fromEntries(new FormData(form).entries()) as Record<
              string,
              string
            >,
            form,
          );
        } catch (e) {
          setError(e instanceof Error ? e.message : "Please try again.");
        } finally {
          setBusy(false);
        }
      }}
    >
      {children}
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      <button className="button primary" disabled={busy}>
        {busy ? <Loader2 className="spin" size={18} /> : null}
        {busy ? t("Saving…") : t(label)}
      </button>
    </form>
  );
}
export function Modal({
  title,
  children,
  close,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
}) {
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="modal">
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description className="modal-description">
            IPPAN integrated platform · demonstration workspace
          </Dialog.Description>
          <Dialog.Close className="modal-close" aria-label="Close dialog">
            <X size={20} />
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function SearchBox({
  value,
  set,
  placeholder = "Search records…",
}: {
  value: string;
  set: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="searchbox">
      <Search size={17} />
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => set(e.target.value)}
      />
      {value && (
        <button aria-label="Clear search" onClick={() => set("")}>
          <X size={15} />
        </button>
      )}
    </div>
  );
}
export function exportCsv(name: string, rows: Record<string, unknown>[]) {
  const keys = Object.keys(rows[0] || {});
  const escape = (v: unknown) =>
    '"' +
    String(v ?? "")
      .replace(/^[=+@-]/, "'$&")
      .replaceAll('"', '""') +
    '"';
  const csv = [
    keys.map(escape).join(","),
    ...rows.map((r) =>
      keys
        .map((k) =>
          escape(typeof r[k] === "object" ? JSON.stringify(r[k]) : r[k]),
        )
        .join(","),
    ),
  ].join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name + ".csv";
  a.click();
  URL.revokeObjectURL(url);
}
export function Export({
  rows,
  name = "ippan-report",
}: {
  rows: object[];
  name?: string;
}) {
  return (
    <button
      className="button"
      onClick={() => exportCsv(name, rows as Record<string, unknown>[])}
    >
      <Download size={16} />
      Export report
    </button>
  );
}
export function DocumentLink({
  id,
  label = "Download PDF",
}: {
  id: string;
  label?: string;
}) {
  const { locale } = useLanguage();
  return (
    <a
      className="button"
      href={"/api/ippan/documents/" + id + (locale === "ne" ? "?lang=ne" : "")}
      target="_blank"
      rel="noreferrer"
    >
      <Download size={16} />
      {label}
    </a>
  );
}
export function PageIntro({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-intro">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function Table({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export async function readPdfFiles(form: HTMLFormElement, name: string) {
  const files = Array.from(
    (form.elements.namedItem(name) as HTMLInputElement)?.files || [],
  );
  if (files.some((f) => f.size > 2 * 1024 * 1024))
    throw new Error("Each PDF must be no larger than 2 MB.");
  return Promise.all(
    files.map(async (file) => ({
      name: file.name,
      data: await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1]);
        reader.onerror = () =>
          reject(new Error("Could not read the selected file."));
        reader.readAsDataURL(file);
      }),
    })),
  );
}
