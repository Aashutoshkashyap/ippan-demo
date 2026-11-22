import { beforeEach, describe, expect, it } from "vitest";
import { seed } from "./seed";
import { applyAction, snapshot } from "./service";
import { cmsFingerprint } from "./cms";
import { homepageContent } from "../cms-model";
import { upgradeState } from "../extensions-model";
import { State, Viewer } from "../model";
let s: State;
const admin: Viewer = {
  id: "admin",
  name: "Reviewer",
  email: "reviewer@example.test",
  role: "Super Administrator",
};
const editor: Viewer = {
  ...admin,
  id: "editor",
  name: "Editor",
  role: "Content Editor",
};
const finance: Viewer = { ...admin, id: "finance", role: "Finance Officer" };
const act = (
  action: string,
  data: Record<string, unknown>,
  u: Viewer | null = admin,
) => applyAction(s, u, { action, data }) as any;
const draft = (title = "Draft notice") => ({
  title,
  titleNe: "नेपाली सूचना",
  body: "## Member services\n\n" + "Institutional information. ".repeat(20),
  bodyNe: "सदस्य सेवा",
  category: "Notice",
  description: "A useful member notice",
  descriptionNe: "",
  access: "Public",
  featured: true,
  date: "2026-11-22",
  imageMediaId: "",
  seoDescription: "Find membership information",
  seoTitle: "Member services",
});
const save = (
  edition = draft(),
  extra: Record<string, unknown> = {},
  u = editor,
) => act("cms-save", { kind: "news", edition, submit: true, ...extra }, u);
const review = (id: string, decision = "Publish", note = "") =>
  act("cms-review", {
    id,
    expectedVersion: s.cmsRevisions!.find((r) => r.id === id)!.version,
    decision,
    note,
  });
