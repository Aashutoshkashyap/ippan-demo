# Original TOR-to-demo coverage matrix

> Historical baseline from 21 November. Several pending UI/CMS items below are superseded by the [22 November implementation release](RELEASE-2026-11-22.md). Retained as provenance, not the current completion report.

Status meanings: **Implemented and verified** = automated or browser evidence recorded; **Implemented but not fully verified** = code/interface exists without complete scenario coverage; **Demonstration/simulated** = deliberately illustrative behavior; **Pending** = not implemented; **Blocked by external dependency** = needs approved content, services or an external decision. Direct user exclusions take precedence over the pasted brief: mobile applications and external integrations are out of this build.

| TOR requirement | Status | Implementation, evidence or remaining boundary |
| --- | --- | --- |
| Repository audit, reuse inventory, isolated branch | Implemented and verified | `AUDIT.md`; `ippan-demo`; original routes/config/manifests preserved in `legacy/merotalent/`. |
| Next.js / React / TypeScript / Tailwind | Implemented and verified | Active App Router, Node REST handlers, shared TypeScript contracts, production build. |
| Neon PostgreSQL persistence | Implemented and verified | Dedicated IPPAN project selected in new account; isolated schema migration applied; live HTTP checks. No original MeroTalent database used. |
| Public website and IPPAN visual identity | Implemented and verified | Browser desktop and 390px mobile review; actual interactive components with local IPPAN reference imagery. |
| Pixel-identical 1:1 copies of all attached references | Pending | Not achieved. References depict different designs; IPPAN implementation combines their patterns and changes content/branding, spacing and composition. |
| Homepage hero, introduction, statistics, news, events, publications and CTAs | Implemented and verified | Public pages render from the shared records; member/project counts are illustrative and computed. |
| Institutional introduction, vision, mission and objectives | Implemented but not fully verified | `/about`; institutional copy adapted for the demo. |
| Executive/secretariat individual profiles and full organization chart | Blocked by external dependency | Approved profile data and imagery not supplied. No fabricated officer identities. Management interfaces remain pending. |
| Contact and inquiry information | Implemented but not fully verified | Contact page, phone/email links. No message sending integration. |
| Corporate/associate directory; company/project detail pages | Implemented and verified | Shared membership/project data; visibility control; searchable public directory. |
| Directory filters: name, location, membership category and minimum capacity | Implemented but not fully verified | Client filters implemented; exact combination coverage remains manual. Project-status directory filter is pending. |
| News/notice listing, detail and categories | Implemented and verified | CMS draft/publish changes reflected in public API; browser CMS draft creation. |
| Featured/priority content, date, short description and source | Implemented but not fully verified | Featured flag/category/date/description supported. Dedicated media-source organization/reference editor remains pending. |
| Upcoming/past events and event detail | Implemented but not fully verified | Published event records, browser navigation and shared event data. |
| Event creation/editing/publishing | Implemented and verified | Validated admin create/publish API verified; edit uses same records and is not fully exercised. |
| Free/paid registration and confirmation | Demonstration/simulated | Persisted participant data; paid tickets require explicit simulated payment. No real financial transaction. |
| QR ticket generation and attendance | Implemented and verified | Real QR-bearing PDFs and attendance action verified over HTTP. Guest visitors receive a reference; staff issue their pass. |
| Event invoices, receipts, participant reports and certificates | Implemented but not fully verified | Participant CSV export and paid status recorded. Standalone event tax invoice/receipt and participation certificate generator are pending. |
| Publications/library categories, search, detail, PDF reader/download | Implemented but not fully verified | Generated demonstration PDFs and optional uploaded PDFs; native browser PDF reader. Upload privacy covered by unit tests; full browser upload/reader journey not yet complete. |
| Page-turn flipbook and publication view/download analytics | Pending | No flipbook package or read/download counters. |
| Energy resource centre with public/member access | Implemented and verified | Shared categorized resources; active membership required for private document access; public snapshots redact private entries. |
| Official acts, regulations, EIA/IEE and policy documents | Blocked by external dependency | Sample reference guides only; approved authoritative documents must be supplied. No claim of legal accuracy. |
| Hydropower fields and project detail | Demonstration/simulated | Province, district, municipality, coordinates, river, capacity, status, licence and operation plan are sample records. |
| Hydropower project administration | Implemented but not fully verified | Validated add/edit API and UI; public table and project detail reflect same collection. |
| Interactive capacity/province charts and summaries | Implemented and verified | Recharts area/bar/donut charts; browser period/metric controls tested. |
| Geographic project map | Demonstration/simulated | Clickable coordinate-positioned schematic markers. Geographic basemap, boundaries and official spatial validation remain pending. |
| CSV import and report exports | Implemented but not fully verified | Entire batch validated before atomic import. CSV formula injection mitigated on export. No `.xlsx` parser; simple unquoted CSV only. |
| Dashboard membership, applications, payments, events and activity | Implemented and verified | Computed from shared demo records; role-filtered snapshots. |
| Homepage text, draft/review/publish/archive and public content synchronization | Implemented and verified | Shared CMS records; editor cannot publish; browser draft creation and HTTP publish checks. |
| Full page/banners/navigation/gallery/committee CMS | Pending | Hero text settings and content modules exist; arbitrary page layout, menu and gallery editors are not included. |
| Membership application, supporting PDFs, unique reference and private tracking | Implemented and verified | Live Neon scenario and private upload review verified. |
| Review approval/rejection/correction states and history | Implemented and verified | Role-controlled atomic transitions; correction resubmission and tracking-key checks unit tested. |
| Activation, portal account, directory visibility and notification records | Implemented and verified | Approval activates one member linked to the same applicant account; saved notification. Visibility toggle implemented. |
| Validity, expiry, renewal invoices and fees | Implemented and verified | Corporate/associate fees; pending invoice reuse; simulated successful renewal extends once. |
| Automated renewal reminder delivery | Pending | No scheduler or real email/SMS; notifications and expiry are visible in the portal. |
| Membership PDF certificate, invoice and receipt | Implemented and verified | Real server-generated PDFs with sample/demo labels; authorization verified. |
| Payment Pending/Successful/Failed/Reversed states | Demonstration/simulated | All state changes are local demo records. Renewal replay/reversal behavior covered by tests. |
| Finance reconciliation and manual approval controls | Implemented and verified | Successful demo payments reconcile; manual entries require a different Super Administrator and cannot be paid from the portal. |
| Payment gateways/eSewa/Khalti/connectIPS callbacks | Pending | Explicitly excluded by user. No merchant credentials, real payments or callback claims. |
| Segmented communication drafts and simulated history | Demonstration/simulated | Compose by membership/province segments; draft/simulated state. No actual recipient delivery or delivery-status claims. |
| Templates, scheduling, opt-in/out, capacity/status segmentation | Pending | Rich communications management and provider delivery excluded/not implemented. |
| AGM agenda display, active-member eligibility and CSV list | Demonstration/simulated | Sample AGM notice/agenda and eligibility computed from active validity. Full AGM creation/registration management remains pending. |
| Proxy submission, approval and eligibility representation | Implemented and verified | Member submission, administrative approval, eligibility export. |
| Controlled ballot creation, windows, one membership/one vote | Implemented and verified | Admin-controlled opening/closing, server-side eligibility, duplicate prevention and transactional writes. |
| Voting confirmation, audit, closed result export | Implemented and verified | HTTP scenario verifies casting/duplicate rejection/closing; audit and export interfaces available. |
| Secret ballot/legal compliance/production election security | Pending | Deliberately not claimed; votes retain membership identity for audit demonstration. Requires approved rules and independent security validation. |
| Darta–Chalani incoming/outgoing, references, assignment and status | Implemented and verified | Persisted registers, unique references, search/export/print interfaces. Core create and follow-up tests. |
| Correspondence attachments, sequential fiscal numbering and expanded fields | Pending | Unique DAR/CHA identifiers exist; full institutional numbering rules, letter uploads and department metadata need extension. |
| Meeting decisions, task assignment, due dates and progress | Implemented and verified | Decision/task register with assigned staff, due dates and completion status. |
| Full meeting agendas, circulation, minutes, attendance and reminders | Pending | Tasks reference a meeting; full meeting administration is not implemented. |
| Seven roles and server-side permission enforcement | Implemented and verified | Admin, secretariat, membership, finance, editor, events and member; unauthorized mutations/private data tested. |
| User role changes, session revocation and audit | Implemented and verified | Role update invalidates stored sessions; sensitive operations append audit records. |
| Member dashboard/card/company/projects/status/certificate | Implemented but not fully verified | Portal UI and certificate verified through HTTP; complete mobile/desktop portal browser review still in verification report. |
| Member payment/renewal/event/resource/proxy workflows | Implemented and verified | Live HTTP scenarios share the same records as administration. |
| Member profile-update request and password change | Implemented but not fully verified | Request enters secretariat correspondence; password change hashes and revokes sessions. Recovery/MFA not included. |
| Application/renewal history and notifications | Implemented but not fully verified | Member application history and payment records; server-created notifications. No external messaging. |
| React Native/mobile application | Pending | Explicitly excluded by direct user request. Responsive web is not represented as a native app. |
| External email/SMS/push/other integrations | Pending | Explicitly excluded by user. No external service delivery. |
| Validation, parameterized SQL, password hashing, HTTP-only sessions | Implemented and verified | Zod 4, pg parameters, scrypt, opaque hashed sessions, origin validation, authorization-aware PDF routes. |
| Upload size/signature and private document access | Implemented and verified | PDF-only, 2 MB, private application attachments, no binary bytes in state snapshots. Malware scanning is pending. |
| Production hardening, recovery, distributed limiting, nonce CSP and least privilege | Pending | Demo controls are implemented; normalization, production security review and recovery operations remain. |
| Docker and CI | Implemented but not fully verified | Standalone Dockerfile and IPPAN-only GitHub Actions provided; Docker image/remote workflow not run. |
| Backups and recovery | Pending | Documented deployment considerations; no restore drill or configured IPPAN backup automation. |
| Public deployment | Implemented and verified | User-requested Vercel browser deployment is Ready at https://ippan-demo.vercel.app/; homepage, admin/member sign-in, charts and member access denial verified in browser. See `DEPLOYMENT.md`. |
