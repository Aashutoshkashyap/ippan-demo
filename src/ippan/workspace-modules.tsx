"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  CheckCircle2,
  FileText,
  Eye,
  Pencil,
  Users,
  Clock,
  Download,
  Upload,
  ShieldCheck,
  CalendarDays,
  Vote,
  Check,
  BookOpen,
  ExternalLink,
  ArrowUpRight,
  Building2,
  FileCheck,
} from "lucide-react";
import {
  usePlatform,
  Panel,
  Table,
  Badge,
  SearchBox,
  Modal,
  Field,
  Form,
  Export,
  DocumentLink,
  date,
  money,
  Empty,
  exportCsv,
  readPdfFiles,
} from "./ui";
import { Content, provinces, roles, nav } from "./model";
import { GrowthChart, RevenueChart, ProvinceChart } from "./charts";
export default function AdminModules({ area }: { area: string }) {
  const { data, act, notify } = usePlatform();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("");
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState("");
  const [record, setRecord] = useState<any>(null);
  const [kind, setKind] = useState<"news" | "publications" | "resources">(
    area === "resources" ? "publications" : "news",
  );
  const title = nav.find((n) => n[0] === area)?.[1] || "Workspace";
  const search = (s: string) => s.toLowerCase().includes(query.toLowerCase());
  const run = async (
    action: string,
    d: Record<string, unknown>,
    message: string,
  ) => {
    try {
      const r = await act(action, d);
      notify(message);
      return r;
    } catch (e) {
      notify(e instanceof Error ? e.message : "Action failed");
    }
  };
  const save = async (
    action: string,
    d: Record<string, unknown>,
    message: string,
  ) => {
    await act(action, d);
    setModal("");
    setRecord(null);
    notify(message);
  };
  const open = (which: string, r: any = null) => {
    setRecord(r);
    setModal(which);
  };
  const appTab = tab || "Applications";
  const successful = data.payments.filter(
    (p) => p.status === "Simulated successful",
  );
  const total = successful.reduce((n, p) => n + p.amount, 0);
  return (
    <>
      <div className="workspace-title">
        <div>
          <div className="welcome-eyebrow">IPPAN ADMINISTRATION</div>
          <h1>{title}</h1>
          <p>
            {
              (
                {
                  members:
                    "A connected membership lifecycle, from first application to annual renewal.",
                  finance:
                    "Track invoices, simulated payments and reconciliation in one place.",
                  content:
                    "Create, review and publish content across the public website.",
                  events:
                    "Bring your community together. Manage events and participants.",
                  projects:
                    "Manage the sample projects behind the public hydropower database.",
                  resources:
                    "Share publications and knowledge with the energy community.",
                  agm: "Manage eligibility, proxies and a controlled demonstration ballot.",
                  secretariat:
                    "Keep correspondence, meeting decisions and follow-up connected.",
                  communications:
                    "Prepare segmented member communications and simulated records.",
                  reports: "Explore the stories behind your community’s data.",
                  users:
                    "Manage role-based access and review sensitive administrative actions.",
                } as Record<string, string>
              )[area]
            }
          </p>
        </div>
        <div className="row-actions">
          {area === "members" && (
            <Export rows={data.members} name="ippan-members" />
          )}
          {area === "finance" && (
            <>
              <Export rows={data.payments} name="ippan-payments" />
              <button
                className="button primary"
                onClick={() => open("manual-payment")}
              >
                <Plus size={16} />
                Manual payment
              </button>
            </>
          )}
          {["content", "resources"].includes(area) && (
            <button className="button primary" onClick={() => open("content")}>
              <Plus size={16} />
              New {kind === "news" ? "content" : "document"}
            </button>
          )}
          {area === "events" && (
            <button className="button primary" onClick={() => open("event")}>
              <Plus size={16} />
              Create event
            </button>
          )}
          {area === "projects" && (
            <>
              <Export rows={data.projects} name="ippan-projects" />
              <button
                className="button primary"
                onClick={() => open("project")}
              >
                <Plus size={16} />
                Add project
              </button>
            </>
          )}
          {area === "agm" && (
            <button className="button primary" onClick={() => open("ballot")}>
              <Plus size={16} />
              Create ballot
            </button>
          )}
          {area === "secretariat" && (
            <button
              className="button primary"
              onClick={() => open("correspondence")}
            >
              <Plus size={16} />
              Register correspondence
            </button>
          )}
          {area === "communications" && (
            <button className="button primary" onClick={() => open("message")}>
              <Plus size={16} />
              Compose message
            </button>
          )}
        </div>
      </div>
      {area === "members" && (
        <>
          <div className="mini-metrics">
            {[
              ["Total members", data.members.length],
              [
                "Active",
                data.members.filter((m) => m.status === "Active").length,
              ],
              [
                "Applications awaiting review",
                data.applications.filter((a) => a.status === "Pending").length,
              ],
              [
                "Expired",
                data.members.filter((m) => m.status === "Expired").length,
              ],
            ].map(([t, v]) => (
              <div key={String(t)}>
                <span>{t}</span>
                <strong>{v}</strong>
              </div>
            ))}
          </div>
          <div className="tabs">
            {["Applications", "Member directory"].map((t) => (
              <button
                key={t}
                className={appTab === t ? "active" : ""}
                onClick={() => {
                  setTab(t);
                  setQuery("");
                  setFilter("All");
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="filter-bar">
            <SearchBox
              value={query}
              set={setQuery}
              placeholder="Search organization or reference…"
            />
            <select
              aria-label="Filter membership status"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {[
                "All",
                ...(appTab === "Applications"
                  ? ["Pending", "Approved", "Rejected", "Correction requested"]
                  : ["Active", "Expired"]),
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <Panel
            title={
              appTab === "Applications"
                ? "Membership applications"
                : "Member directory"
            }
          >
            {appTab === "Applications" ? (
              <Table
                headers={[
                  "Organization / reference",
                  "Category",
                  "Province",
                  "Submitted",
                  "Status",
                  "Review",
                ]}
              >
                {data.applications
                  .filter(
                    (a) =>
                      search(a.name + " " + a.id) &&
                      (filter === "All" || a.status === filter),
                  )
                  .map((a) => (
                    <tr key={a.id}>
                      <td>
                        <strong>{a.name}</strong>
                        <small>{a.id}</small>
                      </td>
                      <td>{a.category}</td>
                      <td>{a.province}</td>
                      <td>{date(a.created)}</td>
                      <td>
                        <Badge>{a.status}</Badge>
                      </td>
                      <td>
                        <button
                          className="button small"
                          onClick={() => open("review", a)}
                        >
                          <Eye size={15} />
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
              </Table>
            ) : (
              <Table
                headers={[
                  "Company",
                  "Category",
                  "Province",
                  "Capacity",
                  "Validity",
                  "Status",
                  "Public visibility",
                ]}
              >
                {data.members
                  .filter(
                    (m) =>
                      search(m.name + " " + m.id) &&
                      (filter === "All" || m.status === filter),
                  )
                  .map((m) => (
                    <tr key={m.id}>
                      <td>
                        <strong>{m.name}</strong>
                        <small>{m.id}</small>
                      </td>
                      <td>{m.category}</td>
                      <td>{m.province}</td>
                      <td>{m.capacity} MW</td>
                      <td>{date(m.expiry)}</td>
                      <td>
                        <Badge>{m.status}</Badge>
                      </td>
                      <td>
                        <button
                          className={"toggle " + (m.visible ? "on" : "")}
                          aria-label={"Toggle public visibility for " + m.name}
                          aria-pressed={m.visible}
                          onClick={() =>
                            run(
                              "visibility",
                              { memberId: m.id, visible: !m.visible },
                              "Directory visibility updated.",
                            )
                          }
                        >
                          <span />
                        </button>
                      </td>
                    </tr>
                  ))}
              </Table>
            )}
          </Panel>
        </>
      )}
      {area === "finance" && (
        <>
          <div className="mini-metrics">
            <div>
              <span>Simulated collections</span>
              <strong>{money(total)}</strong>
            </div>
            <div>
              <span>Pending invoices</span>
              <strong>
                {data.payments.filter((p) => p.status === "Pending").length}
              </strong>
            </div>
            <div>
              <span>Awaiting reconciliation</span>
              <strong>{successful.filter((p) => !p.reconciled).length}</strong>
            </div>
            <div>
              <span>Reconciled</span>
              <strong>{successful.filter((p) => p.reconciled).length}</strong>
            </div>
          </div>
          <div className="callout">
            <ShieldCheck size={20} />
            All transactions are simulated. No payment gateway is connected and
            no real money has moved.
          </div>
          <RevenueChart />
          <div className="filter-bar">
            <SearchBox
              value={query}
              set={setQuery}
              placeholder="Search payment reference or purpose…"
            />
            <select
              aria-label="Payment status"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {[
                "All",
                "Pending",
                "Simulated successful",
                "Failed",
                "Reversed",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <Panel title="Payment register">
            <Table
              headers={[
                "Reference / member",
                "Purpose",
                "Amount",
                "Status",
                "Reconciliation",
                "Actions",
              ]}
            >
              {data.payments
                .filter(
                  (p) =>
                    search(p.id + " " + p.purpose) &&
                    (filter === "All" || p.status === filter),
                )
                .map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.id}</strong>
                      <small>
                        {data.members.find((m) => m.id === p.memberId)?.name ||
                          p.memberId}
                      </small>
                    </td>
                    <td>{p.purpose}</td>
                    <td>{money(p.amount)}</td>
                    <td>
                      <Badge>{p.status}</Badge>
                    </td>
                    <td>
                      {p.reconciled ? (
                        <Badge>Reconciled</Badge>
                      ) : p.status === "Simulated successful" ? (
                        <button
                          className="button small"
                          onClick={() =>
                            run(
                              "reconcile",
                              { paymentId: p.id },
                              "Demo transaction reconciled.",
                            )
                          }
                        >
                          Reconcile
                        </button>
                      ) : (
                        "Awaiting payment"
                      )}
                    </td>
                    <td>
                      <div className="row-actions">
                        <DocumentLink id={p.id} label="PDF" />
                        {p.status === "Pending" &&
                          p.manual &&
                          data.viewer?.role === "Super Administrator" && (
                            <button
                              className="button small"
                              onClick={() =>
                                run(
                                  "approve-manual",
                                  { paymentId: p.id },
                                  "Manual demo entry approved.",
                                )
                              }
                            >
                              Approve demo entry
                            </button>
                          )}
                        {p.status === "Simulated successful" && (
                          <button
                            className="button small"
                            onClick={() => open("reverse", p)}
                          >
                            Reverse demo payment
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </Table>
          </Panel>
        </>
      )}
      {["content", "resources"].includes(area) && (
        <>
          <div className="tabs">
            {(area === "resources"
              ? ["publications", "resources"]
              : ["news", "homepage"]
            ).map((t) => (
              <button
                className={(tab || kind) === t ? "active" : ""}
                key={t}
                onClick={() => {
                  setTab(t);
                  if (t !== "homepage") setKind(t as typeof kind);
                }}
              >
                {t === "news"
                  ? "News & notices"
                  : t === "homepage"
                    ? "Homepage settings"
                    : t === "publications"
                      ? "Publications & library"
                      : "Resource centre"}
              </button>
            ))}
          </div>
          {tab === "homepage" ? (
            <Panel
              title="Homepage hero content"
              sub="Changes appear immediately on the public website."
            >
              <Form
                label="Update homepage"
                onSubmit={(d) =>
                  save("save-settings", d, "Homepage content updated.")
                }
              >
                <Field
                  name="heroTitle"
                  label="Hero heading (use a new line for the accent line)"
                  type="textarea"
                  value={data.settings.heroTitle}
                />
                <Field
                  name="heroSubtitle"
                  label="Hero description"
                  type="textarea"
                  value={data.settings.heroSubtitle}
                />
              </Form>
            </Panel>
          ) : (
            <>
              <div className="filter-bar">
                <SearchBox
                  value={query}
                  set={setQuery}
                  placeholder="Search content…"
                />
                <select
                  aria-label="Publishing status"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  {["All", "Draft", "In review", "Published", "Archived"].map(
                    (s) => (
                      <option key={s}>{s}</option>
                    ),
                  )}
                </select>
                <Link className="button" href={"/" + kind} target="_blank">
                  <ExternalLink size={16} />
                  View public page
                </Link>
              </div>
              <Panel
                title={
                  kind === "news"
                    ? "News & notices"
                    : kind === "publications"
                      ? "Digital publications"
                      : "Energy resources"
                }
              >
                <Table
                  headers={[
                    "Title",
                    "Category",
                    "Access",
                    "Status",
                    "Published",
                    "Actions",
                  ]}
                >
                  {data[kind]
                    .filter(
                      (c) =>
                        search(c.title) &&
                        (filter === "All" || c.status === filter),
                    )
                    .map((c) => (
                      <tr key={c.id}>
                        <td>
                          <strong>{c.title}</strong>
                          <small>
                            {c.featured
                              ? "Featured content"
                              : "Standard content"}
                          </small>
                        </td>
                        <td>{c.category}</td>
                        <td>{c.access}</td>
                        <td>
                          <Badge>{c.status}</Badge>
                        </td>
                        <td>{date(c.date)}</td>
                        <td>
                          <button
                            className="button small"
                            onClick={() => open("content", c)}
                          >
                            <Pencil size={14} />
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                </Table>
              </Panel>
            </>
          )}
        </>
      )}
      {area === "events" && (
        <>
          <div className="tabs">
            {["Events", "Participants"].map((t) => (
              <button
                key={t}
                className={(tab || "Events") === t ? "active" : ""}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          {tab === "Participants" ? (
            <Panel
              title="Participant database"
              action={
                <Export
                  rows={data.registrations}
                  name="ippan-event-participants"
                />
              }
            >
              <Table
                headers={[
                  "Participant",
                  "Event",
                  "Ticket reference",
                  "Payment",
                  "Attendance",
                  "Pass",
                ]}
              >
                {data.registrations.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.name}</strong>
                      <small>{r.email}</small>
                    </td>
                    <td>
                      {data.events.find((e) => e.id === r.eventId)?.title}
                    </td>
                    <td>{r.id}</td>
                    <td>
                      <Badge>{r.paymentStatus}</Badge>
                    </td>
                    <td>
                      <button
                        className={
                          "button small " + (r.attendance ? "checked" : "")
                        }
                        onClick={() =>
                          run(
                            "attendance",
                            { registrationId: r.id },
                            "Attendance updated.",
                          )
                        }
                      >
                        <Check size={14} />
                        {r.attendance ? "Checked in" : "Check in"}
                      </button>
                    </td>
                    <td>
                      <DocumentLink id={r.id} label="QR pass" />
                    </td>
                  </tr>
                ))}
              </Table>
            </Panel>
          ) : (
            <div className="admin-event-grid">
              {data.events.map((e) => (
                <Panel
                  key={e.id}
                  title={e.title}
                  action={<Badge>{e.status}</Badge>}
                >
                  <img
                    className="admin-event-image"
                    src={e.image}
                    alt={e.title}
                  />
                  <p>{e.description}</p>
                  <div className="event-meta">
                    <span>{date(e.date)}</span>
                    <span>{e.location}</span>
                  </div>
                  <div className="row-actions">
                    <span className="badge neutral">
                      {
                        data.registrations.filter((r) => r.eventId === e.id)
                          .length
                      }{" "}
                      registrations
                    </span>
                    <button
                      className="button small"
                      onClick={() => open("event", e)}
                    >
                      <Pencil size={14} />
                      Edit event
                    </button>
                    {e.status === "Published" && (
                      <Link className="button small" href={"/events/" + e.id}>
                        View event
                        <ArrowUpRight size={15} />
                      </Link>
                    )}
                  </div>
                </Panel>
              ))}
            </div>
          )}
        </>
      )}
      {area === "projects" && (
        <>
          <ProvinceChart />
          <div className="filter-bar">
            <SearchBox
              value={query}
              set={setQuery}
              placeholder="Search sample projects…"
            />
            <button className="button" onClick={() => open("import")}>
              <Upload size={16} />
              Import CSV
            </button>
            <Link className="button" href="/hydropower" target="_blank">
              <ExternalLink size={16} />
              Public database
            </Link>
          </div>
          <Panel title="Project register">
            <Table
              headers={[
                "Project / developer",
                "Province",
                "Capacity",
                "Status",
                "Licence",
                "Actions",
              ]}
            >
              {data.projects
                .filter((p) => search(p.name + " " + p.developer))
                .map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.name}</strong>
                      <small>{p.developer}</small>
                    </td>
                    <td>{p.province}</td>
                    <td>{p.capacity} MW</td>
                    <td>
                      <Badge>{p.status}</Badge>
                    </td>
                    <td>{p.licence}</td>
                    <td>
                      <button
                        className="button small"
                        onClick={() => open("project", p)}
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
            </Table>
          </Panel>
        </>
      )}
      {area === "agm" && (
        <>
          <div className="callout">
            <Vote size={22} />
            <div>
              Auditable demonstration workflow. Votes are linked to memberships;
              this implementation does not offer ballot secrecy or claim
              production election readiness.
            </div>
          </div>
          <div className="overview-chart-grid">
            <Panel
              title={data.settings.agmTitle}
              sub={"Scheduled " + date(data.settings.agmDate)}
            >
              <h4>Agenda</h4>
              <p>
                Annual activity plan · Member priorities · Institutional
                coordination
              </p>
              <div className="mini-metrics">
                <div>
                  <span>Eligible memberships</span>
                  <strong>
                    {
                      data.members.filter(
                        (m) =>
                          m.status === "Active" &&
                          m.expiry >= new Date().toISOString().slice(0, 10),
                      ).length
                    }
                  </strong>
                </div>
                <div>
                  <span>Approved proxies</span>
                  <strong>
                    {data.proxies.filter((p) => p.status === "Approved").length}
                  </strong>
                </div>
              </div>
              <Export
                rows={data.members
                  .filter(
                    (m) =>
                      m.status === "Active" &&
                      m.expiry >= new Date().toISOString().slice(0, 10),
                  )
                  .map((m) => ({
                    id: m.id,
                    name: m.name,
                    proxy:
                      data.proxies.find(
                        (p) => p.memberId === m.id && p.status === "Approved",
                      )?.representative || "",
                  }))}
                name="ippan-agm-eligibility"
              />
            </Panel>
            <Panel title="Proxy submissions">
              {!data.proxies.length && (
                <Empty text="No proxy submissions yet." />
              )}
              {data.proxies.map((p) => (
                <div className="proxy-record" key={p.id}>
                  <strong>
                    {data.members.find((m) => m.id === p.memberId)?.name}
                  </strong>
                  <p>Representative: {p.representative}</p>
                  <Badge>{p.status}</Badge>
                  {p.status === "Pending" && (
                    <div className="row-actions">
                      <button
                        className="button primary small"
                        onClick={() =>
                          run(
                            "review-proxy",
                            { proxyId: p.id, status: "Approved" },
                            "Proxy approved.",
                          )
                        }
                      >
                        Approve
                      </button>
                      <button
                        className="button small"
                        onClick={() =>
                          run(
                            "review-proxy",
                            { proxyId: p.id, status: "Rejected" },
                            "Proxy rejected.",
                          )
                        }
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </Panel>
          </div>
          {data.ballots.map((b) => (
            <Panel
              key={b.id}
              title={b.title}
              action={<Badge>{b.status}</Badge>}
            >
              <p>
                One member, one vote. Voting window: {date(b.opens)} –{" "}
                {date(b.closes)}.
              </p>
              <div className="ballot-options">
                {b.options.map((o) => (
                  <div key={o}>
                    <span>{o}</span>
                    <strong>
                      {b.status === "Closed"
                        ? b.votes.filter((v) => v.option === o).length
                        : "—"}
                    </strong>
                  </div>
                ))}
              </div>
              <p>
                {b.votes.length} votes recorded. Results appear after closing.
              </p>
              <div className="row-actions">
                {b.status === "Draft" && (
                  <button
                    className="button primary"
                    onClick={() =>
                      run(
                        "ballot-status",
                        { ballotId: b.id, status: "Open" },
                        "Demo ballot opened.",
                      )
                    }
                  >
                    Open voting
                  </button>
                )}
                {b.status === "Open" && (
                  <button
                    className="button primary"
                    onClick={() =>
                      run(
                        "ballot-status",
                        { ballotId: b.id, status: "Closed" },
                        "Demo ballot closed.",
                      )
                    }
                  >
                    Close voting & generate results
                  </button>
                )}
                {b.status === "Closed" && (
                  <Export
                    rows={b.options.map((option) => ({
                      option,
                      votes: b.votes.filter((v) => v.option === option).length,
                    }))}
                    name="ippan-ballot-results"
                  />
                )}
              </div>
            </Panel>
          ))}
        </>
      )}
      {area === "secretariat" && (
        <>
          <div className="tabs">
            {["Darta–Chalani", "Meetings & tasks"].map((t) => (
              <button
                key={t}
                className={(tab || "Darta–Chalani") === t ? "active" : ""}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          {tab === "Meetings & tasks" ? (
            <Panel
              title="Meeting decisions & assigned actions"
              action={
                <button className="button primary" onClick={() => open("task")}>
                  <Plus size={16} />
                  Assign decision
                </button>
              }
            >
              <Table
                headers={[
                  "Decision / meeting",
                  "Responsible person",
                  "Due date",
                  "Status",
                  "Actions",
                ]}
              >
                {data.tasks.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.title}</strong>
                      <small>{t.meeting}</small>
                    </td>
                    <td>{t.assignee}</td>
                    <td>{date(t.due)}</td>
                    <td>
                      <Badge>{t.status}</Badge>
                    </td>
                    <td>
                      <button
                        className="button small"
                        onClick={() =>
                          run(
                            "task-status",
                            { id: t.id },
                            "Task progress updated.",
                          )
                        }
                      >
                        {t.status === "Completed" ? "Reopen" : "Mark completed"}
                      </button>
                    </td>
                  </tr>
                ))}
              </Table>
            </Panel>
          ) : (
            <>
              <div className="filter-bar">
                <SearchBox
                  value={query}
                  set={setQuery}
                  placeholder="Search correspondence or reference…"
                />
                <Export rows={data.correspondence} name="ippan-darta-chalani" />
                <button className="button" onClick={() => window.print()}>
                  <FileText size={16} />
                  Print register
                </button>
              </div>
              <Panel title="Correspondence register">
                <Table
                  headers={[
                    "Reference",
                    "Direction",
                    "Subject / sender",
                    "Assigned to",
                    "Registered",
                    "Status",
                    "Actions",
                  ]}
                >
                  {data.correspondence
                    .filter((c) => search(c.subject + " " + c.id))
                    .map((c) => (
                      <tr key={c.id}>
                        <td>
                          <strong>{c.id}</strong>
                        </td>
                        <td>{c.direction}</td>
                        <td>
                          <strong>{c.subject}</strong>
                          <small>{c.sender}</small>
                        </td>
                        <td>{c.assignee}</td>
                        <td>{date(c.date)}</td>
                        <td>
                          <Badge>{c.status}</Badge>
                        </td>
                        <td>
                          <button
                            className="button small"
                            onClick={() =>
                              run(
                                "correspondence-status",
                                { id: c.id },
                                "Correspondence updated.",
                              )
                            }
                          >
                            {c.status === "Completed" ? "Reopen" : "Complete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                </Table>
              </Panel>
            </>
          )}
        </>
      )}
      {area === "communications" && (
        <>
          <div className="callout">
            <MailIcon />
            <div>
              Email, SMS and push providers are excluded from this build. You
              can prepare segmented drafts and create clearly labelled simulated
              communication records.
            </div>
          </div>
          <Panel title="Communication history">
            <Table headers={["Message", "Member segment", "Created", "Status"]}>
              {data.messages.map((m) => (
                <tr key={m.id}>
                  <td>
                    <strong>{m.title}</strong>
                  </td>
                  <td>{m.segment}</td>
                  <td>{date(m.date)}</td>
                  <td>
                    <Badge>{m.status}</Badge>
                  </td>
                </tr>
              ))}
            </Table>
            {!data.messages.length && (
              <Empty text="No communication drafts yet." />
            )}
          </Panel>
        </>
      )}
      {area === "reports" && (
        <>
          <div className="overview-chart-grid">
            <GrowthChart />
            <RevenueChart />
          </div>
          <ProvinceChart />
          <Panel title="Download platform reports">
            <div className="report-buttons">
              <Export rows={data.payments} name="ippan-finance" />
              <Export rows={data.projects} name="ippan-projects" />
              <Export rows={data.audit} name="ippan-audit" />
            </div>
          </Panel>
        </>
      )}
      {area === "users" && (
        <>
          <Panel
            title="Users & role-based access"
            sub="Role changes revoke existing sessions. Sensitive operations are recorded below."
          >
            <Table headers={["User", "Email", "Role", "Change access"]}>
              {data.users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.name}</strong>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <Badge>{u.role}</Badge>
                  </td>
                  <td>
                    {u.id !== data.viewer?.id ? (
                      <button
                        className="button small"
                        onClick={() => open("role", u)}
                      >
                        <ShieldCheck size={14} />
                        Change role
                      </button>
                    ) : (
                      <span className="muted">Your account</span>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          </Panel>
          <Panel
            title="Administrative audit trail"
            action={<Export rows={data.audit} name="ippan-audit-log" />}
          >
            <Table headers={["Date / time", "Actor", "Action", "Record"]}>
              {data.audit.slice(0, 50).map((a) => (
                <tr key={a.id}>
                  <td>
                    {new Date(a.date).toLocaleString("en-GB", {
                      timeZone: "Asia/Kathmandu",
                    })}
                  </td>
                  <td>{a.actor}</td>
                  <td>{a.action}</td>
                  <td>{a.detail}</td>
                </tr>
              ))}
            </Table>
          </Panel>
        </>
      )}
      {modal && (
        <Modal
          title={
            {
              review: "Review membership application",
              content: record ? "Edit content" : "Create content",
              event: "Create an event",
              project: record
                ? "Edit hydropower project"
                : "Add hydropower project",
              correspondence: "Register correspondence",
              task: "Assign a meeting decision",
              message: "Prepare member communication",
              "manual-payment": "Record manual demo payment",
              role: "Change user role",
              ballot: "Create controlled demo ballot",
              import: "Import hydropower records",
            }[modal] || "Edit record"
          }
          close={() => setModal("")}
        >
          {modal === "review" && record && (
            <>
              <h3>{record.name}</h3>
              <dl>
                {[
                  ["Reference", record.id],
                  ["Category", record.category],
                  ["Province", record.province],
                  ["Capacity", record.capacity + " MW"],
                  ["Email", record.email],
                ].map(([k, v]) => (
                  <div className="dl-row" key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <h4>Supporting documents</h4>
              {(record.documentNames || []).map((name: string, i: number) => (
                <a
                  className="list-link"
                  key={i}
                  href={
                    "/api/ippan/documents/" + record.id + "?attachment=" + i
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  <FileText size={17} />
                  {name}
                  <Download size={16} />
                </a>
              ))}
              {!record.documentNames?.length && (
                <p className="muted">
                  Seeded sample application has no uploaded document.
                </p>
              )}
              <h4>Application history</h4>
              {record.history.map((h: any, i: number) => (
                <p key={i}>
                  {date(h.date)} · {h.status} · {h.note}
                </p>
              ))}
              {record.status !== "Approved" && record.status !== "Rejected" ? (
                <Form
                  label="Save review decision"
                  onSubmit={(d) =>
                    save(
                      "review",
                      { ...d, applicationId: record.id },
                      "Application review saved.",
                    )
                  }
                >
                  <Field
                    name="status"
                    label="Decision"
                    options={["Approved", "Correction requested", "Rejected"]}
                  />
                  <Field name="note" label="Review notes" type="textarea" />
                </Form>
              ) : (
                <Badge>{record.status}</Badge>
              )}
            </>
          )}
          {modal === "content" && (
            <Form
              label="Save content"
              onSubmit={async (d, form) => {
                const pdf = (await readPdfFiles(form, "pdfFile"))[0];
                await save(
                  "save-content",
                  {
                    ...d,
                    kind,
                    id: record?.id,
                    featured: d.featured === "Yes",
                    ...(pdf ? { pdf } : {}),
                  },
                  "Content saved.",
                );
              }}
            >
              <Field name="title" label="Title" value={record?.title} />
              <div className="form-grid">
                <Field
                  name="category"
                  label="Category"
                  value={
                    record?.category ||
                    (kind === "news" ? "News" : "Research paper")
                  }
                />
                <Field
                  name="access"
                  label="Access level"
                  options={["Public", "Members"]}
                  value={record?.access || "Public"}
                />
              </div>
              <Field
                name="description"
                label="Short description"
                type="textarea"
                value={record?.description}
              />
              <Field
                name="body"
                label="Full content / demo document text"
                type="textarea"
                value={record?.body}
              />
              {kind !== "news" && (
                <label className="field">
                  <span>
                    Upload publication PDF (optional, max. 2 MB; existing upload
                    is kept)
                  </span>
                  <input name="pdfFile" type="file" accept="application/pdf" />
                </label>
              )}
              <div className="form-grid">
                <Field
                  name="status"
                  label="Publishing state"
                  options={
                    data.viewer?.role === "Content Editor"
                      ? ["Draft", "In review"]
                      : ["Draft", "In review", "Published", "Archived"]
                  }
                  value={record?.status || "Draft"}
                />
                <Field
                  name="featured"
                  label="Featured content"
                  options={["Yes", "No"]}
                  value={record?.featured ? "Yes" : "No"}
                />
              </div>
              <div className="callout">
                Published content appears on the public website. Demo
                publications generate a readable PDF from this text.
              </div>
            </Form>
          )}
          {modal === "event" && (
            <Form
              label="Save event"
              onSubmit={(d) =>
                save("save-event", { ...d, id: record?.id }, "Event saved.")
              }
            >
              <Field name="title" label="Event title" value={record?.title} />
              <div className="form-grid">
                <Field
                  name="date"
                  label="Date & time"
                  type="datetime-local"
                  value={record?.date}
                />
                <Field
                  name="location"
                  label="Location"
                  value={record?.location}
                />
              </div>
              <Field
                name="description"
                label="Description"
                type="textarea"
                value={record?.description}
              />
              <div className="form-grid">
                <Field
                  name="price"
                  label="Demo ticket price (NPR; 0 for free)"
                  type="number"
                  value={record?.price || 0}
                />
                <Field
                  name="status"
                  label="Publication state"
                  options={["Draft", "Published"]}
                  value={record?.status}
                />
              </div>
            </Form>
          )}
          {modal === "project" && (
            <Form
              label="Save project"
              onSubmit={(d) =>
                save(
                  "save-project",
                  { ...d, id: record?.id },
                  "Hydropower project saved.",
                )
              }
            >
              <Field name="name" label="Project name" value={record?.name} />
              <Field
                name="developer"
                label="Developer / company name"
                value={record?.developer}
              />
              <div className="form-grid">
                <Field
                  name="memberId"
                  label="Developer member ID"
                  value={record?.memberId || data.members[0]?.id}
                />
                <Field
                  name="province"
                  label="Province"
                  options={provinces}
                  value={record?.province}
                />
                <Field
                  name="district"
                  label="District"
                  value={record?.district}
                />
                <Field
                  name="municipality"
                  label="Municipality"
                  value={record?.municipality}
                />
                <Field
                  name="capacity"
                  label="Installed capacity (MW)"
                  type="number"
                  value={record?.capacity}
                />
                <Field
                  name="river"
                  label="River / energy source"
                  value={record?.river}
                />
                <Field
                  name="lat"
                  label="Latitude"
                  type="number"
                  value={record?.lat || 28}
                />
                <Field
                  name="lng"
                  label="Longitude"
                  type="number"
                  value={record?.lng || 84}
                />
                <Field
                  name="status"
                  label="Project status"
                  options={["Operational", "Under construction", "Survey"]}
                  value={record?.status}
                />
                <Field
                  name="licence"
                  label="Licence reference"
                  value={record?.licence}
                />
                <Field
                  name="cod"
                  label="Commercial operation date / plan"
                  value={record?.cod}
                />
              </div>
              <p className="muted">
                All project records in this environment are sample data.
              </p>
            </Form>
          )}
          {modal === "correspondence" && (
            <Form
              label="Register & generate reference"
              onSubmit={(d) =>
                save(
                  "correspondence",
                  d,
                  "Correspondence registered with a unique reference.",
                )
              }
            >
              <div className="form-grid">
                <Field
                  name="direction"
                  label="Direction"
                  options={["Incoming", "Outgoing"]}
                />
                <Field name="sender" label="Sender / recipient" />
              </div>
              <Field name="subject" label="Subject" />
              <Field name="assignee" label="Responsible person / department" />
            </Form>
          )}
          {modal === "task" && (
            <Form
              label="Assign decision"
              onSubmit={(d) =>
                save("task", d, "Decision assigned and added to task register.")
              }
            >
              <Field name="meeting" label="Meeting / committee" />
              <Field name="title" label="Decision / action" />
              <div className="form-grid">
                <Field name="assignee" label="Responsible person" />
                <Field name="due" label="Due date" type="date" />
              </div>
            </Form>
          )}
          {modal === "message" && (
            <Form
              label="Save communication record"
              onSubmit={(d) =>
                save(
                  "message",
                  d,
                  "Communication record saved. No message was sent.",
                )
              }
            >
              <Field name="title" label="Message / subject" type="textarea" />
              <Field
                name="segment"
                label="Member segment"
                options={[
                  "All active members",
                  "Corporate members",
                  "Associate members",
                  ...provinces.map((p) => p + " members"),
                ]}
              />
              <Field
                name="status"
                label="Record state"
                options={["Draft", "Simulated"]}
              />
              <div className="callout">
                Simulated records are for evaluation only. No emails, SMS or
                push notifications are sent.
              </div>
            </Form>
          )}
          {modal === "manual-payment" && (
            <Form
              label="Submit for approval"
              onSubmit={(d) =>
                save(
                  "manual-payment",
                  d,
                  "Manual demo payment submitted for administrator approval.",
                )
              }
            >
              <Field
                name="memberId"
                label="Member ID"
                value={data.members[0]?.id}
              />
              <Field name="amount" label="Amount (NPR)" type="number" />
              <Field name="purpose" label="Purpose / bank reference" />
              <p>
                Creates a pending record. A Super Administrator must approve
                this simulated entry.
              </p>
            </Form>
          )}
          {modal === "reverse" && (
            <Form
              label="Reverse simulated payment"
              onSubmit={(d) =>
                save(
                  "reverse-payment",
                  { ...d, paymentId: record.id },
                  "Demo transaction reversed.",
                )
              }
            >
              <p>
                Reference: {record.id}. No real financial transaction will
                occur.
              </p>
              <Field name="note" label="Reason for reversal" type="textarea" />
            </Form>
          )}
          {modal === "ballot" && (
            <Form
              label="Create draft ballot"
              onSubmit={(d) =>
                save(
                  "save-ballot",
                  {
                    ...d,
                    options: d.options
                      .split("\n")
                      .map((o) => o.trim())
                      .filter(Boolean),
                  },
                  "Draft ballot created.",
                )
              }
            >
              <Field name="title" label="Ballot title / resolution" />
              <Field
                name="options"
                label="Ballot options (one per line)"
                type="textarea"
                value={"In favour\nAgainst\nAbstain"}
              />
              <div className="form-grid">
                <Field name="opens" label="Opens at" type="datetime-local" />
                <Field name="closes" label="Closes at" type="datetime-local" />
              </div>
              <div className="callout">
                Rule: one active membership, one recorded vote. This demo
                retains voter identity for audit purposes.
              </div>
            </Form>
          )}
          {modal === "role" && (
            <Form
              label="Update role & revoke sessions"
              onSubmit={(d) =>
                save(
                  "set-role",
                  { ...d, userId: record.id },
                  "Role updated and existing sessions revoked.",
                )
              }
            >
              <p>
                {record.name} · {record.email}
              </p>
              <Field
                name="role"
                label="Assigned role"
                options={roles}
                value={record.role}
              />
            </Form>
          )}
          {modal === "import" && (
            <div>
              <p>
                CSV import uses these exact headers. Download the current
                project report as a template.
              </p>
              <code className="import-headers">
                name,developer,memberId,province,district,municipality,capacity,river,status,lat,lng,licence,cod
              </code>
              <p>
                Spreadsheet (.xlsx) import is pending; export an unquoted CSV
                with simple values for this demo importer.
              </p>
              <Form
                label="Validate & import CSV"
                onSubmit={async (_, form) => {
                  const f = (
                    form.elements.namedItem("file") as HTMLInputElement
                  ).files?.[0];
                  if (!f) throw new Error("Select a CSV file.");
                  const lines = (await f.text()).trim().split(/\r?\n/);
                  if (lines.length > 101)
                    throw new Error("Maximum 100 records per import.");
                  const keys = lines[0].split(",").map((k) => k.trim());
                  if (
                    ![
                      "name",
                      "developer",
                      "memberId",
                      "province",
                      "district",
                      "municipality",
                      "capacity",
                      "river",
                      "status",
                      "lat",
                      "lng",
                      "licence",
                      "cod",
                    ].every((k) => keys.includes(k))
                  )
                    throw new Error("Required columns are missing.");
                  if (lines.some((l) => l.includes('"')))
                    throw new Error(
                      "Quoted CSV values are not supported by this demo importer.",
                    );
                  const projects = lines.slice(1).map((line) => {
                    const values = line.split(",");
                    return Object.fromEntries(
                      keys.map((k, i) => [k, values[i]?.trim()]),
                    );
                  });
                  await act("import-projects", { projects });
                  setModal("");
                  notify("CSV records imported.");
                }}
              >
                <label className="field">
                  <span>Project CSV</span>
                  <input
                    name="file"
                    type="file"
                    accept=".csv,text/csv"
                    required
                  />
                </label>
              </Form>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
function MailIcon() {
  return <FileText size={21} />;
}
