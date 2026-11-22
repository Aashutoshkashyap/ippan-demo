# IPPAN foundation audit — 21 November 2026

## Supplied code

Source: Aashutoshkashyap/merotalent-talent-os, main at audit time. Work occurs only on local `ippan-demo` branch. Existing foundation is Next.js 16 App Router wrapping a React Router client, React 18, TypeScript, Tailwind 3, Radix UI, Zod, pg, Recharts 2, PDF-lib and QRCode. Existing API routes cover talent, institutes, commerce, courses and events. Supabase migrations coexist with a Neon migration runtime. Neon configuration explicitly binds the original application's production/staging endpoints. Those endpoints and the original authentication schema must not be reused for IPPAN.

## Reuse inventory

Reuse Next.js compiler/server, React, TypeScript, Tailwind/PostCSS, Lucide icon system, Recharts interactive charts, pg pooling/transaction pattern, Zod, PDF-lib, QRCode, existing local fonts and CI concepts. Preserve original application/API source under `legacy/merotalent/app`; preserve original `src` utilities/components and migration history. Do not serve unrelated talent routes or run legacy migrations. Original auth, entitlement, job, college and payment domain services are unsuitable for IPPAN. An isolated IPPAN session/data implementation replaces them in the active app, so there are not two active auth systems.

## Active architecture

- `app`: Next.js layouts, pages and REST route handlers only.
- `src/ippan`: public site, administration and member portal sharing model/contracts, UI and server repository.
- `src/ippan/server`: server-only session, transactional persistence, validated workflows and private PDF generation.
- `db/ippan`: forward-only PostgreSQL migration in its own namespace.
- Dedicated `IPPAN_DATABASE_URL`: Neon PostgreSQL, never MeroTalent credentials. Explicit local file mode only when no dedicated URL is provided and local demo is enabled. No silent fallback on database errors.
- Next.js Node runtime. Deployment target is a normal Next.js host; Sites Worker/static hosting cannot directly host this requested Node/pg stack.

## Reference audit and visual contract

Browsed https://www.ippan.org.np/ and https://globalcollege.edu.np/ on 21 November 2026. IPPAN supplies institutional identity, energy-sector context, public imagery and navigation categories. Global College supplies a pill-shaped header over a photographic, oversized-type hero and a long-form editorial page. Attached public screenshots supply two-column introductions, asymmetrical photos, service cards, statistics and news grids. Attached dashboards supply a dark navy persistent sidebar, compact top bar, metric cards, interactive area/bar/donut charts and dense operational panels.

The five images depict different industries and incompatible layouts. They cannot all be copied 1:1 into one page. Apply their layout patterns to IPPAN content; explicitly record that pixel-identical fidelity is not achieved. No image is used as a substitute for a functional page. Images downloaded from IPPAN are used only as demo/reference material and are not asserted to be original assets.

## Scope precedence

The user's direct request overrides the attached brief: Next.js server functionality and REST APIs, Neon PostgreSQL, no React Native/mobile app, no live payment/email/SMS/push integrations. Simulated payment and communication records, if shown, must be identified. Connected membership, publishing, events, portal, secretariat and AGM demonstrations are priorities. Maintain the complete TOR status matrix separately.
