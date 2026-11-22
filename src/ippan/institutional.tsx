"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Search,
  Users,
  BookOpen,
  CalendarDays,
  Play,
  ChevronDown,
  Mail,
  CheckCircle2,
  FileText,
} from "lucide-react";
import {
  usePlatform,
  Panel,
  Table,
  Form,
  Field,
  Empty,
  Badge,
  PageIntro,
  date,
  DocumentLink,
} from "./ui";
import { DataChart, HydropowerDashboard } from "./analytics";
import { projectAggregates, totalCapacity } from "./analytics-data";
import { useLanguage, LanguageSwitch } from "./i18n";
import { editorialImage, homepageContent } from "./cms-model";
import { EditorialBody } from "./editorial-body";
export function InstitutionalNavigation() {
  const { data } = usePlatform();
  const { t } = useLanguage();
  const pages = (group: string) =>
    data.sitePages
      ?.filter(
        (p) =>
          p.status === "Published" &&
          p.menuLabel &&
          p.slug !== "privacy" &&
          (p.menuGroup || "About IPPAN") === group,
      )
      .sort((a, b) => a.order - b.order)
      .map((p) => (
        <Link href={"/pages/" + p.slug} key={p.id}>
          {p.menuLabel}
        </Link>
      ));
  return (
    <>
      <nav className="institutional-nav" aria-label="Main navigation">
        <Link href="/">{t("Home")}</Link>
        <details>
          <summary>
            {t("About IPPAN")}
            <ChevronDown size={13} />
          </summary>
          <div>
            <Link href="/about">{t("About IPPAN")}</Link>
            {pages("About IPPAN")}
            <Link href="/contact">{t("Contact")}</Link>
          </div>
        </details>
        <details>
          <summary>
            {t("Membership")}
            <ChevronDown size={13} />
          </summary>
          <div>
            <Link href="/membership">{t("Become a member")}</Link>
            <Link href="/members">{t("Member directory")}</Link>
            <Link href="/track">{t("Track your application")}</Link>
            {pages("Membership")}
          </div>
        </details>
        <Link href="/hydropower">{t("Hydropower Database")}</Link>
        <details>
          <summary>
            {t("News & Media")}
            <ChevronDown size={13} />
          </summary>
          <div>
            <Link href="/news">{t("News & notices")}</Link>
            <Link href="/media">{t("News & Media")}</Link>
            <Link href="/publications">{t("Publications")}</Link>
            <Link href="/resources">{t("Energy Resource Centre")}</Link>
            {pages("News & Media")}
          </div>
        </details>
        <details>
          <summary>
            {t("Events & AGM")}
            <ChevronDown size={13} />
          </summary>
          <div>
            <Link href="/events">{t("Events & AGM")}</Link>
            {pages("Events & AGM")}
            <Link href="/agm">AGM</Link>
          </div>
        </details>
        <Link href="/search" aria-label="Search the public website">
          <Search size={18} />
        </Link>
      </nav>
    </>
  );
}
function SectionHead({
  tag,
  title,
  description,
  href,
  label,
  section,
}: {
  tag: string;
  title: string;
  description?: string;
  href?: string;
  label?: string;
  section?: string;
}) {
  const { data } = usePlatform();
  const { choose } = useLanguage();
  const copy = section ? data.settings.homeCopy?.[section] : undefined;
  const customTitle = copy ? choose(copy.title, copy.titleNe) : "";
  return (
    <div className="editorial-heading">
      <div>
        <span className="eyebrow">{tag}</span>
        <h2>{customTitle || title}</h2>
        {description && <p>{description}</p>}
      </div>
      {href && (
        <Link className="text-link" href={href}>
          {label || "Explore"}
          <ArrowUpRight size={18} />
        </Link>
      )}
    </div>
  );
}
export function InstitutionalHome() {
  const { data } = usePlatform();
  const { choose: c, t } = useLanguage();
  const stats = projectAggregates(data.projects);
  const publicNews = homepageContent(data.news);
  const resources = homepageContent(data.resources);
  const pubs = homepageContent(data.publications);
  const heroImage = editorialImage(
    {
      image: data.settings.heroImage || "/ippan/hydropower.jpg",
      imageMediaId: data.settings.heroMediaId,
    },
    data.media,
  );
  const heading = (key: string, en: string, ne: string) => {
    const copy = data.settings.homeCopy?.[key];
    return (copy && c(copy.title, copy.titleNe)) || c(en, ne);
  };
  const sections = data.settings.sections || [];
  const today = new Date().toISOString().slice(0, 10);
  return (
    <>
      <section className="hero institutional-hero">
        <div
          className="hero-background"
          style={
            heroImage
              ? {
                  backgroundImage: `linear-gradient(90deg,#052d2bc9,#0c35224d), url(${heroImage})`,
                }
              : undefined
          }
        />
        <div className="hero-content">
          <span className="hero-kicker">
            <span />
            {c(
              "ONE COMMUNITY. ENDLESS POTENTIAL.",
              "एक समुदाय। असीमित सम्भावना।",
            )}
          </span>
          <h1>
            {c(data.settings.heroTitle, data.settings.heroTitleNe || "")
              .split("\n")
              .map((line, i) => (
                <span key={i} className={i === 1 ? "accent" : ""}>
                  {line}
                  <br />
                </span>
              ))}
          </h1>
          <p>
            {c(data.settings.heroSubtitle, data.settings.heroSubtitleNe || "")}
          </p>
          <div className="hero-actions">
            <Link className="button lime" href="/hydropower">
              {c(
                "Explore hydropower projects",
                "जलविद्युत् परियोजना खोज्नुहोस्",
              )}
              <ArrowUpRight size={18} />
            </Link>
            <Link className="hero-secondary" href="/membership">
              {t("Become a member")}
              <Users size={18} />
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
              {c(
                "A shared vision for a brighter Nepal",
                "उज्ज्वल नेपालका लागि साझा दृष्टि",
              )}
            </span>
          </div>
        </div>
        <div className="hero-bottom">
          <span>
            {c(
              "Nepal’s independent energy community",
              "नेपालको स्वतन्त्र ऊर्जा समुदाय",
            )}
          </span>
          <span>SCROLL TO EXPLORE ──</span>
        </div>
      </section>
      {sections.includes("glance") && (
        <section className="institutional-glance" data-home-section="glance">
          <div>
            <span className="eyebrow">
              {c("IPPAN AT A GLANCE", "इप्पान एक झलकमा")}
            </span>
            <h2>
              {heading("glance", "A collective force.", "सामूहिक शक्ति।")}
            </h2>
            <p>
              {c(
                "Demonstration records, connected across one platform.",
                "एउटै मञ्चमा जोडिएका प्रदर्शन अभिलेखहरू।",
              )}
            </p>
          </div>
          <div className="glance-numbers">
            {[
              [
                data.members.filter((m) => m.visible).length,
                c("Member organizations", "सदस्य संस्था"),
              ],
              [
                stats.capacity + " MW",
                c(
                  "Represented project capacity",
                  "प्रतिनिधित्व परियोजना क्षमता",
                ),
              ],
              [
                data.projects.filter((p) => p.status === "Operational").length,
                c("Operating projects", "सञ्चालित परियोजना"),
              ],
              [
                data.projects.filter((p) => p.status === "Under construction")
                  .length,
                c("Under construction", "निर्माणाधीन"),
              ],
            ].map(([v, n]) => (
              <div key={n}>
                <strong>{v}</strong>
                <span>{n}</span>
              </div>
            ))}
          </div>
        </section>
      )}
      {sections.includes("sector") && (
        <section
          className="section-wrap sector-section"
          data-home-section="sector"
        >
          <SectionHead
            section="sector"
            tag={c("NEPAL’S ENERGY LANDSCAPE", "नेपालको ऊर्जा क्षेत्र")}
            title={c(
              "Understanding the journey to clean energy.",
              "स्वच्छ ऊर्जातर्फको यात्रा बुझ्दै।",
            )}
            description={c(
              "A view of development stages in the demonstration project register.",
              "प्रदर्शन परियोजना अभिलेखमा विकास चरणहरूको झलक।",
            )}
            href="/hydropower"
            label={c("Explore the data", "तथ्याङ्क हेर्नुहोस्")}
          />
          <div className="sector-layout">
            <div className="sector-story">
              <span className="large-number">
                {stats.capacity}
                <small>MW</small>
              </span>
              <h3>
                {c("Registered project capacity", "दर्ता परियोजनाको क्षमता")}
              </h3>
              <p>
                {c(
                  "This is the total of sample projects in this platform, including future development. It is not Nepal’s national installed capacity.",
                  "यस मञ्चका नमुना परियोजनाहरूको कुल क्षमता हो। यो नेपालको राष्ट्रिय जडित क्षमता होइन।",
                )}
              </p>
              <div className="dataset-note">
                {c(
                  "National statistics await an approved, dated data source.",
                  "राष्ट्रिय तथ्याङ्कका लागि स्वीकृत र मिति सहितको स्रोत आवश्यक छ।",
                )}
              </div>
              <Link href="/about" className="text-link">
                {c(
                  "Meet the association behind the platform",
                  "संघबारे जान्नुहोस्",
                )}{" "}
                →
              </Link>
            </div>
            <DataChart
              title={c(
                "Capacity by development stage",
                "विकास चरणअनुसार क्षमता",
              )}
              rows={stats.statuses.map((r) => ({
                name: t(r.name),
                value: r.capacity,
              }))}
              unit="MW"
            />
          </div>
        </section>
      )}
      {sections.includes("projects") && (
        <section
          className="section-wrap project-explorer-section"
          data-home-section="projects"
        >
          <SectionHead
            section="projects"
            tag={c(
              "EXPLORE NEPAL’S HYDROPOWER PROJECTS",
              "नेपालका जलविद्युत् परियोजना",
            )}
            title={c(
              "Every project. Part of a bigger future.",
              "हरेक परियोजना। ठूलो भविष्यको हिस्सा।",
            )}
            href="/hydropower"
            label={c("View full database", "पूरा डाटाबेस हेर्नुहोस्")}
          />
          <HydropowerDashboard compact />
        </section>
      )}
      {sections.includes("membership") && (
        <section
          className="membership-editorial"
          data-home-section="membership"
        >
          <div className="membership-editorial-image">
            <img
              src="/ippan/assembly.jpg"
              alt="IPPAN energy community gathering"
            />
            <span>
              {c("A stronger voice, together.", "सँगै, अझ बलियो आवाज।")}
            </span>
          </div>
          <div>
            <span className="eyebrow">
              {c("IPPAN MEMBERSHIP", "इप्पान सदस्यता")}
            </span>
            <h2>
              {heading(
                "membership",
                "Your ambition. Our shared momentum.",
                "तपाईंको आकांक्षा। हाम्रो साझा गति।",
              )}
            </h2>
            <p>
              {c(
                "Connect with producers, policy dialogue and knowledge that helps move the energy sector forward.",
                "उत्पादक, नीतिगत संवाद र ऊर्जा क्षेत्रलाई अघि बढाउने ज्ञानसँग जोडिनुहोस्।",
              )}
            </p>
            <div className="membership-types">
              {data.categories
                ?.filter((x) => x.enabled)
                .map((x) => (
                  <div key={x.name}>
                    <strong>{t(x.name)}</strong>
                    <p>{x.description}</p>
                  </div>
                ))}
            </div>
            <div className="row-actions">
              <Link className="button primary" href="/membership">
                {t("Become a member")}
                <ArrowUpRight size={16} />
              </Link>
              <Link className="text-link" href="/members">
                {t("Member directory")} →
              </Link>
            </div>
            <div className="featured-member-list">
              {data.members
                .filter((m) => m.visible)
                .slice(0, 3)
                .map((m) => (
                  <Link key={m.id} href={"/members/" + m.id}>
                    {m.name}
                    <ArrowUpRight size={15} />
                  </Link>
                ))}
            </div>
          </div>
        </section>
      )}
      {sections.includes("news") && (
        <section className="section-wrap" data-home-section="news">
          <SectionHead
            section="news"
            tag={c("LATEST NEWS & NOTICES", "पछिल्ला समाचार र सूचना")}
            title={c("Ideas. Insights. Impact.", "विचार। ज्ञान। प्रभाव।")}
            href="/news"
            label={c("All news & notices", "सबै समाचार र सूचना")}
          />
          <div className="institutional-news">
            {publicNews.slice(0, 3).map((n, i) => (
              <Link
                href={"/news/" + n.id}
                key={n.id}
                className={i === 0 ? "featured-story" : "small-story"}
              >
                <img
                  src={editorialImage(n, data.media)}
                  alt="IPPAN sector reference imagery"
                />
                <div>
                  <span className="eyebrow">
                    {n.category} · {date(n.date)}
                  </span>
                  <h3>{c(n.title, n.titleNe || "")}</h3>
                  <p>{c(n.description, n.descriptionNe || "")}</p>
                  <span className="text-link">
                    {c("Read the story", "पूरा पढ्नुहोस्")}
                    <ArrowUpRight size={17} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      {sections.includes("events") && (
        <section
          className="section-wrap events-editorial"
          data-home-section="events"
        >
          <SectionHead
            section="events"
            tag={c("UPCOMING EVENTS & AGM", "आगामी कार्यक्रम र साधारण सभा")}
            title={c(
              "Good energy starts with a conversation.",
              "राम्रो ऊर्जा संवादबाट सुरु हुन्छ।",
            )}
            href="/events"
            label={c("View all events", "सबै कार्यक्रम")}
          />
          <div className="events-split">
            <img
              src="/ippan/expo.jpg"
              alt="Energy-sector expo reference imagery"
            />
            <div>
              {data.events
                .filter((e) => e.status === "Published" && e.date >= today)
                .slice(0, 3)
                .map((e) => (
                  <Link
                    href={"/events/" + e.id}
                    className="editorial-event"
                    key={e.id}
                  >
                    <time>
                      <strong>{new Date(e.date).getDate()}</strong>
                      {new Date(e.date).toLocaleDateString("en", {
                        month: "short",
                      })}
                    </time>
                    <div>
                      <h3>{e.title}</h3>
                      <p>{e.location}</p>
                      <small>
                        {c("Registration open", "दर्ता खुला")} ·{" "}
                        {e.price ? "NPR " + e.price : c("Free", "निःशुल्क")}
                      </small>
                    </div>
                    <ArrowUpRight />
                  </Link>
                ))}
              <Link className="agm-strip" href="/agm">
                <span>AGM</span>
                <strong>{data.settings.agmTitle}</strong>
                <ArrowUpRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      )}
      {sections.includes("resources") && (
        <section className="resource-editorial" data-home-section="resources">
          <div>
            <BookOpen size={38} />
            <span className="eyebrow">{t("Energy Resource Centre")}</span>
            <h2>
              {heading(
                "resources",
                "Knowledge for what comes next.",
                "आगामी दिनका लागि ज्ञान।",
              )}
            </h2>
            <p>
              {c(
                "Policies, reference guides and research for a better-informed energy community.",
                "सचेत ऊर्जा समुदायका लागि नीति, सन्दर्भ सामग्री र अनुसन्धान।",
              )}
            </p>
            <Link href="/resources" className="button white">
              {c("Explore resource centre", "ऊर्जा स्रोत केन्द्र")}
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <div>
            {resources.slice(0, 4).map((r) => (
              <Link key={r.id} href={"/resources/" + r.id}>
                <FileText size={22} />
                <div>
                  <small>
                    {r.category} · {date(r.date)}
                  </small>
                  <h3>{c(r.title, r.titleNe || "")}</h3>
                </div>
                <ArrowUpRight size={19} />
              </Link>
            ))}
            <p className="source-note">
              {c(
                "Sample reference editions; not verified legislation.",
                "नमुना सन्दर्भ संस्करण; प्रमाणित कानून होइन।",
              )}
            </p>
          </div>
        </section>
      )}
      {sections.includes("publications") && (
        <section className="section-wrap" data-home-section="publications">
          <SectionHead
            section="publications"
            tag={c("FEATURED PUBLICATIONS", "विशेष प्रकाशन")}
            title={c(
              "Perspectives worth keeping.",
              "संग्रह गर्न योग्य दृष्टिकोण।",
            )}
            href="/publications"
            label={c("Visit the library", "पुस्तकालय हेर्नुहोस्")}
          />
          <div className="publication-shelf">
            {pubs.slice(0, 3).map((p) => (
              <article key={p.id}>
                <Link href={"/publications/" + p.id}>
                  <img src={editorialImage(p, data.media)} alt={p.title} />
                </Link>
                <div>
                  <span className="eyebrow">
                    {p.category} · {date(p.date)}
                  </span>
                  <h3>{c(p.title, p.titleNe || "")}</h3>
                  <p>{c(p.description, p.descriptionNe || "")}</p>
                  <Link className="text-link" href={"/publications/" + p.id}>
                    {t("Read online")} →
                  </Link>
                  <DocumentLink id={p.id} label={t("Download")} />
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
      {sections.includes("media") && (
        <section className="section-wrap" data-home-section="media">
          <SectionHead
            section="media"
            tag={c(
              "INSTITUTIONAL ACTIVITIES & MEDIA",
              "संस्थागत गतिविधि र मिडिया",
            )}
            title={c(
              "The people behind the progress.",
              "प्रगतिपछाडिका मानिसहरू।",
            )}
            href="/media"
            label={c("Explore the gallery", "तस्बिर संग्रह हेर्नुहोस्")}
          />
          <MediaGallery preview />
        </section>
      )}
    </>
  );
}
export function MediaGallery({ preview = false }: { preview?: boolean }) {
  const { data } = usePlatform();
  const [filter, setFilter] = useState("All"),
    [selected, setSelected] = useState("");
  const items = (data.media || []).filter(
    (m) => m.status === "Published" && (filter === "All" || m.type === filter),
  );
  return (
    <>
      {!preview && (
        <div className="tabs">
          {["All", "Photo", "Video"].map((f) => (
            <button
              key={f}
              className={filter === f ? "active" : ""}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      )}
      <div className="media-grid">
        {items.slice(0, preview ? 3 : 30).map((m) => (
          <article key={m.id}>
            {m.type === "Photo" ? (
              <button
                onClick={() => setSelected(selected === m.id ? "" : m.id)}
                aria-expanded={selected === m.id}
              >
                <img
                  className={selected === m.id ? "expanded-photo" : ""}
                  src={m.url}
                  alt={m.caption || m.title}
                />
              </button>
            ) : (
              <a
                href={m.url}
                target="_blank"
                rel="noreferrer"
                className="video-link"
              >
                <Play size={35} />
                <span>Watch video ↗</span>
              </a>
            )}
            <span className="eyebrow">
              {m.type} · {date(m.date)}
            </span>
            <h3>{m.title}</h3>
            <p>{m.caption}</p>
          </article>
        ))}
      </div>
      {!items.length && <Empty text="No published media in this category." />}
    </>
  );
}
export function InstitutionalAbout() {
  const { data } = usePlatform();
  const { choose: c } = useLanguage();
  const p = data.sitePages?.find((p) => p.slug === "our-purpose");
  return (
    <>
      <PageIntro
        eyebrow={c("ABOUT IPPAN", "इप्पानबारे")}
        title={c(
          "One voice for a stronger energy future.",
          "सुदृढ ऊर्जा भविष्यका लागि साझा आवाज।",
        )}
        description={c(
          "Independent Power Producers’ Association, Nepal · established 2001",
          "स्वतन्त्र ऊर्जा उत्पादकहरूको संस्था, नेपाल · स्थापना २००१",
        )}
      />
      <section className="section-wrap">
        <div className="about-editorial">
          <img
            src="/ippan/hydropower.jpg"
            alt="Hydropower and Nepal’s river landscape"
          />
          <div>
            <span className="eyebrow">
              {c("OUR PURPOSE", "हाम्रो उद्देश्य")}
            </span>
            <h2>{p ? c(p.title, p.titleNe) : "IPPAN"}</h2>
            {p &&
              c(p.body, p.bodyNe)
                .split("\n\n")
                .map((v, i) => <p key={i}>{v}</p>)}
          </div>
        </div>
        {["Executive committee", "Secretariat"].map((group) => (
          <section className="leadership-section" key={group}>
            <SectionHead
              tag={c("LEADERSHIP & SERVICE", "नेतृत्व र सेवा")}
              title={c(
                group,
                group === "Secretariat" ? "सचिवालय" : "कार्यसमिति",
              )}
            />
            {data.profiles?.some(
              (p) => p.group === group && p.status === "Published",
            ) ? (
              <div className="leadership-grid">
                {data.profiles
                  .filter((p) => p.group === group && p.status === "Published")
                  .sort((a, b) => a.order - b.order)
                  .map((p) => (
                    <article key={p.id}>
                      <div className="profile-monogram">
                        {p.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <h3>{p.name}</h3>
                      <strong>{p.position}</strong>
                      <p>{p.bio}</p>
                    </article>
                  ))}
              </div>
            ) : (
              <div className="institutional-empty">
                <Users />
                <p>
                  {c(
                    "Approved leadership profiles have not been supplied. The secretariat can publish verified names and responsibilities through Website CMS.",
                    "स्वीकृत नेतृत्व विवरण उपलब्ध छैन। सचिवालयले प्रमाणित विवरण प्रकाशित गर्न सक्छ।",
                  )}
                </p>
              </div>
            )}
          </section>
        ))}
        <section className="organization-chart">
          <h2>{c("How we work together", "हामी कसरी सँगै काम गर्छौँ")}</h2>
          <div>
            <span>General membership</span>
            <span>Executive committee</span>
            <span>Secretariat & specialist committees</span>
            <span>Membership · Policy · Finance · Events</span>
          </div>
          <small>
            Institutional overview · confirm the formal organization chart with
            IPPAN.
          </small>
        </section>
        <Panel title={c("Institutional documents", "संस्थागत कागजात")}>
          <Link href="/publications">
            {c(
              "Annual reports, publications and institutional resources",
              "वार्षिक प्रतिवेदन, प्रकाशन र संस्थागत स्रोत",
            )}{" "}
            →
          </Link>
        </Panel>
      </section>
    </>
  );
}
export function PublicSearch() {
  const { data } = usePlatform();
  const [q, setQ] = useState("");
  const results = [
    ...data.news.map((n) => ({
      title: n.title,
      type: "News",
      url: "/news/" + n.id,
    })),
    ...data.projects.map((p) => ({
      title: p.name,
      type: "Project",
      url: "/hydropower/" + p.id,
    })),
    ...data.members
      .filter((m) => m.visible)
      .map((m) => ({ title: m.name, type: "Member", url: "/members/" + m.id })),
    ...data.publications.map((p) => ({
      title: p.title,
      type: "Publication",
      url: "/publications/" + p.id,
    })),
    ...data.resources.map((p) => ({
      title: p.title,
      type: "Resource",
      url: "/resources/" + p.id,
    })),
    ...(data.sitePages || []).map((p) => ({
      title: p.title,
      type: "Page",
      url: "/pages/" + p.slug,
    })),
  ].filter(
    (r) => q.length > 1 && r.title.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <PageIntro
        eyebrow="IPPAN SEARCH"
        title="Find your next connection."
        description="Search published projects, members, news, documents and institutional pages."
      />
      <section className="section-wrap">
        <label className="public-search">
          <Search />
          <input
            aria-label="Search public website"
            placeholder="Search IPPAN…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        {q.length > 1 && (
          <p className="results-label">{results.length} results</p>
        )}
        {results.map((r) => (
          <Link className="queue-row" key={r.url} href={r.url}>
            <div>
              <Badge>{r.type}</Badge>
              <h3>{r.title}</h3>
            </div>
            <ArrowUpRight />
          </Link>
        ))}
        {q.length > 1 && !results.length && <Empty />}
      </section>
    </>
  );
}
export function InstitutionalPage({ slug }: { slug: string }) {
  const { data } = usePlatform();
  const { choose: c } = useLanguage();
  const p = data.sitePages?.find((p) => p.slug === slug);
  if (!p) return <Empty text="Page unavailable." />;
  return (
    <>
      <PageIntro
        eyebrow="IPPAN"
        title={c(p.title, p.titleNe)}
        description={p.seoDescription}
      />
      <article className="institutional-prose section-wrap">
        <EditorialBody body={c(p.body, p.bodyNe)} />
      </article>
    </>
  );
}
export function PublicAgm() {
  const { data } = usePlatform();
  return (
    <>
      <PageIntro
        eyebrow="ANNUAL GENERAL MEETING"
        title={data.settings.agmTitle}
        description={`Demonstration programme · ${date(data.settings.agmDate)}`}
      />
      <section className="section-wrap profile-details">
        <Panel title="Agenda">
          {data.settings.agmAgenda?.split("\n").map((line, i) => (
            <p className="agm-agenda-line" key={i}>
              {i + 1}. {line}
            </p>
          ))}
        </Panel>
        <Panel title="Member participation">
          <p>
            Active members with current validity can register for published
            events, submit a representative proxy and participate in scheduled
            demonstration ballots through their member portal.
          </p>
          <div className="dataset-note">
            Voting rules: one vote per active membership; server-enforced
            opening and closing windows. Proxy approval is recorded separately
            and does not permit a second vote.
          </div>
          <Link href="/portal/agm" className="button primary">
            Open AGM member workspace →
          </Link>
          <p className="source-note">
            Demonstration only. This is not a validated production election
            system or a claim of ballot secrecy or legal compliance.
          </p>
        </Panel>
      </section>
    </>
  );
}
export function Newsletter() {
  const { act } = usePlatform();
  const [saved, setSaved] = useState("");
  return (
    <div className="newsletter">
      <h4>Stay connected</h4>
      {saved ? (
        <p role="status">{saved}</p>
      ) : (
        <Form
          label="Subscribe"
          onSubmit={async (d) => {
            const r = await act("subscribe", d);
            setSaved(r.message);
          }}
        >
          <Field name="email" label="Newsletter email" type="email" />
          <label className="checkbox-row">
            <input type="checkbox" required /> Save my preference for IPPAN
            updates.
          </label>
        </Form>
      )}
      <small>
        Demonstration preference register. No external email delivery.
      </small>
    </div>
  );
}
export function ContactForm() {
  const { act } = usePlatform();
  const [done, setDone] = useState("");
  return (
    <Panel title="Write to the secretariat">
      {done ? (
        <div role="status">
          <CheckCircle2 />
          <p>{done}</p>
        </div>
      ) : (
        <Form
          label="Send inquiry"
          onSubmit={async (d) => {
            const r = await act("inquiry", d);
            setDone(r.message);
          }}
        >
          <div className="form-grid">
            <Field name="name" label="Name" />
            <Field name="email" label="Email" type="email" />
          </div>
          <Field name="subject" label="Subject" />
          <Field name="message" label="Message" type="textarea" />
          <small>
            Your message is saved for staff review. Email/SMS delivery is not
            configured.
          </small>
        </Form>
      )}
    </Panel>
  );
}
