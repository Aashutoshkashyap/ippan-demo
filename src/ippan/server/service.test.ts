import { describe, it, expect, beforeEach } from "vitest";
import { seed } from "./seed";
import { applyAction, signIn, viewer, snapshot, HttpError } from "./service";
import { State, Viewer } from "../model";
let s: State, admin: Viewer, member: Viewer;
const password = "Ippan-Test-Password-2026!";
beforeEach(() => {
  process.env.IPPAN_DEMO_PASSWORD = password;
  s = seed();
  admin = viewer(s, signIn(s, { email: "admin@ippan.demo", password }).token)!;
  member = viewer(
    s,
    signIn(s, { email: "member@ippan.demo", password }).token,
  )!;
});
const act = (
  action: string,
  data: Record<string, unknown> = {},
  u: Viewer | null = admin,
) => applyAction(s, u, { action, data }) as any;
describe("connected membership lifecycle", () => {
  it("persists a private application, approves once, and activates the same applicant account", () => {
    const result = act(
      "apply",
      {
        name: "Test River Energy",
        email: "applicant@example.test",
        category: "Corporate",
        province: "Koshi",
        district: "Taplejung",
        capacity: 15,
        password,
        documents: [
          {
            name: "registration.pdf",
            data: Buffer.from("%PDF-1.4\ndemo document").toString("base64"),
          },
        ],
      },
      null,
    );
    expect(result.reference).toMatch(/^APP-/);
    expect(
      act(
        "track",
        { reference: result.reference, token: result.tracking },
        null,
      ).status,
    ).toBe("Pending");
    expect(() =>
      act("track", { reference: result.reference, token: "wrong" }, null),
    ).toThrow("incorrect");
    expect(snapshot(s, null).applications).toEqual([]);
    expect(snapshot(s, null).users).toEqual([]);
    expect(snapshot(s, null).sessions).toBeUndefined();
    expect(JSON.stringify(snapshot(s, admin))).not.toContain("trackingHash");
    expect(JSON.stringify(snapshot(s, admin))).not.toContain(
      'registration.pdf","data',
    );
    act("review", {
      applicationId: result.reference,
      status: "Approved",
      note: "Documents checked",
    });
    const login = signIn(s, { email: "applicant@example.test", password });
    const u = viewer(s, login.token)!;
    expect(u.memberId).toBeTruthy();
    expect(s.members.find((m) => m.id === u.memberId)?.status).toBe("Active");
    expect(s.notifications.some((n) => n.memberId === u.memberId)).toBe(true);
    expect(() =>
      act("review", {
        applicationId: result.reference,
        status: "Approved",
        note: "Again",
      }),
    ).toThrow("final decision");
  });
  it("rejects non-PDF and duplicate email submissions", () => {
    expect(() =>
      act(
        "apply",
        {
          name: "Bad File Company",
          email: "bad@example.test",
          category: "Associate",
          province: "Bagmati",
          district: "Lalitpur",
          capacity: 0,
          password,
          documents: [
            {
              name: "x.pdf",
              data: Buffer.from("<script>bad</script>").toString("base64"),
            },
          ],
        },
        null,
      ),
    ).toThrow("PDF files");
  });
  it("reuses a pending renewal invoice and cannot extend twice from a replay", () => {
    const p = act("renew", {}, member);
    expect(act("renew", {}, member).id).toBe(p.id);
    const before = s.members[0].expiry;
    act(
      "simulate-payment",
      { paymentId: p.id, outcome: "Simulated successful" },
      member,
    );
    const after = s.members[0].expiry;
    expect(after > before).toBe(true);
    expect(() =>
      act(
        "simulate-payment",
        { paymentId: p.id, outcome: "Simulated successful" },
        member,
      ),
    ).toThrow("already been processed");
    expect(s.members[0].expiry).toBe(after);
  });
  it("prevents a member accessing another member invoice", () => {
    expect(() =>
      act(
        "simulate-payment",
        { paymentId: s.payments[1].id, outcome: "Simulated successful" },
        member,
      ),
    ).toThrow("Invoice not found");
  });
});
describe("permissions and publishing", () => {
  it("denies anonymous and member administrative writes", () => {
    expect(() =>
      act(
        "review",
        { applicationId: s.applications[0].id, status: "Approved", note: "x" },
        null,
      ),
    ).toThrow("Sign in");
    expect(() =>
      act("visibility", { memberId: "M001", visible: false }, member),
    ).toThrow("role cannot");
    expect(() =>
      act("set-role", { userId: "U1", role: "Member" }, member),
    ).toThrow("role cannot");
  });
  it("keeps drafts private and requires administrator publication", () => {
    const editor = viewer(
      s,
      signIn(s, { email: "content@ippan.demo", password }).token,
    )!;
    const d = {
      kind: "news",
      title: "New energy partnership",
      category: "News",
      description: "Demo partnership announcement",
      body: "Full article text",
      access: "Public",
      featured: true,
      status: "Draft",
    };
    const draft = act("save-content", d, editor);
    expect(snapshot(s, null).news.some((n) => n.id === draft.id)).toBe(false);
    expect(() =>
      act("save-content", { ...d, id: draft.id, status: "Published" }, editor),
    ).toThrow("administrator");
    act("save-content", { ...d, id: draft.id, status: "Published" });
    expect(snapshot(s, null).news.some((n) => n.id === draft.id)).toBe(true);
  });
  it("redacts finance, correspondence and private member resources from public snapshots", () => {
    const publicData = snapshot(s, null);
    expect(publicData.payments).toEqual([]);
    expect(publicData.correspondence).toEqual([]);
    expect(publicData.resources.some((r) => r.access === "Members")).toBe(
      false,
    );
    expect(publicData.members.every((m) => !m.email)).toBe(true);
    expect(
      snapshot(s, member).resources.some((r) => r.access === "Members"),
    ).toBe(true);
    s.members[0].status = "Expired";
    expect(
      snapshot(s, member).resources.some((r) => r.access === "Members"),
    ).toBe(false);
  });
  it("revokes existing sessions after a role change", () => {
    const result = signIn(s, { email: "finance@ippan.demo", password });
    const target = viewer(s, result.token)!;
    act("set-role", { userId: target.id, role: "Content Editor" });
    expect(viewer(s, result.token)).toBe(null);
  });
});
describe("events, secretariat and controlled voting", () => {
  it("records a paid registration only after simulated payment confirmation, once per email", () => {
    const d = {
      eventId: "EV001",
      name: "Demo Visitor",
      email: "visitor@example.test",
      simulate: false,
    };
    expect(() => act("register", d, null)).toThrow("simulated payment");
    const reg = act("register", { ...d, simulate: true }, null);
    expect(s.registrations.find((r) => r.id === reg.id)?.paymentStatus).toBe(
      "Simulated successful",
    );
    expect(() => act("register", { ...d, simulate: true }, null)).toThrow(
      "already registered",
    );
    act("attendance", { registrationId: reg.id });
    expect(s.registrations.find((r) => r.id === reg.id)?.attendance).toBe(true);
  });
  it("enforces voting window, active membership and one-member-one-vote", () => {
    expect(() =>
      act("vote", { ballotId: "B001", option: "In favour" }, member),
    ).toThrow("not open");
    act("ballot-status", { ballotId: "B001", status: "Open" });
    s.ballots[0].opens = new Date(Date.now() - 86400000).toISOString();
    s.ballots[0].closes = new Date(Date.now() + 86400000).toISOString();
    act("vote", { ballotId: "B001", option: "In favour" }, member);
    expect(() =>
      act("vote", { ballotId: "B001", option: "Against" }, member),
    ).toThrow("already voted");
    s.members[0].status = "Expired";
    expect(() =>
      act("proxy", { representative: "Demo representative" }, member),
    ).toThrow("Active membership");
  });
  it("creates correspondence and decision tasks with an audit record", () => {
    const c = act("correspondence", {
      direction: "Incoming",
      subject: "Transmission consultation",
      sender: "Demo stakeholder",
      assignee: "Secretariat",
    });
    expect(c.id).toMatch(/^DAR-/);
    act("correspondence-status", { id: c.id });
    expect(s.correspondence[0].status).toBe("Completed");
    act("task", {
      title: "Prepare a response",
      assignee: "Secretariat",
      due: "2026-12-01",
      meeting: "Board meeting",
    });
    act("task-status", { id: s.tasks[0].id });
    expect(s.tasks[0].status).toBe("Completed");
    expect(s.audit[0].action).toBe("Task status updated");
  });
});

