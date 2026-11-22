import { config } from "dotenv";
import { Pool } from "pg";
import fs from "node:fs/promises";
config({ path: ".env.local", quiet: true });
const target = process.env.IPPAN_DATABASE_URL;
if (!target) throw new Error("Set the dedicated IPPAN_DATABASE_URL first.");
const url = new URL(target);
if (
  !url.hostname.endsWith(".neon.tech") ||
  /ep-polished-flower|ep-wispy-credit/.test(url.hostname)
)
  throw new Error("Refusing a non-Neon or legacy MeroTalent database.");
const pool = new Pool({ connectionString: target, max: 1 });
try {
  const db = await pool.query("SELECT current_database() AS database");
  const sql = await fs.readFile("db/ippan/202611210001_foundation.sql", "utf8");
  await pool.query(sql);
  console.log(
    "IPPAN namespace migration applied to dedicated Neon database:",
    db.rows[0].database,
  );
} finally {
  await pool.end();
}
