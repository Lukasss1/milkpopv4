# Developer Handover Document: Milk Pop Platform

Welcome to the Milk Pop source code! This document provides an architectural overview, current robustly working features, areas utilizing mock logic, and next steps for the incoming engineering team to transition this project toward a production-level backend infrastructure.

## 1. Architectural Overview

The application is built as a monolithic React Front-End using standard functional components, hooks, and strict TypeScript types. It is heavily styled using Tailwind CSS and uses Lucide for iconography.

**State Management & Persistence:**
Currently, the application relies on an extensive React `useState` and `useEffect` architecture combined with the browser's `localStorage` to simulate database persistence (`src/App.tsx` contains the master state).

- Application uses the `INITIAL_*` constants (found in `src/data.ts`) to seed data if `localStorage` for a specific entity is empty.
- Almost all top-level states (such as `menuItems`, `cmsPages`, `employeesList`, etc.) live in `src/App.tsx` and are passed down to major section components (`AdminPanel.tsx`, `StaffPortal.tsx`, `PublicPages.tsx`) via props and setter functions.

## 2. Fully Functional & Ready Sub-systems

The following UI/UX features and components are heavily tested, fully fleshed out, and ready for use with or without a backend:

- **Routing & Navigation**: The dynamic tab switching interface that toggles between public views (`home`, `menu`, `locations`, `franchise`) and authenticated views (`staff_hub`, `admin_panel`).
- **CMS Visual Hierarchy**: The `PublicPages.tsx` renders different modules purely driven by data context. Features like "Edit Mode" (where authorized users can visibly update the hero banner or menu items with live previews) function perfectly on the local state layer.
- **Admin Forms & Validations**: `AdminPanel.tsx` contains complete CRUD forms for building Menus, Vacancies, Articles, and Stores. Input controls, state management, validations, and the "category" mappings (e.g. `milkshakes`, `smoothies`, `slush`, `soft_serve`) are functioning correctly.
- **Image Upload Simulation**: The `ImageUploadInline.tsx` component is hooked up properly. It converts local files to Base64 data strings for immediate thumbnail previewing and saves the payload. This is ready to be swapped out for an S3/Cloud Storage upload hook.
- **Role-based Render Guards**: Simple conditionals check for the employee's role (`owner`, `store_manager`, `team_member`) to show or hide administrative functions.

## 3. Mock Data & Local Storage Implementations

The entire application relies on mock implementations for its "Backend". There is no live remote API.

- **Data Sourcing (`src/data.ts`)**: All seeded default data is hardcoded here. It models what an actual database would return.
- **Persistence Mechanism**: The function `saveToStorage` inside `src/App.tsx` pushes JSON strings into `localStorage`. This includes session tokens (`milkpop_session`), menus, shifts, and employees.
- **Authentication**: `handleLogin` inside `src/App.tsx` simply cross-references inputted email and password fields against the `employeesList` array stored in memory. There are no cryptographic hashes, HTTP cookies, or valid JWTs being generated.

## 4. Systems Requiring Backend Integration (Next Steps)

For the next developer step, a true database (such as PostgreSQL, Firebase/Firestore, or MongoDB) alongside an API layer (Node/Express, Next.js API Routes, TRPC, etc.) needs to be constructed.

**Immediate Priorities for Backend Hook-up:**

1. **Replace Local Storage**: Substitute all `useEffect` blocks that read/write from `localStorage` inside `src/App.tsx` with asynchronous `fetch` or `axios` HTTP calls to your API endpoints (e.g., `GET /api/menu`, `POST /api/employees`).
2. **Implement Real Authentication**: Swap the naive local credentials check with a secure solution like Firebase Auth, NextAuth, or an OAuth provider. Pass secure, signed tokens instead of saving the raw employee interface directly into local memory under `milkpop_session`.
3. **Move Image Storage to Cloud**: Currently, image uploads generate heavy Base64 strings. Update `ImageUploadInline.tsx` to push image `Blob`/`File` objects directly to AWS S3/Cloudinary, fetch the returned URL string, and save *that* URL into the database.
4. **Abstract Global State**: The `src/App.tsx` file carries a significant load passing massive state arrays. Consider introducing React Context, Redux Toolkit, or Zustand to manage global state cleaner. If using an external API, using caching query tools like **React Query (@tanstack/react-query)** or **SWR** is highly recommended to manage fetching, caching, synchronizing, and updating server state seamlessly.

## 5. Security Notes

- **Secrets**: Scans completed. No API keys, database credentials, or third-party secrets have been hard-coded into the client codebase.
- **XSS Protection**: React handles automatic DOM string escaping, minimizing generic XSS vulnerabilities in the CMS inputs.
- **Data Protection**: As all data generated exists purely within the user's local browser memory (`localStorage`), deleting cache will completely erase user-generated data. Do NOT deploy this system as is expecting data persistence across different machines.

Good luck with the continuation of Milk Pop's engineering!

---

## 6. July 2026 update — brandbook redesign, sales system & Supabase

**Brand:** all visuals now come from `src/brand.tsx` (logos/patterns traced
from the brandbook PDF; mascot/sticker PNGs in `public/brand/`). The palette is
tokenised in `src/index.css`. Do not recolor, distort or right-align the
horizontal logo (brandbook rules — documented in `src/brand.tsx`).

**New modules:**
- `src/components/SalesPOS.tsx` — staff Till; deal engine in `evaluateDeals()`.
- Admin Panel tabs: `sales`, `deals`, `checklists`, plus a rebuilt `settings`
  tab that edits the persisted `SiteSettings` record and hosts the Supabase
  connection panel.
- `SiteSettings` drives the announcement ribbon (App.tsx), Footer contact
  block/socials/legal, Till VAT rate and currency symbol.
- Staff checklist items are owner-managed templates
  (`milkpop_checklist_templates`) merged into staff task state by id.

**Persistence:** `useLocalStorageState` still writes localStorage first, and
additionally mirrors every save to Supabase via `src/lib/cloudSync.ts`
(debounced upsert + deletion diff). `src/lib/supabase.ts` is a
zero-dependency PostgREST client — no SDK required. On boot, `App.tsx` pulls
all registries from the cloud when configured. Full schema + seeds live in
`supabase/` — the orders JSONB→relational explosion happens in a DB trigger,
so the client never writes child tables directly.
