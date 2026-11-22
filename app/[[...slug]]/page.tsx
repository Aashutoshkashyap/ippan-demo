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
      root === "/hydropower"
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
