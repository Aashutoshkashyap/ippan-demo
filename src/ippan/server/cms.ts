import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { State, Viewer, SitePage, Content } from "../model";
import {
  CmsKind,
  cmsKinds,
  cmsArea,
  cmsAddress,
  CmsRevision,
} from "../cms-model";
import { homeSections } from "../extensions-model";
import { applyAction, HttpError, requireArea } from "./service";
import { checkedPdf } from "./extensions";
const text = z.string().trim().min(1).max(250);
const optionalText = z.string().trim().max(20000).default("");
const photo = z.string().max(100).default("");
const common = {
  title: text,
  titleNe: z.string().max(250).default(""),
  body: z.string().trim().min(1).max(20000),
  bodyNe: optionalText,
  seoDescription: z.string().max(300).default(""),
};
const pageSchema = z.object({
  ...common,
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(80),
  menuLabel: z.string().max(80).default(""),
  order: z.coerce.number().int().min(0).max(100).default(10),
  menuGroup: z
    .enum(["About IPPAN", "Membership", "News & Media", "Events & AGM"])
    .default("About IPPAN"),
});
const contentSchema = z.object({
  ...common,
  category: text,
  description: z.string().trim().min(1).max(20000),
  descriptionNe: optionalText,
  seoTitle: z.string().max(250).default(""),
  access: z.enum(["Public", "Members"]),
  featured: z.boolean(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(
      (v) => !Number.isNaN(Date.parse(v)),
      "Use a valid publication date.",
    ),
  imageMediaId: photo,
  pdf: z.object({ name: text, data: z.string().max(2800000) }).optional(),
});
export function cmsTarget(s: State, kind: CmsKind, targetId?: string) {
  return (kind === "pages" ? s.sitePages! : s[kind]).find(
    (r) => r.id === targetId,
  );
}
export function cmsFingerprint(record: unknown) {
  return record
    ? createHash("sha256").update(JSON.stringify(record)).digest("hex")
    : "new";
}
function revision(s: State, u: Viewer | null, id: string) {
  const r = s.cmsRevisions!.find((r) => r.id === id);
  if (!r) throw new HttpError("Working edition not found.", 404);
  requireArea(u, cmsArea(r.kind));
  return r;
}
function audit(s: State, u: Viewer, action: string, detail: string) {
  s.audit.unshift({
    id: "AUD-" + randomBytes(6).toString("hex"),
    date: new Date().toISOString(),
    actor: u.name,
    action,
    detail,
  });
}
function checkPhoto(s: State, mediaId?: string) {
  if (
    mediaId &&
    !s.media!.some(
      (m) => m.id === mediaId && m.type === "Photo" && m.status === "Published",
    )
  )
    throw new HttpError("Select a published photo from the media library.");
}
export function cmsAction(
  s: State,
  u: Viewer | null,
  action: string,
  data: Record<string, unknown>,
): { handled: boolean; result?: unknown } {
  if (!action.startsWith("cms-")) return { handled: false };
  if (action === "cms-save") {
    const d = z
      .object({
        id: z.string().optional(),
        kind: z.enum(cmsKinds),
        targetId: z.string().optional(),
        expectedVersion: z.number().int().optional(),
        baseFingerprint: z.string().optional(),
        edition: z.record(z.string(), z.unknown()),
        submit: z.boolean().default(false),
        notifyMembers: z.boolean().default(false),
      })
      .parse(data);
    requireArea(u, cmsArea(d.kind));
    const old = d.id ? revision(s, u, d.id) : undefined;
    if (old && (old.kind !== d.kind || old.targetId !== d.targetId))
      throw new HttpError("The edition target cannot change.");
    if (old && ["Published", "Archived"].includes(old.status))
      throw new HttpError("Start a new working edition for this record.", 409);
    if (old && old.version !== d.expectedVersion)
      throw new HttpError(
        "Another staff member updated this edition. Close and reopen it before saving.",
        409,
      );
    const target = cmsTarget(s, d.kind, d.targetId);
    if (d.targetId && !target)
      throw new HttpError("The original record no longer exists.", 404);
    if (!old && target && d.baseFingerprint !== cmsFingerprint(target))
      throw new HttpError(
        "The live record changed. Reopen it before starting an edition.",
        409,
      );
    if (
      !old &&
      d.targetId &&
      s.cmsRevisions!.some(
        (r) =>
          r.kind === d.kind &&
          r.targetId === d.targetId &&
          !["Published", "Archived"].includes(r.status),
      )
    )
      throw new HttpError(
        "A working edition already exists. Open it from the publishing desk.",
        409,
      );
    const edition =
      d.kind === "pages"
        ? pageSchema.parse(d.edition)
        : contentSchema.parse(d.edition);
    if ("pdf" in edition && edition.pdf) checkedPdf(edition.pdf);
    if ("imageMediaId" in edition) checkPhoto(s, edition.imageMediaId);
    if (
      d.kind === "pages" &&
      s.sitePages!.some(
        (p) => p.slug === (edition as SitePage).slug && p.id !== d.targetId,
      )
    )
      throw new HttpError("That page address already exists.");
    const at = new Date().toISOString();
    const row: CmsRevision = {
      id: old?.id || "ED-" + randomBytes(6).toString("hex").toUpperCase(),
      kind: d.kind,
      targetId: d.targetId,
      edition: {
        ...edition,
        ...(!("pdf" in edition) && old?.edition.pdf
          ? { pdf: old.edition.pdf }
          : {}),
      },
      baseFingerprint: old?.baseFingerprint || cmsFingerprint(target),
      status: d.submit ? "In review" : "Draft",
      authorId: old?.authorId || u!.id,
      author: old?.author || u!.name,
      updated: at,
      version: (old?.version || 0) + 1,
      notifyMembers: d.kind !== "pages" && d.notifyMembers,
      history: [
        ...(old?.history || []),
        {
          at,
          actor: u!.name,
          action: d.submit ? "Submitted for review" : "Draft saved",
          note: "",
        },
      ],
    };
    if (old) Object.assign(old, row);
    else s.cmsRevisions!.unshift(row);
    audit(
      s,
      u!,
      d.submit ? "Edition submitted" : "Working edition saved",
      edition.title,
    );
    return { handled: true, result: { id: row.id, version: row.version } };
  }
  if (action === "cms-review") {
    const d = z
      .object({
        id: z.string(),
        expectedVersion: z.number().int(),
        decision: z.enum(["Publish", "Request changes", "Archive draft"]),
        note: z.string().trim().max(2000).default(""),
      })
      .parse(data);
    const r = revision(s, u, d.id);
    if (u!.role === "Content Editor")
      throw new HttpError("An administrator must review this edition.", 403);
    if (r.version !== d.expectedVersion)
      throw new HttpError(
        "This edition changed. Reopen it before reviewing.",
        409,
      );
    if (["Published", "Archived"].includes(r.status))
      throw new HttpError("This edition has already been closed.", 409);
    if (d.decision === "Publish" && r.status !== "In review")
      throw new HttpError("Submit the working edition for review first.");
    if (d.decision === "Request changes" && !d.note)
      throw new HttpError("Explain the changes needed for the editor.");
    if (d.decision === "Publish") {
      const target = cmsTarget(s, r.kind, r.targetId);
      if (cmsFingerprint(target) !== r.baseFingerprint)
        throw new HttpError(
          "The live record changed after this edition was started. Create a fresh edition and reconcile the changes before publishing.",
          409,
        );
      if (r.kind !== "pages") checkPhoto(s, r.edition.imageMediaId);
      const saved = applyAction(s, u, {
        action: r.kind === "pages" ? "save-page" : "save-content",
        data: {
          ...r.edition,
          id: r.targetId,
          kind: r.kind,
          status: "Published",
        },
      }) as Content | SitePage;
      r.targetId = saved.id;
      r.status = "Published";
      if (r.notifyMembers && r.kind !== "pages") {
        for (const m of s.members.filter(
          (m) =>
            m.status === "Active" &&
            m.expiry >= new Date().toISOString().slice(0, 10),
        ))
          s.notifications.unshift({
            id: "NOT-" + randomBytes(6).toString("hex"),
            memberId: m.id,
            title: r.edition.title!,
            date: new Date().toISOString(),
            href: cmsAddress(r.kind, saved),
          });
      }
    } else
      r.status =
        d.decision === "Request changes" ? "Changes requested" : "Archived";
    r.updated = new Date().toISOString();
    r.version++;
    r.history.push({
      at: r.updated,
      actor: u!.name,
      action: d.decision,
      note: d.note,
    });
    audit(s, u!, "Edition: " + d.decision, r.edition.title!);
    return {
      handled: true,
      result: { id: r.id, targetId: r.targetId, status: r.status },
    };
  }
  if (action === "cms-homepage") {
    requireArea(u, "website");
    if (u!.role === "Content Editor")
      throw new HttpError(
        "A secretariat administrator must approve homepage changes.",
        403,
      );
    const d = z
      .object({
        heroTitle: z.string().trim().min(1).max(100),
        heroSubtitle: z.string().trim().min(1).max(500),
        heroTitleNe: z.string().max(250),
        heroSubtitleNe: z.string().max(500),
        heroImage: z.enum([
          "/ippan/hydropower.jpg",
          "/ippan/assembly.jpg",
          "/ippan/expo.jpg",
        ]),
        heroMediaId: photo,
        sections: z
          .array(z.enum(homeSections as [string, ...string[]]))
          .max(homeSections.length),
        homeCopy: z.record(
          z.string(),
          z.object({
            title: z.string().trim().max(150),
            titleNe: z.string().trim().max(150),
          }),
        ),
      })
      .parse(data);
    if (new Set(d.sections).size !== d.sections.length)
      throw new HttpError("Sections cannot repeat.");
    if (Object.keys(d.homeCopy).some((key) => !homeSections.includes(key)))
      throw new HttpError("Unknown homepage section.");
    checkPhoto(s, d.heroMediaId);
    Object.assign(s.settings, d);
    audit(
      s,
      u!,
      "Homepage published",
      "Banner, section visibility and bilingual section headings",
    );
    return { handled: true, result: {} };
  }
  throw new HttpError("Unknown publishing action.");
}
