import { config } from "dotenv";
import { readFileSync } from "node:fs";
config({ path: ".env.local", quiet: true });
if (!process.env.IPPAN_DEMO_PASSWORD)
  throw new Error("Run npm run dev once or configure IPPAN_DEMO_PASSWORD.");
console.log("Admin: admin@ippan.demo");
console.log("Member: member@ippan.demo");
console.log("Demo password (local only):", process.env.IPPAN_DEMO_PASSWORD);
