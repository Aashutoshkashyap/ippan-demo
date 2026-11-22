import { upgradeState } from "../extensions-model";
import { extensionAction } from "./extensions";
import {
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { z } from "zod";
import {
  Application,
  can,
  Content,
  Role,
  State,
  User,
  Viewer,
  provinces,
  roles,
} from "../model";
import { hashPassword } from "./seed";
export class HttpError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export const digest = (s: string) =>
  createHash("sha256").update(s).digest("hex");
const now = () => new Date().toISOString();
const today = () => now().slice(0, 10);
const id = (prefix: string) =>
  prefix + "-" + randomBytes(6).toString("hex").toUpperCase();
const text = z.string().trim().min(1).max(250);
const bodyText = z.string().trim().min(1).max(20000);
const pdfSchema = z.object({
  name: z.string().min(1).max(120),
  data: z.string().max(2800000),
});
function validatePdf(document: { name: string; data: string }) {
  const bytes = Buffer.from(document.data, "base64");
  if (
    bytes.length > 2 * 1024 * 1024 ||
    bytes.subarray(0, 5).toString() !== "%PDF-"
  )
    throw new HttpError("Supporting documents must be PDF files up to 2 MB.");
}
const projectSchema = z.object({
  id: z.string().optional(),
  name: text,
  developer: text,
  memberId: text,
  province: z.enum(provinces as [string, ...string[]]),
  district: text,
  municipality: text,
  capacity: z.coerce.number().positive().max(10000),
  river: text,
  status: z.enum([
    "Operational",
    "Under construction",
    "Construction not started",
    "Survey",
  ]),
  lat: z.coerce.number().min(26).max(31),
  lng: z.coerce.number().min(80).max(89),
  licence: text,
  cod: text,
  surveyLicence: z.string().max(250).optional(),
  contact: z.string().max(250).optional(),
});
export function viewer(s: State, token?: string): Viewer | null {
  if (!token) return null;
  const session = s.sessions.find(
    (x) => x.hash === digest(token) && x.expires > Date.now(),
  );
  const user = s.users.find((x) => x.id === session?.userId);
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}
export function requireArea(user: Viewer | null, area: string) {
  if (!user) throw new HttpError("Sign in to continue.", 401);
  if (!can(user.role, area))
    throw new HttpError("Your role cannot perform this action.", 403);
}
export function requireMember(s: State, u: Viewer | null) {
  if (!u || u.role !== "Member")
    throw new HttpError("Sign in with your member account.", 403);
  const m = s.members.find((m) => m.id === u.memberId);
  if (!m) throw new HttpError("Membership record missing.", 404);
  return m;
}
export function activeMember(s: State, u: Viewer | null) {
  const m = requireMember(s, u);
  if (m.status !== "Active" || m.expiry < today())
    throw new HttpError("Active membership is required.", 403);
  return m;
}
function log(s: State, u: Viewer | null, action: string, detail: string) {
  s.audit.unshift({
    id: id("AUD"),
    date: now(),
    actor: u?.name || "Public applicant",
    action,
    detail,
  });
}
export function signIn(s: State, input: unknown) {
  const { email, password } = z
    .object({
      email: z.string().email().max(250),
      password: z.string().min(1).max(200),
    })
    .parse(input);
  const u = s.users.find((x) => x.email.toLowerCase() === email.toLowerCase());
  const [salt, expected] = (u?.passwordHash || "dummy:00").split(":");
  const hash = scryptSync(password, salt, 64);
  const check = Buffer.from(expected, "hex");
  if (!u || hash.length !== check.length || !timingSafeEqual(hash, check))
    throw new HttpError("Email or password is incorrect.", 401);
  const token = randomBytes(32).toString("base64url");
  s.sessions = s.sessions.filter((x) => x.expires > Date.now());
  s.sessions.push({
    hash: digest(token),
    userId: u.id,
    expires: Date.now() + 1000 * 60 * 60 * 8,
  });
  log(s, viewer(s, token), "Signed in", u.role);
  return { token, user: viewer(s, token) };
}
export function snapshot(s: State, u: Viewer | null) {
  upgradeState(s);
  const safeContent = (list: Content[]) =>
    list.map(({ pdf, ...content }) => ({ ...content, hasPdf: !!pdf }));
  const publicContent = (list: Content[]) =>
    list.filter(
      (c) =>
        c.status === "Published" &&
        (c.access === "Public" ||
          (u?.role === "Member" &&
            s.members.some(
              (m) =>
                m.id === u.memberId &&
                m.status === "Active" &&
                m.expiry >= today(),
            ))),
    );
  const admin = !!u && u.role !== "Member";
  const member = u?.memberId;
  return {
    ...s,
    sitePages: s.sitePages!.filter(
      (p) => p.status === "Published" || (admin && can(u.role, "website")),
    ),
    profiles: s.profiles!.filter(
      (p) => p.status === "Published" || (admin && can(u.role, "website")),
    ),
    media: s.media!.filter(
      (p) => p.status === "Published" || (admin && can(u.role, "website")),
    ),
    meetings:
      admin && can(u.role, "meetings")
        ? s.meetings!.map((m) => ({
            ...m,
            attachments: m.attachments.map((a) => ({ name: a.name, data: "" })),
          }))
        : [],
    subscriptions:
      admin && can(u.role, "communications") ? s.subscriptions : [],
    inquiries: admin && can(u.role, "communications") ? s.inquiries : [],
    users:
      admin && can(u.role, "users")
        ? s.users.map(({ passwordHash, ...user }) => user)
        : [],
    sessions: undefined,
    members:
      admin && can(u.role, "members")
        ? s.members
        : s.members
            .filter((m) => m.visible || m.id === member)
            .map(({ email, contact, ...m }) => ({
              ...m,
              email: m.id === member ? email : "",
              contact: m.id === member ? contact : "",
            })),
    applications:
      (admin && can(u.role, "members")) || u?.role === "Member"
        ? s.applications
            .filter((a) => admin || a.email === u?.email)
            .map(({ trackingHash, documents, ...a }) => ({
              ...a,
              documentNames: documents.map((d) => d.name),
            }))
        : [],
    news: safeContent(
      admin && can(u.role, "content") ? s.news : publicContent(s.news),
    ),
    publications: safeContent(
      admin && can(u.role, "resources")
        ? s.publications
        : publicContent(s.publications),
    ),
    resources: safeContent(
      admin && can(u.role, "resources")
        ? s.resources
        : publicContent(s.resources),
    ),
    events:
      admin && can(u.role, "events")
        ? s.events
        : s.events.filter((e) => e.status === "Published"),
    payments:
      admin && can(u.role, "finance")
        ? s.payments
        : s.payments.filter((p) => p.memberId === member),
    registrations:
      admin && can(u.role, "events")
        ? s.registrations
        : s.registrations.filter((r) => member && r.memberId === member),
    correspondence:
      admin && can(u.role, "secretariat")
        ? s.correspondence.map((c) => ({
            ...c,
            attachments: c.attachments?.map((a) => ({
              name: a.name,
              data: "",
            })),
          }))
        : [],
    tasks: admin && can(u.role, "secretariat") ? s.tasks : [],
    proxies:
      admin && can(u.role, "agm")
        ? s.proxies
        : s.proxies.filter((p) => member && p.memberId === member),
    ballots: (admin && can(u.role, "agm")
      ? s.ballots
      : s.ballots.filter((b) => b.status !== "Draft")
    ).map((b) => ({
      ...b,
      votes:
        admin && can(u!.role, "agm")
          ? b.votes
          : b.votes.filter((v) => v.memberId === member),
      results:
        b.status === "Closed"
          ? b.options.map((option) => ({
              option,
              count: b.votes.filter((v) => v.option === option).length,
            }))
          : undefined,
    })),
    audit: admin && can(u.role, "audit") ? s.audit : [],
    messages: admin && can(u.role, "communications") ? s.messages : [],
    notifications: s.notifications.filter((n) => n.memberId === member),
    viewer: u,
  };
}
const appSchema = z.object({
  name: text,
  email: z.string().email().max(250),
  category: z.enum(["Corporate", "Associate", "Individual"]),
  province: z.enum(provinces as [string, ...string[]]),
  district: text,
  capacity: z.coerce.number().min(0).max(10000),
  password: z.string().min(12).max(200),
  documents: z
    .array(
      z.object({
        name: z.string().min(1).max(120),
        data: z.string().max(2800000),
      }),
    )
    .min(1)
    .max(3),
});
export function applyAction(
  s: State,
  u: Viewer | null,
  input: unknown,
): unknown {
  const envelope = z
    .object({
      action: z.string(),
      data: z.record(z.string(), z.unknown()).default({}),
    })
    .parse(input);
  upgradeState(s);
  const d = envelope.data;
  const extension = extensionAction(s, u, envelope.action, d);
  if (extension.handled) return extension.result;
  switch (envelope.action) {
    case "apply": {
      const a = appSchema.parse(d);
      const category = s.categories!.find(
        (c) => c.name === a.category && c.enabled,
      );
      if (!category)
        throw new HttpError(
          "This membership category is not accepting applications.",
        );
      if (
        s.users.some((x) => x.email === a.email) ||
        s.applications.some(
          (x) => x.email === a.email && x.status !== "Rejected",
        )
      )
        throw new HttpError(
          "An account or application already uses this email.",
        );
      for (const doc of a.documents) {
        const bytes = Buffer.from(doc.data, "base64");
        if (
          bytes.length > 2 * 1024 * 1024 ||
          bytes.subarray(0, 5).toString() !== "%PDF-"
        )
          throw new HttpError(
            "Supporting documents must be PDF files up to 2 MB.",
          );
      }
      const tracking = randomBytes(24).toString("base64url");
      const application: Application = {
        id: id("APP"),
        ...a,
        status: "Pending",
        created: today(),
        history: [
          {
            date: now(),
            status: "Pending",
            note: "Application submitted with supporting documents.",
          },
        ],
        trackingHash: digest(tracking),
      };
      delete (application as unknown as Record<string, unknown>).password;
      s.applications.unshift(application);
      s.users.push({
        id: id("U"),
        name: a.name,
        email: a.email,
        role: "Member",
        passwordHash: hashPassword(a.password),
      });
      log(s, u, "Application received", application.id);
      return { reference: application.id, tracking };
    }
    case "track": {
      const { reference, token } = z
        .object({ reference: text, token: text })
        .parse(d);
      const a = s.applications.find(
        (a) => a.id === reference && a.trackingHash === digest(token),
      );
      if (!a)
        throw new HttpError(
          "Application reference or tracking key is incorrect.",
          404,
        );
      return { id: a.id, name: a.name, status: a.status, history: a.history };
    }
    case "correct-application": {
      const { reference, token, note, documents } = z
        .object({
          reference: text,
          token: text,
          note: bodyText,
          documents: z.array(pdfSchema).min(1).max(3),
        })
        .parse(d);
      const a = s.applications.find(
        (a) => a.id === reference && a.trackingHash === digest(token),
      );
      if (!a)
        throw new HttpError(
          "Application reference or tracking key is incorrect.",
          404,
        );
      if (a.status !== "Correction requested")
        throw new HttpError("This application is not awaiting corrections.");
      documents.forEach(validatePdf);
      a.documents = documents;
      a.status = "Pending";
      a.history.push({
        date: now(),
        status: "Pending",
        note: "Applicant resubmitted corrections: " + note,
      });
      log(s, u, "Application corrected", a.id);
      return { status: a.status };
    }
    case "review": {
      requireArea(u, "members");
      const { applicationId, status, note } = z
        .object({
          applicationId: text,
          status: z.enum(["Approved", "Rejected", "Correction requested"]),
          note: text,
        })
        .parse(d);
      const a = s.applications.find((x) => x.id === applicationId);
      if (!a) throw new HttpError("Application not found.", 404);
      if (a.status === "Approved" || a.status === "Rejected")
        throw new HttpError("This application already has a final decision.");
      a.status = status;
      a.history.push({ date: now(), status, note });
      if (status === "Approved") {
        const memberId = id("M");
        a.memberId = memberId;
        s.members.push({
          id: memberId,
          name: a.name,
          email: a.email,
          category: a.category,
          province: a.province,
          district: a.district,
          capacity: a.capacity,
          status: "Active",
          expiry: new Date(Date.now() + 365 * 86400000)
            .toISOString()
            .slice(0, 10),
          joined: today(),
          visible: true,
          contact: a.name,
          description: "Newly approved demonstration member.",
        });
        const user = s.users.find((x) => x.email === a.email);
        if (user) user.memberId = memberId;
        s.notifications.push({
          id: id("NOT"),
          memberId,
          title:
            "Your membership application has been approved. Your digital certificate is ready.",
          date: today(),
        });
        s.payments.push({
          id: id("PAY"),
          memberId,
          purpose: "Initial membership fee",
          amount:
            s.categories!.find((c) => c.name === a.category)?.fee ?? 10000,
          status: "Pending",
          date: today(),
          reconciled: false,
        });
      }
      log(s, u, "Application " + status, a.id);
      return { status };
    }
    case "visibility": {
      requireArea(u, "members");
      const { memberId, visible } = z
        .object({ memberId: text, visible: z.boolean() })
        .parse(d);
      const m = s.members.find((x) => x.id === memberId);
      if (!m) throw new HttpError("Member not found.", 404);
      m.visible = visible;
      log(s, u, "Directory visibility changed", memberId);
      return {};
    }
    case "renew": {
      const m = requireMember(s, u);
      let payment = s.payments.find(
        (p) => p.memberId === m.id && p.renewal && p.status === "Pending",
      );
      if (!payment) {
        payment = {
          id: id("PAY"),
          memberId: m.id,
          purpose: "Annual membership renewal",
          renewal: true,
          amount:
            s.categories!.find((c) => c.name === m.category)?.fee ?? 10000,
          status: "Pending",
          date: today(),
          reconciled: false,
        };
        s.payments.unshift(payment);
        log(s, u, "Renewal initiated", payment.id);
      }
      return payment;
    }
    case "simulate-payment": {
      const { paymentId, outcome } = z
        .object({
          paymentId: text,
          outcome: z.enum(["Simulated successful", "Failed"]),
        })
        .parse(d);
      const m = requireMember(s, u);
      const p = s.payments.find(
        (x) => x.id === paymentId && x.memberId === m.id,
      );
      if (!p) throw new HttpError("Invoice not found.", 404);
      if (p.manual)
        throw new HttpError("Manual entries require administrator approval.");
      if (p.status !== "Pending")
        throw new HttpError("This invoice has already been processed.");
      p.status = outcome;
      if (outcome === "Simulated successful" && p.renewal) {
        p.previousExpiry = m.expiry;
        const base = Math.max(
          Date.now(),
          new Date(m.expiry + "T12:00:00Z").getTime(),
        );
        m.expiry = new Date(base + 365 * 86400000).toISOString().slice(0, 10);
        p.renewedExpiry = m.expiry;
        m.status = "Active";
        s.notifications.unshift({
          id: id("NOT"),
          memberId: m.id,
          title:
            "Simulated renewal completed. Your membership validity has been extended.",
          date: today(),
        });
      }
      log(s, u, "Payment simulation: " + outcome, p.id);
      return p;
    }
    case "reconcile": {
      requireArea(u, "finance");
      const { paymentId } = z.object({ paymentId: text }).parse(d);
      const p = s.payments.find((x) => x.id === paymentId);
      if (!p || p.status !== "Simulated successful")
        throw new HttpError(
          "Only a successful demo transaction can be reconciled.",
        );
      p.reconciled = true;
      log(s, u, "Demo payment reconciled", p.id);
      return {};
    }
    case "manual-payment": {
      requireArea(u, "finance");
      const p = z
        .object({
          memberId: text,
          amount: z.coerce.number().positive().max(10000000),
          purpose: text,
        })
        .parse(d);
      if (!s.members.some((m) => m.id === p.memberId))
        throw new HttpError("Member not found.");
      s.payments.unshift({
        id: id("PAY"),
        ...p,
        status: "Pending",
        date: today(),
        reconciled: false,
        manual: true,
        createdBy: u!.id,
      });
      log(s, u, "Manual payment awaiting approval", p.memberId);
      return {};
    }
    case "approve-manual": {
      if (u?.role !== "Super Administrator")
        throw new HttpError("Super Administrator approval is required.", 403);
      const p = s.payments.find(
        (x) => x.id === d.paymentId && x.status === "Pending" && x.manual,
      );
      if (!p) throw new HttpError("Pending payment not found.");
      if (p.createdBy === u.id)
        throw new HttpError(
          "A different administrator must approve this manual entry.",
          403,
        );
      p.status = "Simulated successful";
      log(s, u, "Manual demo payment approved", p.id);
      return {};
    }
    case "reverse-payment": {
      requireArea(u, "finance");
      const { paymentId, note } = z
        .object({ paymentId: text, note: text })
        .parse(d);
      const p = s.payments.find(
        (p) => p.id === paymentId && p.status === "Simulated successful",
      );
      if (!p)
        throw new HttpError(
          "Only successful simulated payments can be reversed.",
        );
      if (p.renewal) {
        const m = s.members.find((m) => m.id === p.memberId);
        if (
          !m ||
          !p.previousExpiry ||
          !p.renewedExpiry ||
          m.expiry !== p.renewedExpiry
        )
          throw new HttpError(
            "A later renewal or legacy record prevents automatic reversal.",
          );
        m.expiry = p.previousExpiry;
        m.status = m.expiry >= today() ? "Active" : "Expired";
      }
      p.status = "Reversed";
      p.reconciled = false;
      log(s, u, "Simulated payment reversed", p.id + ": " + note);
      return {};
    }
    case "save-content": {
      requireArea(u, d.kind === "news" ? "content" : "resources");
      const c = z
        .object({
          kind: z.enum(["news", "publications", "resources"]),
          id: z.string().optional(),
          title: text,
          category: text,
          description: bodyText,
          body: bodyText,
          access: z.enum(["Public", "Members"]),
          featured: z.boolean(),
          status: z.enum(["Draft", "In review", "Published", "Archived"]),
          pdf: pdfSchema.optional(),
          titleNe: z.string().max(250).optional(),
          descriptionNe: z.string().max(20000).optional(),
          bodyNe: z.string().max(20000).optional(),
          seoTitle: z.string().max(250).optional(),
          seoDescription: z.string().max(300).optional(),
        })
        .parse(d);
      if (c.status === "Published" && u?.role === "Content Editor")
        throw new HttpError(
          "Submit for review; an administrator must publish.",
          403,
        );
      const list = s[c.kind];
      if (c.pdf) validatePdf(c.pdf);
      const old = list.find((x) => x.id === c.id);
      if (old?.status === "Published" && u?.role === "Content Editor")
        throw new HttpError(
          "A published edition requires administrator review. Create a separate draft for review.",
          403,
        );
      const content = {
        ...c,
        id: old?.id || id(c.kind === "news" ? "N" : "DOC"),
        date: today(),
        pdf: c.pdf || old?.pdf,
        image:
          old?.image ||
          (c.kind === "news"
            ? "/ippan/assembly.jpg"
            : "/ippan/publication.jpg"),
      };
      if (old) Object.assign(old, content);
      else list.unshift(content);
      log(s, u, "Content saved: " + c.status, c.title);
      return content;
    }
    case "save-settings": {
      requireArea(u, "content");
      if (u?.role === "Content Editor")
        throw new HttpError(
          "A secretariat administrator must approve homepage changes.",
          403,
        );
      const v = z
        .object({
          heroTitle: z.string().min(1).max(100),
          heroSubtitle: z.string().min(1).max(500),
          heroTitleNe: z.string().max(250).optional(),
          heroSubtitleNe: z.string().max(500).optional(),
          heroImage: z
            .enum([
              "/ippan/hydropower.jpg",
              "/ippan/assembly.jpg",
              "/ippan/expo.jpg",
            ])
            .optional(),
        })
        .parse(d);
      Object.assign(s.settings, v);
      log(s, u, "Homepage updated", "Hero content");
      return {};
    }
    case "save-event": {
      requireArea(u, "events");
      const e = z
        .object({
          id: z.string().optional(),
          title: text,
          date: z.string().min(10).max(30),
          location: text,
          description: bodyText,
          price: z.coerce.number().min(0).max(100000),
          ticketTypes: z
            .array(
              z.object({
                name: text,
                price: z.coerce.number().min(0).max(100000),
                capacity: z.coerce.number().int().min(1).max(10000),
              }),
            )
            .min(1)
            .max(10)
            .optional(),
          status: z.enum(["Draft", "Published"]),
        })
        .parse(d);
      if (
        e.ticketTypes &&
        new Set(e.ticketTypes.map((t) => t.name)).size !== e.ticketTypes.length
      )
        throw new HttpError("Ticket categories must have unique names.");
      if (Number.isNaN(Date.parse(e.date)))
        throw new HttpError("Enter a valid event date.");
      const old = s.events.find((x) => x.id === e.id);
      const ev = {
        ...e,
        id: old?.id || id("EV"),
        image: old?.image || "/ippan/expo.jpg",
        ticketTypes: e.ticketTypes || old?.ticketTypes,
      };
      if (old) Object.assign(old, ev);
      else s.events.unshift(ev);
      log(s, u, old ? "Event updated" : "Event created", e.title);
      return ev;
    }
    case "register": {
      const r = z
        .object({
          eventId: text,
          name: text,
          email: z.string().email(),
          simulate: z.boolean(),
          ticketType: z.string().max(250).optional(),
        })
        .parse(d);
      const e = s.events.find(
        (e) => e.id === r.eventId && e.status === "Published",
      );
      if (!e) throw new HttpError("Event is not available.", 404);
      if (new Date(e.date) < new Date())
        throw new HttpError("Registration for this event has closed.");
      const ticketTypes = e.ticketTypes || [
        { name: "General", price: e.price, capacity: 10000 },
      ];
      const ticket = ticketTypes.find(
        (t) => t.name === (r.ticketType || ticketTypes[0].name),
      );
      if (!ticket) throw new HttpError("Choose an available ticket category.");
      if (
        s.registrations.filter(
          (x) =>
            x.eventId === e.id && (x.ticketType || "General") === ticket.name,
        ).length >= ticket.capacity
      )
        throw new HttpError("This ticket category is full.");
      if (ticket.price > 0 && !r.simulate)
        throw new HttpError("Confirm simulated payment to register.");
      if (
        s.registrations.some(
          (x) => x.eventId === r.eventId && x.email === r.email,
        )
      )
        throw new HttpError("This email is already registered.");
      const registration = {
        id: id("REG"),
        eventId: e.id,
        name: r.name,
        email: r.email,
        memberId: u?.memberId,
        created: today(),
        attendance: false,
        amount: ticket.price,
        ticketType: ticket.name,
        paymentStatus: ticket.price
          ? ("Simulated successful" as const)
          : ("Free" as const),
      };
      s.registrations.push(registration);
      log(s, u, "Event registration", registration.id);
      return registration;
    }
    case "attendance": {
      requireArea(u, "events");
      const r = s.registrations.find((r) => r.id === d.registrationId);
      if (!r) throw new HttpError("Registration not found.");
      r.attendance = !r.attendance;
      log(s, u, "Attendance updated", r.id);
      return {};
    }
    case "save-project": {
      requireArea(u, "projects");
      const p = projectSchema.parse(d);
      if (!s.members.some((m) => m.id === p.memberId))
        throw new HttpError("Developer member does not exist.");
      const existing = s.projects.find((x) => x.id === p.id);
      if (existing) Object.assign(existing, p);
      else s.projects.push({ ...p, id: id("HP") });
      log(s, u, "Project saved", p.name);
      return {};
    }
    case "import-projects": {
      requireArea(u, "projects");
      const { projects } = z
        .object({ projects: z.array(projectSchema).min(1).max(100) })
        .parse(d);
      if (projects.some((p) => !s.members.some((m) => m.id === p.memberId)))
        throw new HttpError(
          "Every project must reference an existing developer member.",
        );
      for (const p of projects) s.projects.push({ ...p, id: id("HP") });
      log(s, u, "Projects imported", String(projects.length) + " CSV records");
      return { count: projects.length };
    }
    case "proxy": {
      const m = activeMember(s, u);
      const { representative } = z.object({ representative: text }).parse(d);
      if (s.proxies.some((p) => p.memberId === m.id && p.status !== "Rejected"))
        throw new HttpError("A proxy has already been submitted.");
      const p = {
        id: id("PROXY"),
        memberId: m.id,
        representative,
        status: "Pending" as const,
        date: today(),
      };
      s.proxies.push(p);
      log(s, u, "Proxy submitted", p.id);
      return p;
    }
    case "review-proxy": {
      requireArea(u, "agm");
      const { proxyId, status } = z
        .object({ proxyId: text, status: z.enum(["Approved", "Rejected"]) })
        .parse(d);
      const p = s.proxies.find(
        (p) => p.id === proxyId && p.status === "Pending",
      );
      if (!p) throw new HttpError("Pending proxy not found.");
      p.status = status;
      log(s, u, "Proxy " + status, p.id);
      return {};
    }
    case "save-ballot": {
      requireArea(u, "agm");
      const b = z
        .object({
          title: text,
          opens: z.string().max(40),
          closes: z.string().max(40),
          options: z.array(text).min(2).max(10),
        })
        .parse(d);
      if (
        Number.isNaN(Date.parse(b.opens)) ||
        Number.isNaN(Date.parse(b.closes)) ||
        Date.parse(b.closes) <= Date.parse(b.opens)
      )
        throw new HttpError("Choose a valid opening and closing window.");
      if (new Set(b.options).size !== b.options.length)
        throw new HttpError("Ballot options must be unique.");
      const ballot = {
        ...b,
        id: id("BALLOT"),
        status: "Draft" as const,
        votes: [],
      };
      s.ballots.push(ballot);
      log(s, u, "Ballot created", ballot.id);
      return ballot;
    }
    case "ballot-status": {
      requireArea(u, "agm");
      const { ballotId, status } = z
        .object({ ballotId: text, status: z.enum(["Open", "Closed"]) })
        .parse(d);
      const b = s.ballots.find((b) => b.id === ballotId);
      if (!b) throw new HttpError("Ballot not found.");
      if (b.status === "Closed" || (status === "Closed" && b.status !== "Open"))
        throw new HttpError("Invalid ballot transition.");
      b.status = status;
      log(s, u, "Ballot " + status, b.id);
      return {};
    }
    case "vote": {
      const m = activeMember(s, u);
      const { ballotId, option } = z
        .object({ ballotId: text, option: text })
        .parse(d);
      const b = s.ballots.find((x) => x.id === ballotId);
      if (
        !b ||
        b.status !== "Open" ||
        Date.now() < Date.parse(b.opens) ||
        Date.now() > Date.parse(b.closes)
      )
        throw new HttpError("Voting is not open.");
      if (!b.options.includes(option))
        throw new HttpError("Invalid ballot option.");
      if (b.votes.some((v) => v.memberId === m.id))
        throw new HttpError("Your membership has already voted.");
      b.votes.push({ memberId: m.id, option, date: now() });
      log(s, u, "Vote recorded", b.id);
      return { confirmation: "Vote recorded. One vote per membership." };
    }
    case "correspondence": {
      requireArea(u, "secretariat");
      const c = z
        .object({
          direction: z.enum(["Incoming", "Outgoing"]),
          subject: text,
          sender: text,
          assignee: text,
        })
        .parse(d);
      const record = {
        ...c,
        id: id(c.direction === "Incoming" ? "DAR" : "CHA"),
        date: today(),
        status: "Open" as const,
      };
      s.correspondence.unshift(record);
      log(s, u, "Correspondence registered", record.id);
      return record;
    }
    case "correspondence-status": {
      requireArea(u, "secretariat");
      const c = s.correspondence.find((x) => x.id === d.id);
      if (!c) throw new HttpError("Correspondence not found.");
      c.status = c.status === "Completed" ? "Open" : "Completed";
      log(s, u, "Correspondence status updated", c.id);
      return {};
    }
    case "task": {
      requireArea(u, "secretariat");
      const t = z
        .object({
          title: text,
          assignee: text,
          due: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          meeting: text,
        })
        .parse(d);
      s.tasks.unshift({ ...t, id: id("TASK"), status: "Pending" });
      log(s, u, "Meeting decision assigned", t.title);
      return {};
    }
    case "task-status": {
      requireArea(u, "secretariat");
      const t = s.tasks.find((x) => x.id === d.id);
      if (!t) throw new HttpError("Task not found.");
      t.status = t.status === "Completed" ? "Pending" : "Completed";
      log(s, u, "Task status updated", t.id);
      return {};
    }
    case "message": {
      requireArea(u, "communications");
      const m = z
        .object({
          title: text,
          segment: text,
          body: bodyText.optional(),
          template: text.optional(),
          plannedDate: z.string().max(30).optional(),
          status: z.enum(["Draft", "Simulated"]),
        })
        .parse(d);
      s.messages.unshift({ ...m, id: id("MSG"), date: today() });
      log(s, u, "Communication " + m.status, m.title);
      return {};
    }
    case "profile-request": {
      const m = requireMember(s, u);
      const { note } = z.object({ note: bodyText }).parse(d);
      s.correspondence.unshift({
        id: id("DAR"),
        direction: "Incoming",
        subject: "Member profile update: " + note.slice(0, 150),
        sender: m.name,
        assignee: "Membership Officer",
        date: today(),
        status: "Open",
      });
      log(s, u, "Profile update requested", m.id);
      return {};
    }
    case "change-password": {
      if (!u) throw new HttpError("Sign in first.", 401);
      const { oldPassword, password } = z
        .object({ oldPassword: text, password: z.string().min(12).max(200) })
        .parse(d);
      const user = s.users.find((x) => x.id === u.id)!;
      const [salt, hash] = user.passwordHash.split(":");
      if (
        !timingSafeEqual(
          scryptSync(oldPassword, salt, 64),
          Buffer.from(hash, "hex"),
        )
      )
        throw new HttpError("Current password is incorrect.");
      user.passwordHash = hashPassword(password);
      s.sessions = s.sessions.filter((x) => x.userId !== u.id);
      log(s, u, "Password changed", "All sessions revoked");
      return {};
    }
    case "set-role": {
      requireArea(u, "users");
      const { userId, role } = z
        .object({ userId: text, role: z.enum(roles as [Role, ...Role[]]) })
        .parse(d);
      if (userId === u!.id)
        throw new HttpError("You cannot change your own role.");
      const user = s.users.find((x) => x.id === userId);
      if (!user) throw new HttpError("User not found.");
      if (role === "Member" && !user.memberId)
        throw new HttpError(
          "Assign a member record before changing to Member.",
        );
      user.role = role;
      s.sessions = s.sessions.filter((x) => x.userId !== userId);
      log(s, u, "User role updated", user.email + " → " + role);
      return {};
    }
    default:
      throw new HttpError("Unknown action.", 400);
  }
}
