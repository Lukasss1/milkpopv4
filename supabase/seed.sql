-- ============================================================================
--  MILK POP — SEED DATA ("every possible insertion")
--  Run AFTER schema.sql. Idempotent: on conflict, rows are updated in place.
--  Mirrors src/data.ts exactly so a fresh browser and a fresh database agree.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- SITE SETTINGS
-- ---------------------------------------------------------------------------
insert into site_settings (id, brand_name, legal_name, company_number, vat_number, website_url,
  instagram_handle, instagram_url, facebook_url, twitter_url, phone, email, gdpr_email, hq_address,
  footer_tagline, allergen_notice, announcement_enabled, announcement_text, currency_symbol,
  vat_rate_percent, default_opening_hours)
values (1, 'MILK POP', 'Milk Pop UK Limited', '12093847-B', 'GB 987 654 321', 'MILKPOP.RU',
  '@MILKPOP.SHAKES', 'https://instagram.com/milkpop.shakes', 'https://facebook.com', 'https://twitter.com',
  '+44 (0) 121 556 9000', 'hospitality@milkpop.co.uk', 'gdpr@milkpop.co.uk',
  E'Milk Pop Corporate Headquarters,\n10 Colmore Row, Birmingham, B3 2QD',
  '“Every Milk Pop drink is designed to feel like a small moment of happiness — crafted with care, served with warmth, and made to be remembered.”',
  'Allergen Notice: Our dairy, custard ingredients, and specialized toppings are handled in environments processing peanuts, pistachios, hazelnuts, gluten-based cookies, and eggs. If you possess severe food intolerances, please ask a Store Barista for targeted batch disclosures.',
  false, 'New strawberry milkshake has landed — try it today!', '£', 20,
  'Mon - Sat: 09:00 - 21:00 | Sun: 11:00 - 17:00')
on conflict (id) do update set updated_at = now();

-- ---------------------------------------------------------------------------
-- STORES
-- ---------------------------------------------------------------------------
insert into stores (id, name, address, postcode, opening_hours, status, delivery_links, phone, email, image, coordinates) values
('s1', 'Milk Pop Solihull', 'Touchwood Shopping Precinct, Homer Road, Solihull', 'B91 3GJ',
 'Mon - Sat: 09:00 - 21:00 | Sun: 11:00 - 17:00', 'open',
 '{"deliveroo":"https://deliveroo.co.uk","uberEats":"https://ubereats.com"}',
 '+44 121 704 0090', 'solihull@milkpop.co.uk', 'solihull_store', '{"lat":52.4141,"lng":-1.7794}'),
('s2', 'Milk Pop Leicester', '14 Highcross Street, Leicester City Centre, Leicester', 'LE1 4FL',
 'Mon - Sun: 10:00 - 22:00', 'open',
 '{"deliveroo":"https://deliveroo.co.uk","justEat":"https://just-eat.co.uk"}',
 '+44 116 251 4030', 'leicester@milkpop.co.uk', 'leicester_store', '{"lat":52.6369,"lng":-1.1398}'),
('s3', 'Milk Pop Birmingham', 'Bullring Shopping Centre, Birmingham', 'B5 4BU',
 'Coming Soon - Autumn 2026', 'coming_soon', '{}',
 '+44 121 345 6789', 'birmingham@milkpop.co.uk', 'birmingham_store', '{"lat":52.4772,"lng":-1.8942}')
on conflict (id) do update set name = excluded.name, address = excluded.address, updated_at = now();

