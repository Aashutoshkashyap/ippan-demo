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
};
export type Viewer = Omit<User, "passwordHash">;
export type Member = {
  id: string;
  name: string;
  category: "Corporate" | "Associate";
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
  category: "Corporate" | "Associate";
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
  status: "Operational" | "Under construction" | "Survey";
  lat: number;
  lng: number;
  licence: string;
  cod: string;
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
    date: string;
  }[];
  settings: {
    heroTitle: string;
    heroSubtitle: string;
    agmTitle: string;
    agmDate: string;
  };
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
  ["members", "Members & applications", "Users"],
  ["finance", "Payments & finance", "Wallet"],
  ["content", "Website & content", "PanelsTopLeft"],
  ["events", "Events & registrations", "CalendarDays"],
  ["projects", "Hydropower database", "Zap"],
  ["resources", "Publications & resources", "BookOpen"],
  ["agm", "AGM & digital voting", "Vote"],
  ["secretariat", "Digital secretariat", "Files"],
  ["communications", "Communications", "MessagesSquare"],
  ["reports", "Reports & analytics", "ChartNoAxesCombined"],
  ["users", "Users & access", "ShieldCheck"],
] as const;
export function can(role: Role, area: string) {
  if (role === "Super Administrator") return true;
  const map: Record<string, string[]> = {
    overview: roles.filter((r) => r !== "Member"),
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