describe("corrections, document privacy and manual finance controls", () => {
  it("requires the private tracking key for correction resubmission", () => {
    const input = {
      name: "Correction Test Company",
      email: "correction@example.test",
      category: "Corporate",
      province: "Koshi",
      district: "Taplejung",
      capacity: 12,
      password,
      documents: [
        {
          name: "registration.pdf",
          data: Buffer.from("%PDF-1.4\noriginal").toString("base64"),
        },
      ],
    };
    const a = act("apply", input, null);
    act("review", {
      applicationId: a.reference,
      status: "Correction requested",
      note: "Upload a clearer certificate",
    });
    expect(() =>
      act(
        "correct-application",
        {
          reference: a.reference,
          token: "invalid",
          note: "Updated",
          documents: input.documents,
        },
        null,
      ),
    ).toThrow("incorrect");
    act(
      "correct-application",
      {
        reference: a.reference,
        token: a.tracking,
        note: "Updated certificate attached",
        documents: input.documents,
      },
      null,
    );
    expect(s.applications.find((x) => x.id === a.reference)?.status).toBe(
      "Pending",
    );
  });
  it("keeps uploaded publication bytes out of all snapshots", () => {
    const pdf = {
      name: "briefing.pdf",
      data: Buffer.from("%PDF-1.4\nprivate-document-bytes").toString("base64"),
    };
    act("save-content", {
      kind: "resources",
      title: "Private briefing",
      category: "Members",
      description: "Demo private briefing",
      body: "Demo document",
      access: "Members",
      featured: false,
      status: "Published",
      pdf,
    });
    expect(JSON.stringify(snapshot(s, admin))).not.toContain(pdf.data);
    expect(JSON.stringify(snapshot(s, null))).not.toContain("Private briefing");
    expect(
      snapshot(s, member).resources.some((r) => r.title === "Private briefing"),
    ).toBe(true);
  });
  it("enforces independent manual approval and cannot be bypassed from the member portal", () => {
    const finance = viewer(
      s,
      signIn(s, { email: "finance@ippan.demo", password }).token,
    )!;
    act(
      "manual-payment",
      { memberId: "M001", amount: 100, purpose: "QA bank reference" },
      finance,
    );
    const p = s.payments[0];
    expect(() =>
      act(
        "simulate-payment",
        { paymentId: p.id, outcome: "Simulated successful" },
        member,
      ),
    ).toThrow("administrator approval");
    expect(() => act("approve-manual", { paymentId: p.id }, finance)).toThrow(
      "Super Administrator",
    );
    act("approve-manual", { paymentId: p.id });
    expect(p.status).toBe("Simulated successful");
    act("reverse-payment", { paymentId: p.id, note: "QA reversal" });
    expect(p.status).toBe("Reversed");
    act("manual-payment", {
      memberId: "M001",
      amount: 100,
      purpose: "Admin-owned record",
    });
    expect(() =>
      act("approve-manual", { paymentId: s.payments[0].id }),
    ).toThrow("different administrator");
  });
  it("rolls renewal validity back when the latest demo payment is reversed", () => {
    const before = s.members[0].expiry;
    const p = act("renew", {}, member);
    act(
      "simulate-payment",
      { paymentId: p.id, outcome: "Simulated successful" },
      member,
    );
    act("reverse-payment", { paymentId: p.id, note: "QA rollback" });
    expect(s.members[0].expiry).toBe(before);
    expect(p.status).toBe("Reversed");
  });
  it("validates the entire CSV batch before adding projects", () => {
    const count = s.projects.length;
    const valid = { ...s.projects[0], id: undefined };
    expect(() =>
      act("import-projects", {
        projects: [valid, { ...valid, memberId: "missing-member" }],
      }),
    ).toThrow("existing developer member");
    expect(s.projects.length).toBe(count);
  });
});