-- ---------------------------------------------------------------------------
-- MENU ITEMS (full catalogue: milkshakes, smoothies, soft serve, slush, extras)
-- ---------------------------------------------------------------------------
insert into menu_items (id, name, description, category, price, price_large, calories, tags, allergens, image) values
('m1','Kinder Bueno','A creamy milkshake with smooth Kinder Bueno flavour. (340ml / 400ml)','milkshakes',5,6,0,'["Creamy","Chocolate"]','["Dairy","Nuts","Gluten","Soya"]','placeholder'),
('m2','Ferrero Rocher','A rich chocolate and hazelnut-inspired milkshake. (340ml / 400ml)','milkshakes',5,6,0,'["Creamy","Chocolate"]','["Dairy","Nuts","Gluten","Soya"]','placeholder'),
('m3','Oreo','A classic cookies-and-cream milkshake with Oreo flavour. (340ml / 400ml)','milkshakes',5,6,0,'["Creamy","Classic","Chocolate"]','["Dairy","Gluten","Soya"]','placeholder'),
('m4','Snickers','A creamy milkshake with chocolate, caramel and peanut-style flavour. (340ml / 400ml)','milkshakes',5,6,0,'["Creamy","Chocolate"]','["Dairy","Nuts","Soya"]','placeholder'),
('m5','KitKat','A smooth chocolate wafer-style milkshake. (340ml / 400ml)','milkshakes',5,6,0,'["Creamy","Chocolate"]','["Dairy","Gluten","Soya"]','placeholder'),
('m6','Caramel','A sweet and creamy caramel milkshake. (340ml / 400ml)','milkshakes',5,6,0,'["Creamy","Classic"]','["Dairy"]','placeholder'),
('m7','Biscoff','A creamy milkshake with warm spiced Biscoff. (340ml / 400ml)','milkshakes',5,6,0,'["Creamy","Classic"]','["Dairy","Gluten","Soya"]','placeholder'),
('m8','Vanilla','A smooth and simple vanilla classic. (340ml / 400ml)','milkshakes',5,6,0,'["Creamy","Classic"]','["Dairy"]','placeholder'),
('m9','Strawberry','A sweet and creamy strawberry milkshake. (340ml / 400ml)','milkshakes',5,6,0,'["Creamy","Classic","Fruity"]','["Dairy"]','placeholder'),
('m10','Banana','A smooth and creamy banana milkshake. (340ml / 400ml)','milkshakes',5,6,0,'["Creamy","Classic","Fruity"]','["Dairy"]','placeholder'),
('sm1','Strawberry Banana','A fruity smoothie with strawberry and banana flavour. (400ml)','smoothies',5,null,0,'["Fruity","Cold"]','[]','placeholder'),
('sm2','Acai','A berry-style smoothie with acai flavour. (400ml)','smoothies',6,null,0,'["Fruity","Signature"]','[]','placeholder'),
('sm3','Mango Passion Fruit','A tropical smoothie with mango and passion fruit flavour. (400ml)','smoothies',5,null,0,'["Fruity","Cold"]','[]','placeholder'),
('sm4','Berry Mix','A refreshing mixed berry smoothie. (400ml)','smoothies',5,null,0,'["Fruity","Cold"]','[]','placeholder'),
('ss1','Classic Cup','Smooth soft serve served in a classic cup.','soft_serve',3,null,0,'["Classic","Sweet"]','["Dairy"]','placeholder'),
('ss2','Premium Cup','Smooth soft serve served in a premium cup.','soft_serve',4,null,0,'["Signature","Sweet"]','["Dairy"]','placeholder'),
('ss3','Cone','Classic soft serve served in a cone.','soft_serve',2.50,null,0,'["Classic","Sweet"]','["Dairy","Gluten"]','placeholder'),
('sl1','Blue Slush','An icy, refreshing blue slush. (340ml / 400ml)','slush',3,4,0,'["Cold","Fruity"]','[]','placeholder'),
('sl2','Red Slush','An icy, refreshing red slush. (340ml / 400ml)','slush',3,4,0,'["Cold","Fruity"]','[]','placeholder'),
('e1','Mix Flavours','Combine flavours for a customised drink.','extras',0.80,null,0,'["Customisable"]','[]','placeholder'),
('e2','Whipped Cream','Add whipped cream for a soft, sweet finish.','extras',1,null,0,'["Sweet"]','["Dairy"]','placeholder'),
('e3','Extra Nutella','Add extra Nutella for a richer flavour.','extras',1,null,0,'["Chocolate"]','["Dairy","Nuts","Soya"]','placeholder'),
('e4','Cookie Crumbs','Add cookie crumbs for extra texture.','extras',0.80,null,0,'["Sweet"]','["Gluten","Dairy"]','placeholder'),
('e5','Marshmallows','Add marshmallows for a sweet finishing touch.','extras',0.80,null,0,'["Sweet"]','[]','placeholder')
on conflict (id) do update set name = excluded.name, price = excluded.price, price_large = excluded.price_large, updated_at = now();

