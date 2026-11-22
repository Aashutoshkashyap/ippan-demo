import { randomBytes, scryptSync } from "node:crypto";
import { State, provinces, roles, Content } from "../model";
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + scryptSync(password, salt, 64).toString("hex");
}
export function seed(): State {
  const password = process.env.IPPAN_DEMO_PASSWORD;
  if (!password || password.length < 12)
    throw new Error("Set IPPAN_DEMO_PASSWORD with at least 12 characters.");
  const names = [
    "Himalayan River Energy Ltd.",
    "Trishuli Green Power Ltd.",
    "Koshi Hydropower Company",
    "Annapurna Renewable Energy",
    "Seti Valley Power Ltd.",
    "Bheri Energy Development",
    "Arun Cascade Energy Ltd.",
    "Gandaki Hydro Ventures",
    "Sunrise Power Developers",
    "Karnali Clean Energy",
    "Everest Engineering Services",
    "Nepal Energy Advisory",
  ];
  const members: State["members"] = names.map((name, i) => ({
    id: "M" + String(i + 1).padStart(3, "0"),
    name,
    category: i > 9 ? "Associate" : "Corporate",
    province: provinces[i % 7],
    district: [
      "Taplejung",
      "Dhanusha",
      "Rasuwa",
      "Kaski",
      "Palpa",
      "Surkhet",
      "Darchula",
    ][i % 7],
    status: i === 4 || i === 8 ? "Expired" : "Active",
    capacity: i > 9 ? 0 : [42, 24.5, 86, 54, 25, 38, 110, 32, 18, 65][i],
    expiry: i === 4 || i === 8 ? "2026-10-30" : "2027-11-20",
    joined: `202${3 + (i % 3)}-${String(1 + (i % 9)).padStart(2, "0")}-12`,
    visible: true,
    email: `member${i + 1}@ippan.demo`,
    contact: ["Aarav Sharma", "Sita Thapa", "Prakash Rai", "Anita Gurung"][
      i % 4
    ],
    description:
      "A sample independent energy company working toward a resilient and sustainable energy future for Nepal.",
  }));
  const make = (
    id: string,
    title: string,
    category: string,
    image: string,
    description: string,
    access: "Public" | "Members" = "Public",
  ): Content => ({
    id,
    title,
    category,
    image,
    description,
    body:
      description +
      "\n\nThis demonstration record illustrates how IPPAN can share sector knowledge, coordinate member participation and support responsible energy development. All figures and programme details in this demo are illustrative, not verified official records.\n\nContact the IPPAN secretariat for authoritative information and approved publications.",
    date: "2026-11-18",
    status: "Published",
    featured: true,
    access,
  });
  return {
    version: 1,
    users: roles.map((role, i) => ({
      id: "U" + (i + 1),
      name: i === 0 ? "Secretariat Admin" : i === 6 ? "Aarav Sharma" : role,
      email:
        i === 0
          ? "admin@ippan.demo"
          : i === 6
            ? "member@ippan.demo"
            : role.toLowerCase().split(" ")[0] + "@ippan.demo",
      role,
      passwordHash: hashPassword(password),
      ...(i === 6 ? { memberId: "M001" } : {}),
    })),
    sessions: [],
    members,
    applications: [
      {
        id: "APP-2026-001",
        name: "Dudhkoshi Energy Pvt. Ltd.",
        email: "applicant@ippan.demo",
        category: "Corporate",
        province: "Koshi",
        district: "Solukhumbu",
        capacity: 28,
        status: "Pending",
        created: "2026-11-20",
        trackingHash: "seed-no-public-tracking",
        history: [
          {
            date: "2026-11-20",
            status: "Pending",
            note: "Application received",
          },
        ],
        documents: [],
      },
    ],
    projects: members
      .filter((m) => m.category === "Corporate")
      .map((m, i) => ({
        id: "HP" + String(i + 1).padStart(3, "0"),
        name:
          [
            "Upper Tamor",
            "Trishuli Cascade",
            "Lower Arun",
            "Annapurna Khola",
            "Seti River",
            "Bheri Cascade",
            "Arun Valley",
            "Madi Khola",
            "Likhu Valley",
            "Karnali Tributary",
          ][i] + " Hydropower",
        developer: m.name,
        memberId: m.id,
        province: m.province,
        district: m.district,
        municipality: ["Phungling", "Bidur", "Khandbari", "Machhapuchchhre"][
          i % 4
        ],
        capacity: m.capacity,
        river: [
          "Tamor",
          "Trishuli",
          "Arun",
          "Madi",
          "Seti",
          "Bheri",
          "Arun",
          "Madi",
          "Likhu",
          "Karnali",
        ][i],
        status:
          i % 4 === 0
            ? "Under construction"
            : i % 4 === 3
              ? "Survey"
              : "Operational",
        lat: 26.9 + (i % 4) * 0.6,
        lng: 80.5 + i * 0.72,
        licence: "DEMO-GEN-" + String(i + 1).padStart(4, "0"),
        cod: i % 4 === 0 || i % 4 === 3 ? "Planned 2028" : "2024-07-15",
      })),
    news: [
      make(
        "N001",
        "Building a stronger future for Nepal’s independent power producers",
        "Sector update",
        "/ippan/assembly.jpg",
        "A shared commitment to investment, resilient infrastructure and the next chapter of Nepal’s energy sector.",
      ),
      make(
        "N002",
        "Himalayan Hydro Expo: connecting ideas, powering possibilities",
        "Events",
        "/ippan/expo.jpg",
        "Explore emerging hydropower technologies and meaningful partnerships across the energy community.",
      ),
      make(
        "N003",
        "A collective voice for responsible hydropower development",
        "Policy & advocacy",
        "/ippan/hydropower.jpg",
        "Private-sector perspectives on a reliable, inclusive and sustainable electricity landscape.",
      ),
    ],
    publications: [
      make(
        "PUB001",
        "Urja Samriddhi • Annual edition",
        "Annual report",
        "/ippan/publication.jpg",
        "Perspectives, progress and possibilities from Nepal’s energy community.",
      ),
      make(
        "PUB002",
        "Nepal Energy Outlook 2026",
        "Research paper",
        "/ippan/hydropower.jpg",
        "A demonstration energy-sector briefing with sample capacity and project summaries.",
      ),
      make(
        "PUB003",
        "Member newsletter • November",
        "Newsletter",
        "/ippan/assembly.jpg",
        "A digest of institutional activities, upcoming events and member opportunities.",
      ),
    ],
    resources: [
      make(
        "R001",
        "Hydropower development: policy reference guide",
        "Policies",
        "/ippan/hydropower.jpg",
        "A demonstration overview of energy policy topics. Consult official government texts for authoritative requirements.",
      ),
      make(
        "R002",
        "Environmental assessment resource guide",
        "EIA / IEE",
        "/ippan/hydropower.jpg",
        "An illustrative index of environmental impact assessment topics for project teams.",
      ),
      make(
        "R003",
        "Member briefing: project development priorities",
        "Member briefing",
        "/ippan/assembly.jpg",
        "Internal demonstration briefing for active IPPAN members.",
        "Members",
      ),
    ],
    events: [
      {
        id: "EV001",
        title: "Nepal Energy Investment Forum",
        date: "2026-12-12T10:00",
        location: "Kathmandu, Nepal",
        description:
          "Bringing developers, policymakers and investors together to discuss the opportunities shaping Nepal’s energy future.",
        price: 2500,
        status: "Published",
        image: "/ippan/assembly.jpg",
      },
      {
        id: "EV002",
        title: "Hydropower Knowledge Exchange",
        date: "2026-12-20T11:00",
        location: "IPPAN Secretariat, Lalitpur",
        description:
          "A member conversation on project resilience, technical innovation and shared learning.",
        price: 0,
        status: "Published",
        image: "/ippan/hydropower.jpg",
      },
      {
        id: "EV003",
        title: "Himalayan Green Energy Expo",
        date: "2027-01-17T09:00",
        location: "Bhrikutimandap, Kathmandu",
        description:
          "A demonstration event listing inspired by Nepal’s energy exhibition community.",
        price: 0,
        status: "Published",
        image: "/ippan/expo.jpg",
      },
    ],
    registrations: members.slice(0, 5).map((m, i) => ({
      id: "REG-00" + (i + 1),
      eventId: i % 2 ? "EV002" : "EV001",
      memberId: m.id,
      name: m.contact,
      email: m.email,
      created: "2026-11-19",
      attendance: false,
      amount: i % 2 ? 0 : 2500,
      paymentStatus: i % 2 ? "Free" : "Simulated successful",
    })),
    payments: members.slice(0, 9).map((m, i) => ({
      id: "PAY-2026-00" + (i + 1),
      memberId: m.id,
      purpose: "Annual membership fee",
      amount: m.category === "Corporate" ? 25000 : 10000,
      status:
        i === 2 || i === 4
          ? "Pending"
          : i === 6
            ? "Failed"
            : "Simulated successful",
      date: `2026-${String(6 + (i % 6)).padStart(2, "0")}-${String(5 + i).padStart(2, "0")}`,
      reconciled: i < 2,
    })),
    correspondence: [
      {
        id: "DAR-2026-001",
        direction: "Incoming",
        subject: "Consultation on transmission infrastructure",
        sender: "Energy Coordination Office (demo)",
        assignee: "Secretariat",
        date: "2026-11-20",
        status: "Open",
      },
      {
        id: "CHA-2026-001",
        direction: "Outgoing",
        subject: "Invitation to energy investment forum",
        sender: "IPPAN Secretariat",
        assignee: "Events team",
        date: "2026-11-19",
        status: "Completed",
      },
    ],
    tasks: [
      {
        id: "T001",
        title: "Prepare annual membership review",
        assignee: "Membership Officer",
        due: "2026-11-28",
        status: "Pending",
        meeting: "Secretariat coordination meeting",
      },
      {
        id: "T002",
        title: "Finalize investment forum agenda",
        assignee: "Events team",
        due: "2026-12-01",
        status: "Pending",
        meeting: "Events committee meeting",
      },
      {
        id: "T003",
        title: "Publish member resource briefing",
        assignee: "Content Editor",
        due: "2026-11-20",
        status: "Completed",
        meeting: "Editorial meeting",
      },
    ],
    proxies: [],
    ballots: [
      {
        id: "B001",
        title: "Demo resolution: approve the annual activity plan",
        options: ["In favour", "Against", "Abstain"],
        opens: "2026-11-01T00:00:00Z",
        closes: "2026-12-31T23:59:00Z",
        status: "Draft",
        votes: [],
      },
    ],
    audit: [
      {
        id: "A001",
        date: "2026-11-20T09:20:00Z",
        actor: "Secretariat Admin",
        action: "Content published",
        detail: "November member newsletter",
      },
      {
        id: "A002",
        date: "2026-11-20T08:45:00Z",
        actor: "Membership Officer",
        action: "Application received",
        detail: "Dudhkoshi Energy Pvt. Ltd.",
      },
      {
        id: "A003",
        date: "2026-11-19T14:30:00Z",
        actor: "Finance Officer",
        action: "Payment reconciled",
        detail: "Demonstration membership receipt",
      },
    ],
    notifications: [
      {
        id: "NOT001",
        memberId: "M001",
        title: "Welcome to your IPPAN member workspace.",
        date: "2026-11-20",
      },
    ],
    messages: [],
    settings: {
      heroTitle: "Powering Nepal.\nTogether.",
      heroSubtitle:
        "One collective voice. Limitless potential. Connecting independent power producers to build a brighter, sustainable future for Nepal.",
      agmTitle: "Annual General Meeting • Demonstration",
      agmDate: "2026-12-15",
    },
  };
}
