"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Globe2,
  Image as ImageIcon,
  Layers,
  Plus,
  Search,
  Workflow,
  Eye,
  History,
  Link2,
} from "lucide-react";
import {
  usePlatform,
  Panel,
  Form,
  Field,
  Modal,
  Table,
  Badge,
  Empty,
  date,
  readPdfFiles,
} from "./ui";
import { can, Content, SitePage } from "./model";
import {
  CmsEdition,
  CmsKind,
  CmsRevision,
  cmsKinds,
  cmsArea,
  cmsAddress,
  kindLabels,
  editorialImage,
  homepageContent,
  sectionSources,
} from "./cms-model";
import { InstitutionalAdmin } from "./institutional-admin";
import { EditorialBody } from "./editorial-body";
import { isActive } from "./analytics-data";
type Selection = { kind: CmsKind; record?: CmsEdition; revision?: CmsRevision };
export function WebsiteCms() {
  const { data } = usePlatform();
  const [tab, setTab] = useState("Publishing desk");
  const [edit, setEdit] = useState<Selection | null>(null);
  const [review, setReview] = useState<CmsRevision | null>(null);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("All types");
  const [state, setState] = useState("Current editions");
  const allowed = cmsKinds.filter((k) => can(data.viewer!.role, cmsArea(k)));
  const revisions = (data.cmsRevisions || []).filter((r) =>
    allowed.includes(r.kind),
  );
  const records = allowed.flatMap((kind) =>
    (kind === "pages" ? data.sitePages || [] : data[kind]).map((record) => ({
      kind,
      record,
    })),
  );
  const rows: Selection[] = records.map(({ kind, record }) => ({
    kind,
    record,
    revision: revisions.find(
      (r) =>
        r.kind === kind &&
        r.targetId === record.id &&
        !["Published", "Archived"].includes(r.status),
    ),
  }));
  rows.unshift(
    ...revisions
      .filter(
        (r) => !r.targetId && !["Published", "Archived"].includes(r.status),
      )
      .map((revision) => ({ kind: revision.kind, revision })),
  );
  const filtered = rows.filter((row) => {
    const edition = row.revision?.edition || row.record!;
    const status = row.revision?.status || row.record?.status;
    return (
      (kind === "All types" || kind === row.kind) &&
      (state === "All states" ||
        (state === "Current editions"
          ? status !== "Archived"
          : status === state)) &&
      (
        edition.title +
        " " +
        (edition.category || "") +
        " " +
        (edition.slug || "")
      )
        .toLowerCase()
        .includes(q.toLowerCase())
    );
  });
  const pending = revisions.filter((r) => r.status === "In review");
  return (
    <div className="cms-workspace">
      <div className="workspace-title">
        <div>
          <div className="welcome-eyebrow">
            IPPAN PUBLISHING & DIGITAL SERVICES
          </div>
          <h1>One platform. A connected institution.</h1>
          <p>
            Prepare, review and publish the information your members depend on.
          </p>
        </div>
        <Link className="button" href="/" target="_blank">
          <Globe2 size={17} />
          View website
          <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className="cms-summary">
        {[
          {
            n: records.filter((r) => r.record.status === "Published").length,
            label: "Published editions",
            icon: Globe2,
          },
          {
            n: revisions.filter((r) =>
              ["Draft", "Changes requested"].includes(r.status),
            ).length,
            label: "Working drafts",
            icon: FileText,
          },
          { n: pending.length, label: "Awaiting review", icon: CheckCircle2 },
          {
            n: data.media?.filter((m) => m.status === "Published").length || 0,
            label: "Published media",
            icon: ImageIcon,
          },
        ].map(({ n, label, icon: Icon }) => (
          <div key={label}>
            <Icon size={20} />
            <span>
              <strong>{n}</strong>
              <small>{label}</small>
            </span>
          </div>
        ))}
      </div>
      <div className="tabs cms-tabs" aria-label="CMS sections">
        {[
          "Publishing desk",
          "Homepage studio",
          "Navigation",
          "Media library",
          "Leadership",
          "Service connections",
        ].map((label) => (
          <button
            key={label}
            className={tab === label ? "active" : ""}
            onClick={() => setTab(label)}
          >
            {label}
            {label === "Publishing desk" && pending.length > 0 ? (
              <b>{pending.length}</b>
            ) : null}
          </button>
        ))}
      </div>
      {tab === "Publishing desk" && (
        <>
          <div className="cms-toolbar">
            <label className="cms-search">
              <Search size={17} />
              <input
                aria-label="Search publishing desk"
                placeholder="Search title, category or page address…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </label>
            <select
              aria-label="Content type"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
            >
              <option>All types</option>
              {allowed.map((k) => (
                <option key={k} value={k}>
                  {kindLabels[k]}
                </option>
              ))}
            </select>
            <select
              aria-label="Editorial state"
              value={state}
              onChange={(e) => setState(e.target.value)}
            >
              {[
                "Current editions",
                "All states",
                "Draft",
                "In review",
                "Changes requested",
                "Published",
                "Archived",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <button
              className="button primary"
              onClick={() =>
                setEdit({
                  kind: kind === "All types" ? allowed[0] : (kind as CmsKind),
                })
              }
            >
              <Plus size={17} />
              Create content
            </button>
          </div>
          <Panel
            className="cms-edition-panel"
            title="The publishing desk"
            sub="A working edition stays private until approved. Existing public links stay the same when a revision is published."
          >
            <Table
              headers={[
                "Content & destination",
                "Audience",
                "Editorial state",
                "Readiness",
                "Actions",
              ]}
            >
              {filtered.map((row) => {
                const edition = row.revision?.edition || row.record!;
                const published = row.record?.status === "Published";
                return (
                  <tr key={row.revision?.id || row.kind + row.record?.id}>
                    <td>
                      <strong>{edition.title}</strong>
                      <small>
                        {kindLabels[row.kind]}
                        {row.record
                          ? " · " + cmsAddress(row.kind, row.record)
                          : " · New edition"}
                      </small>
                      {row.revision && (
                        <small>
                          Edited by {row.revision.author} ·{" "}
                          {date(row.revision.updated)}
                        </small>
                      )}
                    </td>
                    <td>
                      {edition.access || "Public"}
                      {edition.featured && edition.access === "Public" && (
                        <small>Homepage priority</small>
                      )}
                    </td>
                    <td>
                      <Badge>
                        {row.revision?.status || row.record?.status}
                      </Badge>
                      {row.revision && published && (
                        <small className="cms-live-dot">
                          Current edition remains live
                        </small>
                      )}
                    </td>
                    <td>
                      <small>
                        {edition.titleNe && edition.bodyNe
                          ? "EN + नेपाली"
                          : "EN · Nepali edition missing"}
                      </small>
                      <small>
                        {edition.seoDescription
                          ? "SEO description ready"
                          : "SEO description missing"}
                      </small>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="button small"
                          onClick={() => setEdit(row)}
                        >
                          {row.revision
                            ? "Edit working edition"
                            : published
                              ? "Revise"
                              : "Edit"}
                        </button>
                        {row.revision && (
                          <button
                            className="button small"
                            onClick={() => setReview(row.revision!)}
                          >
                            Preview & review
                          </button>
                        )}
                        {published && (
                          <Link
                            className="text-link"
                            href={cmsAddress(row.kind, row.record!)}
                            target="_blank"
                          >
                            Live ↗
                          </Link>
                        )}
                        <button
                          className="icon-button"
                          aria-label={"Edition history: " + edition.title}
                          onClick={() =>
                            setReview(
                              row.revision ||
                                revisions.find(
                                  (r) =>
                                    r.targetId === row.record?.id &&
                                    r.kind === row.kind,
                                ) ||
                                null,
                            )
                          }
                          disabled={
                            !row.revision &&
                            !revisions.some(
                              (r) =>
                                r.targetId === row.record?.id &&
                                r.kind === row.kind,
                            )
                          }
                        >
                          <History size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </Table>
            {!filtered.length && (
              <Empty text="No editions match these filters." />
            )}
          </Panel>
          <div className="cms-guidance">
            <Workflow size={22} />
            <div>
              <strong>Draft → Review → Publish → Member services</strong>
              <p>
                Publishing updates the website, search and relevant homepage
                section. Member-only editions stay behind active membership
                checks. Optional portal notifications link members to the
                approved edition.
              </p>
            </div>
            <button
              className="text-link"
              onClick={() => setTab("Service connections")}
            >
              Explore connections →
            </button>
          </div>
        </>
      )}
      {tab === "Homepage studio" && (
        <HomepageStudio
          onContent={(k) => {
            setKind(k);
            setTab("Publishing desk");
          }}
          onMedia={() => setTab("Media library")}
        />
      )}
      {tab === "Navigation" && (
        <Panel
          title="Navigation follows published pages"
          sub="Choose a menu group, label and order in a page’s working edition. Drafts never appear in public menus."
        >
          <Table
            headers={[
              "Menu group",
              "Label",
              "Destination",
              "Order",
              "State",
              "",
            ]}
          >
            {(data.sitePages || [])
              .filter((p) => p.menuLabel && p.slug !== "privacy")
              .sort((a, b) => a.order - b.order)
              .map((p) => (
                <tr key={p.id}>
                  <td>{p.menuGroup || "About IPPAN"}</td>
                  <td>{p.menuLabel}</td>
                  <td>/pages/{p.slug}</td>
                  <td>{p.order}</td>
                  <td>
                    <Badge>{p.status}</Badge>
                  </td>
                  <td>
                    <button
                      className="button small"
                      onClick={() =>
                        setEdit({
                          kind: "pages",
                          record: p,
                          revision: revisions.find(
                            (r) =>
                              r.targetId === p.id &&
                              !["Published", "Archived"].includes(r.status),
                          ),
                        })
                      }
                    >
                      Edit page & menu
                    </button>
                  </td>
                </tr>
              ))}
          </Table>
          <button className="button" onClick={() => setEdit({ kind: "pages" })}>
            <Plus size={16} />
            Create a page
          </button>
        </Panel>
      )}
      {tab === "Media library" && (
        <>
          <div className="callout">
            Publish an approved photo here, then reuse it as a homepage banner
            or an editorial cover in the publishing desk.
          </div>
          <InstitutionalAdmin
            key="media"
            area="website"
            initialTab="Media"
            embedded
          />
        </>
      )}
      {tab === "Leadership" && (
        <InstitutionalAdmin
          key="leadership"
          area="website"
          initialTab="Leadership"
          embedded
        />
      )}
      {tab === "Service connections" && <ServiceConnections />}
      {edit && (
        <Modal
          title={
            edit.revision
              ? "Working edition"
              : edit.record
                ? "Revise existing content"
                : "Create an edition"
          }
          close={() => setEdit(null)}
        >
          <EditionEditor
            key={edit.revision?.id || edit.record?.id || edit.kind}
            selection={edit}
            allowed={allowed}
            done={() => setEdit(null)}
          />
        </Modal>
      )}
      {review && (
        <Modal
          title="Preview, approval & history"
          close={() => setReview(null)}
        >
          <EditionReview revision={review} close={() => setReview(null)} />
        </Modal>
      )}
    </div>
  );
}
function EditionEditor({
  selection,
  allowed,
  done,
}: {
  selection: Selection;
  allowed: CmsKind[];
  done: () => void;
}) {
  const { data, act, notify } = usePlatform();
  const [kind, setKind] = useState(selection.kind);
  const original = selection.revision?.edition || selection.record || {};
  const [preview, setPreview] = useState<CmsEdition>(original);
  const [language, setLanguage] = useState("English");
  const [showPreview, setShowPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const r = selection.revision;
  const current = selection.record;
  return (
    <>
      <div className="callout">
        {current?.status === "Published"
          ? "Your changes are kept in a private working edition. The published version stays available until a reviewer approves this revision."
          : "Save a draft, preview both languages, then submit it to an administrator for review."}
      </div>
      {r?.status === "Changes requested" && (
        <div className="cms-review-note">
          <strong>Changes requested</strong>
          <p>{r.history.at(-1)?.note}</p>
        </div>
      )}
      {!current && !r && (
        <label className="field">
          <span>Content type</span>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as CmsKind)}
          >
            {allowed.map((k) => (
              <option value={k} key={k}>
                {kindLabels[k]}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="cms-editor-switch">
        <button
          type="button"
          className={showPreview ? "button small" : "button small primary"}
          onClick={() => setShowPreview(false)}
        >
          Write
        </button>
        <button
          type="button"
          className={showPreview ? "button small primary" : "button small"}
          onClick={() => setShowPreview(true)}
        >
          <Eye size={15} />
          Preview
        </button>
        <select
          aria-label="Preview language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option>English</option>
          <option>नेपाली</option>
        </select>
      </div>
      {showPreview && (
        <EditionPreview
          edition={preview}
          kind={kind}
          nepali={language !== "English"}
        />
      )}
      <div
        hidden={showPreview}
        onChange={(e) => {
          const form = (e.target as HTMLElement).closest("form");
          if (form) {
            const values = Object.fromEntries(new FormData(form).entries());
            setPreview({
              ...original,
              ...values,
              imageMediaId: String(values.imageMediaId || ""),
            });
          }
        }}
      >
        <Form
          key={kind}
          label="Save working edition"
          onSubmit={async (d, form) => {
            setBusy(true);
            try {
              const pdf = (await readPdfFiles(form, "pdfFile"))[0];
              await act("cms-save", {
                id: r?.id,
                kind,
                targetId: r?.targetId || current?.id,
                expectedVersion: r?.version,
                baseFingerprint:
                  data.cmsFingerprints?.[kind + ":" + current?.id],
                submit: d.workflow === "In review",
                notifyMembers: d.notifyMembers === "on",
                edition: {
                  ...d,
                  featured: d.featured === "Yes",
                  ...(pdf ? { pdf } : {}),
                  order: Number(d.order || 10),
                },
              });
              notify(
                d.workflow === "In review"
                  ? "Edition submitted. The published version is unchanged until approval."
                  : "Private working edition saved.",
              );
              done();
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="form-grid">
            <Field
              name="title"
              label="Title — English"
              value={original.title}
            />
            <Field
              name="titleNe"
              label="Title — नेपाली"
              value={original.titleNe}
              required={false}
            />
          </div>
          {kind === "pages" ? (
            <div className="form-grid">
              <Field
                name="slug"
                label="Page address (lowercase-and-hyphens)"
                value={original.slug}
              />
              <Field
                name="menuLabel"
                label="Navigation label (blank to hide)"
                value={original.menuLabel}
                required={false}
              />
              <Field
                name="menuGroup"
                label="Navigation group"
                value={original.menuGroup || "About IPPAN"}
                options={[
                  "About IPPAN",
                  "Membership",
                  "News & Media",
                  "Events & AGM",
                ]}
              />
              <Field
                name="order"
                label="Navigation order"
                type="number"
                value={original.order ?? 10}
              />
            </div>
          ) : (
            <>
              <div className="form-grid">
                <Field
                  name="category"
                  label="Category"
                  value={
                    original.category ||
                    (kind === "news" ? "News" : "Research report")
                  }
                />
                <Field
                  name="date"
                  label="Publication date"
                  type="date"
                  value={original.date || new Date().toISOString().slice(0, 10)}
                />
              </div>
              <div className="form-grid">
                <Field
                  name="description"
                  label="Summary — English"
                  type="textarea"
                  value={original.description}
                />
                <Field
                  name="descriptionNe"
                  label="Summary — नेपाली"
                  type="textarea"
                  value={original.descriptionNe}
                  required={false}
                />
              </div>
            </>
          )}
          <div className="cms-writing-help">
            Use paragraphs, <strong>## headings</strong>,{" "}
            <strong>**bold text**</strong>, numbered steps and{" "}
            <strong>- lists</strong>. The preview uses the same reader as the
            website.
          </div>
          <Field
            name="body"
            label="Content — English"
            type="textarea"
            value={original.body}
          />
          <Field
            name="bodyNe"
            label="Content — नेपाली"
            type="textarea"
            value={original.bodyNe}
            required={false}
          />
          {kind !== "pages" && (
            <>
              <label className="field">
                <span>Cover image from published media</span>
                <select
                  name="imageMediaId"
                  defaultValue={original.imageMediaId || ""}
                >
                  <option value="">Keep existing / standard cover</option>
                  {data.media
                    ?.filter(
                      (m) => m.type === "Photo" && m.status === "Published",
                    )
                    .map((m) => (
                      <option value={m.id} key={m.id}>
                        {m.title}
                      </option>
                    ))}
                </select>
              </label>
              <div className="form-grid">
                <Field
                  name="access"
                  label="Audience"
                  value={original.access || "Public"}
                  options={["Public", "Members"]}
                />
                <Field
                  name="featured"
                  label="Prioritize on homepage"
                  value={original.featured ? "Yes" : "No"}
                  options={["No", "Yes"]}
                />
              </div>
              {kind !== "news" && (
                <label className="field">
                  <span>
                    PDF attachment (optional · maximum 2 MB · existing file is
                    retained)
                  </span>
                  <input name="pdfFile" type="file" accept="application/pdf" />
                </label>
              )}
              <Field
                name="seoTitle"
                label="Search engine title (optional)"
                value={original.seoTitle}
                required={false}
              />
              <label className="cms-checkbox">
                <input
                  name="notifyMembers"
                  type="checkbox"
                  defaultChecked={r?.notifyMembers || false}
                />
                Add a linked notification to active members’ portals when
                approved
              </label>
            </>
          )}
          <Field
            name="seoDescription"
            label="Search engine description (maximum 300 characters)"
            type="textarea"
            value={original.seoDescription}
            required={false}
          />
          <Field
            name="workflow"
            label="Next step"
            options={["Draft", "In review"]}
            value={r?.status === "In review" ? "In review" : "Draft"}
          />
          <p className="muted">
            Saving never publishes automatically. Member notifications are
            in-app only; email and SMS delivery remain disabled.
          </p>
        </Form>
        {busy && <p role="status">Saving the shared edition…</p>}
      </div>
    </>
  );
}
function EditionPreview({
  edition,
  kind,
  nepali = false,
}: {
  edition: CmsEdition;
  kind: CmsKind;
  nepali?: boolean;
}) {
  const { data } = usePlatform();
  const title = nepali && edition.titleNe ? edition.titleNe : edition.title;
  const summary =
    nepali && edition.descriptionNe
      ? edition.descriptionNe
      : edition.description;
  const body = nepali && edition.bodyNe ? edition.bodyNe : edition.body;
  return (
    <article className="cms-preview" lang={nepali ? "ne" : "en"}>
      <div className="cms-preview-context">
        <Badge>{edition.access || "Public"}</Badge>
        <span>{kindLabels[kind]} · Private preview</span>
      </div>
      <h2>{title || "Your title will appear here"}</h2>
      {summary && <p className="article-lead">{summary}</p>}
      {kind !== "pages" && (
        <img
          src={editorialImage(edition, data.media)}
          alt={title || "Editorial cover"}
        />
      )}
      <EditorialBody body={body || "Your content will appear here."} />
      {nepali && !edition.bodyNe && (
        <p className="callout">
          Nepali text is missing. Readers will see the English edition.
        </p>
      )}
    </article>
  );
}
function EditionReview({
  revision: r,
  close,
}: {
  revision: CmsRevision;
  close: () => void;
}) {
  const { data, act, notify } = usePlatform();
  const [language, setLanguage] = useState("English");
  const publisher = data.viewer?.role !== "Content Editor";
  const closed = ["Published", "Archived"].includes(r.status);
  const target = (r.kind === "pages" ? data.sitePages : data[r.kind])?.find(
    (row) => row.id === r.targetId,
  );
  return (
    <>
      <div className="cms-review-meta">
        <Badge>{r.status}</Badge>
        <span>
          Edition {r.version} · {r.author} · {date(r.updated)}
        </span>
        <select
          aria-label="Review language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option>English</option>
          <option>नेपाली</option>
        </select>
      </div>
      {target && (
        <details className="cms-current-edition">
          <summary>
            Compare with the current {target.status.toLowerCase()} edition
          </summary>
          <h3>{target.title}</h3>
          <EditorialBody body={target.body} />
        </details>
      )}
      <EditionPreview
        edition={r.edition}
        kind={r.kind}
        nepali={language !== "English"}
      />
      <Panel title="Edition history">
        {r.history
          .slice()
          .reverse()
          .map((h, i) => (
            <div className="cms-history-row" key={i}>
              <strong>{h.action}</strong>
              <small>
                {h.actor} · {new Date(h.at).toLocaleString("en-GB")}
              </small>
              {h.note && <p>{h.note}</p>}
            </div>
          ))}
      </Panel>
      {publisher && !closed && (
        <Form
          label="Confirm review decision"
          onSubmit={async (d) => {
            await act("cms-review", {
              id: r.id,
              expectedVersion: r.version,
              decision: d.decision,
              note: d.note,
            });
            notify(
              d.decision === "Publish"
                ? "Approved edition is live. Website, search and member access are updated."
                : "Review decision saved.",
            );
            close();
          }}
        >
          <Field
            name="decision"
            label="Review decision"
            options={
              r.status === "In review"
                ? ["Publish", "Request changes", "Archive draft"]
                : ["Request changes", "Archive draft"]
            }
          />
          <Field
            name="note"
            label="Review note (required when requesting changes)"
            type="textarea"
            required={false}
          />
          <div className="callout">
            Publishing replaces the current edition at its existing address. The
            approved working edition and review history are retained.
          </div>
        </Form>
      )}
      {!publisher && !closed && (
        <p className="callout">
          An administrator will review this edition. Return to the desk to edit
          and resubmit.
        </p>
      )}
    </>
  );
}
function HomepageStudio({
  onContent,
  onMedia,
}: {
  onContent: (k: CmsKind) => void;
  onMedia: () => void;
}) {
  const { data, act, notify } = usePlatform();
  const settings = data.settings;
  const editable = data.viewer?.role !== "Content Editor";
  const counts: Record<string, number> = {
    glance: data.members.filter((m) => m.visible).length,
    sector: data.projects.length,
    projects: data.projects.length,
    membership: data.categories?.filter((c) => c.enabled).length || 0,
    news: homepageContent(data.news).length,
    events: data.events.filter(
      (e) =>
        e.status === "Published" &&
        e.date >= new Date().toISOString().slice(0, 10),
    ).length,
    resources: homepageContent(data.resources).length,
    publications: homepageContent(data.publications).length,
    media: data.media?.filter((m) => m.status === "Published").length || 0,
  };
  return (
    <>
      <div className="cms-guidance">
        <Layers size={24} />
        <div>
          <strong>The homepage is assembled from shared records.</strong>
          <p>
            Its institutional section order is preserved. Edit the banner and
            headings here; manage the underlying members, projects, events and
            approved editions in their source modules.
          </p>
        </div>
        <Link className="button small" href="/" target="_blank">
          Open live homepage ↗
        </Link>
      </div>
      {!editable && (
        <div className="callout">
          A secretariat administrator publishes homepage changes. You can
          prepare the related editorial editions in the publishing desk.
        </div>
      )}
      <Form
        label="Publish homepage changes"
        onSubmit={async (d, form) => {
          const homeCopy = Object.fromEntries(
            sectionSources.map((s) => [
              s.key,
              {
                title: d["title-" + s.key] || "",
                titleNe: d["titleNe-" + s.key] || "",
              },
            ]),
          );
          await act("cms-homepage", {
            heroTitle: d.heroTitle,
            heroTitleNe: d.heroTitleNe,
            heroSubtitle: d.heroSubtitle,
            heroSubtitleNe: d.heroSubtitleNe,
            heroImage: d.heroImage,
            heroMediaId: d.heroMediaId,
            homeCopy,
            sections: sectionSources
              .filter(
                (s) =>
                  (
                    form.elements.namedItem(
                      "section-" + s.key,
                    ) as HTMLInputElement
                  )?.checked,
              )
              .map((s) => s.key),
          });
          notify("Homepage updated from the shared publishing records.");
        }}
      >
        <fieldset disabled={!editable} className="cms-fieldset">
          <Panel
            title="Main banner"
            sub="Choose a standard hydropower image or reuse a published photo from the media library."
          >
            <div className="form-grid">
              <Field
                name="heroTitle"
                label="Headline — English"
                type="textarea"
                value={settings.heroTitle}
              />
              <Field
                name="heroTitleNe"
                label="Headline — नेपाली"
                type="textarea"
                value={settings.heroTitleNe}
                required={false}
              />
              <Field
                name="heroSubtitle"
                label="Description — English"
                type="textarea"
                value={settings.heroSubtitle}
              />
              <Field
                name="heroSubtitleNe"
                label="Description — नेपाली"
                type="textarea"
                value={settings.heroSubtitleNe}
                required={false}
              />
              <Field
                name="heroImage"
                label="Standard banner"
                value={settings.heroImage || "/ippan/hydropower.jpg"}
                options={[
                  "/ippan/hydropower.jpg",
                  "/ippan/assembly.jpg",
                  "/ippan/expo.jpg",
                ]}
              />
              <label className="field">
                <span>Media library banner (overrides standard)</span>
                <select
                  name="heroMediaId"
                  defaultValue={settings.heroMediaId || ""}
                >
                  <option value="">Use standard banner</option>
                  {data.media
                    ?.filter(
                      (m) => m.type === "Photo" && m.status === "Published",
                    )
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                </select>
              </label>
            </div>
          </Panel>
          <Panel
            title="Homepage sections & sources"
            sub="Blank headings use the existing bilingual copy. Visibility changes take effect after publishing."
          >
            {sectionSources.map((s, i) => (
              <div className="cms-section-source" key={s.key}>
                <div className="cms-section-number">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="cms-section-fields">
                  <div className="cms-section-top">
                    <label className="cms-checkbox">
                      <input
                        name={"section-" + s.key}
                        type="checkbox"
                        defaultChecked={settings.sections?.includes(s.key)}
                      />
                      <strong>{s.name}</strong>
                    </label>
                    <Badge>{counts[s.key] + " source records"}</Badge>
                  </div>
                  <p>{s.source}</p>
                  <div className="form-grid">
                    <Field
                      name={"title-" + s.key}
                      label={s.name + " heading — English"}
                      value={settings.homeCopy?.[s.key]?.title}
                      required={false}
                    />
                    <Field
                      name={"titleNe-" + s.key}
                      label={s.name + " heading — नेपाली"}
                      value={settings.homeCopy?.[s.key]?.titleNe}
                      required={false}
                    />
                  </div>
                </div>
              </div>
            ))}
          </Panel>
        </fieldset>
      </Form>
      <Panel title="Curate the source records">
        <div className="cms-source-links">
          {sectionSources.map((s) => (
            <div key={s.key}>
              <strong>{s.name}</strong>
              <span>{counts[s.key]} eligible records</span>
              {["news", "resources", "publications"].includes(s.key) ? (
                <button
                  className="text-link"
                  onClick={() => onContent(s.key as CmsKind)}
                >
                  Choose featured editions →
                </button>
              ) : s.key === "media" ? (
                <button className="text-link" onClick={onMedia}>
                  Manage media →
                </button>
              ) : can(data.viewer!.role, s.area) ? (
                <Link className="text-link" href={"/admin/" + s.area}>
                  Manage source →
                </Link>
              ) : (
                <span>Source managed by authorized staff</span>
              )}
              <Link className="text-link" href={s.href} target="_blank">
                View public section ↗
              </Link>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
function ServiceConnections() {
  const { data } = usePlatform();
  const role = data.viewer!.role;
  const connections = [
    {
      name: "Membership applications",
      path: "/membership",
      area: "members",
      step: "Application → document review → approval → member record → portal & invoice",
      count: data.applications.filter((a) =>
        ["Pending", "Correction requested"].includes(a.status),
      ).length,
      label: "applications to follow up",
      note: "Approved members use the same records in the directory, renewal screens and member portal.",
    },
    {
      name: "Renewals & fees",
      path: "/portal/payments",
      area: "renewals",
      step: "Category fee → renewal invoice → confirmed demo payment → updated validity",
      count: data.members.filter((m) => !isActive(m)).length,
      label: "expired memberships",
      note: "Demo payments are labelled. Real gateway settlement is not enabled.",
    },
    {
      name: "News, notices & publications",
      path: "/news",
      area: "content",
      step: "Working edition → review → approved website edition → search & homepage",
      count: (data.cmsRevisions || []).filter((r) => r.status === "In review")
        .length,
      label: "editions awaiting review",
      note: "Choose a member-only audience and add a linked portal notification when publishing.",
    },
    {
      name: "Events & participation",
      path: "/events",
      area: "events",
      step: "Published event → registration → participant list → QR pass → attendance report",
      count: data.registrations.length,
      label: "registrations",
      note: "Event dates, ticket categories and capacities are shared with public registration.",
    },
    {
      name: "Energy resource centre",
      path: "/resources",
      area: "resources",
      step: "Document edition → access policy → approved library entry → authorized PDF",
      count: data.resources.filter((r) => r.status === "Published").length,
      label: "published resources",
      note: "Member-only files require an active membership; staff previews remain private.",
    },
    {
      name: "Hydropower register",
      path: "/hydropower",
      area: "projects",
      step: "Validated project → public directory → geographic map → charts & export",
      count: data.projects.length,
      label: "projects in one dataset",
      note: "All visualizations use the same filtered records. Coordinates and capacity remain labelled demo data.",
    },
    {
      name: "Public enquiries & communication",
      path: "/contact",
      area: "communications",
      step: "Contact form → private staff inbox → follow-up status",
      count: data.inquiries?.filter((i) => i.status === "Open").length || 0,
      label: "open enquiries",
      note: "Newsletter preferences are stored for staff follow-up; external email/SMS delivery remains disabled.",
    },
    {
      name: "Institutional administration",
      path: "/agm",
      area: "meetings",
      step: "Meeting agenda → attendance & minutes → assigned decisions → progress tracking",
      count: data.tasks.filter((t) => t.status === "Pending").length,
      label: "pending decisions",
      note: "Private correspondence, attachments and meeting records stay in authorized staff modules.",
    },
  ];
  return (
    <>
      <Panel
        title="From public service to staff action"
        sub="These connections use the existing shared database. Counts respect your role; restricted queues are not shown."
      >
        <div className="cms-service-grid">
          {connections.map((c) => (
            <article key={c.name}>
              <div className="cms-service-heading">
                <Link2 size={20} />
                <h3>{c.name}</h3>
              </div>
              <p className="cms-service-flow">{c.step}</p>
              {can(role, c.area) ? (
                <>
                  <strong className="cms-service-count">
                    {c.count}
                    <small>{c.label}</small>
                  </strong>
                  <Link className="button small" href={"/admin/" + c.area}>
                    Open staff workspace →
                  </Link>
                </>
              ) : (
                <p className="muted">Managed by an authorized {c.area} team.</p>
              )}
              <p>{c.note}</p>
              <Link className="text-link" href={c.path} target="_blank">
                Open service ↗
              </Link>
            </article>
          ))}
        </div>
      </Panel>
      <div className="cms-guidance">
        <CheckCircle2 size={22} />
        <div>
          <strong>Presentation path</strong>
          <p>
            Show the public homepage → revise and approve a notice → open its
            live edition → follow a membership application into the staff queue
            → demonstrate the member portal → explore project charts and event
            registration. This demonstrates shared records and server-enforced
            roles.
          </p>
        </div>
      </div>
    </>
  );
}
