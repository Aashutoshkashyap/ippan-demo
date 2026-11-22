# Connected CMS and member demonstration

This release extends the existing IPPAN Next.js/React/TypeScript application, dedicated Neon PostgreSQL database, REST actions, session authentication and server-enforced roles. It does not introduce another database or Vercel project.

## Staff demonstration

Open `/admin/website`:

1. **Publishing desk** collects news/notices, institutional pages, resources and publications in one searchable queue. Filter by type and editorial state; archived records are hidden by default and remain recoverable through the filter.
2. **Revise** starts a private working edition against the existing record. The published edition remains available. English and Nepali previews use the same safe Markdown reader as the website; headings, lists, emphasis and links are supported, with raw HTML excluded.
3. Choose a published library photo for a cover, update publication dates and SEO fields, select Public/Members access and optionally request a linked in-app notification for active members.
4. Save Draft or submit In review. Content Editors can prepare editions but cannot approve them. An administrator can preview, request changes with a mandatory note, publish, or archive the proposal without affecting the live record.
5. Approval updates the existing record and URL. Approved editions and their review trail remain stored. Optimistic version checks reject concurrent draft edits; live-record fingerprints reject publication if another workflow changed the source record.
6. **Homepage studio** controls the bilingual banner, published media selection, section visibility and bilingual section headings. TOR section order remains fixed. Each section shows its source and eligible record count, with direct staff and public links. Public news, publications and resources prioritize featured editions consistently; member-only editions are excluded from homepage collections.
7. **Navigation** reflects published page menu groups, labels and order. New pages can be assigned to About, Membership, News & Media or Events & AGM; desktop and mobile navigation use only approved pages.
8. **Media library** and **Leadership** reuse the protected institutional editors. **Service connections** explains the actual routes between public applications, staff review, membership validity/invoices, events, documents, project analytics and private enquiries. Operational dashboard content queues include submitted working editions.

## Member demonstration

- Account: `demo.member@ippan.demo` (ordinary Member role).
- Uses the existing private IPPAN demo password, supplied separately; no credentials are committed.
- Fictional company: **Demo River Energy Pvt. Ltd. (Sample)**.
- Member record: `M-A7F6280B1A50`.
- Public profile: `/members/M-A7F6280B1A50`.
- Linked 12.5 MW survey-stage project: `HP-32993C203021`, explicitly illustrative, without a real generation licence or COD.
- Created through application submission with a clearly labelled sample PDF, administrative approval and linked member activation. The initial fee invoice remains Pending; no real funds are transferred.
- Free event registration, a QR pass, digital membership certificate, company/project profile, private library and linked portal notifications support the evaluation path.
- A bilingual member-only guide, “Member demo guide — your connected IPPAN services,” was prepared, previewed and approved through the browser.

`scripts/ippan-demo-member.mjs` is an idempotent provisioning helper restricted to this deployment or localhost. It uses the existing demo secret from local environment configuration, creates no privileged account and does not change existing credentials.

## Privacy and deployment

Snapshots now enumerate allowed fields rather than spreading the database object. Working editions and fingerprints are available only to the corresponding editorial roles; PDF bytes remain off all snapshots. Member-only editions and documents retain existing active-membership authorization. Unknown future private collections are excluded by default.

Compatibility handling: the older deployed snapshot implementation spread unknown database fields, so the new demonstration editorial collection was temporarily held in an ignored private local file. Only fictional demonstration guide material was in that collection. Review history was then restored into the separate, additive `ippan_demo.editorial_state` table. New server reads join that private collection and apply editorial authorization; writes persist it atomically with operational changes. A database trigger rejects older releases that attempt to write nonempty editorial collections into the legacy operational document, and strips empty collections from compatible old writes. Older release URLs therefore cannot read the private table through their operational snapshots. Existing public records, memberships and financial records are retained. Run `npm run db:migrate` before deploying this code to a fresh environment.

Native mobile apps and real payment/email/SMS/push integrations remain outside the agreed scope. Notifications in this release are in-app records. Official institutional content, verified project data and production election requirements still require approved inputs.

Verification and deployment provenance are recorded in `VERIFICATION.md` and `DEPLOYMENT.md`.
