import type { Project, Member, Payment } from "./model";
export type ProjectFilters = {
  query?: string;
  province?: string;
  district?: string;
  status?: string;
  min?: number;
  max?: number;
};
export const projectStatuses = [
  "Operational",
  "Under construction",
  "Construction not started",
  "Survey",
];
export const totalCapacity = (projects: Project[]) =>
  Math.round(projects.reduce((n, p) => n + p.capacity, 0) * 100) / 100;
export function filterProjects(projects: Project[], f: ProjectFilters) {
  const ids = new Set<string>();
  return projects.filter((p) => {
    if (ids.has(p.id)) return false;
    ids.add(p.id);
    return (
      (!f.query ||
        `${p.name} ${p.developer} ${p.river} ${p.district}`
          .toLowerCase()
          .includes(f.query.toLowerCase())) &&
      (!f.province || p.province === f.province) &&
      (!f.district || p.district === f.district) &&
      (!f.status || p.status === f.status) &&
      (f.min === undefined || p.capacity >= f.min) &&
      (f.max === undefined || p.capacity <= f.max)
    );
  });
}
export function groupCounts<T>(rows: T[], get: (r: T) => string) {
  const groups = new Map<string, number>();
  rows.forEach((r) => groups.set(get(r), (groups.get(get(r)) || 0) + 1));
  return Array.from(groups, ([name, value]) => ({ name, value }));
}
export function projectAggregates(projects: Project[]) {
  const rows = filterProjects(projects, {});
  const statuses = projectStatuses.map((name) => ({
    name,
    value: rows.filter((p) => p.status === name).length,
    capacity: totalCapacity(rows.filter((p) => p.status === name)),
  }));
  const locations = groupCounts(rows, (p) => p.province).map((r) => ({
    ...r,
    capacity: totalCapacity(rows.filter((p) => p.province === r.name)),
  }));
  const ranges = [
    { name: "Below 10 MW", min: 0, max: 10 },
    { name: "10–25 MW", min: 10, max: 25 },
    { name: "25–100 MW", min: 25, max: 100 },
    { name: "100 MW+", min: 100, max: Infinity },
  ].map((r) => ({
    name: r.name,
    value: rows.filter((p) => p.capacity >= r.min && p.capacity < r.max).length,
  }));
  return {
    statuses,
    locations,
    ranges,
    capacity: totalCapacity(rows),
    total: rows.length,
  };
}
export function monthlyRecords(
  members: Member[],
  payments: Payment[],
  months = 6,
  until = new Date(),
) {
  return Array.from({ length: months }, (_, i) => {
    const from = new Date(
      Date.UTC(until.getUTCFullYear(), until.getUTCMonth() - months + 1 + i, 1),
    );
    const end = new Date(
      Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 1),
    );
    const key = from.toISOString().slice(0, 7);
    return {
      name: from.toLocaleDateString("en-GB", {
        month: "short",
        year: "2-digit",
        timeZone: "UTC",
      }),
      Members: members.filter((m) => m.joined.slice(0, 7) === key).length,
      Total: members.filter((m) => m.joined < end.toISOString().slice(0, 10))
        .length,
      Collections: payments
        .filter(
          (p) =>
            p.status === "Simulated successful" && p.date.slice(0, 7) === key,
        )
        .reduce((n, p) => n + p.amount, 0),
    };
  });
}
export const isActive = (
  m: Member,
  asOf = new Date().toISOString().slice(0, 10),
) => m.status === "Active" && m.expiry >= asOf;
