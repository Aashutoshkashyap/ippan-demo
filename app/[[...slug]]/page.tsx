import Platform from "@/ippan/platform";
import { notFound } from "next/navigation";
import { readState, storageMode } from "@/ippan/server/store";
import { viewer, snapshot } from "@/ippan/server/service";
import { token } from "@/ippan/server/http";
import { nav, type Snapshot } from "@/ippan/model";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const path = "/" + ((await params).slug || []).join("/");
  const roots = [
    "/",
    "/about",
    "/members",
    "/news",
    "/events",
    "/publications",
    "/resources",
    "/hydropower",
    "/contact",
    "/membership",
    "/track",
    "/login",
    "/media",
    "/search",
    "/agm",
    "/pages",
  ];
  const parts = path.split("/").filter(Boolean);
  const root = "/" + (parts[0] || "");
  if (!roots.includes(root) && !["/admin", "/portal"].includes(root))
    notFound();
  if (
    root === "/admin" &&
    (parts.length > 2 || (parts[1] && !nav.some((n) => n[0] === parts[1])))
  )
    notFound();
  if (
    root === "/portal" &&
    (parts.length > 2 ||
      (parts[1] &&
        ![
          "overview",
          "profile",
          "payments",
          "events",
          "resources",
          "agm",
          "notifications",
        ].includes(parts[1])))
  )
    notFound();
  if (
    parts.length > 1 &&
    ![
      "/members",
      "/news",
      "/events",
      "/publications",
      "/resources",
      "/hydropower",
      "/admin",
      "/portal",
      "/pages",
    ].includes(root)
  )
    notFound();
  const s = await readState();
  const initialData = {
    ...snapshot(s, viewer(s, await token())),
    storage: storageMode(),
  } as Snapshot;
  if (parts.length > 1 && !["/admin", "/portal"].includes(root)) {
    const list =
      root === "/pages"
        ? (initialData.sitePages || []).map((p) => ({ ...p, id: p.slug }))
        : root === "/hydropower"
          ? initialData.projects
          : root === "/members"
            ? initialData.members
            : initialData[
                parts[0] as "news" | "events" | "resources" | "publications"
              ];
    if (parts.length !== 2 || !list.some((item) => item.id === parts[1]))
      notFound();
  }
  return <Platform path={path} initialData={initialData} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const parts = (await params).slug || [];
  const labels: Record<string, string> = {
    about: "About IPPAN",
    membership: "IPPAN Membership",
    members: "Member directory",
    hydropower: "Hydropower Database",
    resources: "Energy Resource Centre",
    publications: "Publications",
    events: "Events & AGM",
    agm: "Annual General Meeting",
    media: "News & Media",
    search: "Search IPPAN",
    contact: "Contact IPPAN",
    login: "Secure sign in",
    admin: "Administration",
    portal: "Member portal",
  };
  let title = labels[parts[0]] || "Powering Nepal, Together";
  let description =
    "The integrated platform for Nepal’s independent energy community.";
  if (
    parts.length === 2 &&
    ["pages", "news", "publications", "resources", "hydropower"].includes(
      parts[0],
    )
  ) {
    const s = await readState();
    if (parts[0] === "pages") {
      const p = s.sitePages?.find(
        (p) => p.slug === parts[1] && p.status === "Published",
      );
      if (p) {
        title = p.title;
        description = p.seoDescription || p.body.slice(0, 160);
      }
    } else if (parts[0] === "hydropower") {
      const p = s.projects.find((p) => p.id === parts[1]);
      if (p) {
        title = p.name;
        description =
          p.developer +
          " · " +
          p.province +
          " · " +
          p.capacity +
          " MW · demonstration project record";
      }
    } else {
      const p = s[parts[0] as "news" | "publications" | "resources"].find(
        (p) =>
          p.id === parts[1] &&
          p.status === "Published" &&
          p.access === "Public",
      );
      if (p) {
        title = p.seoTitle || p.title;
        description = p.seoDescription || p.description;
      }
    }
  }
  return {
    title: title + " | IPPAN",
    description,
    robots:
      parts[0] === "admin" || parts[0] === "portal"
        ? { index: false, follow: false }
        : undefined,
  };
}
