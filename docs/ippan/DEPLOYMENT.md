# IPPAN Vercel deployment

Verified on 21 November 2026 (Asia/Kathmandu).

- Live website: https://ippan-demo.vercel.app/
- Sign-in: https://ippan-demo.vercel.app/login
- Admin workspace: https://ippan-demo.vercel.app/admin
- Member portal: https://ippan-demo.vercel.app/portal
- Vercel project: https://vercel.com/aashutoshkashyaps-projects/ippan-demo
- Final deployment: https://vercel.com/aashutoshkashyaps-projects/ippan-demo/DqvG44kognTsBxBwZ3AeWWmDpaJe
- Deployment ID: `dpl_DqvG44kognTsBxBwZ3AeWWmDpaJe`
- Vercel status: **Ready**, Production. Institutional platform release from Git commit `97e382a`.

## Original upload method and source

The original release used Vercel’s browser “Drop to Deploy” folder-upload interface. The current institutional release uses the connected Git repository and a manual production deployment, recorded below. A sanitized 39-file source folder (2.3 MB) contains the active Next.js app, `src/ippan`, local public assets and build manifests. Local environment files, archived MeroTalent code, local builds and QA captures were excluded. Uploaded-source fingerprint (relative paths and bytes, sorted):

`6cc38a3e82ba3b0a3aa6f83c34f3685225f31d28d2cf6658fbcb11255c9d4dc0`

The initial build was followed by a production redeployment after environment settings were configured. Vercel account email verification was completed by the user. The app uses the dedicated IPPAN Neon project previously configured; no MeroTalent database or deployment settings were changed.

The original release used folder upload. On 22 November 2026, the source was pushed to the dedicated GitHub repository and connected to this same Vercel project, as recorded below. Automatic Git deployments are disabled at the user’s request.

## Production environment

The user explicitly approved saving these credentials in Vercel. Only names are recorded here:

| Name | Vercel type | Scope |
| --- | --- | --- |
| IPPAN_DATABASE_URL | Secret; cannot be revealed after saving | Production |
| IPPAN_DEMO_PASSWORD | Secret; cannot be revealed after saving | Production |
| IPPAN_LOCAL_DEMO | Config, value `0` | Production |
| IPPAN_SITE_URL | Config, canonical HTTPS website origin | Production |

These are server-only variables; no `NEXT_PUBLIC_` credentials are present. Secret values are absent from deployment source and documentation. The first deployment had no DB environment configured; the final Ready deployment includes all four production settings.

## Live browser checks

- Canonical public homepage loaded with the expected IPPAN title, content and images.
- Footer identifies the live persistence layer as Neon PostgreSQL.
- Administrator sign-in succeeded over HTTPS and opened the administration dashboard with the existing shared demo records.
- Hosted chart metric and 6/12-month controls changed the displayed graph.
- Member sign-in succeeded and opened the linked membership card, company, validity, certificate control, events and notifications.
- A signed-in member visiting `/admin` received “Access restricted.”

This deployment verification does not repeat every local/domain integration scenario. The broader TOR and production-readiness gaps remain as documented in `COVERAGE.md`.

Screenshots are local and ignored by Git: `output/playwright/vercel-ready.png`, `vercel-live-admin.png`, `vercel-live-member.png`, and `vercel-live-home.png`.


## Typography release — 21 November 2026

The larger-font/responsive revision was uploaded through Vercel’s browser folder chooser, followed by **Deploy to an existing project instead → ippan-demo**. The 39-file source bundle contained no environment files or secrets. The user completed a fresh Vercel email identity challenge. Vercel then reported the new production deployment Ready on the existing `ippan-demo.vercel.app` domain. The previous baseline deployment was `dpl_HcPYRzkBXDr2AitoCVbmmSfuEX9b`.

Hosted browser verification confirmed 16px body and hero paragraph text, 14px public navigation, the revised 280px desktop sidebar, and no page-level horizontal overflow in the reviewed 390px, 768px, 1024px and 1280px layouts. The signed-in member portal and administrator dashboard were reviewed at phone width. Administrator sign-in and chart metric/6-to-12-month interactions succeeded; the chart displayed all twelve month labels. The final dashboard console error list was empty. The 320px membership form/header and mobile review dialog were checked locally before deployment.

The production build passed compilation, TypeScript and page-data generation. Responsive viewport overrides were reset. Screenshots: `output/playwright/typography-live-home-mobile.png`, `typography-live-admin-mobile.png`, `typography-live-admin-desktop.png`, and `typography-vercel-ready.png`.


