"use client";
import { EditorialBody } from "./editorial-body";
import { editorialImage } from "./cms-model";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  Users,
  Leaf,
  Globe2,
  ArrowUpRight,
  ChevronRight,
  CalendarDays,
  MapPin,
  BookOpen,
  Search,
  Menu,
  X,
  Building2,
  ShieldCheck,
  HandHeart,
  Download,
  Mail,
  Phone,
  CheckCircle2,
  Mountain,
  LockKeyhole,
  Play,
  Plus,
} from "lucide-react";
import {
  usePlatform,
  Brand,
  Badge,
  Field,
  Form,
  PageIntro,
  Panel,
  SearchBox,
  Empty,
  Modal,
  DocumentLink,
  date,
  money,
  Export,
  Table,
  readPdfFiles,
} from "./ui";
import { Content, provinces, Event as PlatformEvent } from "./model";
import { ProvinceChart } from "./charts";
import {
  InstitutionalHome,
  InstitutionalAbout,
  InstitutionalNavigation,
  InstitutionalPage,
  PublicSearch,
  PublicAgm,
  MediaGallery,
  Newsletter,
  ContactForm,
} from "./institutional";
import { HydropowerDashboard } from "./analytics";
import { useLanguage, LanguageSwitch } from "./i18n";
const publicNav = [
  ["Home", "/"],
  ["About IPPAN", "/about"],
  ["Membership", "/membership"],
  ["Member directory", "/members"],
  ["Hydropower Database", "/hydropower"],
  ["Energy Resource Centre", "/resources"],
  ["News & Media", "/news"],
  ["Publications", "/publications"],
  ["Events & AGM", "/events"],
  ["AGM", "/agm"],
  ["Media gallery", "/media"],
  ["Contact", "/contact"],
  ["Search", "/search"],
];
export default function PublicSite({ path }: { path: string }) {
  const { data } = usePlatform();
  const [menu, setMenu] = useState(false);
  const home = path === "/";
  const { t, choose: c } = useLanguage();
  return (
    <div className={"public-site " + (home ? "is-home" : "")}>
      <div className="utility">
        <span>
          {c(
            "THE VOICE OF NEPAL’S INDEPENDENT ENERGY PRODUCERS",
            "नेपालका स्वतन्त्र ऊर्जा उत्पादकहरूको साझा आवाज",
          )}
        </span>
        <div>
          <Link href="/hydropower">Hydropower database</Link>
          <span className="utility-divider" />
          <Link href="/login">Secretariat login</Link>
          <LanguageSwitch />
        </div>
      </div>
      <header className="public-header">
        <Brand />
        <InstitutionalNavigation />
        <Link
          className="button primary header-portal"
          href={data.viewer?.role === "Member" ? "/portal" : "/login"}
        >
          <Users size={16} />
          {t("Member Login")}
        </Link>
        <button
          className="mobile-menu"
          aria-label="Toggle navigation"
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X /> : <Menu />}
        </button>
      </header>
      {menu && (
        <nav className="mobile-nav">
          {[...publicNav, ["Member portal", "/login"]].map(([label, u]) => (
            <Link onClick={() => setMenu(false)} key={u} href={u}>
              {t(label)}
            </Link>
          ))}
          {data.sitePages
            ?.filter(
              (p) =>
                p.status === "Published" && p.menuLabel && p.slug !== "privacy",
            )
            .sort((a, b) => a.order - b.order)
            .map((p) => (
              <Link
                key={p.id}
                href={"/pages/" + p.slug}
                onClick={() => setMenu(false)}
              >
                {p.menuLabel}
              </Link>
            ))}
        </nav>
      )}
      <main>
        {home ? (
          <InstitutionalHome />
        ) : path.startsWith("/membership") ? (
          <Membership />
        ) : path === "/track" ? (
          <Track />
        ) : path.startsWith("/members") ? (
          <Directory path={path} />
        ) : path.startsWith("/news") ? (
          <ContentPage path={path} kind="news" />
        ) : path.startsWith("/publications") ? (
          <ContentPage path={path} kind="publications" />
        ) : path.startsWith("/resources") ? (
          <ContentPage path={path} kind="resources" />
        ) : path.startsWith("/events") ? (
          <Events path={path} />
        ) : path.startsWith("/hydropower") ? (
          <Hydropower path={path} />
        ) : path.startsWith("/pages/") ? (
          <InstitutionalPage slug={path.split("/")[2]} />
        ) : path === "/media" ? (
          <>
            <PageIntro
              eyebrow="IPPAN MEDIA"
              title={c("Our community in action.", "हाम्रो समुदायका गतिविधि।")}
              description={c(
                "Institutional activities, photographs and video updates.",
                "संस्थागत गतिविधि, तस्बिर र भिडियो।",
              )}
            />
            <section className="section-wrap">
              <MediaGallery />
            </section>
          </>
        ) : path === "/search" ? (
          <PublicSearch />
        ) : path === "/agm" ? (
          <PublicAgm />
        ) : path === "/contact" ? (
          <Contact />
        ) : (
          <InstitutionalAbout />
        )}
      </main>
      <section className="join-banner">
        <div>
          <span className="eyebrow">TOGETHER, WE GENERATE POSSIBILITIES</span>
          <h2>
            {c(
              "Be part of Nepal’s energy future.",
              "नेपालको ऊर्जा भविष्यको हिस्सा बन्नुहोस्।",
            )}
          </h2>
          <p>
            {c(
              "A stronger network. A shared purpose. A lasting impact.",
              "बलियो सञ्जाल। साझा उद्देश्य। दिगो प्रभाव।",
            )}
          </p>
        </div>
        <Link href="/membership" className="button white">
          Become a member <Users size={18} />
        </Link>
      </section>
      <footer className="public-footer">
        <div className="footer-top">
          <div>
            <Brand light />
            <p>
              One collective voice for a sustainable,
              <br />
              prosperous and energy-secure Nepal.
            </p>
            <div className="socials">
              <a
                href="https://www.facebook.com/profile.php?id=100064622144383"
                target="_blank"
                rel="noreferrer"
                aria-label="IPPAN Facebook"
              >
                f
              </a>
              <a
                href="https://www.linkedin.com/company/independent-power-producers-association-nepal/"
                target="_blank"
                rel="noreferrer"
                aria-label="IPPAN LinkedIn"
              >
                in
              </a>
              <a
                href="https://www.ippan.org.np/"
                target="_blank"
                rel="noreferrer"
                aria-label="Official IPPAN website"
              >
                <Globe2 size={17} />
              </a>
            </div>
          </div>
          <div>
            <h4>Discover IPPAN</h4>
            <Link href="/about">Our story & purpose</Link>
            <Link href="/members">Member directory</Link>
            <Link href="/events">Events & programmes</Link>
            <Link href="/news">News & notices</Link>
          </div>
          <div>
            <h4>Knowledge & services</h4>
            <Link href="/hydropower">Hydropower database</Link>
            <Link href="/resources">Energy resource centre</Link>
            <Link href="/publications">Publications & library</Link>
            <Link href="/membership">Membership application</Link>
          </div>
          <div>
            <h4>Get in touch</h4>
            <p>{data.settings.contactAddress}</p>
            <a
              href={
                "tel:" + data.settings.contactPhone?.replace(/[^+0-9]/g, "")
              }
            >
              {data.settings.contactPhone}
            </a>
            <a href={"mailto:" + data.settings.contactEmail}>
              {data.settings.contactEmail}
            </a>
            <Link href="/contact">Contact the secretariat</Link>
          </div>
        </div>
        <Newsletter />
        <div className="footer-bottom">
          <span>© 2026 IPPAN. All rights reserved.</span>
          <span className="demo-note">
            Evaluation demo · Sample records · {data.storage}
          </span>
          <Link href="/track">{t("Track your application")}</Link>
          <Link href="/pages/privacy">
            {c("Privacy & data", "गोपनीयता र तथ्याङ्क")}
          </Link>
        </div>
      </footer>
    </div>
  );
}
export function ContentCard({ item, kind }: { item: Content; kind: string }) {
  const { data } = usePlatform();
  return (
    <Link className="content-card" href={"/" + kind + "/" + item.id}>
      <div className="content-image">
        <img src={editorialImage(item, data.media)} alt={item.title} />
        <span className="image-category">{item.category}</span>
      </div>
      <div className="content-info">
        <span className="metadata">{date(item.date)} · IPPAN insights</span>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <span className="text-link">
          {kind === "news" ? "Read the story" : "Explore publication"}
          <ArrowUpRight size={16} />
        </span>
      </div>
    </Link>
  );
}
function ContentPage({
  path,
  kind,
}: {
  path: string;
  kind: "news" | "publications" | "resources";
}) {
  const { data } = usePlatform();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [reading, setReading] = useState(false);
  const { choose: localize } = useLanguage();
  const records = data[kind]
    .filter((c) => c.status === "Published")
    .map((item) => ({
      ...item,
      title: localize(item.title, item.titleNe || ""),
      description: localize(item.description, item.descriptionNe || ""),
      body: localize(item.body, item.bodyNe || ""),
    }));
  const item = records.find((c) => c.id === path.split("/")[2]);
  if (item)
    return (
      <article className="article section-wrap">
        <Link className="text-link" href={"/" + kind}>
          Back to {kind}
        </Link>
        <span className="eyebrow">
          {item.category} · {date(item.date)}
        </span>
        <h1>{item.title}</h1>
        <p className="article-lead">{item.description}</p>
        <img
          className="article-image"
          src={editorialImage(item, data.media)}
          alt={item.title}
        />
        <EditorialBody body={item.body} />
        {kind !== "news" && (
          <div className="row-actions">
            <button className="button primary" onClick={() => setReading(true)}>
              <BookOpen size={18} />
              Read online
            </button>
            <DocumentLink id={item.id} />
          </div>
        )}
        {reading && (
          <Modal title={item.title} close={() => setReading(false)}>
            <iframe
              className="pdf-viewer"
              title="Publication PDF reader"
              src={"/api/ippan/documents/" + item.id}
            />
          </Modal>
        )}
      </article>
    );
  const list = records.filter(
    (c) =>
      (category === "All categories" || c.category === category) &&
      (c.title + " " + c.description)
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <PageIntro
        eyebrow={
          kind === "news"
            ? "OUR COLLECTIVE JOURNEY"
            : kind === "resources"
              ? "ENERGY RESOURCE CENTRE"
              : "PUBLICATIONS & DIGITAL LIBRARY"
        }
        title={
          kind === "news"
            ? "What’s happening. What’s next."
            : kind === "resources"
              ? "Knowledge that moves us forward."
              : "Perspectives worth sharing."
        }
        description="Discover the ideas, updates and knowledge shaping our energy community."
      />
      <section className="section-wrap">
        <div className="filter-bar">
          <SearchBox
            value={query}
            set={setQuery}
            placeholder="Search by title or keyword…"
          />
          <select
            aria-label="Content category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {["All categories", ...new Set(records.map((c) => c.category))].map(
              (c) => (
                <option key={c}>{c}</option>
              ),
            )}
          </select>
          <Link
            className="button"
            href={kind === "publications" ? "/resources" : "/publications"}
          >
            {kind === "publications" ? "Resource centre" : "Digital library"}
            <BookOpen size={16} />
          </Link>
        </div>
        {kind === "resources" && (
          <div className="callout">
            <LockKeyhole size={20} />
            <div>
              Some briefings are reserved for active members.{" "}
              <Link href="/login">Sign in to access member resources.</Link>
              <p>
                All documents here are illustrative demo editions, not official
                legal or policy texts.
              </p>
            </div>
          </div>
        )}
        <div className="news-grid">
          {list.map((item) => (
            <ContentCard key={item.id} item={item} kind={kind} />
          ))}
        </div>
        {!list.length && <Empty />}
      </section>
    </>
  );
}
function Directory({ path }: { path: string }) {
  const { data } = usePlatform();
  const [q, setQ] = useState("");
  const [province, setProvince] = useState("All provinces");
  const [category, setCategory] = useState("All categories");
  const [min, setMin] = useState("");
  const [projectStatus, setProjectStatus] = useState("");
  const m = data.members.find((m) => m.id === path.split("/")[2] && m.visible);
  if (m)
    return (
      <>
        <PageIntro
          eyebrow={m.category + " MEMBER · " + m.id}
          title={m.name}
          description={m.description}
        />
        <section className="section-wrap">
          <Link href="/members" className="text-link">
            Back to member directory
          </Link>
          <div className="profile-details">
            <Panel title="Company overview">
              <dl>
                <dt>Province</dt>
                <dd>{m.province}</dd>
                <dt>District</dt>
                <dd>{m.district}</dd>
                <dt>Project capacity</dt>
                <dd>{m.capacity} MW</dd>
                <dt>Membership</dt>
                <dd>
                  <Badge>{m.status}</Badge>
                </dd>
                <dt>Member since</dt>
                <dd>{date(m.joined)}</dd>
              </dl>
            </Panel>
            <Panel title="Company projects">
              {data.projects
                .filter((p) => p.memberId === m.id)
                .map((p) => (
                  <Link
                    key={p.id}
                    className="list-link"
                    href={"/hydropower/" + p.id}
                  >
                    <Zap />
                    {p.name}
                    <Badge>{p.status}</Badge>
                  </Link>
                ))}
            </Panel>
          </div>
        </section>
      </>
    );
  const list = data.members.filter(
    (m) =>
      m.visible &&
      (m.name + " " + m.district).toLowerCase().includes(q.toLowerCase()) &&
      (province === "All provinces" || m.province === province) &&
      (category === "All categories" || m.category === category) &&
      m.capacity >= Number(min || 0) &&
      (!projectStatus ||
        data.projects.some(
          (p) => p.memberId === m.id && p.status === projectStatus,
        )),
  );
  return (
    <>
      <PageIntro
        eyebrow="OUR STRENGTH IS OUR COMMUNITY"
        title="Independent producers. Shared ambition."
        description="Meet the companies and partners working toward a brighter energy future."
      />
      <section className="section-wrap">
        <div className="filter-bar">
          <SearchBox
            value={q}
            set={setQ}
            placeholder="Search companies or districts…"
          />
          <select
            aria-label="Province"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
          >
            {["All provinces", ...provinces].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <select
            aria-label="Membership category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {["All categories", "Corporate", "Associate", "Individual"].map(
              (p) => (
                <option key={p}>{p}</option>
              ),
            )}
          </select>
          <input
            type="number"
            aria-label="Minimum capacity MW"
            placeholder="Min. capacity (MW)"
            value={min}
            onChange={(e) => setMin(e.target.value)}
          />
        </div>
        <div className="filter-bar">
          <label className="field">
            <span>Project status</span>
            <select
              aria-label="Member project status"
              value={projectStatus}
              onChange={(e) => setProjectStatus(e.target.value)}
            >
              <option value="">All project stages</option>
              {[
                "Operational",
                "Under construction",
                "Construction not started",
                "Survey",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
        <p className="results-label">
          {list.length} member companies · illustrative sample directory
        </p>
        <div className="directory-grid">
          {list.map((m, i) => (
            <Link href={"/members/" + m.id} key={m.id} className="member-card">
              <div className={"company-mark color-" + (i % 4)}>
                <Mountain size={28} />
              </div>
              <Badge>{m.category}</Badge>
              <h3>{m.name}</h3>
              <p>
                <MapPin size={14} />
                {m.district}, {m.province}
              </p>
              <p>
                {Array.from(
                  new Set(
                    data.projects
                      .filter((p) => p.memberId === m.id)
                      .map((p) => p.status),
                  ),
                ).join(" · ") || "No linked projects"}
              </p>
              <div className="member-card-bottom">
                <span>
                  {m.capacity ? m.capacity + " MW" : "Sector partner"}
                </span>
                <ArrowUpRight size={19} />
              </div>
            </Link>
          ))}
        </div>
        {!list.length && <Empty />}
      </section>
    </>
  );
}
function Events({ path }: { path: string }) {
  const { data, act, notify } = usePlatform();
  const [register, setRegister] = useState(false);
  const [ticket, setTicket] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [filter, setFilter] = useState("Upcoming");
  const [ticketCategory, setTicketCategory] = useState("");
  const item = data.events.find(
    (e) => e.id === path.split("/")[2] && e.status === "Published",
  );
  const tickets = item?.ticketTypes || [
    { name: "General", price: item?.price || 0, capacity: 10000 },
  ];
  const selectedTicket =
    tickets.find((t) => t.name === ticketCategory) || tickets[0];
  if (item)
    return (
      <>
        <PageIntro
          eyebrow="CONNECTING THE ENERGY COMMUNITY"
          title={item.title}
          description={item.description}
        />
        <section className="section-wrap event-detail">
          <img className="article-image" src={item.image} alt={item.title} />
          <Panel title="Event information">
            <p>
              <CalendarDays size={18} />
              {date(item.date)}
            </p>
            <p>
              <MapPin size={18} />
              {item.location}
            </p>
            <p>
              <Badge>
                {item.price
                  ? money(item.price) + " · simulated"
                  : "Free admission"}
              </Badge>
            </p>
            <button
              className="button primary"
              onClick={() => setRegister(true)}
            >
              Register for this event
            </button>
          </Panel>
        </section>
        {register && (
          <Modal title="Event registration" close={() => setRegister(false)}>
            {ticket ? (
              <div className="success-state">
                <CheckCircle2 size={42} />
                <h3>You’re registered, {ticket.name}.</h3>
                <p>Reference: {ticket.id}</p>
                <p>
                  Your registration has been saved to IPPAN’s participant
                  register.
                </p>
                {data.viewer && (
                  <DocumentLink id={ticket.id} label="Download QR entry pass" />
                )}
                {!data.viewer && (
                  <p>
                    Keep your reference. The secretariat can issue your QR entry
                    pass from the participant register.
                  </p>
                )}
              </div>
            ) : (
              <Form
                label={
                  item.price
                    ? "Confirm simulated payment & register"
                    : "Confirm registration"
                }
                onSubmit={async (d) => {
                  const r = await act("register", {
                    ...d,
                    eventId: item.id,
                    ticketType: selectedTicket.name,
                    simulate: selectedTicket.price > 0,
                  });
                  setTicket(r);
                  notify("Event registration confirmed.");
                }}
              >
                <label className="field">
                  <span>Ticket category</span>
                  <select
                    aria-label="Event ticket category"
                    name="ticketType"
                    value={selectedTicket.name}
                    onChange={(e) => setTicketCategory(e.target.value)}
                  >
                    {tickets.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name} ·{" "}
                        {t.price ? money(t.price) + " (simulated)" : "Free"}
                      </option>
                    ))}
                  </select>
                </label>
                <Field
                  name="name"
                  label="Participant name"
                  value={data.viewer?.name}
                />
                <Field
                  name="email"
                  label="Email address"
                  type="email"
                  value={data.viewer?.email}
                />
                {selectedTicket.price > 0 && (
                  <div className="callout">
                    Demo ticket: {money(selectedTicket.price)}. This confirms a
                    simulated payment. No money will be charged.
                  </div>
                )}
              </Form>
            )}
          </Modal>
        )}
      </>
    );
  const records = data.events.filter(
    (e) =>
      e.status === "Published" &&
      (filter === "Upcoming"
        ? new Date(e.date) >= new Date()
        : new Date(e.date) < new Date()),
  );
  return (
    <>
      <PageIntro
        eyebrow="GOOD CONVERSATIONS. GREAT POSSIBILITIES."
        title="Where our community comes together."
        description="Join forums, exhibitions and knowledge exchanges that help our energy community move forward."
      />
      <section className="section-wrap">
        <div className="tabs">
          {["Upcoming", "Past events"].map((t) => (
            <button
              key={t}
              className={t === filter ? "active" : ""}
              onClick={() => setFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="news-grid">
          {records.map((e) => (
            <Link className="content-card" href={"/events/" + e.id} key={e.id}>
              <div className="content-image">
                <img src={e.image} alt={e.title} />
                <span className="image-category">
                  {e.price ? "Forum" : "Community"}
                </span>
              </div>
              <div className="content-info">
                <span className="metadata">
                  {date(e.date)} · {e.price ? money(e.price) : "Free"}
                </span>
                <h3>{e.title}</h3>
                <p>{e.description}</p>
                <span className="text-link">
                  View event
                  <ArrowUpRight size={17} />
                </span>
              </div>
            </Link>
          ))}
        </div>
        {!records.length && <Empty text="No events in this period." />}
      </section>
    </>
  );
}
export function Hydropower({ path = "/hydropower" }: { path?: string }) {
  const { data } = usePlatform();
  const [q, setQ] = useState("");
  const [province, setProvince] = useState("All provinces");
  const [status, setStatus] = useState("All statuses");
  const [view, setView] = useState("Table");
  const item = data.projects.find((p) => p.id === path.split("/")[2]);
  if (item)
    return (
      <>
        <PageIntro
          eyebrow="NEPAL HYDROPOWER DATABASE · SAMPLE RECORD"
          title={item.name}
          description={item.developer}
        />
        <section className="section-wrap">
          <div className="profile-details">
            <Panel title="Project information">
              <dl>
                {Object.entries({
                  Province: item.province,
                  District: item.district,
                  Municipality: item.municipality,
                  "Capacity (MW)": item.capacity,
                  River: item.river,
                  Status: item.status,
                  "Generation licence": item.licence,
                  "Survey licence": item.surveyLicence || "Not supplied",
                  Contact:
                    item.contact ||
                    "Contact the developer through the member directory",
                  "Commercial operation": item.cod,
                  Coordinates: item.lat + ", " + item.lng,
                }).map(([k, v]) => (
                  <div className="dl-row" key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
            <div className="project-image">
              <img
                src="/ippan/hydropower.jpg"
                alt="Hydropower sector reference imagery"
              />
              <p>
                Sector imagery; not a verified photograph of this sample
                project.
              </p>
            </div>
          </div>
        </section>
      </>
    );
  return (
    <>
      <PageIntro
        eyebrow="HYDROPOWER DATABASE"
        title="Explore Nepal’s energy potential."
        description="Search the shared project register. Charts, map and reports update together. All project records are clearly labelled demonstration fixtures."
      />
      <section className="section-wrap">
        <HydropowerDashboard />
      </section>
    </>
  );
}

function Membership() {
  const { act, data } = usePlatform();
  const [result, setResult] = useState<{
    reference: string;
    tracking: string;
  } | null>(null);
  if (result)
    return (
      <section className="section-wrap success-state application-success">
        <CheckCircle2 size={54} />
        <h1>Your next chapter starts here.</h1>
        <p>Your membership application has been received by the secretariat.</p>
        <div className="tracking-result">
          <label>Application reference</label>
          <strong>{result.reference}</strong>
          <label>Private tracking key — save this securely</label>
          <code>{result.tracking}</code>
        </div>
        <p>
          Your chosen email and password will open the member portal after
          approval.
        </p>
        <Link className="button primary" href="/track">
          Track application
        </Link>
      </section>
    );
  return (
    <>
      <PageIntro
        eyebrow="BECOME PART OF SOMETHING GREATER"
        title="Your energy. Our collective strength."
        description="Corporate, associate and individual membership. Submit your information, attach the required PDF, and track review, corrections and approval online."
      />
      <section className="section-wrap application-layout">
        <aside>
          <div className="category-requirements">
            {data.categories
              ?.filter((c) => c.enabled)
              .map((c) => (
                <div key={c.name}>
                  <h3>{c.name} membership</h3>
                  <p>{c.description}</p>
                  <strong>{money(c.fee)} / year</strong>
                  <small>Required: {c.documents}</small>
                </div>
              ))}
          </div>
          <h2>
            A stronger future,
            <br />
            <em>built together.</em>
          </h2>
          <p>
            Complete the application and our membership team will review your
            details.
          </p>
          {[
            [
              Users,
              "Corporate membership",
              "For independent power producers and project developers.",
            ],
            [
              HandHeart,
              "Associate membership",
              "For professionals, suppliers and energy-sector partners.",
            ],
            [
              ShieldCheck,
              "A connected process",
              "Track your application, receive updates and access your digital membership.",
            ],
          ].map(([I, t, s]) => {
            const Icon = I as typeof Users;
            return (
              <div className="application-benefit" key={String(t)}>
                <Icon size={24} />
                <div>
                  <h3>{String(t)}</h3>
                  <p>{String(s)}</p>
                </div>
              </div>
            );
          })}
          <Link href="/track" className="text-link">
            Already applied? Track your application
            <ChevronRight size={16} />
          </Link>
        </aside>
        <Panel
          title="Membership application"
          sub="All fields are required. Use sample data for this evaluation demo."
        >
          <Form
            label="Submit membership application"
            onSubmit={async (d, form) => {
              const files = Array.from(
                (form.elements.namedItem("documents") as HTMLInputElement)
                  .files || [],
              );
              const documents = await Promise.all(
                files.map(async (f) => ({
                  name: f.name,
                  data: await new Promise<string>((res, rej) => {
                    const r = new FileReader();
                    r.onload = () => res(String(r.result).split(",")[1]);
                    r.onerror = rej;
                    r.readAsDataURL(f);
                  }),
                })),
              );
              setResult(await act("apply", { ...d, documents }));
            }}
          >
            <div className="form-grid">
              <Field name="name" label="Company / organization name" />
              <Field name="email" label="Contact email" type="email" />
              <Field
                name="category"
                label="Membership category"
                options={
                  data.categories
                    ?.filter((c) => c.enabled)
                    .map((c) => c.name) || [
                    "Corporate",
                    "Associate",
                    "Individual",
                  ]
                }
              />
              <Field name="province" label="Province" options={provinces} />
              <Field name="district" label="District" />
              <Field
                name="capacity"
                label="Project capacity (MW; 0 for associates)"
                type="number"
                value={0}
              />
            </div>
            <Field
              name="password"
              label="Choose a portal password (minimum 12 characters)"
              type="password"
            />
            <label className="field">
              <span>
                Company registration / supporting documents (PDF, max. 2 MB
                each)
              </span>
              <input
                type="file"
                name="documents"
                accept="application/pdf"
                multiple
                required
              />
            </label>
            <label className="checkbox-row">
              <input type="checkbox" required />I confirm these are sample
              details submitted for the IPPAN evaluation demo.
            </label>
          </Form>
        </Panel>
      </section>
    </>
  );
}
function Track() {
  const { act } = usePlatform();
  const [result, setResult] = useState<any>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  return (
    <>
      <PageIntro
        eyebrow="MEMBERSHIP APPLICATION"
        title="Stay connected to your progress."
        description="Use your application reference and private tracking key to see updates from the membership team."
      />
      <section className="section-wrap narrow">
        <Panel title="Track your application">
          <Form
            label="Check application status"
            onSubmit={async (d) => {
              setCredentials(d);
              setResult(await act("track", d));
            }}
          >
            <Field name="reference" label="Application reference" />
            <Field name="token" label="Private tracking key" />
          </Form>
        </Panel>
        {result && (
          <Panel title={result.name} action={<Badge>{result.status}</Badge>}>
            {result.history.map((h: any, i: number) => (
              <div className="timeline-item" key={i}>
                <span className="timeline-dot" />
                <div>
                  <strong>{h.status}</strong>
                  <p>{h.note}</p>
                  <small>{date(h.date)}</small>
                </div>
              </div>
            ))}
            {result.status === "Correction requested" && (
              <Form
                label="Resubmit corrected documents"
                onSubmit={async (d, form) => {
                  const documents = await readPdfFiles(form, "corrections");
                  await act("correct-application", {
                    ...credentials,
                    ...d,
                    documents,
                  });
                  setResult(await act("track", credentials));
                }}
              >
                <Field
                  name="note"
                  label="Explain your corrections"
                  type="textarea"
                />
                <label className="field">
                  <span>
                    Corrected supporting documents (PDF, max. 2 MB each)
                  </span>
                  <input
                    name="corrections"
                    type="file"
                    accept="application/pdf"
                    multiple
                    required
                  />
                </label>
              </Form>
            )}
          </Panel>
        )}
      </section>
    </>
  );
}
function Contact() {
  const { data } = usePlatform();
  return (
    <>
      <PageIntro
        eyebrow="LET’S START A CONVERSATION"
        title="Good things begin with a connection."
        description="Reach the IPPAN secretariat for membership, events and institutional inquiries."
      />
      <section className="section-wrap contact-grid">
        <Panel title="Visit the secretariat">
          <MapPin size={28} />
          <h3>Kandevta Complex, Kupondole</h3>
          <p>Lalitpur, Nepal</p>
        </Panel>
        <Panel title="Call us">
          <Phone size={28} />
          <a href="tel:+97715445444">+977 01 5445444</a>
          <p>Contact the secretariat during office hours.</p>
        </Panel>
        <Panel title="Write to us">
          <Mail size={28} />
          <a href="mailto:info@ippan.org.np">info@ippan.org.np</a>
          <p>Open your email application to send an inquiry.</p>
        </Panel>
      </section>
      <section className="section-wrap">
        <ContactForm />
      </section>
    </>
  );
}
