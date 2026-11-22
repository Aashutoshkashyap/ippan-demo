# IPPAN Integrated Digital Platform — evaluation demo

Next.js 16, React, TypeScript, Tailwind CSS, Next.js REST APIs, PostgreSQL on **a dedicated IPPAN Neon project**, role-based sessions and interactive Recharts graphs. No native mobile application or external payment/email/SMS/push integrations are included, as requested.

## Run locally

Requires Node.js 24 and npm 10+.

```sh
npm ci --ignore-scripts
# Configure .env.local using .env.example with a dedicated IPPAN Neon connection.
npm run db:migrate
npm run dev
```

This workspace is already configured with the dedicated IPPAN Neon project selected in the browser. Credentials are in ignored `.env.local`, never in source control. No MeroTalent database was used. The migration only creates `ippan_demo.platform_state`; demo entities share a transactional JSONB aggregate so application approvals, sessions, fees, events and voting transitions are atomic. Entity normalization and a least-privilege runtime database role are production follow-ups.

If no `.env.local` exists, `predev` generates a local-only evaluation configuration and random demo password. Local file mode is explicitly labelled and refuses to run in production; a configured Neon failure never falls back to a local file.

Open `http://localhost:3000`. The active app includes:

- `/`: public website, with about, member directory, news, events, publications, resources and a sample hydropower database.
- `/membership`, `/track`: PDF-backed applications, private status tracking and corrected-document resubmission.
- `/login`: secure session sign-in.
- `/admin`: administrative overview and twelve role-controlled modules.
- `/portal`: membership card, profile, certificate, renewal invoices, simulated payments, events, resources and AGM/proxy workflow.

## Evaluation accounts

Run `npm run demo:accounts` **locally** to display the generated demo password. Do not paste it into an issue, commit or public document.

| Role | Email |
| --- | --- |
| Super Administrator | admin@ippan.demo |
| Secretariat Administrator | secretariat@ippan.demo |
| Membership Officer | membership@ippan.demo |
| Finance Officer | finance@ippan.demo |
| Content Editor | content@ippan.demo |
| Event Administrator | event@ippan.demo |
| Member | member@ippan.demo |

Seed accounts use the initial demo password; changing the environment variable later does not reset stored password hashes. Public applicants choose their own password. Approval links that same applicant account to its new membership record. Passwords are scrypt-hashed; session tokens are random, stored as hashes, and sent in HTTP-only SameSite cookies. Role/password changes revoke existing sessions. A process-local sign-in limiter is included; distributed limiting, recovery and MFA remain production work.

## Demonstrate connected workflows

1. Submit a membership application with a sample company-registration PDF. Save its private reference and tracking key. Sign in as an administrator, review the uploaded document, request corrections or approve it. The applicant can track the history, then sign in to the portal after approval.
2. From the member portal, create a renewal invoice and choose a simulated successful or failed payment. A successful renewal extends validity once, produces a PDF receipt and enters the finance reconciliation queue.
3. Create and publish news as an administrator. A Content Editor can save drafts or submit for review, but cannot publish. The public news page reflects the same stored record.
4. Create/publish an event, register, generate a QR PDF entry pass, and check in the participant from administration.
5. Submit a member proxy, approve it, create/open a timed demonstration ballot, vote once per active membership, close voting and export the results.
6. Register incoming/outgoing correspondence, assign meeting decisions as dated tasks and update their progress.

Uploaded PDFs are validated by byte signature and size, stored privately inside the isolated demo aggregate, and served through authorization-aware routes. This is bounded demo storage, not a replacement for production document storage or malware scanning. Library entries support an uploaded PDF or a generated demo edition. The reader is a browser PDF viewer; a page-turn flipbook is not implemented.

## Verification

```sh
npm run typecheck
npm run test
npm run build
# With the local server running against the dedicated demo Neon database:
npm run test:integration
```

The integration suite writes clearly named QA sample records to the dedicated demo database. It tests authentication, private data filtering, application/upload/approval, certificates, renewal replay protection, receipts, reconciliation, publishing, events, proxy/voting, correspondence, tasks, RBAC and audit records. It calls no external payment or messaging services. Run only against an evaluation environment, never production.

The [audit](docs/ippan/AUDIT.md), [TOR coverage matrix](docs/ippan/COVERAGE.md), and [verification report](docs/ippan/VERIFICATION.md) document implementation and remaining gaps. Browser screenshots are saved locally in ignored `output/playwright/`.

## Deployment

`npm run build && npm start` runs the production Next.js build. Dockerfile uses Next.js standalone output. Set `IPPAN_DATABASE_URL`, `IPPAN_DEMO_PASSWORD`, `IPPAN_LOCAL_DEMO=0`, and `IPPAN_SITE_URL` as private runtime variables. Apply the migration separately against the dedicated IPPAN database before first launch. CI checks the IPPAN branch without accessing the original application’s services. The current demo is deployed at https://ippan-demo.vercel.app/ through Vercel’s browser folder-upload workflow. No Git push was performed. See `docs/ippan/DEPLOYMENT.md` for the verified deployment and environment configuration.

Preserve Neon project backups and use a tested `pg_dump`/restore procedure before significant data changes. Production work includes entity normalization, dedicated database permissions, restore testing, persistent rate limits, credential recovery, document scanning, a CSP nonce strategy and independently validated election rules. This build makes no claim of production election readiness, legal compliance or ballot secrecy.

## Reference fidelity and source preservation

The public site adapts IPPAN identity/content, the Global College photographic-hero pattern, and the two attached public-page layout references. Administration adapts the dark navy sidebar, operational panels and chart composition of the three supplied dashboard references. These conflicting references are **not reproduced pixel-for-pixel**. The app uses functional components and real demo workflows, not screenshot backgrounds.

The original Next.js routes/config and original dependency manifests are preserved in `legacy/merotalent/`; existing `src` code and original migrations are retained for future selective reuse. They are excluded from active routing, compilation and the IPPAN test suite. The active IPPAN app does not call MeroTalent or Supabase.


## Repository and existing hosting

Source: [Aashutoshkashyap/ippan-demo](https://github.com/Aashutoshkashyap/ippan-demo), branch `main`. This repository is connected to the existing [IPPAN Vercel project](https://vercel.com/aashutoshkashyaps-projects/ippan-demo), serving [ippan-demo.vercel.app](https://ippan-demo.vercel.app/).

Automatic Git deployments are disabled in `vercel.json` to preserve the current production deployment. Pushing code runs GitHub verification, without deploying the website. See [deployment records](docs/ippan/DEPLOYMENT.md) before a separately authorized release.


## Institutional platform update

The [22 November release](docs/ippan/RELEASE-2026-11-22.md) adds the prescribed homepage hierarchy, bilingual institutional pages, shared hydropower analytics/map/filtering, page/media/leadership CMS, configurable membership categories, private meeting and correspondence documents, ticket categories, operational reports, audit/settings pages and Excel imports. All use the existing dedicated IPPAN data and authorization model. See the release notes for verified workflows and remaining institutional-data dependencies.
