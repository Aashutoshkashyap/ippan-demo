"use client";
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
const publicNav = [
  ["About IPPAN", "/about"],
  ["Our members", "/members"],
  ["News & insights", "/news"],
  ["Events", "/events"],
  ["Resources", "/resources"],
];
export default function PublicSite({ path }: { path: string }) {
  const { data } = usePlatform();
  const [menu, setMenu] = useState(false);
  const home = path === "/";
  return (
    <div className={"public-site " + (home ? "is-home" : "")}>
      <div className="utility">
        <span>THE VOICE OF NEPAL’S INDEPENDENT ENERGY PRODUCERS</span>
        <div>
          <Link href="/hydropower">Hydropower database</Link>
          <span className="utility-divider" />
          <Link href="/login">Secretariat login</Link>
          <span>EN</span>
        </div>
      </div>
      <header className="public-header">
        <Brand />
        <nav aria-label="Main navigation">
          {publicNav.map(([label, url]) => (
            <Link
              className={path.startsWith(url) ? "active" : ""}
              key={url}
              href={url}
            >
              {label}
            </Link>
          ))}
        </nav>
        <Link
          className="button primary header-portal"
          href={data.viewer?.role === "Member" ? "/portal" : "/login"}
        >
          <Users size={16} />
          Member portal
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
          {[
            ...publicNav,
            ["Hydropower database", "/hydropower"],
            ["Member portal", "/login"],
          ].map(([t, u]) => (
            <Link onClick={() => setMenu(false)} key={u} href={u}>
              {t}
            </Link>
          ))}
        </nav>
      )}
      <main>
        {home ? (
          <Home />
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
        ) : path === "/contact" ? (
          <Contact />
        ) : (
          <About />
        )}
      </main>
      <section className="join-banner">
        <div>
          <span className="eyebrow">TOGETHER, WE GENERATE POSSIBILITIES</span>
          <h2>Be part of Nepal’s energy future.</h2>
          <p>A stronger network. A shared purpose. A lasting impact.</p>
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
            <p>
              Kandevta Complex, Kupondole
              <br />
              Lalitpur, Nepal
            </p>
            <a href="tel:+97715445444">+977 01 5445444</a>
            <a href="mailto:info@ippan.org.np">info@ippan.org.np</a>
            <Link href="/contact">Contact the secretariat</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 IPPAN. All rights reserved.</span>
          <span className="demo-note">
            Evaluation demo · Sample records · {data.storage}
          </span>
          <Link href="/track">Track your application</Link>
        </div>
      </footer>
    </div>
  );
}
function Home() {
  const { data } = usePlatform();
  const capacity = data.projects.reduce((n, p) => n + p.capacity, 0);
  return (
    <>
      <section className="hero">
        <div className="hero-background" />
        <div className="hero-content">
          <span className="hero-kicker">
            <span />
            THE ENERGY OF A UNITED COMMUNITY
          </span>
          <h1>
            {data.settings.heroTitle.split("\n").map((l, i) => (
              <span key={i} className={i === 1 ? "accent" : ""}>
                {l}
                <br />
              </span>
            ))}
          </h1>
          <p>{data.settings.heroSubtitle}</p>
          <div className="hero-actions">
            <Link className="button lime" href="/membership">
              Become a member
              <Users size={18} />
            </Link>
            <Link className="hero-secondary" href="/about">
              Discover IPPAN
              <span className="round-icon">
                <ArrowUpRight size={20} />
              </span>
            </Link>
          </div>
        </div>
        <div className="hero-side">
          <span className="vertical-label">
            INDEPENDENT POWER. COLLECTIVE PROGRESS.
          </span>
          <div className="hero-year">
            <strong>
              Since
              <br />
              2001.
            </strong>
            <span>
              A shared vision
              <br />
              for a brighter Nepal
            </span>
          </div>
        </div>
        <div className="hero-bottom">
          <span>
            <MapPin size={15} /> Powering possibilities across Nepal
          </span>
          <span>
            SCROLL TO EXPLORE <span className="scroll-line" />
          </span>
          <span className="hero-image-caption">
            Hydropower sector imagery · IPPAN
          </span>
        </div>
      </section>
      <section className="public-stats">
        {[
          [
            data.members.length,
            "Member companies",
            "A connected energy community",
          ],
          [
            capacity.toLocaleString() + " MW",
            "Project capacity",
            "Represented in our demo database",
          ],
          ["7", "Provinces connected", "One shared national ambition"],
          ["25+", "Years of advocacy", "A legacy of collective progress"],
        ].map(([v, t, s], i) => (
          <div key={t}>
            <span className="stat-index">
              {["Membership", "Energy", "Presence", "Our journey"][i]}
            </span>
            <strong>{v}</strong>
            <h3>{t}</h3>
            <p>{s}</p>
          </div>
        ))}
      </section>
      <section className="about-section section-wrap">
        <div className="about-image">
          <img
            src="/ippan/hydropower.jpg"
            alt="Hydropower station and forested river valley"
          />
          <div className="image-label">
            <Leaf size={23} />
            <span>
              Natural potential.
              <br />
              <strong>Lasting prosperity.</strong>
            </span>
          </div>
          <div className="about-image-small">
            <img
              src="/ippan/assembly.jpg"
              alt="IPPAN energy community gathering"
            />
          </div>
        </div>
        <div className="about-copy">
          <span className="eyebrow">A COLLECTIVE FORCE FOR CHANGE</span>
          <h2>
            Our rivers hold potential.
            <br />
            <em>Our people unlock it.</em>
          </h2>
          <p>
            Since 2001, IPPAN has brought Nepal’s independent power producers
            together with a simple belief: our energy future is stronger when we
            build it together.
          </p>
          <p>
            We connect the private sector, policymakers and partners to advance
            responsible energy development and create lasting value for Nepal.
          </p>
          <div className="about-values">
            <span>
              <ShieldCheck size={20} />A trusted collective voice
            </span>
            <span>
              <Leaf size={20} />
              Sustainable progress
            </span>
          </div>
          <Link className="button dark" href="/about">
            Get to know IPPAN
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <section className="services-section section-wrap">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CONNECTED FOR A COMMON PURPOSE</span>
            <h2>
              More than an association.
              <br />
              <em>A platform for progress.</em>
            </h2>
          </div>
          <p>
            The knowledge, connections and representation
            <br />
            to move Nepal’s energy community forward.
          </p>
        </div>
        <div className="service-grid">
          {[
            [
              Users,
              "A stronger network",
              "Connect with independent producers and energy-sector partners.",
              "/members",
            ],
            [
              ShieldCheck,
              "A shared voice",
              "Shaping dialogue and championing a supportive energy landscape.",
              "/about",
            ],
            [
              BookOpen,
              "Knowledge that powers",
              "Discover publications, policy references and sector insights.",
              "/resources",
            ],
            [
              Zap,
              "Energy in perspective",
              "Explore the projects shaping the hydropower landscape.",
              "/hydropower",
            ],
          ].map(([Icon, t, s, url]) => {
            const I = Icon as typeof Users;
            return (
              <Link className="service-card" href={String(url)} key={String(t)}>
                <I size={29} />
                <h3>{String(t)}</h3>
                <p>{String(s)}</p>
                <span className="service-link">
                  Explore
                  <ArrowUpRight size={17} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
      <section className="energy-strip">
        <div>
          <span className="eyebrow">THE POTENTIAL IS EXTRAORDINARY</span>
          <h2>
            Clean energy.
            <br />
            Shared prosperity.
          </h2>
          <p>
            Explore the projects and people building
            <br />
            Nepal’s renewable energy future.
          </p>
          <Link className="button lime" href="/hydropower">
            Explore hydropower database
            <Zap size={17} />
          </Link>
        </div>
        <div className="energy-strip-metric">
          <strong>
            {capacity}
            <small>MW</small>
          </strong>
          <span>Sample project capacity</span>
          <div className="tiny-line" />
          <p>
            {data.projects.length} projects. Seven provinces.
            <br />
            Endless possibilities.
          </p>
        </div>
      </section>
      <section className="section-wrap news-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FROM THE ENERGY COMMUNITY</span>
            <h2>
              Ideas. Insights. <em>Impact.</em>
            </h2>
          </div>
          <Link className="text-link" href="/news">
            All news & insights
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="news-grid">
          {data.news
            .filter((n) => n.status === "Published")
            .slice(0, 3)
            .map((n) => (
              <ContentCard key={n.id} item={n} kind="news" />
            ))}
        </div>
      </section>
      <section className="events-section section-wrap">
        <div className="section-heading">
          <div>
            <span className="eyebrow">MEET. CONNECT. MOVE FORWARD.</span>
            <h2>
              Good energy starts
              <br />
              <em>with a conversation.</em>
            </h2>
          </div>
          <Link className="text-link" href="/events">
            Explore events
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="event-preview">
          <img
            src="/ippan/expo.jpg"
            alt="Energy sector expo opening ceremony"
          />
          <div>
            {data.events
              .filter((e) => e.status === "Published")
              .slice(0, 3)
              .map((e) => (
                <Link className="event-row" href={"/events/" + e.id} key={e.id}>
                  <div className="event-date">
                    <strong>{new Date(e.date).getDate()}</strong>
                    <span>
                      {new Date(e.date).toLocaleString("en", {
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="eyebrow">
                      {e.price ? "FORUM" : "COMMUNITY EVENT"}
                    </span>
                    <h3>{e.title}</h3>
                    <p>
                      <MapPin size={13} />
                      {e.location}
                    </p>
                  </div>
                  <span className="round-icon">
                    <ArrowUpRight size={19} />
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>
      <section className="section-wrap library-preview">
        <div>
          <span className="eyebrow">KNOWLEDGE FOR WHAT’S NEXT</span>
          <h2>
            A resource for
            <br />
            <em>every possibility.</em>
          </h2>
          <p>
            Sector perspectives, institutional publications
            <br />
            and practical knowledge, in one place.
          </p>
          <Link href="/publications" className="button dark">
            Explore the digital library
            <BookOpen size={17} />
          </Link>
        </div>
        <div className="publication-cover">
          <img
            src="/ippan/publication.jpg"
            alt="Urja Samriddhi publication cover"
          />
          <span>PUBLICATIONS & DIGITAL LIBRARY</span>
        </div>
      </section>
    </>
  );
}
export function ContentCard({ item, kind }: { item: Content; kind: string }) {
  return (
    <Link className="content-card" href={"/" + kind + "/" + item.id}>
      <div className="content-image">
        <img src={item.image} alt={item.title} />
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
  const records = data[kind].filter((c) => c.status === "Published");
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
        <img className="article-image" src={item.image} alt={item.title} />
        <div className="article-body">
          {item.body.split("\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
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
      m.capacity >= Number(min || 0),
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
            {["All categories", "Corporate", "Associate"].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <input
            type="number"
            aria-label="Minimum capacity MW"
            placeholder="Min. capacity (MW)"
            value={min}
            onChange={(e) => setMin(e.target.value)}
          />
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
  const item = data.events.find(
    (e) => e.id === path.split("/")[2] && e.status === "Published",
  );
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
                    simulate: item.price > 0,
                  });
                  setTicket(r);
                  notify("Event registration confirmed.");
                }}
              >
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
                {item.price > 0 && (
                  <div className="callout">
                    Demo ticket: {money(item.price)}. This confirms a simulated
                    payment. No money will be charged.
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
                  Licence: item.licence,
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
  const records = data.projects.filter(
    (p) =>
      (p.name + " " + p.developer + " " + p.district)
        .toLowerCase()
        .includes(q.toLowerCase()) &&
      (province === "All provinces" || p.province === province) &&
      (status === "All statuses" || p.status === status),
  );
  return (
    <>
      <PageIntro
        eyebrow="NEPAL HYDROPOWER DATABASE"
        title="See the energy. Explore the potential."
        description="Explore sample hydropower projects by location, capacity and development stage. Data is illustrative and is not verified official IPPAN information."
      />
      <section className="section-wrap">
        <div className="database-metrics">
          {[
            ["Projects", records.length],
            [
              "Total capacity",
              records.reduce((n, p) => n + p.capacity, 0) + " MW",
            ],
            [
              "Operational",
              records.filter((p) => p.status === "Operational").length,
            ],
            [
              "Under construction",
              records.filter((p) => p.status === "Under construction").length,
            ],
          ].map(([t, v]) => (
            <div key={t}>
              <span>{t}</span>
              <strong>{v}</strong>
            </div>
          ))}
        </div>
        <ProvinceChart />
        <div className="filter-bar">
          <SearchBox
            value={q}
            set={setQ}
            placeholder="Search projects, developers or districts…"
          />
          <select
            aria-label="Project province"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
          >
            {["All provinces", ...provinces].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <select
            aria-label="Project status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {[
              "All statuses",
              "Operational",
              "Under construction",
              "Survey",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <Export rows={records} name="ippan-hydropower" />
        </div>
        <div className="tabs">
          {["Table", "Map"].map((t) => (
            <button
              key={t}
              className={view === t ? "active" : ""}
              onClick={() => setView(t)}
            >
              {t}
            </button>
          ))}
        </div>
        {view === "Map" ? (
          <div className="project-map">
            <div className="map-grid" />
            <div className="nepal-shape" />
            {records.map((p) => (
              <Link
                title={p.name + " · " + p.capacity + " MW"}
                key={p.id}
                style={{
                  left: 8 + (p.lng - 80) * 11 + "%",
                  top: 85 - (p.lat - 26) * 17 + "%",
                }}
                className="map-marker"
                href={"/hydropower/" + p.id}
              >
                <MapPin size={25} />
                <span>{p.name}</span>
              </Link>
            ))}
            <p>
              Interactive project markers · Schematic location view, not a
              geographic basemap
            </p>
          </div>
        ) : (
          <Table
            headers={[
              "Project / developer",
              "Province",
              "River",
              "Capacity",
              "Status",
              "",
            ]}
          >
            {records.map((p) => (
              <tr key={p.id}>
                <td>
                  <strong>{p.name}</strong>
                  <small>{p.developer}</small>
                </td>
                <td>{p.province}</td>
                <td>{p.river}</td>
                <td>{p.capacity} MW</td>
                <td>
                  <Badge>{p.status}</Badge>
                </td>
                <td>
                  <Link className="table-action" href={"/hydropower/" + p.id}>
                    Details
                    <ChevronRight size={15} />
                  </Link>
                </td>
              </tr>
            ))}
          </Table>
        )}
        {!records.length && <Empty />}
      </section>
    </>
  );
}
function Membership() {
  const { act } = usePlatform();
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
        description="Apply for corporate or associate membership and connect with Nepal’s independent energy community."
      />
      <section className="section-wrap application-layout">
        <aside>
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
                options={["Corporate", "Associate"]}
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
function About() {
  return (
    <>
      <PageIntro
        eyebrow="INDEPENDENT POWER. COLLECTIVE PROGRESS."
        title="A shared vision for a brighter Nepal."
        description="Established in 2001, IPPAN brings the independent power community together to advance Nepal’s energy potential."
      />
      <section className="about-section section-wrap">
        <div className="about-image">
          <img src="/ippan/assembly.jpg" alt="IPPAN community gathering" />
        </div>
        <div className="about-copy">
          <span className="eyebrow">OUR PURPOSE</span>
          <h2>
            A collective voice.
            <br />
            <em>A lasting contribution.</em>
          </h2>
          <p>
            We connect energy producers, policymakers and partners, creating a
            platform for dialogue, knowledge exchange and sustainable
            development.
          </p>
          <p>
            Our vision is a prosperous and energy-secure Nepal, supported by a
            thriving independent power sector.
          </p>
          <div className="about-values">
            <span>
              <Leaf />
              Responsible development
            </span>
            <span>
              <Users />
              Meaningful collaboration
            </span>
          </div>
        </div>
      </section>
      <section className="section-wrap">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              THE INSTITUTION BEHIND THE COMMUNITY
            </span>
            <h2>
              People. Purpose. <em>Progress.</em>
            </h2>
          </div>
        </div>
        <div className="service-grid">
          {[
            [
              "Our mission",
              "Represent members, support informed policy dialogue and encourage responsible private investment in energy.",
            ],
            [
              "Executive committee",
              "Elected member representatives provide institutional leadership. Committee profiles await approved IPPAN content.",
            ],
            [
              "Our secretariat",
              "Membership, finance, events and communications teams coordinate the work of the association.",
            ],
            [
              "Our objectives",
              "Promote sector collaboration, strengthen knowledge exchange and advance a resilient energy future.",
            ],
          ].map(([t, s]) => (
            <div className="service-card" key={t}>
              <Building2 />
              <h3>{t}</h3>
              <p>{s}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
function Contact() {
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
    </>
  );
}
