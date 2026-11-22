import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
const base = process.env.IPPAN_TEST_URL || "http://127.0.0.1:3000";
const login = await fetch(base + "/api/ippan/auth", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "admin@ippan.demo",
    password: process.env.IPPAN_DEMO_PASSWORD,
  }),
});
if (!login.ok) throw new Error("Demo admin sign-in failed.");
const cookie = login.headers.get("set-cookie").split(";")[0];
const s = await (
  await fetch(base + "/api/ippan/state", { headers: { Cookie: cookie } })
).json();
async function act(action, data) {
  const r = await fetch(base + "/api/ippan/actions", {
    method: "POST",
    headers: { Cookie: cookie, "Content-Type": "application/json" },
    body: JSON.stringify({ action, data }),
  });
  if (!r.ok) throw new Error("Could not hide QA record.");
}
let count = 0;
for (const c of s.news.filter(
  (c) => c.title.startsWith("QA ") && c.status !== "Archived",
)) {
  await act("save-content", { ...c, kind: "news", status: "Archived" });
  count++;
}
for (const e of s.events.filter(
  (e) => e.title.startsWith("QA ") && e.status !== "Draft",
)) {
  await act("save-event", { ...e, status: "Draft" });
  count++;
}
for (const m of s.members.filter(
  (m) => m.name.startsWith("QA ") && m.visible,
)) {
  await act("visibility", { memberId: m.id, visible: false });
  count++;
}
console.log(
  `${count} QA sample records hidden from public pages. All records and audit history retained.`,
);
