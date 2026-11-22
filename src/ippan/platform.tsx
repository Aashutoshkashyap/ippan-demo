"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, X, AlertTriangle } from "lucide-react";
import { Snapshot } from "./model";
import { Context, Brand, Form, Field } from "./ui";
import PublicSite from "./public-site";
import Admin from "./workspace";
export default function Platform({
  path,
  initialData,
}: {
  path: string;
  initialData?: Snapshot;
}) {
  const [data, setData] = useState<Snapshot | null>(initialData || null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const router = useRouter();
  const refresh = useCallback(async () => {
    const r = await fetch("/api/ippan/state", { cache: "no-store" });
    const body = await r.json();
    if (!r.ok) throw new Error(body.error);
    setData(body);
    setError("");
  }, []);
  useEffect(() => {
    if (initialData) setData(initialData);
    else refresh().catch((e) => setError(e.message));
  }, [refresh, initialData, path]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(t);
  }, [notice]);
  const act = async (action: string, input: Record<string, unknown> = {}) => {
    const r = await fetch("/api/ippan/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, data: input }),
    });
    const body = await r.json();
    if (!r.ok) throw new Error(body.error);
    await refresh();
    return body.result;
  };
  if (error)
    return (
      <main className="boot">
        <Brand />
        <AlertTriangle />
        <h1>Unable to load the platform</h1>
        <p>{error}</p>
        <button
          className="button primary"
          onClick={() => refresh().catch((e) => setError(e.message))}
        >
          Try again
        </button>
      </main>
    );
  if (!data)
    return (
      <main className="boot">
        <Brand />
        <div className="loading-bar" />
        <p>Preparing your IPPAN workspace…</p>
      </main>
    );
  return (
    <Context.Provider value={{ data, refresh, act, notify: setNotice }}>
      {path === "/login" ? (
        <div className="login-page">
          <div className="login-story">
            <Brand light />
            <div>
              <span className="eyebrow">OUR ENERGY. OUR FUTURE.</span>
              <h1>
                A connected community.
                <br />A stronger Nepal.
              </h1>
              <p>Your gateway to membership, knowledge and opportunity.</p>
            </div>
            <small>IPPAN Integrated Digital Platform · Demo</small>
          </div>
          <div className="login-form">
            <a className="text-link" href="/">
              Back to the website
            </a>
            <span className="eyebrow">WELCOME TO IPPAN</span>
            <h1>Good to see you again.</h1>
            <p>Sign in to your member or secretariat workspace.</p>
            <Form
              label="Sign in securely"
              onSubmit={async (d) => {
                const r = await fetch("/api/ippan/auth", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(d),
                });
                const result = await r.json();
                if (!r.ok) throw new Error(result.error);
                await refresh();
                router.push(
                  result.user.role === "Member" ? "/portal" : "/admin",
                );
              }}
            >
              <Field name="email" label="Email address" type="email" />
              <Field name="password" label="Password" type="password" />
            </Form>
            <div className="callout">
              <strong>Evaluation accounts</strong>
              <p>
                Admin: admin@ippan.demo
                <br />
                Member: member@ippan.demo
              </p>
              <p>Use the demo password stored in this project’s .env.local.</p>
            </div>
            <p className="muted">
              Not a member yet? <a href="/membership">Apply for membership</a>
            </p>
          </div>
        </div>
      ) : path.startsWith("/admin") || path.startsWith("/portal") ? (
        <Admin path={path} />
      ) : (
        <PublicSite path={path} />
      )}{" "}
      {notice && (
        <div className="toast" role="status">
          <CheckCircle2 size={21} />
          <span>{notice}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={17} />
          </button>
        </div>
      )}
    </Context.Provider>
  );
}
