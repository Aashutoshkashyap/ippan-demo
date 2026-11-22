import { randomBytes } from "node:crypto";
import { z } from "zod";
import { State, Viewer, roles, provinces, MembershipCategory } from "../model";
import { homeSections, upgradeState } from "../extensions-model";
import { HttpError, requireArea, requireMember } from "./service";
import { hashPassword } from "./seed";
const text = z.string().trim().min(1).max(250),
  body = z.string().trim().max(20000);
const status = z.enum(["Draft", "In review", "Published", "Archived"]);
const id = (p: string) =>
  p + "-" + randomBytes(6).toString("hex").toUpperCase();
const date = () => new Date().toISOString();
const pdf = z.object({ name: text, data: z.string().max(2800000) });
export function checkedPdf(d: { name: string; data: string }) {
  const b = Buffer.from(d.data, "base64");
  if (b.length > 2097152 || b.subarray(0, 5).toString() !== "%PDF-")
    throw new HttpError("Upload a PDF of at most 2 MB.");
}
function audit(s: State, u: Viewer | null, action: string, detail: string) {
  s.audit.unshift({
    id: id("AUD"),
    date: date(),
    actor: u?.name || "Public visitor",
    action,
    detail,
  });
}
const actions = [
  "notification-preferences",
  "save-page",
  "save-profile",
  "save-media",
  "save-category",
  "save-system",
  "save-meeting",
  "save-correspondence",
  "save-member",
  "create-user",
  "subscribe",
  "inquiry",
  "inquiry-status",
];
export function extensionAction(
  s: State,
  u: Viewer | null,
  action: string,
  d: Record<string, unknown>,
): { handled: boolean; result?: unknown } {
  if (!actions.includes(action)) return { handled: false };
  upgradeState(s);
  let result: unknown = {};
  const publishing = (st: string) => {
    if (st === "Published" && u?.role === "Content Editor")
      throw new HttpError(
        "Submit for review; an administrator must publish.",
        403,
      );
  };
  if (action === "notification-preferences") {
    requireMember(s, u);
    const v = z.object({ email: z.boolean(), sms: z.boolean() }).parse(d);
    const user = s.users.find((x) => x.id === u!.id)!;
    user.preferences = v;
    audit(
      s,
      u,
      "Notification preferences updated",
      "Member preference register",
    );
  } else if (action === "save-page") {
    requireArea(u, "website");
    const v = z
      .object({
        id: z.string().optional(),
        slug: z
          .string()
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
          .max(80),
        title: text,
        titleNe: body.default(""),
        body: body.min(1),
        bodyNe: body.default(""),
        status,
        seoDescription: z.string().max(300).default(""),
        menuLabel: z.string().max(80).default(""),
        order: z.coerce.number().int().min(0).max(100).default(10),
      })
      .parse(d);
    publishing(v.status);
    if (s.sitePages!.some((p) => p.slug === v.slug && p.id !== v.id))
      throw new HttpError("That page address already exists.");
    const old = s.sitePages!.find((p) => p.id === v.id);
    if (old?.status === "Published" && u?.role === "Content Editor")
      throw new HttpError(
        "An administrator must revise a published page. Create a separate draft for review.",
        403,
      );
    const row = { ...v, id: old?.id || id("PAGE") };
    if (old) Object.assign(old, row);
    else s.sitePages!.push(row);
    result = row;
    audit(s, u, "Page " + v.status, v.title);
  } else if (action === "save-profile") {
    requireArea(u, "website");
    const v = z
      .object({
        id: z.string().optional(),
        name: text,
        position: text,
        group: z.enum(["Executive committee", "Secretariat"]),
        bio: body,
        image: z
          .enum(["/ippan/assembly.jpg", "/ippan/expo.jpg", ""])
          .default(""),
        order: z.coerce.number().int().min(0).max(100),
        status: z.enum(["Draft", "Published"]),
      })
      .parse(d);
    publishing(v.status);
    const old = s.profiles!.find((p) => p.id === v.id);
    if (old?.status === "Published" && u?.role === "Content Editor")
      throw new HttpError(
        "An administrator must revise a published profile.",
        403,
      );
    const row = { ...v, id: old?.id || id("PROFILE") };
    if (old) Object.assign(old, row);
    else s.profiles!.push(row);
    result = row;
    audit(s, u, "Leadership profile saved", v.name);
  } else if (action === "save-media") {
    requireArea(u, "website");
    const v = z
      .object({
        id: z.string().optional(),
        title: text,
        caption: body,
        type: z.enum(["Photo", "Video"]),
        url: z.string().max(750000),
        status: z.enum(["Draft", "Published"]),
      })
      .parse(d);
    publishing(v.status);
    if (v.type === "Photo") {
      if (!/^\/ippan\/[a-zA-Z0-9_.-]+\.(jpg|png|webp)$/.test(v.url)) {
        const match = v.url.match(
          /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/,
        );
        if (!match)
          throw new HttpError(
            "Use an IPPAN image or upload a PNG, JPEG or WebP.",
          );
        const bytes = Buffer.from(match[2], "base64");
        if (bytes.length > 512000)
          throw new HttpError("Images must be at most 500 KB.");
        const valid =
          match[1] === "png"
            ? bytes.subarray(0, 8).toString("hex") === "89504e470d0a1a0a"
            : match[1] === "jpeg"
              ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
              : bytes.subarray(0, 4).toString() === "RIFF" &&
                bytes.subarray(8, 12).toString() === "WEBP";
        if (!valid)
          throw new HttpError(
            "The image content does not match its file type.",
          );
      }
    } else {
      let url: URL;
      try {
        url = new URL(v.url);
      } catch {
        throw new HttpError("Enter a valid HTTPS video address.");
      }
      if (
        url.protocol !== "https:" ||
        ![
          "www.youtube.com",
          "youtube.com",
          "youtu.be",
          "vimeo.com",
          "www.vimeo.com",
        ].includes(url.hostname)
      )
        throw new HttpError("Use a YouTube or Vimeo HTTPS video link.");
    }
    const old = s.media!.find((m) => m.id === v.id);
    if (old?.status === "Published" && u?.role === "Content Editor")
      throw new HttpError("An administrator must revise published media.", 403);
    if (!old && s.media!.length >= 30)
      throw new HttpError(
        "This demonstration media library supports 30 items.",
      );
    const row = { ...v, id: old?.id || id("MEDIA"), date: date().slice(0, 10) };
    if (old) Object.assign(old, row);
    else s.media!.unshift(row);
    result = row;
    audit(s, u, "Media " + v.status, v.title);
  } else if (action === "save-category") {
    requireArea(u, "categories");
    const v = z
      .object({
        name: z.enum(["Corporate", "Associate", "Individual"]),
        fee: z.coerce.number().min(0).max(1000000),
        description: body.min(1),
        documents: body.min(1),
        enabled: z.boolean(),
      })
      .parse(d);
    const old = s.categories!.find((c) => c.name === v.name);
    if (old) Object.assign(old, v);
    else s.categories!.push(v as MembershipCategory);
    audit(s, u, "Membership category updated", v.name);
  } else if (action === "save-system") {
    requireArea(u, "settings");
    const v = z
      .object({
        heroTitle: text,
        heroSubtitle: z.string().min(1).max(500),
        heroTitleNe: z.string().max(250),
        heroSubtitleNe: z.string().max(500),
        contactAddress: text,
        contactEmail: z.string().email(),
        contactPhone: text,
        agmTitle: text,
        agmDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        agmAgenda: body,
        sections: z
          .array(z.enum(homeSections as [string, ...string[]]))
          .max(homeSections.length),
      })
      .parse(d);
    if (new Set(v.sections).size !== v.sections.length)
      throw new HttpError("Homepage sections cannot repeat.");
    Object.assign(s.settings, v);
    audit(
      s,
      u,
      "Platform settings updated",
      "Institutional content and homepage sections",
    );
  } else if (action === "save-meeting") {
    requireArea(u, "meetings");
    const v = z
      .object({
        id: z.string().optional(),
        title: text,
        committee: text,
        date: z.string().min(10).max(30),
        location: text,
        agenda: body.min(1),
        minutes: body,
        attendees: z.array(text).max(100),
        status: z.enum(["Scheduled", "Completed"]),
        attachments: z.array(pdf).max(3).optional(),
      })
      .parse(d);
    if (Number.isNaN(Date.parse(v.date)))
      throw new HttpError("Enter a valid meeting date.");
    v.attachments?.forEach(checkedPdf);
    const old = s.meetings!.find((m) => m.id === v.id);
    const row = {
      ...v,
      attachments: v.attachments || old?.attachments || [],
      id: old?.id || id("MEET"),
    };
    if (old) Object.assign(old, row);
    else s.meetings!.unshift(row);
    result = {
      ...row,
      attachments: row.attachments.map((a) => ({ name: a.name })),
    };
    audit(s, u, "Meeting " + v.status, v.title);
  } else if (action === "save-correspondence") {
    requireArea(u, "secretariat");
    const v = z
      .object({
        id: z.string().optional(),
        direction: z.enum(["Incoming", "Outgoing"]),
        subject: text,
        sender: text,
        assignee: text,
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        department: text,
        received: z.string().max(100).default(""),
        approval: z.enum(["Pending", "Approved"]),
        dispatchReference: z.string().max(150).default(""),
        status: z.enum(["Open", "In progress", "Completed"]),
        attachments: z.array(pdf).max(3).optional(),
      })
      .parse(d);
    v.attachments?.forEach(checkedPdf);
    const old = s.correspondence.find((c) => c.id === v.id);
    const row = {
      ...v,
      attachments: v.attachments || old?.attachments || [],
      id: old?.id || id(v.direction === "Incoming" ? "DAR" : "CHA"),
    };
    if (old) Object.assign(old, row);
    else s.correspondence.unshift(row);
    result = {
      ...row,
      attachments: row.attachments.map((a) => ({ name: a.name })),
    };
    audit(s, u, "Correspondence saved", row.id);
  } else if (action === "save-member") {
    requireArea(u, "members");
    const v = z
      .object({
        id: z.string().optional(),
        name: text,
        category: z.enum(["Corporate", "Associate", "Individual"]),
        province: z.enum(provinces as [string, ...string[]]),
        district: text,
        capacity: z.coerce.number().min(0).max(10000),
        email: z.string().email(),
        contact: z.string().max(100),
        description: body,
        status: z.enum(["Active", "Expired"]),
        expiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        joined: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        visible: z.boolean(),
      })
      .parse(d);
    const old = s.members.find((m) => m.id === v.id);
    if (v.id && !old) throw new HttpError("Member not found.", 404);
    const row = { ...v, id: old?.id || id("M") };
    if (old) Object.assign(old, row);
    else s.members.unshift(row);
    result = row;
    audit(s, u, "Member record saved", row.name);
  } else if (action === "create-user") {
    requireArea(u, "users");
    const v = z
      .object({
        name: text,
        email: z
          .string()
          .email()
          .transform((s) => s.toLowerCase()),
        role: z.enum(
          roles as [(typeof roles)[number], ...(typeof roles)[number][]],
        ),
        password: z.string().min(12).max(200),
        memberId: z.string().optional(),
      })
      .parse(d);
    if (s.users.some((x) => x.email.toLowerCase() === v.email))
      throw new HttpError("Email already exists.");
    if (v.role === "Member" && !s.members.some((m) => m.id === v.memberId))
      throw new HttpError("Choose an existing membership.");
    s.users.push({
      id: id("U"),
      name: v.name,
      email: v.email,
      role: v.role,
      passwordHash: hashPassword(v.password),
      ...(v.role === "Member" ? { memberId: v.memberId } : {}),
    });
    audit(s, u, "Staff account created", v.email + " · " + v.role);
  } else if (action === "subscribe") {
    const v = z
      .object({
        email: z
          .string()
          .email()
          .max(250)
          .transform((s) => s.toLowerCase()),
      })
      .parse(d);
    if (s.subscriptions!.length >= 10000)
      throw new HttpError("Subscription capacity reached.");
    if (!s.subscriptions!.some((x) => x.email === v.email))
      s.subscriptions!.push({ email: v.email, date: date() });
    result = {
      message:
        "Your preference is saved. Email delivery is not enabled in this demonstration.",
    };
  } else if (action === "inquiry") {
    const v = z
      .object({
        name: text,
        email: z.string().email().max(250),
        subject: text,
        message: body.min(10),
      })
      .parse(d);
    if (
      s.inquiries!.filter(
        (x) => x.email === v.email && Date.parse(x.date) > Date.now() - 3600000,
      ).length >= 5
    )
      throw new HttpError(
        "Please allow the secretariat time to review your messages.",
        429,
      );
    s.inquiries!.unshift({ ...v, id: id("ENQ"), date: date(), status: "Open" });
    result = {
      message:
        "Your inquiry is saved for the secretariat. No external email has been sent.",
    };
  } else if (action === "inquiry-status") {
    requireArea(u, "communications");
    const inquiry = s.inquiries!.find((x) => x.id === d.id);
    if (!inquiry) throw new HttpError("Inquiry not found.", 404);
    inquiry.status = inquiry.status === "Open" ? "Completed" : "Open";
    audit(s, u, "Inquiry status updated", inquiry.id);
  }
  return { handled: true, result };
}
