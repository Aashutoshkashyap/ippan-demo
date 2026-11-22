import { describe, it, expect } from "vitest";
import {
  filterProjects,
  projectAggregates,
  monthlyRecords,
} from "./analytics-data";
import { seed } from "./server/seed";
process.env.IPPAN_DEMO_PASSWORD = "test-only-password-2026";
describe("shared project analytics", () => {
  it("deduplicates before filtering and uses the same population for every total", () => {
    const s = seed();
    const rows = filterProjects([...s.projects, s.projects[0]], {
      province: s.projects[0].province,
      min: 0,
    });
    const a = projectAggregates(rows);
    expect(a.total).toBe(rows.length);
    expect(a.statuses.reduce((n, r) => n + r.value, 0)).toBe(rows.length);
    expect(a.locations.reduce((n, r) => n + r.capacity, 0)).toBeCloseTo(
      a.capacity,
      3,
    );
    expect(a.ranges.reduce((n, r) => n + r.value, 0)).toBe(rows.length);
    expect(new Set(rows.map((r) => r.id)).size).toBe(rows.length);
  });
  it("combines district, stage, capacity and keyword filters without leaking unrelated records", () => {
    const p = seed().projects[0];
    expect(
      filterProjects(seed().projects, {
        query: p.developer,
        province: p.province,
        district: p.district,
        status: p.status,
        min: p.capacity,
        max: p.capacity,
      }),
    ).toContainEqual(p);
    expect(filterProjects(seed().projects, { min: 9000 })).toEqual([]);
  });
  it("treats capacity boundaries as disjoint ranges", () => {
    const p = seed().projects[0];
    const a = projectAggregates(
      [0.5, 10, 25, 100].map((capacity, i) => ({
        ...p,
        id: String(i),
        capacity,
      })),
    );
    expect(a.ranges.map((r) => r.value)).toEqual([1, 1, 1, 1]);
  });
  it("uses recorded joining and payment dates instead of proportional invented trends", () => {
    const s = seed();
    const m = { ...s.members[0], joined: "2026-10-15" };
    const p = {
      ...s.payments[0],
      date: "2026-11-01",
      amount: 100,
      status: "Simulated successful" as const,
    };
    const rows = monthlyRecords([m], [p], 3, new Date("2026-11-22"));
    expect(rows.map((r) => r.Members)).toEqual([0, 1, 0]);
    expect(rows.map((r) => r.Total)).toEqual([0, 1, 1]);
    expect(rows.map((r) => r.Collections)).toEqual([0, 0, 100]);
  });
});
import { parseCsv, projectImportRows } from "./import-data";
describe("project spreadsheet normalization", () => {
  it("handles quoted commas, escaped quotes and line breaks", () => {
    expect(
      parseCsv('name,developer\n"River, One","A ""Hydro"" Company"\n'),
    ).toEqual([
      ["name", "developer"],
      ["River, One", 'A "Hydro" Company'],
    ]);
    expect(() => parseCsv('name\n"bad')).toThrow("not closed");
  });
  it("requires complete, unambiguous project headers", () => {
    expect(() =>
      projectImportRows([
        ["name", "name"],
        ["A", "B"],
      ]),
    ).toThrow("headers");
  });
});