## Dedicated GitHub repository connection — 22 November 2026

- Repository: https://github.com/Aashutoshkashyap/ippan-demo
- Branch: `main`
- Initial self-contained source commit: `40c246c35374898d538373116f881704112e468c`
- Existing Vercel project: `aashutoshkashyaps-projects/ippan-demo`
- Production deployment retained: `dpl_679mcD4o7Dv2QRW4doYiuK4HZp5d`

The browser’s Connected Git Repository section confirms `Aashutoshkashyap/ippan-demo`. Connection was made through the existing project’s Git settings; no project import, deployment creation or redeployment action was used. The deployment history still lists the existing 21 November release as the latest deployment. Existing production environment settings and the dedicated IPPAN database remain in place.

`vercel.json` sets `git.deploymentEnabled` to `false` for all branches, following [Vercel’s Git configuration documentation](https://vercel.com/docs/project-configuration/git-configuration). A future push therefore does not automatically deploy. A new deployment requires a separate explicit release action. GitHub Actions verifies `main` with TypeScript, 16 domain tests and a production build; this workflow contains no deploy step.

The local primary remote now points to the dedicated IPPAN repository. The original MeroTalent remote and imported history remain available locally as `merotalent-source` and `ippan-import-history`; neither was pushed back to MeroTalent. Private environment files and ignored local QA captures were excluded. The staged source was checked against the private IPPAN runtime secret values and common credential patterns before publishing.


## Institutional platform release — 22 November 2026

The user explicitly requested implementation of the two new briefs, a Git push and a production release. The implementation commit `f0492d8` was pushed to `Aashutoshkashyap/ippan-demo` and released through **existing project → Deployments → Create Deployment → Deploy to Production**. Final authorization review then corrected staff audit visibility and protected approved content from editor unpublishing. The corrected code commit is `97e382aac5ec90ab0d8f630c3872eca8fb6c2d50`. Vercel reports deployment `dpl_DqvG44kognTsBxBwZ3AeWWmDpaJe` **Ready**, Production, and its Git source link points to this exact commit. The earlier implementation deployment was `dpl_3TGro8iTLkyEzkFXTvc2VxqHHHCE`.

No new Vercel project was created. The canonical domain, existing production environment variables and dedicated IPPAN Neon database were reused. `git.deploymentEnabled` remains false; both releases were explicit manual releases authorized by this request.

Final checks:

- **31 tests passed** across four files, including actual-date analytics, category fees, publishing permissions, media validation, private records, ticket pricing/capacity, notification preferences and Unicode PDF font shaping.
- **34 live HTTP assertions passed** against dedicated Neon for the retained membership, renewal/payment, publishing, event/QR, proxy/voting, correspondence and task workflows.
- Production build, TypeScript and Git whitespace checks passed. Lint: **0 errors, 14 HTML-image optimization warnings**. Dependency installation reported **0 vulnerabilities**. Next.js retains the existing React 18 deprecation notice.
- Fourteen public routes loaded successfully from the standalone production build. A Nepali generated PDF was parsed successfully after fixing the font-shaping runtime dependency. The Devanagari font is present in the server file trace.
- Browser: bilingual CMS member-service page published and visible with SEO metadata; phone Nepali homepage; synchronized project map/KPI/chart filtering; mobile member/users/reports/CMS layouts; Excel validation rejection without import; persisted meeting with uploaded PDF.
- Hosted browser: canonical homepage and required section order, Nepali phone layout, public CMS page/title, project filter/map synchronization and administrator sign-in. Document width matched viewport at 390px and 1280px. No console errors on the reviewed live dashboard.
- Hosted security/API: secure HTTP-only admin session, isolated Neon state, private meeting denial for guests and authorized PDF access, member-only document denial and a successful Unicode PDF; final finance snapshot excludes audit records and editor unpublishing returns HTTP 403.
- Source GitHub CI run `45043994373` passed for corrected commit `97e382a`.

Screenshots are local and Git-ignored: `tor-live-home.png`, `tor-live-nepali-mobile.png`, `tor-live-admin-mobile.png`, `tor-live-admin-desktop.png`, `tor-vercel-ready.png` under `output/playwright/`. The application retains the existing private evaluation credentials; none are recorded in this document. Scope and institutional-data dependencies are summarized in `RELEASE-2026-11-22.md`.
