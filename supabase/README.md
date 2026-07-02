# Milk Pop — Supabase Cloud Database

Everything the app stores locally has a real table here: menu, deals, orders
(fully normalised for analytics), staff, shifts, checklists, documents, SIFR,
training, knowledge base, recruitment, franchise leads, contact messages,
news, CMS pages, media, audit trail, permissions, customers, loyalty and
inventory.

## Setup (5 minutes)

1. Create a project at https://supabase.com (free tier is fine).
2. Open **SQL Editor** → paste and run **`schema.sql`**.
3. Run **`seed.sql`** (idempotent — safe to re-run).
4. In the app: log in as the owner → **Admin Panel → Company Settings →
   Cloud database (Supabase)** → paste your **Project URL** and **anon public
   key** (Project Settings → API) → **Save & test connection**.
5. Click **Push everything** to upload this device's data, or **Pull from
   cloud** to load what's already in the database.

From then on every change made anywhere in the app mirrors to the cloud
automatically (debounced ~1s), and the app hydrates from the cloud on boot.

## How the sales core works

The Till writes one row to `orders`, with the basket as a JSONB snapshot in
`orders.items`. A database trigger (`explode_order_items`) instantly explodes
that snapshot into the relational tables `order_items` and
`order_item_modifiers` — so the client stays simple while SQL analytics stay
pure:

```sql
select * from daily_sales;        -- revenue, VAT, discounts, avg ticket per day/store
select * from top_products;       -- units + revenue per menu item
select * from sales_by_channel;   -- walk-in vs Deliveroo vs Uber Eats vs Just Eat
select * from popular_modifiers;  -- which extras actually sell
select * from stock_levels;       -- inventory on hand vs par level
```

## Security model

RLS is enabled on every table with a permissive `demo_full_access` policy so
the anon-key connection works out of the box. **Before real production use**:

1. Move staff onto Supabase Auth and drop `staff_profiles.password`
   (it exists only to keep the demo login working).
2. Drop `demo_full_access` on each table and add per-role policies — a worked
   example is in the comments at the bottom of `schema.sql`.
3. Rotate the anon key if it was ever shared.
