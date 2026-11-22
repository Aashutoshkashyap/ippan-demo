import { upgradeState } from "../extensions-model";
import { Pool } from "pg";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import { State } from "../model";
import { seed } from "./seed";
let pool: Pool | undefined;
export function storageMode(): "Neon PostgreSQL" | "Local demo file" {
  return process.env.IPPAN_DATABASE_URL ? "Neon PostgreSQL" : "Local demo file";
}
export function getIppanPool() {
  const url = process.env.IPPAN_DATABASE_URL;
  if (!url) throw new Error("IPPAN_DATABASE_URL is not configured");
  const parsed = new URL(url);
  if (
    !["postgres:", "postgresql:"].includes(parsed.protocol) ||
    !parsed.hostname.endsWith(".neon.tech")
  )
    throw new Error("IPPAN_DATABASE_URL must be a Neon PostgreSQL connection");
  if (/ep-polished-flower|ep-wispy-credit/.test(parsed.hostname))
    throw new Error("MeroTalent database endpoints are prohibited");
  parsed.searchParams.set("sslmode", "verify-full");
  if (!pool) {
    pool = new Pool({
      connectionString: parsed.toString(),
      max: 3,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      allowExitOnIdle: true,
    });
    pool.on("error", () =>
      console.error("IPPAN idle database connection closed"),
    );
  }
  return pool;
}
let localQueue: Promise<unknown> = Promise.resolve();
export async function readState(): Promise<State> {
  if (process.env.IPPAN_DATABASE_URL) {
    const result = await getIppanPool().query<{
      data: State;
      editions: State["cmsRevisions"];
    }>(
      "SELECT p.data, coalesce(e.data, '[]'::jsonb) AS editions FROM ippan_demo.platform_state p LEFT JOIN ippan_demo.editorial_state e ON e.id=p.id WHERE p.id=1",
    );
    if (result.rows[0])
      return upgradeState({
        ...result.rows[0].data,
        cmsRevisions: result.rows[0].editions,
      });
  }
  return transaction((s) => structuredClone(s));
}
export async function transaction<T>(
  fn: (state: State) => T | Promise<T>,
): Promise<T> {
  if (process.env.IPPAN_DATABASE_URL) {
    const client = await getIppanPool().connect();
    try {
      await client.query("BEGIN");
      const result = await client.query<{ data: State }>(
        "SELECT data FROM ippan_demo.platform_state WHERE id=1 FOR UPDATE",
      );
      if (!result.rows[0]) {
        await client.query(
          "INSERT INTO ippan_demo.platform_state (id,data) VALUES (1,$1) ON CONFLICT DO NOTHING",
          [JSON.stringify(seed())],
        );
      }
      const data =
        result.rows[0]?.data ||
        (
          await client.query<{ data: State }>(
            "SELECT data FROM ippan_demo.platform_state WHERE id=1 FOR UPDATE",
          )
        ).rows[0].data;
      upgradeState(data);
      const editorial = await client.query<{ data: State["cmsRevisions"] }>(
        "SELECT data FROM ippan_demo.editorial_state WHERE id=1",
      );
      data.cmsRevisions = editorial.rows[0]?.data || [];
      const value = await fn(data);
      const { cmsRevisions, ...operational } = data;
      await client.query(
        "UPDATE ippan_demo.platform_state SET data=$1, updated_at=now() WHERE id=1",
        [JSON.stringify(operational)],
      );
      await client.query(
        "INSERT INTO ippan_demo.editorial_state (id,data) VALUES (1,$1) ON CONFLICT (id) DO UPDATE SET data=excluded.data, updated_at=now()",
        [JSON.stringify(cmsRevisions || [])],
      );
      await client.query("COMMIT");
      return value;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }
  if (
    process.env.IPPAN_LOCAL_DEMO !== "1" ||
    process.env.NODE_ENV === "production"
  )
    throw new Error(
      "Configure the dedicated IPPAN Neon database. Local fallback is disabled.",
    );
  const run = localQueue.then(async () => {
    const dir = path.join(process.cwd(), ".ippan-data");
    await mkdir(dir, { recursive: true, mode: 0o700 });
    let data: State;
    try {
      data = JSON.parse(await readFile(path.join(dir, "state.json"), "utf8"));
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
      data = seed();
    }
    upgradeState(data);
    const value = await fn(data);
    await writeFile(path.join(dir, "state.tmp"), JSON.stringify(data), {
      mode: 0o600,
    });
    await rename(path.join(dir, "state.tmp"), path.join(dir, "state.json"));
    return value;
  });
  localQueue = run.catch(() => {});
  return run;
}
