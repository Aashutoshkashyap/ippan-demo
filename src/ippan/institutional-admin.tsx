"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  ArrowUpRight,
  FileText,
  Download,
  Search,
  Settings2,
} from "lucide-react";
import {
  usePlatform,
  Panel,
  Form,
  Field,
  Modal,
  Table,
  Badge,
  Export,
  Empty,
  SearchBox,
  money,
  date,
  readPdfFiles,
} from "./ui";
import {
  nav,
  can,
  provinces,
  roles,
  SitePage,
  Profile,
  Media,
  Meeting,
  MembershipCategory,
  Correspondence,
  Member,
} from "./model";
import { homeSections } from "./extensions-model";
import { DataChart, MembershipAnalytics } from "./analytics";
import {
  groupCounts,
  isActive,
  monthlyRecords,
  projectAggregates,
} from "./analytics-data";
import { useLanguage } from "./i18n";
type EditRecord = Partial<
  SitePage &
    Profile &
    Media &
    Meeting &
    MembershipCategory &
    Correspondence &
    Member
>;
export function InstitutionalAdmin({ area }: { area: string }) {
  const { data, act, notify } = usePlatform();
  const { t } = useLanguage();
  const [tab, setTab] = useState("Homepage"),
    [q, setQ] = useState(""),
    [modal, setModal] = useState(""),
    [record, setRecord] = useState<any>(null);
  const [filter, setFilter] = useState("All");
  const open = (kind: string, row: any = null) => {
    setModal(kind);
    setRecord(row);
  };
  const save = async (action: string, value: Record<string, unknown>) => {
    await act(action, value);
    setModal("");
    setRecord(null);
    notify("Changes saved to the shared IPPAN platform.");
  };
  const run = async (action: string, value: Record<string, unknown>) => {
    try {
      await act(action, value);
      notify("Record updated.");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Unable to update.");
    }
  };
  const match = (s: string) => s.toLowerCase().includes(q.toLowerCase());
  const title = nav.find((n) => n[0] === area)?.[1] || area;
  const canPublish = data.viewer?.role !== "Content Editor";
  const states = canPublish
    ? ["Draft", "In review", "Published", "Archived"]
    : ["Draft", "In review"];
  const now = new Date().toISOString().slice(0, 10),
    until = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
  return (
    <>
      <div className="workspace-title">
        <div>
          <div className="welcome-eyebrow">IPPAN ADMINISTRATION</div>
          <h1>{t(title)}</h1>
          <p>
            {area === "website"
              ? "Manage the institutional story, navigation, leadership and media."
              : area === "reports"
                ? "Recorded operational data, consistent filters and downloadable reports."
                : area === "meetings"
                  ? "Agendas, attendance, minutes and assigned decisions, in one place."
                  : area === "secretariat"
                    ? "Incoming and outgoing correspondence with private supporting documents."
                    : "Shared records, protected by your administrative role."}
          </p>
        </div>
        <div className="row-actions">
          {area === "website" && tab !== "Homepage" && (
            <button
              className="button primary"
              onClick={() =>
                open(
                  tab === "Pages"
                    ? "page"
                    : tab === "Leadership"
                      ? "profile"
                      : "media",
                )
              }
            >
              <Plus size={16} />
              Add{" "}
              {tab === "Pages"
                ? "page"
                : tab === "Leadership"
                  ? "profile"
                  : "media"}
            </button>
          )}
          {area === "meetings" && (
            <>
              <button className="button" onClick={() => open("task")}>
                <Plus size={16} />
                Assign decision
              </button>
              <button
                className="button primary"
                onClick={() => open("meeting")}
              >
                <Plus size={16} />
                Schedule meeting
              </button>
            </>
          )}
          {area === "secretariat" && (
            <button className="button primary" onClick={() => open("letter")}>
              <Plus size={16} />
              Register correspondence
            </button>
          )}
        </div>
      </div>
      {area === "website" && (
        <>
          <div className="tabs">
            {["Homepage", "Pages", "Leadership", "Media"].map((x) => (
              <button
                className={tab === x ? "active" : ""}
                key={x}
                onClick={() => {
                  setTab(x);
                  setQ("");
                }}
              >
                {x}
              </button>
            ))}
          </div>
          <SearchBox
            value={q}
            set={setQ}
            placeholder="Search institutional content…"
          />
          {tab === "Homepage" ? (
            <HomepageEditor />
          ) : tab === "Pages" ? (
            <Panel
              title="Institutional pages & navigation"
              sub="Published pages with a menu label appear in About IPPAN navigation. Pages are available in English and Nepali."
            >
              <Table
                headers={["Page", "Public address", "State", "Menu order", ""]}
              >
                {data.sitePages
                  ?.filter((p) => match(p.title))
                  .sort((a, b) => a.order - b.order)
                  .map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.title}</strong>
                        <small>{p.titleNe}</small>
                      </td>
                      <td>/pages/{p.slug}</td>
                      <td>
                        <Badge>{p.status}</Badge>
                      </td>
                      <td>{p.order}</td>
                      <td>
                        <button
                          className="button small"
                          onClick={() => open("page", p)}
                        >
                          Edit page
                        </button>
                        {p.status === "Published" && (
                          <Link className="text-link" href={"/pages/" + p.slug}>
                            View ↗
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
              </Table>
            </Panel>
          ) : tab === "Leadership" ? (
            <Panel
              title="Executive committee & secretariat"
              sub="Publish approved institutional identities only. No fabricated officer profiles are seeded."
            >
              <Table headers={["Name", "Position", "Group", "State", ""]}>
                {data.profiles
                  ?.filter((p) => match(p.name))
                  .map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.position}</td>
                      <td>{p.group}</td>
                      <td>
                        <Badge>{p.status}</Badge>
                      </td>
                      <td>
                        <button
                          className="button small"
                          onClick={() => open("profile", p)}
                        >
                          Edit profile
                        </button>
                      </td>
                    </tr>
                  ))}
              </Table>
              {!data.profiles?.length && (
                <Empty text="Add the first approved leadership profile." />
              )}
            </Panel>
          ) : (
            <Panel
              title="Photo & video library"
              sub="Upload compressed PNG/JPEG/WebP images or add approved video links. Published items appear in the public gallery."
            >
              <div className="media-admin-grid">
                {data.media
                  ?.filter((m) => match(m.title))
                  .map((m) => (
                    <article key={m.id}>
                      {m.type === "Photo" ? (
                        <img src={m.url} alt={m.title} />
                      ) : (
                        <div className="video-link">Video link</div>
                      )}
                      <h3>{m.title}</h3>
                      <Badge>{m.status}</Badge>
                      <p>{m.caption}</p>
                      <button
                        className="button small"
                        onClick={() => open("media", m)}
                      >
                        Edit media
                      </button>
                    </article>
                  ))}
              </div>
            </Panel>
          )}
        </>
      )}
      {area === "categories" && (
        <Panel
          title="Membership categories & annual fees"
          sub="These values control new applications and renewal invoices. Already-issued invoices retain their recorded amount."
        >
          <Table
            headers={[
              "Category",
              "Annual fee",
              "Required document",
              "Applications",
              "",
            ]}
          >
            {data.categories?.map((c) => (
              <tr key={c.name}>
                <td>
                  <strong>{c.name}</strong>
                  <small>{c.description}</small>
                </td>
                <td>{money(c.fee)}</td>
                <td>{c.documents}</td>
                <td>
                  <Badge>{c.enabled ? "Open" : "Closed"}</Badge>
                </td>
                <td>
                  <button
                    className="button small"
                    onClick={() => open("category", c)}
                  >
                    Configure
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}
      {area === "renewals" && (
        <>
          <div className="data-kpis">
            {[
              ["Active", data.members.filter((m) => isActive(m)).length],
              ["Expired", data.members.filter((m) => !isActive(m)).length],
              [
                "Expiring in 90 days",
                data.members.filter((m) => isActive(m) && m.expiry <= until)
                  .length,
              ],
              [
                "Renewal invoices",
                data.payments.filter((p) => p.renewal).length,
              ],
            ].map(([n, v]) => (
              <div key={n}>
                <span>{n}</span>
                <strong>{v}</strong>
              </div>
            ))}
          </div>
          <div className="filter-bar">
            <SearchBox value={q} set={setQ} placeholder="Search member…" />
            <select
              aria-label="Renewal filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {["All", "Expired", "Expiring in 90 days"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
            <Export
              rows={data.members.filter(
                (m) =>
                  match(m.name) &&
                  (filter === "All" ||
                    (filter === "Expired"
                      ? !isActive(m)
                      : isActive(m) && m.expiry <= until)),
              )}
              name="ippan-renewals"
            />
          </div>
          <Panel title="Membership validity register">
            <Table
              headers={[
                "Member",
                "Category",
                "Validity",
                "Status",
                "Annual fee",
                "",
              ]}
            >
              {data.members
                .filter(
                  (m) =>
                    match(m.name) &&
                    (filter === "All" ||
                      (filter === "Expired"
                        ? !isActive(m)
                        : isActive(m) && m.expiry <= until)),
                )
                .sort((a, b) => a.expiry.localeCompare(b.expiry))
                .map((m) => (
                  <tr key={m.id}>
                    <td>
                      <strong>{m.name}</strong>
                      <small>{m.id}</small>
                    </td>
                    <td>{m.category}</td>
                    <td>{date(m.expiry)}</td>
                    <td>
                      <Badge>{isActive(m) ? "Active" : "Expired"}</Badge>
                    </td>
                    <td>
                      {money(
                        data.categories?.find((c) => c.name === m.category)
                          ?.fee || 0,
                      )}
                    </td>
                    <td>
                      <Link href="/admin/members" className="text-link">
                        Member record →
                      </Link>
                    </td>
                  </tr>
                ))}
            </Table>
          </Panel>
          <p className="source-note">
            Validity extends only through the existing confirmed
            demonstration-payment or authorized manual-approval workflow. No
            expiry date is silently changed by this report.
          </p>
        </>
      )}
      {area === "meetings" && (
        <>
          <Panel
            title="Board & committee meetings"
            action={
              <Export
                rows={(data.meetings || []).map(({ attachments, ...m }) => ({
                  ...m,
                  documents: attachments.map((a) => a.name).join("; "),
                }))}
                name="ippan-meetings"
              />
            }
          >
            <Table
              headers={[
                "Meeting",
                "Committee",
                "Schedule / venue",
                "Attendance",
                "Status",
                "",
              ]}
            >
              {data.meetings?.map((m) => (
                <tr key={m.id}>
                  <td>
                    <strong>{m.title}</strong>
                    <small>{m.id}</small>
                  </td>
                  <td>{m.committee}</td>
                  <td>
                    {date(m.date)}
                    <small>{m.location}</small>
                  </td>
                  <td>{m.attendees.length}</td>
                  <td>
                    <Badge>{m.status}</Badge>
                  </td>
                  <td>
                    <button
                      className="button small"
                      onClick={() => open("meeting", m)}
                    >
                      Agenda & minutes
                    </button>
                    {m.attachments.map((a, i) => (
                      <a
                        className="text-link"
                        key={i}
                        href={"/api/ippan/documents/" + m.id + "?meeting=" + i}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {a.name} ↗
                      </a>
                    ))}
                  </td>
                </tr>
              ))}
            </Table>
            {!data.meetings?.length && (
              <Empty text="Schedule your first board or committee meeting." />
            )}
          </Panel>
          <Panel
            title="Decisions & follow-up"
            action={<Export rows={data.tasks} name="ippan-meeting-decisions" />}
          >
            <Table
              headers={[
                "Decision / task",
                "Meeting",
                "Responsible person",
                "Deadline",
                "Status",
                "",
              ]}
            >
              {data.tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.meeting}</td>
                  <td>{task.assignee}</td>
                  <td>
                    {date(task.due)}
                    {task.due < now && task.status !== "Completed" && (
                      <Badge>Overdue</Badge>
                    )}
                  </td>
                  <td>
                    <Badge>{task.status}</Badge>
                  </td>
                  <td>
                    <button
                      className="button small"
                      onClick={() => run("task-status", { id: task.id })}
                    >
                      {task.status === "Completed" ? "Reopen" : "Complete"}
                    </button>
                  </td>
                </tr>
              ))}
            </Table>
          </Panel>
        </>
      )}
      {area === "secretariat" && (
        <>
          <div className="filter-bar">
            <SearchBox
              value={q}
              set={setQ}
              placeholder="Search subject, reference or sender…"
            />
            <select
              aria-label="Correspondence direction"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {["All", "Incoming", "Outgoing"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
            <Export
              rows={data.correspondence.map(({ attachments, ...c }) => ({
                ...c,
                documents: attachments?.map((a) => a.name).join("; "),
              }))}
              name="ippan-correspondence"
            />
          </div>
          <Panel
            title="Darta–Chalani register"
            sub="Private correspondence attachments require secretariat access."
          >
            <Table
              headers={[
                "Reference",
                "Subject / party",
                "Department / assignee",
                "Date",
                "Approval / follow-up",
                "",
              ]}
            >
              {data.correspondence
                .filter(
                  (c) =>
                    match(c.subject + " " + c.sender + " " + c.id) &&
                    (filter === "All" || filter === c.direction),
                )
                .map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.id}</strong>
                      <Badge>{c.direction}</Badge>
                    </td>
                    <td>
                      <strong>{c.subject}</strong>
                      <small>{c.sender}</small>
                      {c.attachments?.map((a, i) => (
                        <a
                          className="text-link"
                          key={i}
                          href={"/api/ippan/documents/" + c.id + "?letter=" + i}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {a.name} ↗
                        </a>
                      ))}
                    </td>
                    <td>
                      {c.department || "Secretariat"}
                      <small>{c.assignee}</small>
                    </td>
                    <td>{date(c.date)}</td>
                    <td>
                      <Badge>{c.approval || "Pending"}</Badge>
                      <Badge>{c.status}</Badge>
                      <small>{c.dispatchReference}</small>
                    </td>
                    <td>
                      <button
                        className="button small"
                        onClick={() => open("letter", c)}
                      >
                        Review / edit
                      </button>
                    </td>
                  </tr>
                ))}
            </Table>
          </Panel>
          <div className="callout">
            References are unique demonstration identifiers. Formal fiscal-year
            numbering requires IPPAN-approved numbering rules.{" "}
            <Link className="text-link" href="/admin/meetings">
              Open meetings and decisions →
            </Link>
          </div>
        </>
      )}
      {area === "audit" && (
        <>
          <SearchBox
            value={q}
            set={setQ}
            placeholder="Search staff, action or record…"
          />
          <Panel
            title="Administrative audit history"
            sub="Server-generated records of changes and authentication; entries cannot be edited here."
            action={
              <Export
                rows={data.audit.filter((a) =>
                  match(a.actor + " " + a.action + " " + a.detail),
                )}
                name="ippan-audit"
              />
            }
          >
            <Table headers={["Time (Nepal)", "Actor", "Action", "Details"]}>
              {data.audit
                .filter((a) => match(a.actor + " " + a.action + " " + a.detail))
                .map((a) => (
                  <tr key={a.id}>
                    <td>
                      {new Date(a.date).toLocaleString("en-GB", {
                        timeZone: "Asia/Kathmandu",
                      })}
                    </td>
                    <td>{a.actor}</td>
                    <td>{a.action}</td>
                    <td>{a.detail}</td>
                  </tr>
                ))}
            </Table>
          </Panel>
        </>
      )}
      {area === "settings" && (
        <Panel
          title="Institutional settings & homepage sections"
          sub="Saved settings are shared across the website and AGM member workspace."
        >
          <Form
            label="Save platform settings"
            onSubmit={(d, form) =>
              save("save-system", {
                ...d,
                sections: homeSections.filter(
                  (key) =>
                    (
                      form.elements.namedItem(
                        "section-" + key,
                      ) as HTMLInputElement
                    )?.checked,
                ),
              })
            }
          >
            <div className="form-grid">
              <Field
                name="heroTitle"
                label="Homepage headline — English"
                type="textarea"
                value={data.settings.heroTitle}
              />
              <Field
                name="heroTitleNe"
                label="Homepage headline — नेपाली"
                type="textarea"
                value={data.settings.heroTitleNe}
                required={false}
              />
              <Field
                name="heroSubtitle"
                label="Hero description — English"
                type="textarea"
                value={data.settings.heroSubtitle}
              />
              <Field
                name="heroSubtitleNe"
                label="Hero description — नेपाली"
                type="textarea"
                value={data.settings.heroSubtitleNe}
                required={false}
              />
              <Field
                name="contactAddress"
                label="Institutional address"
                value={data.settings.contactAddress}
              />
              <Field
                name="contactEmail"
                label="Institutional email"
                type="email"
                value={data.settings.contactEmail}
              />
              <Field
                name="contactPhone"
                label="Institutional phone"
                value={data.settings.contactPhone}
              />
              <Field
                name="agmTitle"
                label="AGM notice title"
                value={data.settings.agmTitle}
              />
              <Field
                name="agmDate"
                label="AGM date"
                type="date"
                value={data.settings.agmDate}
              />
            </div>
            <Field
              name="agmAgenda"
              label="AGM agenda — one item per line"
              type="textarea"
              value={data.settings.agmAgenda}
            />
            <fieldset className="section-controls">
              <legend>Homepage sections — institutional order</legend>
              {homeSections.map((key, i) => (
                <label className="checkbox-row" key={key}>
                  <input
                    type="checkbox"
                    name={"section-" + key}
                    defaultChecked={data.settings.sections?.includes(key)}
                  />
                  {i + 1}. {key}
                </label>
              ))}
            </fieldset>
            <p className="source-note">
              Homepage section order follows the approved brief. Turn sections
              on/off here; page content, profiles and media are edited in
              Website CMS.
            </p>
          </Form>
        </Panel>
      )}
      {area === "reports" && <Reports />}
      {modal && (
        <Modal
          title={
            modal === "page"
              ? "Institutional page"
              : modal === "profile"
                ? "Leadership profile"
                : modal === "media"
                  ? "Media library item"
                  : modal === "category"
                    ? "Membership category"
                    : modal === "meeting"
                      ? "Meeting agenda & minutes"
                      : modal === "letter"
                        ? "Correspondence record"
                        : "Assign meeting decision"
          }
          close={() => setModal("")}
        >
          {modal === "page" && (
            <Form
              label="Save page"
              onSubmit={(d) => save("save-page", { ...d, id: record?.id })}
            >
              <Field
                name="slug"
                label="Page address (lowercase-and-hyphens)"
                value={record?.slug}
              />
              <div className="form-grid">
                <Field
                  name="title"
                  label="Title — English"
                  value={record?.title}
                />
                <Field
                  name="titleNe"
                  label="Title — नेपाली"
                  value={record?.titleNe}
                  required={false}
                />
              </div>
              <Field
                name="body"
                label="Page content — English"
                type="textarea"
                value={record?.body}
              />
              <Field
                name="bodyNe"
                label="Page content — नेपाली"
                type="textarea"
                value={record?.bodyNe}
                required={false}
              />
              <Field
                name="seoDescription"
                label="SEO description"
                value={record?.seoDescription}
                required={false}
              />
              <div className="form-grid">
                <Field
                  name="menuLabel"
                  label="About menu label (optional)"
                  value={record?.menuLabel}
                  required={false}
                />
                <Field
                  name="order"
                  label="Menu order"
                  type="number"
                  value={record?.order || 10}
                />
                <Field
                  name="status"
                  label="Publishing state"
                  options={states}
                  value={record?.status || "Draft"}
                />
              </div>
            </Form>
          )}
          {modal === "profile" && (
            <Form
              label="Save leadership profile"
              onSubmit={(d) =>
                save("save-profile", { ...d, id: record?.id, image: "" })
              }
            >
              <Field
                name="name"
                label="Approved full name"
                value={record?.name}
              />
              <Field
                name="position"
                label="Institutional position"
                value={record?.position}
              />
              <Field
                name="group"
                label="Group"
                options={["Executive committee", "Secretariat"]}
                value={record?.group}
              />
              <Field
                name="bio"
                label="Approved biography"
                type="textarea"
                value={record?.bio}
              />
              <div className="form-grid">
                <Field
                  name="order"
                  label="Display order"
                  type="number"
                  value={record?.order || 1}
                />
                <Field
                  name="status"
                  label="Publishing state"
                  options={canPublish ? ["Draft", "Published"] : ["Draft"]}
                  value={record?.status || "Draft"}
                />
              </div>
              <small>
                Names and responsibilities must be verified before publication.
              </small>
            </Form>
          )}
          {modal === "media" && (
            <Form
              label="Save media item"
              onSubmit={async (d, form) => {
                const file = (
                  form.elements.namedItem("imageFile") as HTMLInputElement
                )?.files?.[0];
                let url = d.url;
                if (file) {
                  if (file.size > 512000)
                    throw new Error("Compress the image below 500 KB.");
                  url = await new Promise<string>((resolve, reject) => {
                    const r = new FileReader();
                    r.onload = () => resolve(String(r.result));
                    r.onerror = reject;
                    r.readAsDataURL(file);
                  });
                }
                await save("save-media", { ...d, url, id: record?.id });
              }}
            >
              <Field name="title" label="Title" value={record?.title} />
              <Field
                name="caption"
                label="Caption / image description"
                type="textarea"
                value={record?.caption}
              />
              <Field
                name="type"
                label="Media type"
                options={["Photo", "Video"]}
                value={record?.type}
              />
              <Field
                name="url"
                label="IPPAN image path or YouTube/Vimeo URL"
                value={
                  record?.url?.startsWith("data:")
                    ? ""
                    : record?.url || "/ippan/assembly.jpg"
                }
                required={false}
              />
              <label className="field">
                <span>Upload image (PNG, JPEG, WebP · 500 KB maximum)</span>
                <input
                  type="file"
                  name="imageFile"
                  accept="image/png,image/jpeg,image/webp"
                />
              </label>
              <Field
                name="status"
                label="Publishing state"
                options={canPublish ? ["Draft", "Published"] : ["Draft"]}
                value={record?.status || "Draft"}
              />
              <small>
                Uploaded images are validated on the server. Use only approved
                media.
              </small>
            </Form>
          )}
          {modal === "category" && (
            <Form
              label="Save category"
              onSubmit={(d) =>
                save("save-category", { ...d, enabled: d.enabled === "Yes" })
              }
            >
              <Field
                name="name"
                label="Category"
                options={[record.name]}
                value={record.name}
              />
              <Field
                name="description"
                label="Description"
                type="textarea"
                value={record.description}
              />
              <Field
                name="fee"
                label="Annual fee (NPR)"
                type="number"
                value={record.fee}
              />
              <Field
                name="documents"
                label="Required supporting document"
                type="textarea"
                value={record.documents}
              />
              <Field
                name="enabled"
                label="Accept new applications"
                options={["Yes", "No"]}
                value={record.enabled ? "Yes" : "No"}
              />
            </Form>
          )}
          {modal === "meeting" && (
            <Form
              label="Save meeting"
              onSubmit={async (d, form) => {
                const attachments = await readPdfFiles(form, "documents");
                await save("save-meeting", {
                  ...d,
                  id: record?.id,
                  attendees: d.attendees
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                  ...(attachments.length ? { attachments } : {}),
                });
              }}
            >
              <Field name="title" label="Meeting title" value={record?.title} />
              <div className="form-grid">
                <Field
                  name="committee"
                  label="Board / committee"
                  value={record?.committee}
                />
                <Field
                  name="date"
                  label="Meeting date & time"
                  type="datetime-local"
                  value={record?.date?.slice(0, 16)}
                />
                <Field
                  name="location"
                  label="Venue / meeting link"
                  value={record?.location}
                />
                <Field
                  name="status"
                  label="Status"
                  options={["Scheduled", "Completed"]}
                  value={record?.status}
                />
              </div>
              <Field
                name="agenda"
                label="Agenda"
                type="textarea"
                value={record?.agenda}
              />
              <Field
                name="attendees"
                label="Attendance — one confirmed name per line"
                type="textarea"
                value={record?.attendees?.join("\n")}
                required={false}
              />
              <Field
                name="minutes"
                label="Minutes and decisions"
                type="textarea"
                value={record?.minutes}
                required={false}
              />
              <label className="field">
                <span>
                  Meeting PDFs (optional; new uploads replace previous
                  attachments)
                </span>
                <input
                  type="file"
                  name="documents"
                  accept="application/pdf"
                  multiple
                />
              </label>
            </Form>
          )}
          {modal === "letter" && (
            <Form
              label="Save correspondence"
              onSubmit={async (d, form) => {
                const attachments = await readPdfFiles(form, "documents");
                await save("save-correspondence", {
                  ...d,
                  id: record?.id,
                  ...(attachments.length ? { attachments } : {}),
                });
              }}
            >
              <div className="form-grid">
                <Field
                  name="direction"
                  label="Register"
                  options={["Incoming", "Outgoing"]}
                  value={record?.direction}
                />
                <Field
                  name="date"
                  label="Registration date"
                  type="date"
                  value={record?.date || now}
                />
              </div>
              <Field name="subject" label="Subject" value={record?.subject} />
              <Field
                name="sender"
                label="Sender / recipient"
                value={record?.sender}
              />
              <div className="form-grid">
                <Field
                  name="department"
                  label="Department"
                  value={record?.department || "Secretariat"}
                />
                <Field
                  name="assignee"
                  label="Assigned staff"
                  value={record?.assignee}
                />
                <Field
                  name="received"
                  label="Date received / dispatched"
                  type="date"
                  value={record?.received || now}
                />
                <Field
                  name="approval"
                  label="Approval status"
                  options={["Pending", "Approved"]}
                  value={record?.approval}
                />
                <Field
                  name="dispatchReference"
                  label="Dispatch tracking reference"
                  value={record?.dispatchReference}
                  required={false}
                />
                <Field
                  name="status"
                  label="Follow-up status"
                  options={["Open", "In progress", "Completed"]}
                  value={record?.status}
                />
              </div>
              <label className="field">
                <span>
                  Letter / supporting PDFs (optional; new uploads replace
                  previous attachments)
                </span>
                <input
                  type="file"
                  name="documents"
                  accept="application/pdf"
                  multiple
                />
              </label>
            </Form>
          )}
          {modal === "task" && (
            <Form label="Assign decision" onSubmit={(d) => save("task", d)}>
              <Field name="title" label="Decision / task" />
              <Field
                name="meeting"
                label="Meeting reference"
                options={
                  (data.meetings || []).length
                    ? data.meetings!.map((m) => m.id + " · " + m.title)
                    : ["Secretariat follow-up"]
                }
              />
              <Field name="assignee" label="Responsible staff" />
              <Field name="due" label="Due date" type="date" />
            </Form>
          )}
        </Modal>
      )}
    </>
  );
}
export function Reports() {
  const { data } = usePlatform();
  const [kind, setKind] = useState("Membership"),
    [from, setFrom] = useState(""),
    [to, setTo] = useState("");
  const inDate = (v: string) =>
    (!from || v.slice(0, 10) >= from) && (!to || v.slice(0, 10) <= to);
  const members = data.members.filter((m) => inDate(m.joined));
  const payments = data.payments.filter((p) => inDate(p.date));
  const events = data.events.filter((e) => inDate(e.date));
  const registrations = data.registrations.filter((r) =>
    events.some((e) => e.id === r.eventId),
  );
  const proj = projectAggregates(data.projects);
  const rows =
    kind === "Membership"
      ? members
      : kind === "Finance"
        ? payments
        : kind === "Hydropower"
          ? data.projects
          : registrations;
  return (
    <>
      <div className="tabs">
        {["Membership", "Finance", "Hydropower", "Events"].map((k) => (
          <button
            key={k}
            className={k === kind ? "active" : ""}
            onClick={() => setKind(k)}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="filter-bar">
        {kind !== "Hydropower" ? (
          <>
            <label className="field">
              <span>From date</span>
              <input
                aria-label="Report start date"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </label>
            <label className="field">
              <span>To date</span>
              <input
                aria-label="Report end date"
                type="date"
                value={to}
                min={from}
                onChange={(e) => setTo(e.target.value)}
              />
            </label>
          </>
        ) : (
          <span className="source-note">
            Current project register. Use the dedicated database for province,
            stage and capacity filters.
          </span>
        )}
        <Export rows={rows} name={"ippan-" + kind.toLowerCase() + "-report"} />
        <button className="button" onClick={() => window.print()}>
          Print / save PDF
        </button>
      </div>
      {kind === "Membership" ? (
        <>
          <div className="analytics-grid">
            <DataChart
              title="Active vs expired"
              type="donut"
              rows={[
                {
                  name: "Active",
                  value: members.filter((m) => isActive(m)).length,
                },
                {
                  name: "Expired",
                  value: members.filter((m) => !isActive(m)).length,
                },
              ]}
            />
            <DataChart
              title="Membership categories"
              type="donut"
              rows={groupCounts(members, (m) => m.category)}
            />
            <DataChart
              title="Geographic distribution"
              rows={groupCounts(members, (m) => m.province)}
            />
            <DataChart
              title="Recorded new memberships"
              rows={monthlyRecords(members, []).map((m) => ({
                name: m.name,
                value: m.Members,
              }))}
              type="line"
            />
          </div>
          <Panel title="Membership report">
            <Table
              headers={["Member", "Category", "Joined", "Validity", "Status"]}
            >
              {members.map((m) => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.category}</td>
                  <td>{m.joined}</td>
                  <td>{m.expiry}</td>
                  <td>{isActive(m) ? "Active" : "Expired"}</td>
                </tr>
              ))}
            </Table>
          </Panel>
        </>
      ) : kind === "Finance" ? (
        <>
          <div className="data-kpis">
            <div>
              <span>Successful demo collections</span>
              <strong>
                {money(
                  payments
                    .filter((p) => p.status === "Simulated successful")
                    .reduce((n, p) => n + p.amount, 0),
                )}
              </strong>
            </div>
            <div>
              <span>Pending invoices</span>
              <strong>
                {money(
                  payments
                    .filter((p) => p.status === "Pending")
                    .reduce((n, p) => n + p.amount, 0),
                )}
              </strong>
            </div>
          </div>
          <div className="analytics-grid">
            <DataChart
              title="Monthly collections"
              unit="NPR"
              type="line"
              rows={monthlyRecords([], payments, 12).map((m) => ({
                name: m.name,
                value: m.Collections,
              }))}
            />
            <DataChart
              title="Payment states"
              rows={groupCounts(payments, (p) => p.status)}
              type="donut"
            />
            <DataChart
              title="Collections by purpose"
              unit="NPR"
              rows={groupCounts(
                payments.filter((p) => p.status === "Simulated successful"),
                (p) => p.purpose,
              ).map((g) => ({
                name: g.name,
                value: payments
                  .filter(
                    (p) =>
                      p.purpose === g.name &&
                      p.status === "Simulated successful",
                  )
                  .reduce((n, p) => n + p.amount, 0),
              }))}
            />
          </div>
          <Panel title="Transactions">
            <Table
              headers={["Reference", "Date", "Purpose", "Amount", "State"]}
            >
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.date}</td>
                  <td>{p.purpose}</td>
                  <td>{money(p.amount)}</td>
                  <td>
                    <Badge>{p.status}</Badge>
                  </td>
                </tr>
              ))}
            </Table>
          </Panel>
        </>
      ) : kind === "Hydropower" ? (
        <>
          <div className="analytics-grid">
            <DataChart
              title="Projects by status"
              rows={proj.statuses}
              type="donut"
            />
            <DataChart
              title="Capacity by province"
              rows={proj.locations.map((g) => ({
                name: g.name,
                value: g.capacity,
              }))}
              unit="MW"
            />
            <DataChart title="Capacity distribution" rows={proj.ranges} />
            <DataChart
              title="Developer portfolio"
              rows={groupCounts(data.projects, (p) => p.developer).map((g) => ({
                name: g.name,
                value: data.projects
                  .filter((p) => p.developer === g.name)
                  .reduce((n, p) => n + p.capacity, 0),
              }))}
              unit="MW"
            />
          </div>
          <Link className="button primary" href="/hydropower">
            Open searchable map and full project report →
          </Link>
        </>
      ) : (
        <>
          <div className="analytics-grid">
            <DataChart
              title="Registrations by event"
              rows={events.map((e) => ({
                name: e.title,
                value: registrations.filter((r) => r.eventId === e.id).length,
              }))}
            />
            <DataChart
              title="Attendance vs registrations"
              rows={[
                {
                  name: "Attended",
                  value: registrations.filter((r) => r.attendance).length,
                },
                {
                  name: "Not checked in",
                  value: registrations.filter((r) => !r.attendance).length,
                },
              ]}
              type="donut"
            />
            <DataChart
              title="Registration payment types"
              rows={groupCounts(registrations, (r) => r.paymentStatus)}
              type="donut"
            />
            <DataChart
              title="Event demo revenue"
              unit="NPR"
              rows={events.map((e) => ({
                name: e.title,
                value: registrations
                  .filter((r) => r.eventId === e.id)
                  .reduce((n, r) => n + r.amount, 0),
              }))}
            />
          </div>
          <Panel title="Event registration report">
            <Table headers={["Event", "Participant", "Payment", "Attendance"]}>
              {registrations.map((r) => (
                <tr key={r.id}>
                  <td>{events.find((e) => e.id === r.eventId)?.title}</td>
                  <td>{r.name}</td>
                  <td>{r.paymentStatus}</td>
                  <td>{r.attendance ? "Attended" : "Not checked in"}</td>
                </tr>
              ))}
            </Table>
          </Panel>
        </>
      )}
      <p className="source-note">
        Date filters use joining dates for membership, transaction dates for
        finance and scheduled event dates for events. Hydropower reports use the
        current inventory, not an invented historical series. CSV exports open
        in spreadsheet software; use the print view to save PDF.
      </p>
    </>
  );
}
export function MembershipTools() {
  const { data, act, notify } = usePlatform();
  const [editing, setEditing] = useState<Member | null | undefined>(undefined);
  return (
    <>
      <div className="filter-bar">
        <button className="button primary" onClick={() => setEditing(null)}>
          <Plus size={16} />
          Add member
        </button>
        <select
          aria-label="Member to edit"
          value={editing?.id || ""}
          onChange={(e) =>
            setEditing(data.members.find((m) => m.id === e.target.value))
          }
        >
          <option value="">Edit an existing member…</option>
          {data.members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>
      <details className="membership-analytics">
        <summary>Membership distribution & recorded growth</summary>
        <MembershipAnalytics />
      </details>
      {editing !== undefined && (
        <Modal
          title={editing ? "Edit member record" : "Add member record"}
          close={() => setEditing(undefined)}
        >
          <Form
            label="Save member record"
            onSubmit={async (d) => {
              await act("save-member", {
                ...d,
                id: editing?.id,
                visible: d.visible === "Yes",
              });
              setEditing(undefined);
              notify("Member record saved.");
            }}
          >
            <Field
              name="name"
              label="Member / company name"
              value={editing?.name}
            />
            <div className="form-grid">
              <Field
                name="category"
                label="Category"
                options={["Corporate", "Associate", "Individual"]}
                value={editing?.category}
              />
              <Field
                name="province"
                label="Province"
                options={provinces}
                value={editing?.province}
              />
              <Field
                name="district"
                label="District"
                value={editing?.district}
              />
              <Field
                name="capacity"
                label="Represented capacity (MW)"
                type="number"
                value={editing?.capacity || 0}
              />
              <Field
                name="email"
                label="Private member email"
                type="email"
                value={editing?.email}
              />
              <Field
                name="contact"
                label="Private contact"
                value={editing?.contact}
                required={false}
              />
              <Field
                name="joined"
                label="Joining date"
                type="date"
                value={editing?.joined || new Date().toISOString().slice(0, 10)}
              />
              <Field
                name="expiry"
                label="Valid until"
                type="date"
                value={editing?.expiry}
              />
              <Field
                name="status"
                label="Membership status"
                options={["Active", "Expired"]}
                value={editing?.status}
              />
              <Field
                name="visible"
                label="Public directory visibility"
                options={["Yes", "No"]}
                value={editing?.visible ? "Yes" : "No"}
              />
            </div>
            <Field
              name="description"
              label="Public company profile"
              type="textarea"
              value={editing?.description}
              required={false}
            />
            <p className="source-note">
              This creates a member record. A login is activated by the
              application approval workflow or explicitly linked in Users &
              access. Updating the contact email does not change an existing
              account’s sign-in email.
            </p>
          </Form>
        </Modal>
      )}
    </>
  );
}
export function StaffAccountForm() {
  const { data, act, notify } = usePlatform();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="button primary" onClick={() => setOpen(true)}>
        <Plus size={16} />
        Create staff / linked member account
      </button>
      {open && (
        <Modal title="Create account" close={() => setOpen(false)}>
          <Form
            label="Create account"
            onSubmit={async (d) => {
              await act("create-user", d);
              setOpen(false);
              notify("Account created. Share its initial password securely.");
            }}
          >
            <Field name="name" label="Full name" />
            <Field name="email" label="Email" type="email" />
            <Field name="role" label="Role" options={roles} />
            <label className="field">
              <span>Linked membership (required for Member role)</span>
              <select name="memberId">
                <option value="">No linked membership</option>
                {data.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id} · {m.name}
                  </option>
                ))}
              </select>
            </label>
            <Field
              name="password"
              label="Initial password (12+ characters)"
              type="password"
            />
            <small>
              Use a unique initial password and share it privately.
              Administrative actions are audited.
            </small>
          </Form>
        </Modal>
      )}
    </>
  );
}
export function CommunicationsInbox() {
  const { data, act, notify } = usePlatform();
  return (
    <>
      <Panel
        title="Website inquiries"
        sub="Persisted contact-form submissions for secretariat review; no external delivery is implied."
      >
        <Table
          headers={["From", "Subject / message", "Received", "Status", ""]}
        >
          {data.inquiries?.map((i) => (
            <tr key={i.id}>
              <td>
                <strong>{i.name}</strong>
                <small>{i.email}</small>
              </td>
              <td>
                <strong>{i.subject}</strong>
                <p>{i.message}</p>
              </td>
              <td>{date(i.date)}</td>
              <td>
                <Badge>{i.status}</Badge>
              </td>
              <td>
                <button
                  className="button small"
                  onClick={async () => {
                    try {
                      await act("inquiry-status", { id: i.id });
                      notify("Inquiry updated.");
                    } catch (e) {
                      notify(e instanceof Error ? e.message : "Update failed.");
                    }
                  }}
                >
                  {i.status === "Open" ? "Complete" : "Reopen"}
                </button>
              </td>
            </tr>
          ))}
        </Table>
        {!data.inquiries?.length && <Empty text="No website inquiries yet." />}
      </Panel>
      <Panel
        title="Newsletter preference register"
        sub="Visitors who explicitly requested updates. Email/SMS integrations remain disabled."
        action={
          <Export
            rows={data.subscriptions || []}
            name="ippan-newsletter-preferences"
          />
        }
      >
        <p className="register-count">
          {data.subscriptions?.length || 0} saved subscriptions
        </p>
      </Panel>
    </>
  );
}
export function HomepageEditor() {
  const { data, act, notify } = usePlatform();
  if (data.viewer?.role === "Content Editor")
    return (
      <Panel title="Homepage approval">
        <p>
          Homepage banners are published by a secretariat administrator. Prepare
          institutional pages and news as drafts for review in the other tabs.
        </p>
      </Panel>
    );
  return (
    <Panel
      title="Homepage banner"
      sub="Publish the institutional headline, language variants and approved reference image."
    >
      <Form
        label="Publish homepage banner"
        onSubmit={async (d) => {
          await act("save-settings", d);
          notify("Homepage banner published.");
        }}
      >
        <div className="form-grid">
          <Field
            name="heroTitle"
            label="Headline — English"
            type="textarea"
            value={data.settings.heroTitle}
          />
          <Field
            name="heroTitleNe"
            label="Headline — नेपाली"
            type="textarea"
            value={data.settings.heroTitleNe}
            required={false}
          />
        </div>
        <Field
          name="heroSubtitle"
          label="Description — English"
          type="textarea"
          value={data.settings.heroSubtitle}
        />
        <Field
          name="heroSubtitleNe"
          label="Description — नेपाली"
          type="textarea"
          value={data.settings.heroSubtitleNe}
          required={false}
        />
        <Field
          name="heroImage"
          label="Banner image"
          options={[
            "/ippan/hydropower.jpg",
            "/ippan/assembly.jpg",
            "/ippan/expo.jpg",
          ]}
          value={data.settings.heroImage || "/ippan/hydropower.jpg"}
        />
      </Form>
      <Link className="text-link" href="/admin/settings">
        Manage homepage section visibility and institutional contact information
        →
      </Link>
    </Panel>
  );
}

