export type Role =
  | "Super Administrator"
  | "Secretariat Administrator"
  | "Membership Officer"
  | "Finance Officer"
  | "Content Editor"
  | "Event Administrator"
  | "Member";
export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  memberId?: string;
  passwordHash: string;
  preferences?: { email: boolean; sms: boolean };
};
export type Viewer = Omit<User, "passwordHash">;
export type Member = {
  id: string;
  name: string;
  category: "Corporate" | "Associate" | "Individual";
  province: string;
  district: string;
  status: "Active" | "Expired";
  capacity: number;
  expiry: string;
  joined: string;
  visible: boolean;
  email: string;
  contact: string;
  description: string;
};
export type Application = {
  id: string;
  name: string;
  email: string;
  category: "Corporate" | "Associate" | "Individual";
  province: string;
  district: string;
  capacity: number;
  status: "Pending" | "Correction requested" | "Approved" | "Rejected";
  created: string;
  trackingHash: string;
  history: { date: string; status: string; note: string }[];
  documents: { name: string; data: string }[];
  memberId?: string;
};
export type Project = {
  id: string;
  name: string;
  developer: string;
  memberId: string;
  province: string;
  district: string;
  municipality: string;
  capacity: number;
  river: string;
  status:
    | "Operational"
    | "Under construction"
    | "Construction not started"
    | "Survey";
  lat: number;
  lng: number;
  licence: string;
  cod: string;
  surveyLicence?: string;
  contact?: string;
};
export type Content = {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  body: string;
  status: "Draft" | "In review" | "Published" | "Archived";
  image: string;
  featured: boolean;
  access: "Public" | "Members";
  source?: string;
  pdf?: { name: string; data: string };
  titleNe?: string;
  descriptionNe?: string;
  bodyNe?: string;
  seoTitle?: string;
  seoDescription?: string;
};
export type Event = {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  price: number;
  status: "Draft" | "Published";
  image: string;
  ticketTypes?: { name: string; price: number; capacity: number }[];
};
export type Registration = {
  id: string;
  eventId: string;
  memberId?: string;
  name: string;
  email: string;
  created: string;
  attendance: boolean;
  amount: number;
  ticketType?: string;
  paymentStatus: "Free" | "Simulated successful";
};
export type Payment = {
  id: string;
  memberId: string;
  purpose: string;
  amount: number;
  status: "Pending" | "Simulated successful" | "Failed" | "Reversed";
  date: string;
  reconciled: boolean;
  renewal?: boolean;
  manual?: boolean;
  createdBy?: string;
  previousExpiry?: string;
  renewedExpiry?: string;
};
export type Correspondence = {
  id: string;
  direction: "Incoming" | "Outgoing";
  subject: string;
  sender: string;
  assignee: string;
  date: string;
  status: "Open" | "In progress" | "Completed";
  department?: string;
  received?: string;
  approval?: "Pending" | "Approved";
  dispatchReference?: string;
  attachments?: { name: string; data: string }[];
};
export type Task = {
  id: string;
  title: string;
  assignee: string;
  due: string;
  status: "Pending" | "Completed";
  meeting: string;
};
export type Proxy = {
  id: string;
  memberId: string;
  representative: string;
  status: "Pending" | "Approved" | "Rejected";
  date: string;
};
export type Ballot = {
  id: string;
  title: string;
  options: string[];
  opens: string;
  closes: string;
  status: "Draft" | "Open" | "Closed";
  votes: { memberId: string; option: string; date: string }[];
};
export type Audit = {
  id: string;
  date: string;
  actor: string;
  action: string;
  detail: string;
};
export type Notification = {
  id: string;
  memberId: string;
  title: string;
  date: string;
};
export type State = {
  version: number;
  users: User[];
  sessions: { hash: string; userId: string; expires: number }[];
  members: Member[];
  applications: Application[];
  projects: Project[];
  news: Content[];
  publications: Content[];
  resources: Content[];
  events: Event[];
  registrations: Registration[];
  payments: Payment[];
  correspondence: Correspondence[];
  tasks: Task[];
  proxies: Proxy[];
  ballots: Ballot[];
  audit: Audit[];
  notifications: Notification[];
  messages: {
    id: string;
    title: string;
    segment: string;
    status: "Draft" | "Simulated";
    body?: string;
    template?: string;
    plannedDate?: string;
    date: string;
  }[];
  settings: {
    heroTitle: string;
    heroSubtitle: string;
    agmTitle: string;
    agmDate: string;
    heroImage?: string;
    heroTitleNe?: string;
    heroSubtitleNe?: string;
    contactAddress?: string;
    contactEmail?: string;
    contactPhone?: string;
    agmAgenda?: string;
    sections?: string[];
  };
  sitePages?: SitePage[];
  profiles?: Profile[];
  media?: Media[];
  categories?: MembershipCategory[];
  meetings?: Meeting[];
  subscriptions?: { email: string; date: string }[];
  inquiries?: {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    date: string;
    status: "Open" | "Completed";
  }[];
};
export type SitePage = {
  id: string;
  slug: string;
  title: string;
  titleNe: string;
  body: string;
  bodyNe: string;
  status: "Draft" | "In review" | "Published" | "Archived";
  seoDescription: string;
  menuLabel: string;
  order: number;
};
export type Profile = {
  id: string;
  name: string;
  position: string;
  group: "Executive committee" | "Secretariat";
  bio: string;
  image: string;
  order: number;
  status: "Draft" | "Published";
};
export type Media = {
  id: string;
  title: string;
  caption: string;
  type: "Photo" | "Video";
  url: string;
  status: "Draft" | "Published";
  date: string;
};
export type MembershipCategory = {
  name: "Corporate" | "Associate" | "Individual";
  fee: number;
  description: string;
  documents: string;
  enabled: boolean;
};
export type Meeting = {
  id: string;
  title: string;
  committee: string;
  date: string;
  location: string;
  agenda: string;
  minutes: string;
  attendees: string[];
  status: "Scheduled" | "Completed";
  attachments: { name: string; data: string }[];
};
export type Snapshot = Omit<State, "users" | "sessions" | "applications"> & {
  applications: Omit<Application, "trackingHash" | "documents">[];
  users: Viewer[];
  viewer: Viewer | null;
  storage: "Neon PostgreSQL" | "Local demo file";
};
export const provinces = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
];
export const roles: Role[] = [
  "Super Administrator",
  "Secretariat Administrator",
  "Membership Officer",
  "Finance Officer",
  "Content Editor",
  "Event Administrator",
  "Member",
];
export const nav = [
  ["overview", "Overview", "LayoutDashboard"],
  ["website", "Website CMS", "PanelsTopLeft"],
  ["members", "Membership", "Users"],
  ["categories", "Categories & fees", "Tags"],
  ["renewals", "Renewals & expiry", "CalendarClock"],
  ["finance", "Payments & finance", "Wallet"],
  ["projects", "Hydropower database", "Zap"],
  ["events", "Events & registrations", "CalendarDays"],
  ["agm", "AGM & digital voting", "Vote"],
  ["resources", "Energy resource centre", "BookOpen"],
  ["content", "News & publications", "Newspaper"],
  ["secretariat", "Digital secretariat", "Files"],
  ["meetings", "Meetings & decisions", "ClipboardList"],
  ["communications", "Communications", "MessagesSquare"],
  ["reports", "Reports & analytics", "ChartNoAxesCombined"],
  ["users", "Users & access", "ShieldCheck"],
  ["audit", "Audit logs", "History"],
  ["settings", "System settings", "Settings"],
] as const;
export function can(role: Role, area: string) {
  if (role === "Super Administrator") return true;
  const map: Record<string, string[]> = {
    overview: roles.filter((r) => r !== "Member"),
    website: ["Content Editor", "Secretariat Administrator"],
    categories: ["Membership Officer", "Secretariat Administrator"],
    renewals: ["Membership Officer", "Secretariat Administrator"],
    meetings: ["Secretariat Administrator"],
    audit: ["Secretariat Administrator"],
    settings: [],
    members: ["Membership Officer", "Secretariat Administrator"],
    finance: ["Finance Officer", "Secretariat Administrator"],
    content: ["Content Editor", "Secretariat Administrator"],
    events: ["Event Administrator", "Secretariat Administrator"],
    projects: ["Secretariat Administrator"],
    resources: ["Content Editor", "Secretariat Administrator"],
    agm: ["Event Administrator", "Secretariat Administrator"],
    secretariat: ["Secretariat Administrator"],
    communications: ["Secretariat Administrator"],
    reports: ["Finance Officer", "Secretariat Administrator"],
    users: [],
  };
  return (map[area] || []).includes(role);
}
