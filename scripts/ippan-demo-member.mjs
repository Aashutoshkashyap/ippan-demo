import { config } from "dotenv";
import { PDFDocument, StandardFonts } from "pdf-lib";
config({ path: ".env.local", quiet: true });
const base = process.env.IPPAN_TEST_URL || "http://127.0.0.1:3000";
if (
  !/^https:\/\/ippan-demo\.vercel\.app$|^http:\/\/(127\.0\.0\.1|localhost):3000$/.test(
    base,
  )
)
  throw new Error("Use the dedicated IPPAN deployment or localhost.");
const password = process.env.IPPAN_DEMO_PASSWORD;
if (!password) throw new Error("Set the existing IPPAN demo password.");
async function request(path, data, cookie) {
  const r = await fetch(base + path, {
    method: data ? "POST" : "GET",
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });
  const body = await r.json();
  if (!r.ok) throw new Error(body.error || "Request failed");
  return { body, cookie: r.headers.get("set-cookie")?.split(";")[0] };
}
const login = await request("/api/ippan/auth", {
  email: "admin@ippan.demo",
  password,
});
const action = async (action, data, cookie = login.cookie) =>
  (await request("/api/ippan/actions", { action, data }, cookie)).body.result;
const state = async () =>
  (await request("/api/ippan/state", undefined, login.cookie)).body;
const email = "demo.member@ippan.demo";
let data = await state();
let member = data.members.find((m) => m.email === email);
if (!member) {
  let application = data.applications.find(
    (a) => a.email === email && a.status !== "Rejected",
  );
  if (!application) {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    page.drawText("IPPAN EVALUATION - FICTIONAL COMPANY", {
      x: 45,
      y: 770,
      size: 17,
      font,
    });
    page.drawText(
      "Demo River Energy Pvt. Ltd. - sample application attachment.",
      { x: 45, y: 735, size: 12, font },
    );
    page.drawText(
      "This is not a company registration certificate or official document.",
      { x: 45, y: 710, size: 11, font },
    );
    const result = await action(
      "apply",
      {
        name: "Demo River Energy Pvt. Ltd. (Sample)",
        email,
        category: "Corporate",
        province: "Bagmati",
        district: "Rasuwa",
        capacity: 12.5,
        password,
        documents: [
          {
            name: "sample-company-profile.pdf",
            data: Buffer.from(await pdf.save()).toString("base64"),
          },
        ],
      },
      undefined,
    );
    application = { id: result.reference };
  }
  await action("review", {
    applicationId: application.id,
    status: "Approved",
    note: "Fictional member approved for the requested platform demonstration; no real-world identity verification is represented.",
  });
  data = await state();
  member = data.members.find((m) => m.email === email);
}
if (!member) throw new Error("Demonstration member was not created.");
await action("save-member", {
  ...member,
  contact: "Demo Member Representative",
  description:
    "Fictional corporate profile for evaluating the IPPAN integrated platform. Based in Rasuwa, Bagmati, this sample company has a 12.5 MW survey-stage project with illustrative coordinates. Explore membership validity, invoices, certificate downloads, event registration and private member resources. No company, licence or operating capacity is claimed as verified official information.",
  visible: true,
});
let project = data.projects.find(
  (p) => p.memberId === member.id && p.name.startsWith("Demo River"),
);
if (!project)
  project = await action("save-project", {
    name: "Demo River Hydropower (Sample)",
    developer: member.name,
    memberId: member.id,
    province: "Bagmati",
    district: "Rasuwa",
    municipality: "Illustrative project location",
    capacity: 12.5,
    river: "Demo Khola (illustrative)",
    status: "Survey",
    lat: 28.05,
    lng: 85.3,
    licence: "DEMO-ONLY - no official generation licence",
    surveyLicence: "DEMO-SURVEY - illustrative reference",
    cod: "Not commissioned - demonstration",
    contact: "Use the IPPAN demo member portal",
  });
data = await state();
project = data.projects.find(
  (p) => p.memberId === member.id && p.name.startsWith("Demo River"),
);
const memberLogin = await request("/api/ippan/auth", { email, password });
const memberData = (
  await request("/api/ippan/state", undefined, memberLogin.cookie)
).body;
if (memberData.viewer?.memberId !== member.id)
  throw new Error("Member portal is not linked correctly.");
const free = data.events.find(
  (e) =>
    e.status === "Published" &&
    e.date >= new Date().toISOString().slice(0, 10) &&
    (e.ticketTypes?.some((t) => t.price === 0) ||
      (!e.ticketTypes?.length && e.price === 0)),
);
if (free && !memberData.registrations.some((r) => r.eventId === free.id)) {
  const ticket = free.ticketTypes?.find((t) => t.price === 0);
  await action(
    "register",
    {
      eventId: free.id,
      name: "Demo Member Representative",
      email,
      simulate: false,
      ...(ticket ? { ticketType: ticket.name } : {}),
    },
    memberLogin.cookie,
  );
}
console.log(
  JSON.stringify(
    {
      email,
      memberId: member.id,
      publicProfile: "https://ippan-demo.vercel.app/members/" + member.id,
      projectId: project.id,
      portal: "https://ippan-demo.vercel.app/portal",
      message:
        "Use the existing private IPPAN demo password. No real payment or external delivery was performed.",
    },
    null,
    2,
  ),
);