export function NotificationPreferences() {
  const { data, act, notify } = usePlatform();
  return (
    <Panel
      title="Notification preferences"
      sub="Your communication choices are saved privately. External email and SMS delivery remain disabled."
    >
      <Form
        label="Save notification preferences"
        onSubmit={async (d) => {
          await act("notification-preferences", {
            email: d.email === "Yes",
            sms: d.sms === "Yes",
          });
          notify("Notification preferences saved.");
        }}
      >
        <div className="form-grid">
          <Field
            name="email"
            label="Email updates"
            options={["Yes", "No"]}
            value={data.viewer?.preferences?.email ? "Yes" : "No"}
          />
          <Field
            name="sms"
            label="SMS updates"
            options={["Yes", "No"]}
            value={data.viewer?.preferences?.sms ? "Yes" : "No"}
          />
        </div>
      </Form>
    </Panel>
  );
}
export function RolePermissions() {
  return (
    <Panel
      title="Role permission matrix"
      sub="These permissions are enforced on the server. Assign staff roles above; custom permission policies require a reviewed server configuration change."
    >
      <Table headers={["Module", ...roles.filter((r) => r !== "Member")]}>
        {nav.map(([key, label]) => (
          <tr key={key}>
            <th scope="row">{label}</th>
            {roles
              .filter((r) => r !== "Member")
              .map((role) => (
                <td key={role}>{can(role, key) ? "Allowed" : "—"}</td>
              ))}
          </tr>
        ))}
      </Table>
    </Panel>
  );
}
