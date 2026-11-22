"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { MapPin, ArrowUpRight, Filter, RotateCcw } from "lucide-react";
import {
  Panel,
  Table,
  Badge,
  Export,
  Empty,
  SearchBox,
  usePlatform,
  money,
} from "./ui";
import type { Project } from "./model";
import {
  filterProjects,
  projectAggregates,
  groupCounts,
  isActive,
  monthlyRecords,
  totalCapacity,
} from "./analytics-data";
import boundary from "./nepal-boundary.json";
const palette = [
  "#087f70",
  "#438dba",
  "#d9a444",
  "#8175b5",
  "#b9c9c5",
  "#df8d78",
  "#6da88c",
];
export function DataChart({
  title,
  rows,
  unit = "count",
  type = "bar",
  sub,
}: {
  title: string;
  rows: { name: string; value: number }[];
  unit?: string;
  type?: "bar" | "donut" | "line";
  sub?: string;
}) {
  const nonzero = rows.some((r) => r.value > 0);
  return (
    <Panel
      title={title}
      sub={sub || `Unit: ${unit} · current demonstration records`}
    >
      {nonzero ? (
        <div
          className="data-chart"
          role="img"
          aria-label={`${title}. ${rows.map((r) => `${r.name}: ${r.value} ${unit}`).join("; ")}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            {type === "donut" ? (
              <PieChart>
                <Pie
                  data={rows.filter((r) => r.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="52%"
                  outerRadius="80%"
                  paddingAngle={2}
                >
                  {rows
                    .filter((r) => r.value > 0)
                    .map((r, i) => (
                      <Cell key={r.name} fill={palette[i % palette.length]} />
                    ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => [
                    v.toLocaleString() + " " + unit,
                    "Value",
                  ]}
                />
              </PieChart>
            ) : type === "line" ? (
              <AreaChart
                data={rows}
                margin={{ top: 15, left: 10, right: 20, bottom: 25 }}
              >
                <CartesianGrid stroke="#e8efec" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  width={58}
                  allowDecimals={unit !== "count"}
                />
                <Tooltip
                  formatter={(v: number) => [
                    v.toLocaleString() + " " + unit,
                    "Value",
                  ]}
                />
                <Area
                  dataKey="value"
                  name={unit}
                  type="monotone"
                  stroke={palette[0]}
                  fill="#087f7018"
                  strokeWidth={2}
                />
              </AreaChart>
            ) : (
              <BarChart
                data={rows}
                layout="vertical"
                margin={{ top: 5, left: 0, right: 28, bottom: 10 }}
              >
                <CartesianGrid stroke="#e8efec" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12 }}
                  allowDecimals={unit !== "count"}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={118}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(v: number) => [
                    v.toLocaleString() + " " + unit,
                    "Value",
                  ]}
                />
                <Bar
                  dataKey="value"
                  name={unit}
                  radius={[0, 4, 4, 0]}
                  maxBarSize={28}
                >
                  {rows.map((r, i) => (
                    <Cell key={r.name} fill={palette[i % palette.length]} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      ) : (
        <Empty text="No data for this selection." />
      )}
      {type === "donut" && (
        <div className="chart-key">
          {rows.map((r, i) => (
            <div key={r.name}>
              <i style={{ background: palette[i % palette.length] }} />
              <span>{r.name}</span>
              <strong>
                {r.value.toLocaleString()} {unit === "count" ? "" : unit}
              </strong>
            </div>
          ))}
        </div>
      )}
      <details className="chart-data">
        <summary>View data table</summary>
        <Table headers={["Category", unit]}>
          {rows.map((r) => (
            <tr key={r.name}>
              <th scope="row">{r.name}</th>
              <td>{r.value.toLocaleString()}</td>
            </tr>
          ))}
        </Table>
      </details>
    </Panel>
  );
}
const pos = (lng: number, lat: number) => [
  ((lng - 79.8) / 8.6) * 920 + 20,
  ((31 - lat) / 5.1) * 480 + 10,
];
const countryPath = (boundary.coordinates as number[][][])
  .map(
    (ring) =>
      ring
        .map(([lng, lat], i) => {
          const [x, y] = pos(lng, lat);
          return `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(" ") + "Z",
  )
  .join(" ");
export function ProjectMap({ projects }: { projects: Project[] }) {
  const [selected, setSelected] = useState("");
  const [zoom, setZoom] = useState(1);
  const item = projects.find((p) => p.id === selected);
  return (
    <div className="geographic-map">
      <div className="map-toolbar">
        <span>
          <MapPin size={16} /> Geographic project explorer
        </span>
        <div>
          <button
            aria-label="Zoom out map"
            disabled={zoom === 1}
            onClick={() => setZoom(Math.max(1, zoom - 0.5))}
          >
            −
          </button>
          <button
            aria-label="Zoom in map"
            disabled={zoom === 2.5}
            onClick={() => setZoom(Math.min(2.5, zoom + 0.5))}
          >
            +
          </button>
        </div>
      </div>
      <svg
        viewBox={`${480 - 480 / zoom} ${250 - 250 / zoom} ${960 / zoom} ${500 / zoom}`}
        aria-label="Geographic outline of Nepal with demonstration project coordinates"
        role="group"
      >
        <defs>
          <pattern
            id="geo-grid"
            width="70"
            height="55"
            patternUnits="userSpaceOnUse"
          >
            <path d="M70 0H0V55" fill="none" stroke="#d6e5df" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="960" height="500" fill="url(#geo-grid)" />
        <path d={countryPath} fill="#dbe9de" stroke="#71998a" strokeWidth="2" />
        <text x="380" y="260" fill="#6b887c" fontSize="27" letterSpacing="14">
          NEPAL
        </text>
        <text x="90" y="400" fill="#9faea5" fontSize="16">
          INDIA
        </text>
        <text x="740" y="95" fill="#9faea5" fontSize="16">
          CHINA
        </text>
        {projects.map((p) => {
          const [cx, cy] = pos(p.lng, p.lat);
          return (
            <g
              key={p.id}
              role="button"
              tabIndex={0}
              aria-label={`${p.name}, ${p.capacity} MW, ${p.status}`}
              onClick={() => setSelected(p.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelected(p.id);
                }
              }}
            >
              <title>{`${p.name} · ${p.capacity} MW`}</title>
              <circle
                cx={cx}
                cy={cy}
                r={selected === p.id ? 14 : 10}
                fill={
                  p.status === "Operational"
                    ? "#087f70"
                    : p.status === "Survey"
                      ? "#8175b5"
                      : "#d9a444"
                }
                stroke="white"
                strokeWidth="3"
              />
            </g>
          );
        })}
      </svg>
      <div className="map-detail">
        {item ? (
          <>
            <div>
              <Badge>{item.status}</Badge>
              <h3>{item.name}</h3>
              <p>
                {item.developer} · {item.district} · {item.capacity} MW
              </p>
              <small>
                {item.lat.toFixed(4)}° N, {item.lng.toFixed(4)}° E
              </small>
            </div>
            <Link className="button primary" href={"/hydropower/" + item.id}>
              Project details <ArrowUpRight size={16} />
            </Link>
          </>
        ) : (
          <p>
            Select a project marker to view its details. {projects.length}{" "}
            projects in the current selection.
          </p>
        )}
      </div>
      <p className="source-note">
        Natural Earth country outline · geographic reference, not an official
        boundary map. Locations are unverified demonstration coordinates.{" "}
        <a href="/ippan/MAP-SOURCE.txt">Map source</a>
      </p>
    </div>
  );
}
export function HydropowerDashboard({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { data } = usePlatform();
  const [q, setQ] = useState(""),
    [province, setProvince] = useState(""),
    [district, setDistrict] = useState(""),
    [status, setStatus] = useState(""),
    [min, setMin] = useState(""),
    [max, setMax] = useState(""),
    [sort, setSort] = useState("name");
  const records = useMemo(
    () =>
      filterProjects(data.projects, {
        query: q,
        province,
        district,
        status,
        min: min === "" ? undefined : Number(min),
        max: max === "" ? undefined : Number(max),
      }).sort((a, b) =>
        sort === "capacity"
          ? b.capacity - a.capacity
          : sort === "cod"
            ? a.cod.localeCompare(b.cod)
            : a.name.localeCompare(b.name),
      ),
    [data.projects, q, province, district, status, min, max, sort],
  );
  const stats = projectAggregates(records);
  return (
    <div className="hydropower-dashboard">
      <div className="dataset-note">
        <span className="status-dot" /> IPPAN project register · demonstration
        dataset · filtered results, not national electricity statistics.
      </div>
      <div className="project-filters">
        <SearchBox
          value={q}
          set={setQ}
          placeholder="Search project, developer or river…"
        />
        <label>
          <span>Province</span>
          <select
            aria-label="Project province"
            value={province}
            onChange={(e) => {
              setProvince(e.target.value);
              setDistrict("");
            }}
          >
            <option value="">All provinces</option>
            {Array.from(new Set(data.projects.map((p) => p.province)))
              .sort()
              .map((p) => (
                <option key={p}>{p}</option>
              ))}
          </select>
        </label>
        <label>
          <span>District</span>
          <select
            aria-label="Project district"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            <option value="">All districts</option>
            {Array.from(
              new Set(
                data.projects
                  .filter((p) => !province || p.province === province)
                  .map((p) => p.district),
              ),
            )
              .sort()
              .map((p) => (
                <option key={p}>{p}</option>
              ))}
          </select>
        </label>
        <label>
          <span>Status</span>
          <select
            aria-label="Project status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            {[
              "Operational",
              "Under construction",
              "Construction not started",
              "Survey",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Minimum MW</span>
          <input
            aria-label="Minimum project capacity"
            type="number"
            min="0"
            value={min}
            onChange={(e) => setMin(e.target.value)}
          />
        </label>
        <label>
          <span>Maximum MW</span>
          <input
            aria-label="Maximum project capacity"
            type="number"
            min="0"
            value={max}
            onChange={(e) => setMax(e.target.value)}
          />
        </label>
        <button
          className="button"
          onClick={() => {
            setQ("");
            setProvince("");
            setDistrict("");
            setStatus("");
            setMin("");
            setMax("");
          }}
        >
          <RotateCcw size={16} /> Reset
        </button>
      </div>
      <div className="data-kpis">
        {[
          ["Registered projects", stats.total],
          ["Registered portfolio capacity", stats.capacity + " MW"],
          [
            "Installed / operational capacity",
            totalCapacity(records.filter((p) => p.status === "Operational")) +
              " MW",
          ],
          [
            "Operating projects",
            records.filter((p) => p.status === "Operational").length,
          ],
          [
            "Under construction",
            records.filter((p) => p.status === "Under construction").length,
          ],
          [
            "Survey / licence",
            records.filter((p) => p.status === "Survey").length,
          ],
        ].map(([name, v]) => (
          <div key={name}>
            <span>{name}</span>
            <strong>{v}</strong>
          </div>
        ))}
      </div>
      <ProjectMap projects={records} />
      {!compact && (
        <div className="analytics-grid">
          <DataChart
            title="Project status distribution"
            rows={stats.statuses}
            type="donut"
          />
          <DataChart
            title="Capacity by development status"
            rows={stats.statuses.map((r) => ({
              name: r.name,
              value: r.capacity,
            }))}
            unit="MW"
          />
          <DataChart title="Projects by province" rows={stats.locations} />
          <DataChart
            title="Capacity by province"
            rows={stats.locations.map((r) => ({
              name: r.name,
              value: r.capacity,
            }))}
            unit="MW"
          />
          <DataChart
            title="Project capacity distribution"
            rows={stats.ranges}
          />
          <DataChart
            title="Developer portfolio"
            rows={groupCounts(records, (p) => p.developer).map((r) => ({
              name: r.name,
              value: totalCapacity(
                records.filter((p) => p.developer === r.name),
              ),
            }))}
            unit="MW"
          />
        </div>
      )}
      <Panel
        title={
          compact ? "Project directory preview" : "Project development overview"
        }
        sub={`${records.length} matching projects · all figures use the same filtered register`}
        action={
          <div className="row-actions">
            <select
              aria-label="Sort projects"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="name">Name A–Z</option>
              <option value="capacity">Capacity high–low</option>
              <option value="cod">COD</option>
            </select>
            <Export rows={records} name="ippan-filtered-projects" />
          </div>
        }
      >
        <Table
          headers={[
            "Project / developer",
            "Location",
            "Capacity (MW)",
            "Status",
            "COD",
            "",
          ]}
        >
          {(compact ? records.slice(0, 4) : records).map((p) => (
            <tr key={p.id}>
              <td>
                <strong>{p.name}</strong>
                <small>{p.developer}</small>
              </td>
              <td>
                {p.province}
                <small>{p.district}</small>
              </td>
              <td>{p.capacity.toLocaleString()} MW</td>
              <td>
                <Badge>{p.status}</Badge>
              </td>
              <td>{p.cod}</td>
              <td>
                <Link className="text-link" href={"/hydropower/" + p.id}>
                  View project <ArrowUpRight size={15} />
                </Link>
              </td>
            </tr>
          ))}
        </Table>
        {!records.length && <Empty />}
      </Panel>
    </div>
  );
}
export function MembershipAnalytics() {
  const { data } = usePlatform();
  return (
    <div className="analytics-grid">
      <DataChart
        title="Membership categories"
        rows={groupCounts(data.members, (m) => m.category)}
        type="donut"
      />
      <DataChart
        title="Membership status"
        rows={[
          {
            name: "Active",
            value: data.members.filter((m) => isActive(m)).length,
          },
          {
            name: "Expired",
            value: data.members.filter((m) => !isActive(m)).length,
          },
        ]}
        type="donut"
      />
      <DataChart
        title="Members by province"
        rows={groupCounts(data.members, (m) => m.province)}
      />
      <DataChart
        title="New membership records"
        rows={monthlyRecords(data.members, []).map((r) => ({
          name: r.name,
          value: r.Members,
        }))}
        type="line"
        sub="Recorded joining dates · monthly count"
      />
    </div>
  );
}
export function OperationalOverview() {
  const { data } = usePlatform();
  const today = new Date().toISOString().slice(0, 10);
  const cutoff = new Date(Date.now() + 90 * 86400000)
    .toISOString()
    .slice(0, 10);
  const active = data.members.filter((m) => isActive(m));
  const expiring = active.filter((m) => m.expiry <= cutoff);
  const payments = data.payments.filter(
    (p) => p.status === "Simulated successful",
  );
  const pending = data.applications.filter(
    (a) => a.status === "Pending" || a.status === "Correction requested",
  );
  const review = [...data.news, ...data.publications, ...data.resources].filter(
    (c) => c.status === "In review",
  );
  const months = monthlyRecords(data.members, data.payments);
  return (
    <>
      <div className="workspace-title">
        <div>
          <div className="welcome-eyebrow">IPPAN OPERATIONS</div>
          <h1>Your institution, connected.</h1>
          <p>
            Membership, publishing and the work that moves Nepal’s energy
            community forward.
          </p>
        </div>
        <Export rows={data.members} name="ippan-overview-members" />
      </div>
      <div className="dataset-note">
        Live from shared demonstration records · recorded dates only · payments
        are simulated
      </div>
      <div className="data-kpis">
        {[
          ["Total members", data.members.length],
          ["Active memberships", active.length],
          ["Pending applications", pending.length],
          ["Expiring in 90 days", expiring.length],
          [
            "Demo collections",
            money(payments.reduce((n, p) => n + p.amount, 0)),
          ],
        ].map(([n, v]) => (
          <div key={n}>
            <span>{n}</span>
            <strong>{v}</strong>
          </div>
        ))}
      </div>
      <div className="analytics-grid overview-trends">
        <DataChart
          title="Membership growth"
          rows={months.map((r) => ({ name: r.name, value: r.Total }))}
          type="line"
          sub="Cumulative memberships by recorded joining date"
        />
        <DataChart
          title="Monthly membership collection"
          rows={months.map((r) => ({ name: r.name, value: r.Collections }))}
          unit="NPR"
          sub="Successful demonstration payments · transaction dates"
        />
        <DataChart
          title="Application status"
          rows={groupCounts(data.applications, (a) => a.status)}
          type="donut"
        />
      </div>
      <div className="operations-grid">
        <Panel
          title="Applications requiring attention"
          action={
            <Link href="/admin/members" className="text-link">
              Review queue →
            </Link>
          }
        >
          {pending.length ? (
            pending.slice(0, 4).map((a) => (
              <Link className="queue-row" href="/admin/members" key={a.id}>
                <div>
                  <strong>{a.name}</strong>
                  <small>{a.id}</small>
                </div>
                <Badge>{a.status}</Badge>
              </Link>
            ))
          ) : (
            <Empty text="All applications are up to date." />
          )}
        </Panel>
        <Panel
          title="Recent payments"
          action={
            <Link className="text-link" href="/admin/finance">
              Finance →
            </Link>
          }
        >
          {data.payments.slice(0, 4).map((p) => (
            <Link className="queue-row" href="/admin/finance" key={p.id}>
              <div>
                <strong>{money(p.amount)}</strong>
                <small>{p.purpose}</small>
              </div>
              <Badge>{p.status}</Badge>
            </Link>
          ))}
        </Panel>
        <Panel
          title="Upcoming renewals"
          action={
            <Link className="text-link" href="/admin/renewals">
              Renewals →
            </Link>
          }
        >
          {expiring.length ? (
            expiring.slice(0, 4).map((m) => (
              <div className="queue-row" key={m.id}>
                <strong>{m.name}</strong>
                <small>{m.expiry}</small>
              </div>
            ))
          ) : (
            <Empty text="No memberships expire in the next 90 days." />
          )}
        </Panel>
        <Panel
          title="Content awaiting approval"
          action={
            <Link className="text-link" href="/admin/content">
              Editorial desk →
            </Link>
          }
        >
          {review.length ? (
            review.slice(0, 4).map((c) => (
              <Link className="queue-row" href="/admin/content" key={c.id}>
                <strong>{c.title}</strong>
                <Badge>{c.status}</Badge>
              </Link>
            ))
          ) : (
            <Empty text="No content awaiting approval." />
          )}
        </Panel>
      </div>
      <div className="operations-grid">
        <Panel
          title="Events & registrations"
          action={
            <Link className="text-link" href="/admin/events">
              Manage events →
            </Link>
          }
        >
          {data.events
            .filter((e) => e.status === "Published" && e.date >= today)
            .slice(0, 3)
            .map((e) => (
              <div className="queue-row" key={e.id}>
                <div>
                  <strong>{e.title}</strong>
                  <small>
                    {e.date} · {e.location}
                  </small>
                </div>
                <Badge>
                  {data.registrations.filter((r) => r.eventId === e.id).length +
                    " registered"}
                </Badge>
              </div>
            ))}
        </Panel>
        <Panel
          title="Secretariat tasks"
          action={
            <Link className="text-link" href="/admin/meetings">
              Meetings →
            </Link>
          }
        >
          {data.tasks
            .filter((t) => t.status !== "Completed")
            .slice(0, 4)
            .map((t) => (
              <div className="queue-row" key={t.id}>
                <div>
                  <strong>{t.title}</strong>
                  <small>
                    {t.assignee} · due {t.due}
                  </small>
                </div>
                <Badge>{t.due < today ? "Overdue" : t.status}</Badge>
              </div>
            ))}
          {!data.tasks.some((t) => t.status !== "Completed") && (
            <Empty text="No pending decisions." />
          )}
        </Panel>
      </div>
      <Panel title="Recent administrative activity">
        <Table headers={["When", "Staff", "Action", "Record"]}>
          {data.audit.slice(0, 5).map((a) => (
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
      <Panel title="Quick actions">
        <div className="operations-actions">
          {[
            ["Add member", "/admin/members"],
            ["Review applications", "/admin/members"],
            ["Create news / notice", "/admin/content"],
            ["Add hydropower project", "/admin/projects"],
            ["Create event", "/admin/events"],
            ["Register correspondence", "/admin/secretariat"],
            ["Manage homepage", "/admin/website"],
          ].map(([n, url]) => (
            <Link className="button" href={url} key={n}>
              {n}
              <ArrowUpRight size={16} />
            </Link>
          ))}
        </div>
      </Panel>
    </>
  );
}
