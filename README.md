# Milk Pop - Operations & E-Commerce Platform

A comprehensive single-page React application functioning as both the public-facing storefront and the internal staff operations platform for Milk Pop.

## Features

- **Public Storefront**: Browse menu items (Milkshakes, Smoothies, Slush, Soft Serve), locate stores, read articles/news, and apply for franchise/career opportunities.
- **Administrative Portal**: Complete CRUD operations for Menu recipes, Store locations, Employee profiles, Job vacancies, Knowledge base articles, News announcements, and Shift scheduling.
- **Staff Operations (SIFR)**: Interactive tools for daily store operations, audits, compliance checks, and performance tracking.
- **Content Management System (CMS)**: Visual editing tools to manage home page banners, featured products, and media library assets.

## Quick Start (Running Locally)

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or newer recommended)
- `npm` (v8.x or newer)

### Installation

1. **Clone or Extract the Source Code**:
   Navigate into the project directory using your terminal.

   ```bash
   cd milk-pop-app
   ```

2. **Install Dependencies**:
   Install all required Node modules.

   ```bash
   npm install
   ```

### Running the Development Server

Start the Vite development server:

```bash
npm run dev
```

This will launch the application locally. Open your browser and navigate to `http://localhost:3000` (or whichever port Vite successfully binds to, typically indicated in your terminal output).

### Building for Production

To create an optimized production build:

```bash
npm run build
```

This command generates a `dist` folder containing minified, production-ready static assets that can be deployed to any static host (Vercel, Netlify, AWS S3, etc.).


## Brand system (from the official brandbook)

The visual identity is implemented 1:1 from the brandbook (`Милкпоп2.pdf`):

- **Logos** — the vertical, horizontal and icon lock-ups were vector-traced
  from the brandbook artwork and live as React components in `src/brand.tsx`
  (`LogoVertical`, `LogoHorizontal`, `LogoIcon`). Per the brandbook: horizontal
  in the site header, white version on dark backgrounds, icon for the favicon.
- **Palette** — caramel `#BD783A` (Pantone 287C) and milk-blue `#7CC0C7`
  (Pantone 285C), near-black ink for text; defined as tokens in `src/index.css`.
- **Patterns** — the milk-drip top edge and wave bottom edge are traced brand
  paths (`DripEdge`, `WaveEdge` in `src/brand.tsx`); `WaveDivider` now renders
  them everywhere it was already used.
- **Mascot & stickers** — extracted with transparency into `public/brand/`
  (`MASCOT` and `STICKERS` maps in `src/brand.tsx`).
- **Typeface** — the brandbook specifies **Unageo** (Bold + Light). It isn't on
  Google Fonts; if you own the files, drop `Unageo-Bold` / `Unageo-Light`
  (woff2 or otf) into `public/fonts/` and the site picks them up automatically.
  Until then it falls back to Poppins, the closest geometric sans available.

## Sales system

- **Staff Till (POS)** — Staff Portal → *Till / POS*: category grid, sizes,
  extras per line, live combo engine (the brandbook deals “1+1” and “1+1=3”
  auto-apply, best deal wins), walk-in/phone/Deliveroo/Uber Eats/Just Eat
  channels, cash with change calculation or card/online, VAT-inclusive totals.
- **Sales & Orders** (Admin) — revenue KPIs, top sellers, filterable order
  ledger with expandable line detail, refund and void with audit logging.
- **Deals & Combos** (Admin, owner) — create/edit/pause promotions; they apply
  at the Till and show on the public menu and homepage instantly.

## Owner editing tools

Everything on the site is editable from the Admin Panel without code:
Website Content (CMS pages + on-page edit mode), Menu Items, Store Locations,
News, Media, **Deals & Combos**, **Staff Checklists** (feeds the Staff Portal
checklist screen live), Academy courses & assessments, Knowledge Base,
Staff Directory / Rota / Documents / SIFR, Permissions Matrix, and
**Company Settings** — brand contacts, social links, footer copy, allergen
notice, announcement ribbon, currency symbol and the VAT rate used by the Till.

## Cloud database (Supabase)

The app is offline-first (localStorage) and can mirror every registry to a
real PostgreSQL database. See **`supabase/README.md`** — run `schema.sql` +
`seed.sql`, then connect from *Admin Panel → Company Settings → Cloud
database*. Orders are normalised server-side for SQL analytics
(`daily_sales`, `top_products`, `sales_by_channel`, `popular_modifiers`).

## Technologies Used

- **Framework**: [React](https://reactjs.org/) (v18+) Functional Components & Hooks
- **Build Tool**: [Vite](https://vitejs.dev/) - Lightning-fast frontend tooling
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/) (via `motion/react`)
- **Language**: [TypeScript](https://www.typescriptlang.org/) - For robust type safety
- **Routing**: Internal state-based routing (`currentTab` states) optimized for Single-Page Application behavior without complex browser history management (easily upgradeable to React Router if needed).
- **Data Persistence**: Local Storage API (Mock Database) - Temporarily holding the state in local browsers.
- **Typography**: Unageo (brandbook typeface, self-hosted hook) with Poppins fallback

## Environment Variables

Currently, the application is designed to be fully client-side for demonstration and immediate operations usage, meaning no environment variables are strictly required to start the frontend.

However, moving forward toward backend integration, you'll find an example `.env.example` file at the root. Anticipated future variables:

```env
# Future backend API URL
VITE_API_BASE_URL=
# Examples of potential future integrations:
VITE_STRIPE_PUBLIC_KEY=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

_Note: The frontend codebase has been scanned, and there are **no hardcoded API keys or secrets** stored within the repository._