beforeEach(() => {
  process.env.IPPAN_DEMO_PASSWORD = "test-password-never-used-in-production";
  s = upgradeState(seed());
});
describe("connected CMS publishing", () => {
  it("excludes future private database fields from every snapshot by default", () => {
    Object.assign(s, {
      futurePrivateQueue: [{ note: "Private staff material" }],
    });
    expect(snapshot(s, null)).not.toHaveProperty("futurePrivateQueue");
    expect(snapshot(s, admin)).not.toHaveProperty("futurePrivateQueue");
  });
  it("revises a live record privately, then approves it at the same public address", () => {
    const current = s.news.find((n) => n.status === "Published")!;
    const oldTitle = current.title;
    const r = save(draft("Approved revision"), {
      targetId: current.id,
      baseFingerprint: cmsFingerprint(current),
    });
    expect(current.title).toBe(oldTitle);
    expect(snapshot(s, null).cmsRevisions).toEqual([]);
    expect(snapshot(s, null).cmsFingerprints).toEqual({});
    expect(snapshot(s, finance).cmsRevisions).toEqual([]);
    expect(() =>
      act(
        "cms-review",
        { id: r.id, expectedVersion: r.version, decision: "Publish" },
        editor,
      ),
    ).toThrow("administrator must review");
    review(r.id);
    expect(current.title).toBe("Approved revision");
    expect(snapshot(s, null).news.find((n) => n.id === current.id)?.title).toBe(
      "Approved revision",
    );
    expect(s.cmsRevisions![0].history.map((h) => h.action)).toEqual([
      "Submitted for review",
      "Publish",
    ]);
    expect(() =>
      save(draft("Tamper"), {
        id: r.id,
        targetId: current.id,
        expectedVersion: 2,
      }),
    ).toThrow("new working edition");
  });
  it("requires review notes, returns changes and rejects stale draft saves", () => {
    const r = save();
    expect(() => review(r.id, "Request changes")).toThrow(
      "Explain the changes",
    );
    review(r.id, "Request changes", "Please add the approved contact.");
    const row = s.cmsRevisions![0];
    expect(row.status).toBe("Changes requested");
    expect(row.history.at(-1)?.note).toContain("approved contact");
    expect(() => save(draft(), { id: r.id, expectedVersion: 1 })).toThrow(
      "Another staff member",
    );
    save(draft(), { id: r.id, expectedVersion: row.version });
    expect(row.status).toBe("In review");
    review(r.id);
    expect(row.status).toBe("Published");
  });
  it("does not let an older working copy overwrite newer live edits", () => {
    const target = s.news[0];
    const r = save(draft(), {
      targetId: target.id,
      baseFingerprint: cmsFingerprint(target),
    });
    act("save-content", {
      ...target,
      kind: "news",
      title: "Newer approved information",
    });
    expect(() => review(r.id)).toThrow("live record changed");
    expect(target.title).toBe("Newer approved information");
    expect(s.cmsRevisions![0].status).toBe("In review");
    expect(() =>
      save(draft(), {
        targetId: target.id,
        baseFingerprint: cmsFingerprint(target),
      }),
    ).toThrow("already exists");
  });
  it("publishes member-only editions with linked portal notifications without leaking the edition", () => {
    const r = save(
      { ...draft("Member briefing"), access: "Members" },
      { notifyMembers: true },
    );
    review(r.id);
    const target = s.cmsRevisions![0].targetId!;
    expect(snapshot(s, null).news.some((n) => n.id === target)).toBe(false);
    const member = s.members.find(
      (m) => m.status === "Active" && m.expiry >= "2026-11-22",
    )!;
    const memberViewer: Viewer = {
      ...admin,
      id: "member",
      role: "Member",
      memberId: member.id,
    };
    expect(
      snapshot(s, memberViewer).news.find((n) => n.id === target)?.title,
    ).toBe("Member briefing");
    expect(
      snapshot(s, memberViewer).notifications.find(
        (n) => n.title === "Member briefing",
      )?.href,
    ).toBe("/news/" + target);
    expect(homepageContent(s.news).some((n) => n.id === target)).toBe(false);
    expect(snapshot(s, null).notifications).toEqual([]);
  });
  it("archives a proposal without changing the existing public edition", () => {
    const target = s.news[0];
    const previous = structuredClone(target);
    const r = save(draft(), {
      targetId: target.id,
      baseFingerprint: cmsFingerprint(target),
    });
    review(r.id, "Archive draft", "Withdrawn for reconciliation");
    expect(target).toEqual(previous);
    expect(s.cmsRevisions![0].status).toBe("Archived");
  });
  it("keeps PDF bytes out of snapshots while retaining an attachment across draft edits", () => {
    const pdf = {
      name: "member-guide.pdf",
      data: Buffer.from("%PDF-1.4 private draft bytes").toString("base64"),
    };
    const r = act(
      "cms-save",
      { kind: "resources", edition: { ...draft(), pdf }, submit: false },
      editor,
    );
    expect(JSON.stringify(snapshot(s, admin))).not.toContain(pdf.data);
    act(
      "cms-save",
      {
        kind: "resources",
        id: r.id,
        expectedVersion: 1,
        edition: draft(),
        submit: true,
      },
      editor,
    );
    expect(s.cmsRevisions![0].edition.pdf).toEqual(pdf);
    review(r.id);
    expect(
      s.resources.find((c) => c.id === s.cmsRevisions![0].targetId)?.pdf,
    ).toEqual(pdf);
    expect(JSON.stringify(snapshot(s, admin))).not.toContain(pdf.data);
  });
  it("publishes page navigation and bilingual copy only after approval", () => {
    const edition = {
      title: "Member services",
      titleNe: "सदस्य सेवा",
      body: "## Application process\n\n1. Apply\n2. Review",
      bodyNe: "सदस्य आवेदन",
      slug: "approved-services",
      menuLabel: "Member services",
      menuGroup: "Membership",
      order: 2,
      seoDescription: "Approved service information",
    };
    const r = act("cms-save", { kind: "pages", edition, submit: true }, editor);
    expect(
      snapshot(s, null).sitePages?.some((p) => p.slug === edition.slug),
    ).toBe(false);
    review(r.id);
    expect(
      snapshot(s, null).sitePages?.find((p) => p.slug === edition.slug)
        ?.menuGroup,
    ).toBe("Membership");
  });
  it("limits homepage editing to publishers, validates media and preserves the institutional order", () => {
    const settings = {
      ...s.settings,
      heroImage: "/ippan/hydropower.jpg",
      heroMediaId: "",
      homeCopy: {
        news: { title: "From the secretariat", titleNe: "सचिवालयबाट" },
      },
      sections: ["glance", "news", "events"],
    };
    expect(() => act("cms-homepage", settings, editor)).toThrow(
      "administrator must approve",
    );
    expect(() =>
      act("cms-homepage", { ...settings, heroMediaId: "unknown" }),
    ).toThrow("published photo");
    act("cms-homepage", settings);
    expect(snapshot(s, null).settings.homeCopy?.news.titleNe).toBe(
      "सचिवालयबाट",
    );
    expect(() =>
      act("cms-homepage", { ...settings, sections: ["news", "news"] }),
    ).toThrow("cannot repeat");
    expect(() => save({ ...draft(), imageMediaId: "unknown" })).toThrow(
      "published photo",
    );
  });
  it("prioritizes featured public editions consistently and retains original publication dates", () => {
    const current = s.news[0];
    const date = current.date;
    act("save-content", { ...current, kind: "news", title: "Edited title" });
    expect(current.date).toBe(date);
    current.status = "Published";
    current.access = "Public";
    current.featured = true;
    s.news.push({
      ...current,
      id: "PRIVATE",
      access: "Members",
      date: "2099-01-01",
    });
    expect(homepageContent(s.news).some((n) => n.id === "PRIVATE")).toBe(false);
    expect(homepageContent(s.news)[0].featured).toBe(true);
  });
});
