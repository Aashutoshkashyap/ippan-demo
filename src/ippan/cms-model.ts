import type { Content, SitePage, State } from "./model";
export const cmsKinds = ["news", "pages", "resources", "publications"] as const;
export type CmsKind = (typeof cmsKinds)[number];
export type CmsEdition = Partial<Content & SitePage>;
export type CmsRevision = {
  id: string;
  kind: CmsKind;
  targetId?: string;
  edition: CmsEdition;
  baseFingerprint: string;
  status:
    | "Draft"
    | "In review"
    | "Changes requested"
    | "Published"
    | "Archived";
  authorId: string;
  author: string;
  updated: string;
  version: number;
  notifyMembers: boolean;
  history: { at: string; actor: string; action: string; note: string }[];
};
export const kindLabels: Record<CmsKind, string> = {
  news: "News & notices",
  pages: "Institutional pages",
  resources: "Energy resources",
  publications: "Publications",
};
export function cmsArea(kind: CmsKind) {
  return kind === "pages"
    ? "website"
    : kind === "news"
      ? "content"
      : "resources";
}
export function cmsAddress(kind: CmsKind, record: CmsEdition) {
  return kind === "pages"
    ? "/pages/" + record.slug
    : "/" + kind + "/" + record.id;
}
export function editorialImage(
  record: { image?: string; imageMediaId?: string },
  media: State["media"],
) {
  return (
    media?.find(
      (m) =>
        m.id === record.imageMediaId &&
        m.type === "Photo" &&
        m.status === "Published",
    )?.url ||
    record.image ||
    "/ippan/assembly.jpg"
  );
}
export function homepageContent<T extends Content>(records: T[]) {
  return records
    .filter((r) => r.status === "Published" && r.access === "Public")
    .sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) ||
        b.date.localeCompare(a.date) ||
        a.id.localeCompare(b.id),
    );
}
export const sectionSources = [
  {
    key: "glance",
    name: "IPPAN at a glance",
    source: "Visible members & project register",
    area: "members",
    href: "/members",
  },
  {
    key: "sector",
    name: "Hydropower sector overview",
    source: "Project status & capacity",
    area: "projects",
    href: "/hydropower",
  },
  {
    key: "projects",
    name: "Project explorer",
    source: "Coordinates, province & project records",
    area: "projects",
    href: "/hydropower",
  },
  {
    key: "membership",
    name: "Membership",
    source: "Enabled categories & visible members",
    area: "categories",
    href: "/membership",
  },
  {
    key: "news",
    name: "News & notices",
    source: "Published public editions · featured first",
    area: "content",
    href: "/news",
  },
  {
    key: "events",
    name: "Events & AGM",
    source: "Upcoming published events & AGM settings",
    area: "events",
    href: "/events",
  },
  {
    key: "resources",
    name: "Energy resource centre",
    source: "Published public resources · featured first",
    area: "resources",
    href: "/resources",
  },
  {
    key: "publications",
    name: "Publications",
    source: "Published public editions · featured first",
    area: "content",
    href: "/publications",
  },
  {
    key: "media",
    name: "Institutional activities & media",
    source: "Published photo & video library",
    area: "website",
    href: "/media",
  },
] as const;
