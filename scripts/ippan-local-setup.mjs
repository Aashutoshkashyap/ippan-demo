import fs from "node:fs";
import { randomBytes } from "node:crypto";
if (!fs.existsSync(".env.local")) {
  const password = randomBytes(15).toString("base64url");
  fs.writeFileSync(
    ".env.local",
    `IPPAN_LOCAL_DEMO=1\nIPPAN_DEMO_PASSWORD=${password}\n`,
    { mode: 0o600 },
  );
  console.log(
    "Local IPPAN demo configured. Demo password is stored in .env.local (not committed).",
  );
}