-- ---------------------------------------------------------------------------
-- DEALS — the brandbook menu combos "1+1" and "1+1=3"
-- ---------------------------------------------------------------------------
insert into deals (id, name, description, type, active, category, buy_qty, bundle_price, free_qty, badge) values
('deal_two_shakes', 'Two Milkshakes Combo', 'Any two milkshakes together — the classic pair from our menu.', 'bundle_price', true, 'milkshakes', 2, 9, null, '1+1'),
('deal_third_free', 'Third Milkshake Free', 'Buy two milkshakes and the third one is on the house.', 'buy_x_get_y_free', true, 'milkshakes', 2, null, 1, '1+1=3')
on conflict (id) do update set active = excluded.active, updated_at = now();

-- ---------------------------------------------------------------------------
-- STAFF, SHIFTS & CHECKLIST TEMPLATES
-- ---------------------------------------------------------------------------
insert into staff_profiles (id, name, email, password, must_change_password, role, store_id, store_name,
  next_shift, holiday_balance, points, level, badges, avatar, pay_rate, pay_type) values
('emp1', 'Lukas Cekanauskas', 'lukas@milkpop.co.uk', '123123', false, 'owner', 's1', 'Milk Pop HQ',
 'Flexible Executive Schedule', 28.0, 1000, 10, '["Founder","System Admin"]',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120', 0, 'salary')
on conflict (id) do update set updated_at = now();

insert into work_shifts (id, employee_id, employee_name, role, store_id, store_name, date, start_time, end_time, type, notes) values
('shift_seed_1', 'emp1', 'Lukas Cekanauskas', 'owner', 's1', 'Milk Pop Solihull', current_date + 1, '09:00', '17:00', 'opening', 'Quarterly store walk-through')
on conflict (id) do nothing;

insert into checklist_templates (id, label, category, critical, sort_order) values
('ck_o1', 'Confirm walk-in chillers are between 1°C and 4°C and log the reading', 'opening', true, 1),
('ck_o2', 'De-ice blend nozzles and sanitise stainless prep counters', 'opening', true, 2),
('ck_o3', 'Stock paper straws, lids and takeaway collars at the pass', 'opening', false, 3),
('ck_o4', 'Calibrate caramel syrup pumps (one squeeze = 15ml)', 'opening', false, 4),
('ck_o5', 'Count the float and sign the till on', 'opening', true, 5),
('ck_m1', 'Mid-day temperature check on all display fridges', 'midday', true, 1),
('ck_m2', 'Wipe seating zones and restock napkin stations', 'midday', false, 2),
('ck_m3', 'Rotate milk stock — check dates, FIFO order', 'midday', true, 3),
('ck_m4', 'Empty and re-line front-of-house bins', 'midday', false, 4),
('ck_c1', 'Strip, wash and sanitise shake churns and blender canisters', 'closing', true, 1),
('ck_c2', 'Cash up the till and reconcile card terminal totals', 'closing', true, 2),
('ck_c3', 'Record closing fridge temperatures in the log', 'closing', true, 3),
('ck_c4', 'Mop floors, switch off signage and set the alarm', 'closing', false, 4)
on conflict (id) do update set label = excluded.label, updated_at = now();

-- ---------------------------------------------------------------------------
-- STAFF DOCUMENTS / SIFR (representative rows)
-- ---------------------------------------------------------------------------
insert into staff_documents (id, name, type, category, upload_date, status, url) values
('doc_seed_1', 'Level 2 Food Hygiene Certificate — L. Cekanauskas', 'PDF', 'compliance', '2026-05-01', 'approved', '#')
on conflict (id) do nothing;

insert into sifr_reports (id, title, category, date, involved_people, store_id, store_name, description,
  impact, suggested_action, confidentiality, status, reporter_name, reporter_id, submitted_at, replies) values
('sifr_seed_1', 'Blender guard latch loose on unit 2', 'health_safety', '2026-06-20', 'Maintenance',
 's1', 'Milk Pop Solihull', 'The safety latch on blender unit 2 does not click fully shut.',
 'Potential hand-safety risk during peak service.', 'Engineer visit; take unit 2 out of rotation until fixed.',
 'standard', 'resolved', 'Lukas Cekanauskas', 'emp1', '2026-06-20T10:15:00Z',
 '[{"id":"reply_seed_1","user":"Lukas Cekanauskas","role":"owner","message":"Engineer booked for Friday.","timestamp":"2026-06-21T09:00:00Z"}]')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- TRAINING
-- ---------------------------------------------------------------------------
insert into training_courses (id, title, description, category, progress, points, estimated_time, badge, assessment_id) values
('c1', 'Module 1: Welcome to Milk Pop',
 'It introduces every new team member to the heart of Milk Pop: our purpose, our standards, our customers, our working environment, and the role each person plays in helping the brand grow.',
 'induction', 0, 150, '35–45 mins', 'Ambassador Badge', 'a1')
on conflict (id) do update set updated_at = now();

insert into training_assessments (id, title, description, learning_objectives, passing_score, slides, questions, category, points, badge) values
('a1', 'Welcome to Milk Pop — Knowledge Check',
 'Confirms the essentials from Module 1 before the first solo shift.',
 '["Know the Milk Pop brand promise","Know the fridge temperature limits","Know the allergen escalation steps"]',
 80, '[]',
 '[{"id":"q1","text":"What temperature band must walk-in chillers stay inside?","type":"multiple_choice","options":["1°C – 4°C","5°C – 8°C","-2°C – 0°C","Any, if logged"],"correctAnswer":"1°C – 4°C","explanation":"Dairy safety requires 1–4°C, logged twice per shift.","difficulty":"easy","categoryTag":"safety"}]',
 'brand', 150, 'Ambassador Badge')
on conflict (id) do update set updated_at = now();

-- ---------------------------------------------------------------------------
-- KNOWLEDGE BASE
-- ---------------------------------------------------------------------------
insert into kb_articles (id, title, category, last_updated, author, reading_time, content, steps) values
('k1', 'Opening Station Verification Procedures', 'opening', '15 May 2026', 'Daniel Cross (Ops Director)', '6 mins',
 'All raw storage nodes must be logged. Proper startup of high-speed shake churns ensures creamy foam profiles. Check milk delivery dates immediately upon receipt.',
 '["Log into the temperature monitoring terminal. Confirm walk-in chillers are strictly between 1°C and 4°C.","De-ice core blend nozzles using distilled hot water. Wipe stainless steel prep counters with approved sanitiser.","Arrange biodegradable paper straws, customized lids, and premium takeaway collars in chronological dispenser queues.","Calibrate caramel syrup pumps: verify a single squeeze dispenses exactly 15ml."]'),
('k2', 'Strict Allergen Cross-Contact Policies', 'recipes', '12 Jan 2026', 'Elena Rostova (Compliance Leader)', '5 mins',
 'Pistachios and dairy are dominant elements. When an allergen request triggers, dedicated orange-rimmed blender cups must be sourced and washed separately.',
 '["Wipe the primary station down completely while donning fresh secondary disposable gloves.","Retrieve the dedicated clean blender canister designated for allergy preps.","Gather fresh garnishes from sealed isolation chambers to avoid main bowl exposure.","Label the finished premium container clearly with allergen warnings."]')
on conflict (id) do update set updated_at = now();

-- ---------------------------------------------------------------------------
-- RECRUITMENT
-- ---------------------------------------------------------------------------
insert into job_vacancies (id, title, department, location, salary, type, role_description, requirements, responsibilities) values
('v1', 'Hospitality Team Member', 'Front of House & Barista Ops', 'Solihull', '£11.50 - £12.20 / hour', 'Part-time',
 'In this energetic and friendly role, you will hold the key to creating unforgettable moments of happiness. You will prepare signature shakes, waffle cups, greet guests with authentic warmth, and preserve high hygienic and structural standards.',
 '["Genuine passion for hospitality, guests engagement, and retail excellence.","Ability to thrive in a rapid, cooperative environment.","Impeccable punctuality and professional hygiene values.","Previous cashier or barista experience is appreciated but absolutely not required—we train you!"]',
 '["Operate high-spec blend counters, ensuring exact recipe compliance and visual formatting.","Engage with guests cheerfully, offering customized pairing ideas across the dessert range.","Maintain surgical sanitisation along raw storage sections and guest seating zones."]'),
('v2', 'Shift Supervisor', 'Store Management Operations', 'Leicester', '£13.50 - £14.30 / hour', 'Full-time',
 'The supervisor co-pilots daily team workflows, validating compliance across ingredients prep, food safety checklists, and cash close procedures, motivating staff to serve every beverage with outstanding quality.',
 '["Minimum of 1 year in a leadership or supervising capacity in food/retail.","Robust problem-solving mindset and transparent, professional communication style.","Sound understanding of basic health safety regulations and storage temperatures."]',
 '["Supervise operational lines during high-traffic lunch and weekend peaks.","Audit close checklists, register logs, prep levels, and stock balances.","Lead short energizing huddles at shift start to communicate targets."]')
on conflict (id) do update set updated_at = now();

insert into job_applications (id, full_name, email, phone, applied_for, applied_store, availability, experience, cv_name, message, status, applied_at) values
('app_seed_1', 'Amelia Hart', 'amelia.hart@example.com', '+44 7700 900123', 'Hospitality Team Member', 'Milk Pop Solihull',
 'Weekends and evenings', '1 year café experience', 'amelia_hart_cv.pdf', 'I love the brand and live five minutes away!', 'pending', '2026-06-28T14:30:00Z')
on conflict (id) do nothing;

insert into franchise_inquiries (id, full_name, email, phone, country, city, budget, experience, message, status, submitted_at) values
('fran_seed_1', 'Tomas Berg', 'tomas.berg@example.com', '+46 70 123 4567', 'Sweden', 'Gothenburg', '£80k – £120k',
 'Owns two coffee kiosks', 'Interested in bringing Milk Pop to Scandinavian malls.', 'pending', '2026-06-25T09:00:00Z')
on conflict (id) do nothing;

insert into contact_messages (id, full_name, email, reason, message, submitted_at) values
('msg_seed_1', 'Priya Nair', 'priya.n@example.com', 'Feedback', 'The strawberry shake at Leicester was fantastic — thank you!', '2026-06-30T16:45:00Z')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- CONTENT — news, CMS pages, media
-- ---------------------------------------------------------------------------
insert into news_posts (id, title, content, category, date, status) values
('news_seed_1', 'Birmingham Bullring store coming this autumn',
 'Our third location is under construction inside the Bullring — same shakes, same smiles, bigger seating area.',
 'Store Opening', '2026-06-15', 'published')
on conflict (id) do update set updated_at = now();

insert into cms_pages (id, page_name, title, hero_headline, hero_subheadline, hero_image, cta_text,
  section_content, seo_title, seo_description, status, last_edited_by, last_edited_date) values
('cms_home', 'home', 'Home', E'Sip • Smile •\nEnjoy',
 'Creamy milkshakes, refreshing smoothies, soft serve and slush — made for quick, feel-good moments while you shop.',
 '', 'View Menu', '', 'MILK POP — Milkshake Bar', 'Creamy milkshakes, smoothies, soft serve and slush.',
 'published', 'System', '2026-07-01')
on conflict (id) do update set updated_at = now();

insert into media_assets (id, name, folder, size, type, uploaded_at, url) values
('media_seed_1', 'Brandbook — Милкпоп2.pdf', 'brand', '4.2 MB', 'application/pdf', '2026-07-01', '#')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- GOVERNANCE — permissions matrix & audit trail opener
-- ---------------------------------------------------------------------------
insert into role_permissions (role, "view", "create", "edit", "delete", "approve", "publish") values
('team_member',   true, false, false, false, false, false),
('supervisor',    true, true,  true,  false, false, false),
('store_manager', true, true,  true,  true,  true,  false),
('owner',         true, true,  true,  true,  true,  true)
on conflict (role) do update set "view" = excluded."view", "create" = excluded."create",
  "edit" = excluded."edit", "delete" = excluded."delete", "approve" = excluded."approve", "publish" = excluded."publish";

insert into audit_logs (id, operator_name, role, action, timestamp, module) values
('aud_seed_1', 'System', 'system', 'Database initialised from seed.sql', now()::text, 'Cloud Database')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- INVENTORY starter set
-- ---------------------------------------------------------------------------
insert into ingredients (id, name, unit, par_level, cost_per_unit, supplier) values
('ing_milk',      'Whole milk',            'ml',   40000, 0.0011, 'DairyDirect UK'),
('ing_icecream',  'Soft-serve base mix',   'ml',   20000, 0.0028, 'CreamCo'),
('ing_caramel',   'Caramel syrup',         'ml',    5000, 0.0060, 'SweetSupplies'),
('ing_strawb',    'Strawberry purée',      'ml',    4000, 0.0075, 'BerryFarm'),
('ing_choc',      'Chocolate crumb',       'g',     3000, 0.0090, 'CocoaWorks'),
('ing_cream',     'Whipping cream',        'ml',    6000, 0.0040, 'DairyDirect UK'),
('ing_straws',    'Paper straws',          'unit',   500, 0.0200, 'EcoPack'),
('ing_cups_400',  '400ml dome cups',       'unit',   600, 0.0900, 'EcoPack')
on conflict (id) do update set updated_at = now();

delete from stock_movements where recorded_by = 'seed';  -- keeps re-runs idempotent
insert into stock_movements (id, ingredient_id, store_id, quantity, movement_type, note, recorded_by) values
(gen_random_uuid(), 'ing_milk',     's1', 60000, 'delivery', 'Opening stock', 'seed'),
(gen_random_uuid(), 'ing_icecream', 's1', 30000, 'delivery', 'Opening stock', 'seed'),
(gen_random_uuid(), 'ing_caramel',  's1',  8000, 'delivery', 'Opening stock', 'seed'),
(gen_random_uuid(), 'ing_straws',   's1',  1000, 'delivery', 'Opening stock', 'seed'),
(gen_random_uuid(), 'ing_cups_400', 's1',  1200, 'delivery', 'Opening stock', 'seed');

-- ---------------------------------------------------------------------------
-- CUSTOMERS & LOYALTY starter rows
-- ---------------------------------------------------------------------------
insert into customers (id, full_name, email, phone, marketing_ok, loyalty_points) values
('cust_seed_1', 'Walk-in Guest', null, null, false, 0)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- SAMPLE ORDER — exercises the JSONB→relational explosion trigger end-to-end.
-- After running, check: select * from order_items; select * from daily_sales;
-- ---------------------------------------------------------------------------
insert into orders (id, order_number, store_id, store_name, channel, items, applied_deals,
  subtotal, discount_total, tax_rate, tax_amount, total, payment_method, status,
  customer_name, staff_id, staff_name, placed_at, completed_at) values
('ord_seed_1', 1001, 's1', 'Milk Pop Solihull', 'walk_in',
 '[
    {"id":"li_seed_1","menuItemId":"m6","name":"Caramel","category":"milkshakes","size":"large","unitPrice":6,"quantity":1,
     "modifiers":[{"id":"mod_seed_1","menuItemId":"e2","name":"Whipped Cream","price":1}],"lineTotal":7},
    {"id":"li_seed_2","menuItemId":"m9","name":"Strawberry","category":"milkshakes","size":"regular","unitPrice":5,"quantity":1,
     "modifiers":[],"lineTotal":5}
  ]'::jsonb,
 '[{"dealId":"deal_two_shakes","dealName":"Two Milkshakes Combo","discount":2}]'::jsonb,
 12, 2, 20, 1.67, 10, 'card', 'completed', 'Sasha', 'emp1', 'Lukas Cekanauskas',
 now() - interval '2 hours', now() - interval '2 hours')
on conflict (id) do update set items = excluded.items, updated_at = now();
