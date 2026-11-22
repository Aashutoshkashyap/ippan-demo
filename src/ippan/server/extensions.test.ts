import { describe, it, expect, beforeEach } from "vitest";
import { seed } from "./seed";
import { applyAction, snapshot, signIn, viewer } from "./service";
import { State, Viewer } from "../model";
const password = "only-for-unit-tests-2026";
let s: State, admin: Viewer;
beforeEach(() => {
  process.env.IPPAN_DEMO_PASSWORD = password;
  s = seed();
  admin = viewer(s, signIn(s, { email: "admin@ippan.demo", password }).token)!;
});
const act = (
  action: string,
  data: Record<string, unknown>,
  u: Viewer | null = admin,
) => applyAction(s, u, { action, data }) as any;
describe("institutional CMS and private staff workflows", () => {
  it("keeps draft pages private, publishes bilingual content and prevents editor self-publishing", () => {
    const page = {
      slug: "test-institutional-page",
      title: "English page",
      titleNe: "नेपाली पृष्ठ",
      body: "Institutional content",
      bodyNe: "संस्थागत विवरण",
      status: "Draft",
      menuLabel: "Our work",
      order: 3,
      seoDescription: "Test page",
    };
    const saved = act("save-page", page);
    expect(snapshot(s, null).sitePages?.some((p) => p.id === saved.id)).toBe(
      false,
    );
    act("save-page", { ...page, id: saved.id, status: "Published" });
    expect(
      snapshot(s, null).sitePages?.find((p) => p.id === saved.id)?.titleNe,
    ).toBe("नेपाली पृष्ठ");
    const editor = { ...admin, role: "Content Editor" as const };
    expect(() =>
      act(
        "save-page",
        { ...page, status: "Published", slug: "editor-page" },
        editor,
      ),
    ).toThrow("administrator must publish");
    expect(() => act("save-page", page, null)).toThrow("Sign in");
  });
  it("stores category fees and uses them for an individual application invoice", () => {
    act("save-category", {
      name: "Individual",
      fee: 4500,
      description: "Energy professionals",
      documents: "Professional ID",
      enabled: true,
    });
    const result = act(
      "apply",
      {
        name: "Test Professional",
        email: "individual@example.test",
        category: "Individual",
        province: "Bagmati",
        district: "Lalitpur",
        capacity: 0,
        password,
        documents: [
          {
            name: "id.pdf",
            data: Buffer.from("%PDF-1.4\nfixture").toString("base64"),
          },
        ],
      },
      null,
    );
    act("review", {
      applicationId: result.reference,
      status: "Approved",
      note: "Checked professional document",
    });
    const app = s.applications.find((a) => a.id === result.reference)!;
    expect(s.payments.find((p) => p.memberId === app.memberId)?.amount).toBe(
      4500,
    );
  });
  it("keeps correspondence and meeting attachments off public and administrator snapshots", () => {
    const data = Buffer.from("%PDF-1.4\nprivate fixture").toString("base64");
    const meeting = act("save-meeting", {
      title: "Board meeting",
      committee: "Board",
      date: "2026-12-15T12:00",
      location: "Secretariat",
      agenda: "Review policy",
      minutes: "",
      attendees: ["Test Person"],
      status: "Scheduled",
      attachments: [{ name: "board.pdf", data }],
    });
    expect(s.meetings?.[0].attachments[0].data).toBe(data);
    expect(snapshot(s, null).meetings).toEqual([]);
    expect(JSON.stringify(snapshot(s, admin))).not.toContain(data);
    act("save-meeting", {
      ...meeting,
      attachments: undefined,
      title: "Updated meeting",
    });
    expect(s.meetings?.[0].attachments[0].data).toBe(data);
  });
  it("validates media bytes and does not publish a script or arbitrary external URL", () => {
    expect(() =>
      act("save-media", {
        title: "Bad photo",
        caption: "",
        type: "Photo",
        url: "data:image/png;base64,PHNjcmlwdD4=",
        status: "Published",
      }),
    ).toThrow("file type");
    expect(() =>
      act("save-media", {
        title: "Bad video",
        caption: "",
        type: "Video",
        url: "javascript:alert(1)",
        status: "Published",
      }),
    ).toThrow("YouTube");
  });
  it("stores public inquiries/preferences privately, deduplicates subscriptions and rate limits inquiries", () => {
    act("subscribe", { email: "news@example.test" }, null);
    act("subscribe", { email: "news@example.test" }, null);
    expect(s.subscriptions).toHaveLength(1);
    for (let i = 0; i < 5; i++)
      act(
        "inquiry",
        {
          name: "Visitor",
          email: "hello@example.test",
          subject: "Demo inquiry",
          message: "Request a membership briefing",
        },
        null,
      );
    expect(() =>
      act(
        "inquiry",
        {
          name: "Visitor",
          email: "hello@example.test",
          subject: "Demo inquiry",
          message: "Request a membership briefing",
        },
        null,
      ),
    ).toThrow("allow the secretariat");
    expect(snapshot(s, null).subscriptions).toEqual([]);
    expect(snapshot(s, null).inquiries).toEqual([]);
  });
  it("enforces ticket prices and category capacity on the server", () => {
    const e = s.events[0];
    s.registrations = s.registrations.filter((r) => r.eventId !== e.id);
    e.date = "2099-12-01";
    e.status = "Published";
    e.ticketTypes = [
      { name: "General", price: 500, capacity: 1 },
      { name: "Student", price: 0, capacity: 2 },
    ];
    expect(() =>
      act(
        "register",
        {
          eventId: e.id,
          name: "A",
          email: "a@example.test",
          ticketType: "General",
          simulate: false,
        },
        null,
      ),
    ).toThrow("simulated payment");
    const r = act(
      "register",
      {
        eventId: e.id,
        name: "A",
        email: "a@example.test",
        ticketType: "General",
        simulate: true,
      },
      null,
    );
    expect(r.amount).toBe(500);
    expect(() =>
      act(
        "register",
        {
          eventId: e.id,
          name: "B",
          email: "b@example.test",
          ticketType: "General",
          simulate: true,
        },
        null,
      ),
    ).toThrow("full");
    const free = act(
      "register",
      {
        eventId: e.id,
        name: "B",
        email: "b@example.test",
        ticketType: "Student",
        simulate: false,
      },
      null,
    );
    expect(free.amount).toBe(0);
    expect(free.paymentStatus).toBe("Free");
  });
  it("keeps notification choices on the member account and rejects anonymous writes", () => {
    const member = viewer(
      s,
      signIn(s, { email: "member@ippan.demo", password }).token,
    )!;
    act("notification-preferences", { email: true, sms: false }, member);
    expect(s.users.find((u) => u.id === member.id)?.preferences).toEqual({
      email: true,
      sms: false,
    });
    expect(snapshot(s, null).users).toEqual([]);
    expect(() =>
      act("notification-preferences", { email: false, sms: true }, null),
    ).toThrow("member account");
  });
});
