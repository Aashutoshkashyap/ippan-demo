import { config } from "dotenv";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { PDFDocument } from "pdf-lib";
config({ path: ".env.local", quiet: true });
const base = process.env.IPPAN_TEST_URL || "http://127.0.0.1:3000";
const password = process.env.IPPAN_DEMO_PASSWORD;
const suffix = randomBytes(4).toString("hex");
const email = `qa-${suffix}@example.test`;
let assertions = 0;
function ok(value, message) {
  assert.ok(value, message);
  assertions++;
  console.log("PASS:", message);
}
async function request(path, { method = "GET", cookie, data, origin } = {}) {
  const r = await fetch(base + path, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...(origin ? { Origin: origin } : {}),
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });
  const body = r.headers.get("content-type")?.includes("application/json")
    ? await r.json()
    : new Uint8Array(await r.arrayBuffer());
  return {
    status: r.status,
    body,
    cookie: r.headers.get("set-cookie")?.split(";")[0],
    headers: r.headers,
  };
}
async function action(action, data, cookie) {
  return request("/api/ippan/actions", {
    method: "POST",
    cookie,
    data: { action, data },
  });
}
async function login(email) {
  const r = await request("/api/ippan/auth", {
    method: "POST",
    data: { email, password },
  });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  return r.cookie;
}
const publicData = await request("/api/ippan/state");
ok(
  publicData.body.storage === "Neon PostgreSQL",
  "Live dedicated Neon persistence",
);
ok(
  publicData.body.applications.length === 0 &&
    publicData.body.payments.length === 0 &&
    !publicData.body.sessions,
  "Anonymous snapshot excludes private records",
);
const csrf = await request("/api/ippan/actions", {
  method: "POST",
  origin: "https://untrusted.example",
  data: { action: "renew", data: {} },
});
ok(csrf.status === 403, "Cross-origin mutation rejected");
const unauth = await action("visibility", { memberId: "M001", visible: false });
ok(unauth.status === 401, "Anonymous administration rejected");
const pdf = await PDFDocument.create();
pdf.addPage();
const doc = Buffer.from(await pdf.save()).toString("base64");
const app = await action("apply", {
  name: `QA River Energy ${suffix}`,
  email,
  category: "Corporate",
  province: "Koshi",
  district: "Taplejung",
  capacity: 16,
  password,
  documents: [{ name: "qa-company-registration.pdf", data: doc }],
});
ok(
  app.status === 200 && app.body.result.reference,
  "Application with PDF accepted",
);
const { reference, tracking } = app.body.result;
const tracked = await action("track", { reference, token: tracking });
ok(
  tracked.body.result.status === "Pending",
  "Private application tracking reports Pending",
);
const admin = await login("admin@ippan.demo");
const adminState = await request("/api/ippan/state", { cookie: admin });
ok(
  adminState.body.applications.some((a) => a.id === reference),
  "Application appears in admin review queue",
);
const uploaded = await request(
  `/api/ippan/documents/${reference}?attachment=0`,
  { cookie: admin },
);
ok(
  uploaded.status === 200 && uploaded.body[0] === 37,
  "Private supporting PDF can be reviewed by administrator",
);
const approved = await action(
  "review",
  {
    applicationId: reference,
    status: "Approved",
    note: "QA verification: sample document reviewed",
  },
  admin,
);
ok(approved.status === 200, "Administrator approves application");
const trackedApproved = await action("track", { reference, token: tracking });
ok(
  trackedApproved.body.result.status === "Approved",
  "Applicant sees approved status",
);
const member = await login(email);
const memberState = await request("/api/ippan/state", { cookie: member });
const memberId = memberState.body.viewer.memberId;
ok(
  memberState.body.members.some(
    (m) => m.id === memberId && m.status === "Active",
  ),
  "Approved applicant has active portal membership",
);
const certificate = await request("/api/ippan/documents/" + memberId, {
  cookie: member,
});
ok(
  certificate.status === 200 &&
    certificate.headers.get("content-type") === "application/pdf",
  "Active membership certificate generates PDF",
);
const publicCertificate = await request("/api/ippan/documents/" + memberId);
ok(
  publicCertificate.status === 401,
  "Membership certificate protected from anonymous access",
);
const renewal = await action("renew", {}, member);
const paymentId = renewal.body.result.id;
ok(renewal.status === 200, "Renewal generates linked invoice");
const outcomes = await Promise.all([
  action(
    "simulate-payment",
    { paymentId, outcome: "Simulated successful" },
    member,
  ),
  action(
    "simulate-payment",
    { paymentId, outcome: "Simulated successful" },
    member,
  ),
]);
ok(
  outcomes.filter((x) => x.status === 200).length === 1 &&
    outcomes.filter((x) => x.status === 400).length === 1,
  "Concurrent payment replay extends membership only once",
);
const receipt = await request("/api/ippan/documents/" + paymentId, {
  cookie: member,
});
ok(
  receipt.status === 200 && receipt.body[0] === 37,
  "Simulated payment receipt generates PDF",
);
ok(
  (await action("reconcile", { paymentId }, admin)).status === 200,
  "Finance reconciliation saved",
);
const event = await action(
  "save-event",
  {
    title: `QA Energy Forum ${suffix}`,
    date: "2027-03-15T10:00",
    location: "Kathmandu (demo)",
    description: "QA event for connected registration verification",
    price: 1500,
    status: "Published",
  },
  admin,
);
const eventId = event.body.result.id;
ok(event.status === 200, "Administrator publishes event");
const registration = await action(
  "register",
  { eventId, name: "QA Participant", email, simulate: true },
  member,
);
ok(
  registration.status === 200,
  "Member registers with simulated event payment",
);
const regId = registration.body.result.id;
ok(
  (await request("/api/ippan/documents/" + regId, { cookie: member }))
    .status === 200,
  "QR event pass generates PDF",
);
ok(
  (await action("attendance", { registrationId: regId }, admin)).status === 200,
  "Attendance check-in saved",
);
const article = {
  kind: "news",
  title: `QA sector update ${suffix}`,
  category: "QA sample",
  description: "Connected content publishing verification",
  body: "This is an automated QA demo content record.",
  access: "Public",
  featured: false,
  status: "Draft",
};
const draft = await action("save-content", article, admin);
const contentId = draft.body.result.id;
const publicDraft = await request("/api/ippan/state");
ok(
  !publicDraft.body.news.some((n) => n.id === contentId),
  "Draft content remains private",
);
ok(
  (
    await action(
      "save-content",
      { ...article, id: contentId, status: "Published" },
      admin,
    )
  ).status === 200,
  "Administrator publishes draft",
);
const publicPublished = await request("/api/ippan/state");
ok(
  publicPublished.body.news.some((n) => n.id === contentId),
  "Published CMS content appears in public API",
);
const proxy = await action(
  "proxy",
  { representative: "QA Proxy Representative" },
  member,
);
ok(proxy.status === 200, "Eligible member submits proxy");
ok(
  (
    await action(
      "review-proxy",
      { proxyId: proxy.body.result.id, status: "Approved" },
      admin,
    )
  ).status === 200,
  "Administrator approves proxy",
);
const ballot = await action(
  "save-ballot",
  {
    title: `QA controlled resolution ${suffix}`,
    options: ["In favour", "Against"],
    opens: new Date(Date.now() - 3600000).toISOString(),
    closes: new Date(Date.now() + 86400000).toISOString(),
  },
  admin,
);
const ballotId = ballot.body.result.id;
ok(ballot.status === 200, "Administrator creates draft ballot");
await action("ballot-status", { ballotId, status: "Open" }, admin);
ok(
  (await action("vote", { ballotId, option: "In favour" }, member)).status ===
    200,
  "Eligible member casts controlled demo vote",
);
ok(
  (await action("vote", { ballotId, option: "Against" }, member)).status ===
    400,
  "Duplicate membership vote rejected",
);
ok(
  (await action("ballot-status", { ballotId, status: "Closed" }, admin))
    .status === 200,
  "Administrator closes voting",
);
const letter = await action(
  "correspondence",
  {
    direction: "Incoming",
    subject: `QA consultation ${suffix}`,
    sender: "QA demo stakeholder",
    assignee: "Secretariat",
  },
  admin,
);
ok(
  letter.status === 200 && letter.body.result.id.startsWith("DAR-"),
  "Incoming correspondence gets a unique reference",
);
ok(
  (
    await action(
      "task",
      {
        title: `QA follow-up ${suffix}`,
        assignee: "Secretariat",
        due: "2026-12-15",
        meeting: "QA coordination meeting",
      },
      admin,
    )
  ).status === 200,
  "Meeting decision becomes assigned task",
);
const finance = await login("finance@ippan.demo");
ok(
  (await action("save-content", article, finance)).status === 403,
  "Finance role cannot publish content",
);
const final = await request("/api/ippan/state", { cookie: admin });
ok(
  final.body.audit.some((a) => a.detail === reference),
  "Sensitive review action appears in audit trail",
);
await action(
  "save-content",
  { ...article, id: contentId, status: "Archived" },
  admin,
);
console.log(
  `Integration complete: ${assertions} assertions passed. QA records use suffix ${suffix}. No external financial or messaging services were called.`,
);
