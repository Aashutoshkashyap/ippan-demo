"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Wallet,
  PanelsTopLeft,
  CalendarDays,
  Zap,
  BookOpen,
  Vote,
  Files,
  MessagesSquare,
  ChartNoAxesCombined,
  ShieldCheck,
  Search,
  Bell,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Globe2,
  LogOut,
  Menu,
  X,
  Settings,
  HelpCircle,
  Clock,
  Check,
  FileText,
  Download,
  Leaf,
  RefreshCw,
  Building2,
  CircleCheck,
  CheckCircle2,
  ChevronRight,
  Mail,
} from "lucide-react";
import {
  usePlatform,
  Brand,
  Badge,
  Panel,
  Table,
  SearchBox,
  Export,
  Modal,
  Field,
  Form,
  DocumentLink,
  date,
  money,
  Empty,
} from "./ui";
import { can, nav } from "./model";
import {
  GrowthChart,
  MembershipChart,
  ProvinceChart,
  RevenueChart,
} from "./charts";
import AdminModules from "./workspace-modules";
const icons = {
  LayoutDashboard,
  Users,
  Wallet,
  PanelsTopLeft,
  CalendarDays,
  Zap,
  BookOpen,
  Vote,
  Files,
  MessagesSquare,
  ChartNoAxesCombined,
  ShieldCheck,
};
export default function Workspace({ path }: { path: string }) {
  const { data, refresh, notify } = usePlatform();
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState("");
  const [overlay, setOverlay] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInput.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const router = useRouter();
  const portal = path.startsWith("/portal");
  const area = path.split("/")[2] || "overview";
  const u = data.viewer;
  if (!u)
    return (
      <div className="workspace-gate">
        <Brand />
        <ShieldCheck size={45} />
        <h1>Your secure workspace awaits.</h1>
        <p>Sign in with your IPPAN account to continue.</p>
        <Link className="button primary" href="/login">
          Sign in to IPPAN
        </Link>
        <Link href="/">Return to the website</Link>
      </div>
    );
  if (portal && u.role !== "Member")
    return (
      <div className="workspace-gate">
        <h1>This workspace is for members.</h1>
        <Link className="button primary" href="/admin">
          Open administration
        </Link>
      </div>
    );
  if (!portal && !can(u.role, area))
    return (
      <div className="workspace-gate">
        <ShieldCheck />
        <h1>Access restricted</h1>
        <p>Your role does not have access to this module.</p>
        <Link
          className="button primary"
          href={u.role === "Member" ? "/portal" : "/admin"}
        >
          Open your workspace
        </Link>
      </div>
    );
  const portalNav = [
    ["overview", "My dashboard", "LayoutDashboard"],
    ["profile", "Company & membership", "Building2"],
    ["payments", "Invoices & payments", "Wallet"],
    ["events", "Events & tickets", "CalendarDays"],
    ["resources", "Member resources", "BookOpen"],
    ["agm", "AGM & proxy", "Vote"],
    ["notifications", "Notifications", "Bell"],
  ];
  return (
    <div className={"workspace " + (mobile ? "menu-open" : "")}>
      <aside className="sidebar">
        <Brand light />
        <div className="workspace-label">
          {portal ? "MEMBER WORKSPACE" : "ADMINISTRATION"}
        </div>
        <nav aria-label="Workspace navigation">
          {(portal ? portalNav : nav.filter(([key]) => can(u.role, key))).map(
            ([key, label, icon]) => {
              const Icon =
                ({ ...icons, Building2, Bell } as Record<string, typeof Users>)[
                  icon
                ] || LayoutDashboard;
              return (
                <Link
                  href={
                    "/" +
                    (portal ? "portal" : "admin") +
                    (key === "overview" ? "" : "/" + key)
                  }
                  className={area === key ? "active" : ""}
                  key={key}
                  onClick={() => setMobile(false)}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                  {key === "members" &&
                    data.applications.filter((a) => a.status === "Pending")
                      .length > 0 && (
                      <b>
                        {
                          data.applications.filter(
                            (a) => a.status === "Pending",
                          ).length
                        }
                      </b>
                    )}
                </Link>
              );
            },
          )}
        </nav>
        <div className="sidebar-card">
          <span className="sidebar-card-icon">
            <Leaf size={23} />
          </span>
          <strong>
            Our energy.
            <br />
            Our future.
          </strong>
          <p>
            A stronger community.
            <br />A brighter Nepal.
          </p>
          <Link href="/">
            Explore IPPAN
            <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="sidebar-bottom">
          <button onClick={() => setOverlay("help")}>
            <HelpCircle size={18} />
            Help & support
          </button>
          <Link href="/">
            <Globe2 size={18} />
            View public website
            <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="sidebar-foot">
          IPPAN DIGITAL PLATFORM <span>DEMO</span>
        </div>
      </aside>
      {mobile && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <div className="workspace-main">
        <header className="workspace-header">
          <div className="breadcrumb">
            <button
              className="mobile-menu"
              aria-label="Open workspace navigation"
              onClick={() => setMobile(!mobile)}
            >
              <Menu size={21} />
            </button>
            <span>{portal ? "Member portal" : "Workspace"}</span>
            <ChevronRight size={14} />
            <strong>
              {portal
                ? portalNav.find((n) => n[0] === area)?.[1] || "Dashboard"
                : nav.find((n) => n[0] === area)?.[1] || "Overview"}
            </strong>
          </div>
          <div className="workspace-header-right">
            <div className="global-search">
              <Search size={16} />
              <input
                ref={searchInput}
                aria-label="Search platform"
                placeholder="Search anything…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <kbd>⌘ K</kbd>
            </div>
            <button
              className="notification-button"
              aria-label="View notifications"
              onClick={() => setOverlay("notifications")}
            >
              <Bell size={20} />
              <span />
            </button>
            <span className="header-separator" />
            <button
              className="user-button"
              onClick={() => setOverlay("account")}
            >
              <span className="avatar">
                {u.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <span>
                <strong>{u.name}</strong>
                <small>{u.role}</small>
              </span>
              <ChevronDown size={14} />
            </button>
          </div>
        </header>
        {search && (
          <div className="search-results">
            <div>
              <strong>Search results</strong>
              <button aria-label="Close search" onClick={() => setSearch("")}>
                <X size={16} />
              </button>
            </div>
            {[
              ...data.members.map((m) => ({
                title: m.name,
                url: "/members/" + m.id,
                type: "Member",
              })),
              ...data.projects.map((p) => ({
                title: p.name,
                url: "/hydropower/" + p.id,
                type: "Project",
              })),
              ...data.news.map((n) => ({
                title: n.title,
                url: "/news/" + n.id,
                type: "News",
              })),
            ]
              .filter((r) =>
                r.title.toLowerCase().includes(search.toLowerCase()),
              )
              .slice(0, 7)
              .map((r) => (
                <Link key={r.url} href={r.url}>
                  <span>
                    {r.title}
                    <small>{r.type}</small>
                  </span>
                  <ArrowUpRight size={16} />
                </Link>
              ))}
          </div>
        )}
        <main className="workspace-content">
          {portal ? (
            <MemberPortal area={area} />
          ) : area === "overview" ? (
            <Overview />
          ) : (
            <AdminModules area={area} />
          )}
        </main>
        <footer className="workspace-footer">
          <span>
            © 2026 IPPAN · Independent Power Producers’ Association, Nepal
          </span>
          <span>
            <span className="connection-dot" />
            {data.storage} <span className="footer-demo">Evaluation demo</span>
          </span>
        </footer>
      </div>
      {overlay && (
        <Modal
          title={
            overlay === "account"
              ? "Your account"
              : overlay === "notifications"
                ? "Notifications"
                : "Help & support"
          }
          close={() => setOverlay("")}
        >
          {overlay === "account" ? (
            <div className="account-details">
              <span className="avatar large">{u.name[0]}</span>
              <h3>{u.name}</h3>
              <p>{u.email}</p>
              <Badge>{u.role}</Badge>
              <p>
                This evaluation account is secured with an HTTP-only session.
              </p>
              <button
                className="button"
                onClick={async () => {
                  await fetch("/api/ippan/auth", { method: "DELETE" });
                  await refresh();
                  router.push("/login");
                }}
              >
                {" "}
                <LogOut size={17} />
                Sign out
              </button>
            </div>
          ) : overlay === "notifications" ? (
            <div className="activity-list">
              {(portal
                ? data.notifications.map((n) => ({
                    id: n.id,
                    title: n.title,
                    date: n.date,
                  }))
                : data.audit.slice(0, 6).map((a) => ({
                    id: a.id,
                    title: a.action + " · " + a.detail,
                    date: a.date,
                  }))
              ).map((a) => (
                <div className="activity" key={a.id}>
                  <span className="activity-icon">
                    <Bell size={17} />
                  </span>
                  <div>
                    <strong>{a.title}</strong>
                    <small>{date(a.date)}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <p>
                Use the left navigation to explore connected membership, content
                and institutional workflows.
              </p>
              <div className="callout">
                All member, project and financial records are sample data.
                Payments are simulated. External delivery and integrations are
                excluded.
              </div>
              <p>
                <Mail size={17} /> info@ippan.org.np
              </p>
              <Link href="/contact" className="button primary">
                Contact details
              </Link>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
function Overview() {
  const { data } = usePlatform();
  const [period, setPeriod] = useState("This year");
  const [quick, setQuick] = useState(false);
  const active = data.members.filter((m) => m.status === "Active").length;
  const pending = data.applications.filter(
    (a) => a.status === "Pending",
  ).length;
  const capacity = data.projects.reduce((n, p) => n + p.capacity, 0);
  const collected = data.payments
    .filter(
      (p) =>
        p.status === "Simulated successful" &&
        (period === "This year" || p.date.startsWith("2026-11")),
    )
    .reduce((n, p) => n + p.amount, 0);
  return (
    <>
      <div className="workspace-title">
        <div>
          <div className="welcome-eyebrow">YOUR PLATFORM AT A GLANCE</div>
          <h1>
            Overview <span className="wave">☀</span>
          </h1>
          <p>
            Welcome back. Here’s what’s happening across the IPPAN community.
          </p>
        </div>
        <div className="row-actions">
          <select
            aria-label="Dashboard reporting period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option>This year</option>
            <option>This month</option>
          </select>
          <Export
            name="ippan-overview"
            rows={[
              {
                members: data.members.length,
                active,
                pending,
                capacityMW: capacity,
                simulatedCollections: collected,
                period,
              },
            ]}
          />
        </div>
      </div>
      <div className="overview-banner">
        <div className="banner-icon">
          <Zap size={22} />
        </div>
        <div>
          <strong>One platform. A more connected IPPAN.</strong>
          <p>
            Manage your community, share knowledge and keep the energy moving.
          </p>
        </div>
        <Link href="/" target="_blank">
          Visit public website
          <ArrowUpRight size={17} />
        </Link>
      </div>
      <div className="metric-grid">
        {[
          [
            Users,
            "Total members",
            data.members.length,
            `${data.members.filter((m) => m.category === "Corporate").length} corporate · ${data.members.filter((m) => m.category === "Associate").length} associate`,
            "teal",
            "members",
          ],
          [
            ShieldCheck,
            "Active memberships",
            active,
            `${Math.round((active / data.members.length) * 100)}% of the member community`,
            "purple",
            "members",
          ],
          [
            Clock,
            "Pending applications",
            pending,
            "Awaiting your team’s review",
            "amber",
            "members",
          ],
          [
            Zap,
            "Project capacity",
            capacity.toLocaleString() + " MW",
            `${data.projects.length} sample hydropower projects`,
            "blue",
            "projects",
          ],
        ].map(([I, t, v, s, c, route]) => {
          const Icon = I as typeof Users;
          return (
            <Link
              href={"/admin/" + route}
              className={"metric-card " + c}
              key={String(t)}
            >
              <div className="metric-top">
                <span>{String(t)}</span>
                <span className="metric-icon">
                  <Icon size={20} />
                </span>
              </div>
              <strong>{String(v)}</strong>
              <p>
                <span className="metric-dot" />
                {String(s)}
              </p>
              <div className="metric-spark">
                <svg viewBox="0 0 100 30" aria-hidden="true">
                  <path
                    d="M0,24 L8,22 L16,23 L24,17 L32,20 L40,13 L48,16 L56,8 L64,12 L72,5 L80,8 L90,3 L100,0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="overview-chart-grid">
        <GrowthChart />
        <MembershipChart />
      </div>
      <div className="overview-middle-grid">
        <ProvinceChart />
        <Panel
          title="Financial snapshot"
          sub="Membership payments · demonstration"
          action={
            <Link
              href="/admin/finance"
              className="icon-link"
              aria-label="Open finance"
            >
              <ArrowUpRight size={18} />
            </Link>
          }
        >
          <div className="finance-total">
            <span>Simulated collections · {period.toLowerCase()}</span>
            <strong>{money(collected)}</strong>
            <span className="inline-green">
              <Check size={14} />
              {
                data.payments.filter((p) => p.status === "Simulated successful")
                  .length
              }{" "}
              successful demo transactions
            </span>
          </div>
          <div className="finance-split">
            <div>
              <span>Outstanding fees</span>
              <strong>
                {money(
                  data.payments
                    .filter((p) => p.status === "Pending")
                    .reduce((n, p) => n + p.amount, 0),
                )}
              </strong>
            </div>
            <div>
              <span>To reconcile</span>
              <strong>
                {
                  data.payments.filter(
                    (p) => p.status === "Simulated successful" && !p.reconciled,
                  ).length
                }
                <small> transactions</small>
              </strong>
            </div>
          </div>
          <div className="chart-note">
            <ShieldCheck size={14} /> No live financial transactions
          </div>
        </Panel>
        <Panel title="Quick actions" sub="Make things happen">
          <div className="quick-actions">
            {[
              [Users, "Review applications", "/admin/members"],
              [FileText, "Create a news update", "/admin/content"],
              [CalendarDays, "Manage events", "/admin/events"],
              [Files, "Register correspondence", "/admin/secretariat"],
            ].map(([I, t, url]) => {
              const Icon = I as typeof Users;
              return (
                <Link href={String(url)} key={String(t)}>
                  <span>
                    <Icon size={17} />
                  </span>
                  {String(t)}
                  <ChevronRight size={15} />
                </Link>
              );
            })}
          </div>
        </Panel>
      </div>
      <div className="overview-bottom-grid">
        <Panel
          title="Recent membership applications"
          sub="Growing the IPPAN community"
          action={
            <Link className="text-link" href="/admin/members">
              View all
              <ChevronRight size={14} />
            </Link>
          }
        >
          <Table
            headers={["Organization", "Category", "Applied on", "Status", ""]}
          >
            {data.applications.slice(0, 4).map((a) => (
              <tr key={a.id}>
                <td>
                  <div className="table-company">
                    <span className="company-avatar">
                      <Building2 size={18} />
                    </span>
                    <div>
                      <strong>{a.name}</strong>
                      <small>{a.id}</small>
                    </div>
                  </div>
                </td>
                <td>{a.category}</td>
                <td>{date(a.created)}</td>
                <td>
                  <Badge>{a.status}</Badge>
                </td>
                <td>
                  <Link href="/admin/members" className="table-action">
                    Review
                    <ChevronRight size={13} />
                  </Link>
                </td>
              </tr>
            ))}
          </Table>
          {!data.applications.length && (
            <Empty text="No pending applications." />
          )}
          <div className="table-foot">
            Applications and decisions are connected to the member portal.
          </div>
        </Panel>
        <Panel
          title="Upcoming events"
          action={
            <Link className="text-link" href="/admin/events">
              View all
              <ChevronRight size={14} />
            </Link>
          }
        >
          {data.events
            .filter(
              (e) => e.status === "Published" && new Date(e.date) >= new Date(),
            )
            .slice(0, 3)
            .map((e) => (
              <Link
                className="dashboard-event"
                href={"/events/" + e.id}
                key={e.id}
              >
                <div className="event-date">
                  <strong>{new Date(e.date).getDate()}</strong>
                  <span>
                    {new Date(e.date).toLocaleString("en", { month: "short" })}
                  </span>
                </div>
                <div>
                  <h4>{e.title}</h4>
                  <small>
                    <MapPinIcon />
                    {e.location}
                  </small>
                  <span>
                    {
                      data.registrations.filter((r) => r.eventId === e.id)
                        .length
                    }{" "}
                    participants registered
                  </span>
                </div>
              </Link>
            ))}
        </Panel>
      </div>
      <div className="overview-last-grid">
        <Panel
          title="Recent activity"
          sub="A transparent record of your team’s work"
          action={<span className="muted">Latest updates</span>}
        >
          <div className="activity-list">
            {data.audit.slice(0, 4).map((a, i) => (
              <div className="activity" key={a.id}>
                <span className={"activity-icon activity-" + i}>
                  {i % 2 ? <Users size={17} /> : <FileText size={17} />}
                </span>
                <div>
                  <strong>{a.action}</strong>
                  <p>{a.detail}</p>
                  <small>{a.actor}</small>
                </div>
                <time>{date(a.date)}</time>
              </div>
            ))}
          </div>
        </Panel>
        <div className="impact-card">
          <div className="impact-top">
            <Leaf size={27} />
            <span>THE POWER OF TOGETHER</span>
          </div>
          <h2>
            A stronger community.
            <br />A brighter Nepal.
          </h2>
          <p>
            Every connection, every project and every conversation brings us
            closer to a sustainable energy future.
          </p>
          <Link href="/about">
            Our shared purpose
            <ArrowUpRight size={17} />
          </Link>
          <div className="impact-lines" />
        </div>
      </div>
      <div className="sample-footnote">
        <ShieldCheck size={14} />
        Sample data for evaluation. Figures are calculated from the connected
        demo records and are not official IPPAN statistics.
      </div>
    </>
  );
}
function MapPinIcon() {
  return (
    <svg width="11" height="13" viewBox="0 0 12 14" fill="none">
      <path
        d="M6 13S1 8 1 5.5a5 5 0 0 1 10 0C11 8 6 13 6 13Z"
        stroke="currentColor"
      />
      <circle cx="6" cy="5" r="1.5" stroke="currentColor" />
    </svg>
  );
}
function MemberPortal({ area }: { area: string }) {
  const { data, act, notify, refresh } = usePlatform();
  const u = data.viewer!;
  const m = data.members.find((m) => m.id === u.memberId);
  const [dialog, setDialog] = useState("");
  const [pay, setPay] = useState("");
  if (!m)
    return (
      <Panel title="Your application is being reviewed">
        <p>
          Once your application is approved, your membership details and
          documents will appear here.
        </p>
        <Link className="button primary" href="/track">
          Track your application
        </Link>
      </Panel>
    );
  const run = async (
    action: string,
    d: Record<string, unknown>,
    message: string,
  ) => {
    try {
      await act(action, d);
      notify(message);
    } catch (e) {
      notify(e instanceof Error ? e.message : "Action failed");
    }
  };
  return (
    <>
      <div className="workspace-title">
        <div>
          <div className="welcome-eyebrow">YOUR IPPAN COMMUNITY</div>
          <h1>
            {area === "overview"
              ? "Hello, " + u.name.split(" ")[0] + "."
              : {
                  profile: "Company & membership",
                  payments: "Invoices & payments",
                  events: "Events & registrations",
                  resources: "Your member library",
                  agm: "AGM & proxy",
                  notifications: "Your notifications",
                }[area] || "Member workspace"}
          </h1>
          <p>
            {m.name} · {m.id}
          </p>
        </div>
        <Badge>{m.status}</Badge>
      </div>
      {area === "overview" && (
        <>
          <div className="member-overview">
            <div className="digital-card">
              <Brand light />
              <span>DIGITAL MEMBERSHIP CARD</span>
              <h2>{m.name}</h2>
              <div>
                <strong>{m.id}</strong>
                <Badge>{m.category}</Badge>
              </div>
              <footer>
                <span>
                  VALID UNTIL
                  <br />
                  <strong>{date(m.expiry)}</strong>
                </span>
                <span>
                  <ShieldCheck size={30} />
                </span>
              </footer>
              <small>Evaluation demo · not an official credential</small>
            </div>
            <Panel title="Your membership, connected">
              <dl>
                <dt>Status</dt>
                <dd>
                  <Badge>{m.status}</Badge>
                </dd>
                <dt>Category</dt>
                <dd>{m.category}</dd>
                <dt>Renewal date</dt>
                <dd>{date(m.expiry)}</dd>
                <dt>Outstanding fees</dt>
                <dd>
                  {money(
                    data.payments
                      .filter((p) => p.status === "Pending")
                      .reduce((n, p) => n + p.amount, 0),
                  )}
                </dd>
              </dl>
              <div className="row-actions">
                <DocumentLink id={m.id} label="Membership certificate" />
                <button
                  className="button primary"
                  onClick={async () => {
                    await run("renew", {}, "Renewal invoice created.");
                    setDialog("renew");
                  }}
                >
                  Renew membership
                </button>
              </div>
            </Panel>
          </div>
          <div className="overview-chart-grid">
            <Panel title="Coming up in your community">
              {data.events.map((e) => (
                <Link className="list-link" key={e.id} href={"/events/" + e.id}>
                  <CalendarDays size={19} />
                  <span>
                    <strong>{e.title}</strong>
                    <small>
                      {date(e.date)} · {e.location}
                    </small>
                  </span>
                  <ChevronRight size={16} />
                </Link>
              ))}
            </Panel>
            <Panel title="Your latest updates">
              {data.notifications.map((n) => (
                <div className="activity" key={n.id}>
                  <span className="activity-icon">
                    <Bell size={18} />
                  </span>
                  <div>
                    <strong>{n.title}</strong>
                    <small>{date(n.date)}</small>
                  </div>
                </div>
              ))}
            </Panel>
          </div>
        </>
      )}
      {area === "profile" && (
        <div className="overview-chart-grid">
          <Panel title="Company profile">
            <dl>
              {[
                ["Company", m.name],
                ["Membership", m.category],
                ["Province", m.province],
                ["District", m.district],
                ["Capacity", m.capacity + " MW"],
                ["Email", u.email],
                ["Valid until", date(m.expiry)],
              ].map(([k, v]) => (
                <div className="dl-row" key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <button
              className="button primary"
              onClick={() => setDialog("profile")}
            >
              Request a profile update
            </button>
            <DocumentLink id={m.id} label="Download certificate" />
          </Panel>
          <Panel title="Account security">
            <p>
              Update your password. This signs you out of all current sessions.
            </p>
            <Form
              label="Update password"
              onSubmit={async (d) => {
                await act("change-password", d);
                notify("Password updated. Sign in again.");
                await refresh();
              }}
            >
              <Field
                name="oldPassword"
                label="Current password"
                type="password"
              />
              <Field
                name="password"
                label="New password (minimum 12 characters)"
                type="password"
              />
            </Form>
          </Panel>
          <Panel title="Application & membership history">
            {data.applications.map((a) => (
              <div className="proxy-record" key={a.id}>
                <strong>{a.id}</strong>
                <Badge>{a.status}</Badge>
                {a.history.map((h, i) => (
                  <p key={i}>
                    {date(h.date)} · {h.status} · {h.note}
                  </p>
                ))}
              </div>
            ))}
            <p>
              Member since {date(m.joined)}. Current validity ends{" "}
              {date(m.expiry)}. Renewal invoices and receipts are in your
              payment history.
            </p>
          </Panel>
        </div>
      )}
      {(area === "payments" || dialog === "renew") && (
        <Panel
          title="Invoices & payment history"
          sub="Payments in this demo are simulated. No real funds are transferred."
          action={
            <button
              className="button primary"
              onClick={() => run("renew", {}, "Renewal invoice ready.")}
            >
              Create renewal invoice
            </button>
          }
        >
          <Table
            headers={[
              "Reference / purpose",
              "Date",
              "Amount",
              "Status",
              "Actions",
            ]}
          >
            {data.payments.map((p) => (
              <tr key={p.id}>
                <td>
                  <strong>{p.purpose}</strong>
                  <small>{p.id}</small>
                </td>
                <td>{date(p.date)}</td>
                <td>{money(p.amount)}</td>
                <td>
                  <Badge>{p.status}</Badge>
                </td>
                <td>
                  <div className="row-actions">
                    <DocumentLink
                      id={p.id}
                      label={
                        p.status === "Simulated successful"
                          ? "Receipt"
                          : "Invoice"
                      }
                    />
                    {p.status === "Pending" && !p.manual && (
                      <button
                        className="button primary"
                        onClick={() => setPay(p.id)}
                      >
                        Simulate payment
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}
      {area === "events" && (
        <>
          <Link href="/events" className="button primary">
            Explore upcoming events
          </Link>
          <Panel title="Your registrations">
            <Table
              headers={[
                "Event",
                "Reference",
                "Payment",
                "Attendance",
                "Ticket",
              ]}
            >
              {data.registrations.map((r) => (
                <tr key={r.id}>
                  <td>{data.events.find((e) => e.id === r.eventId)?.title}</td>
                  <td>{r.id}</td>
                  <td>
                    <Badge>{r.paymentStatus}</Badge>
                  </td>
                  <td>{r.attendance ? "Checked in" : "Not checked in"}</td>
                  <td>
                    <DocumentLink id={r.id} label="QR entry pass" />
                  </td>
                </tr>
              ))}
            </Table>
          </Panel>
        </>
      )}
      {area === "resources" && (
        <div className="directory-grid">
          {[...data.resources, ...data.publications].map((r) => (
            <Panel key={r.id} title={r.title} sub={r.category}>
              <p>{r.description}</p>
              <Badge>{r.access}</Badge>
              <DocumentLink id={r.id} />
            </Panel>
          ))}
        </div>
      )}
      {area === "notifications" && (
        <Panel title="Membership updates">
          {data.notifications.map((n) => (
            <div className="activity" key={n.id}>
              <Bell size={20} />
              <div>
                <strong>{n.title}</strong>
                <small>{date(n.date)}</small>
              </div>
            </div>
          ))}
        </Panel>
      )}
      {area === "agm" && (
        <>
          <div className="callout">
            <Vote size={22} />
            <div>
              Controlled demonstration only. Votes are auditable and associated
              with memberships. This is not a secret or production-ready
              election system.
            </div>
          </div>
          <Panel
            title={data.settings.agmTitle}
            sub={date(data.settings.agmDate)}
          >
            <p>
              Agenda: annual activity plan, member priorities and institutional
              coordination.
            </p>
            <Form
              label="Submit proxy for review"
              onSubmit={async (d) => {
                await act("proxy", d);
                notify("Proxy submitted for administrative review.");
              }}
            >
              <Field
                name="representative"
                label="Authorized representative name"
              />
            </Form>
            {data.proxies.map((p) => (
              <div className="list-link" key={p.id}>
                {p.representative}
                <Badge>{p.status}</Badge>
              </div>
            ))}
          </Panel>
          {data.ballots.map((b) => (
            <Panel
              key={b.id}
              title={b.title}
              action={<Badge>{b.status}</Badge>}
            >
              <p>One membership, one vote. Voting closes {date(b.closes)}.</p>
              {b.votes.length ? (
                <div className="callout">
                  <CheckCircle2 />
                  Your vote has been recorded.
                </div>
              ) : b.status === "Open" ? (
                <Form
                  label="Confirm demo vote"
                  onSubmit={async (d) => {
                    await act("vote", { ...d, ballotId: b.id });
                    notify("Your vote has been recorded.");
                  }}
                >
                  <Field name="option" label="Your vote" options={b.options} />
                </Form>
              ) : (
                <p>Voting is not currently open.</p>
              )}
            </Panel>
          ))}
        </>
      )}
      {dialog === "profile" && (
        <Modal
          title="Request company profile update"
          close={() => setDialog("")}
        >
          <Form
            label="Send update request"
            onSubmit={async (d) => {
              await act("profile-request", d);
              setDialog("");
              notify("Update request recorded for the secretariat.");
            }}
          >
            <Field
              name="note"
              label="Describe the change you need"
              type="textarea"
            />
          </Form>
        </Modal>
      )}
      {pay && (
        <Modal title="Simulated payment" close={() => setPay("")}>
          <div className="callout">
            This is a demo transaction. No payment gateway is connected and no
            money will move.
          </div>
          <p>Invoice {pay}</p>
          <div className="row-actions">
            <button
              className="button primary"
              onClick={async () => {
                await run(
                  "simulate-payment",
                  { paymentId: pay, outcome: "Simulated successful" },
                  "Demo payment recorded.",
                );
                setPay("");
                setDialog("");
              }}
            >
              Simulate success
            </button>
            <button
              className="button"
              onClick={async () => {
                await run(
                  "simulate-payment",
                  { paymentId: pay, outcome: "Failed" },
                  "Simulated failure recorded.",
                );
                setPay("");
              }}
            >
              Simulate failure
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
