import { MenuItem, StoreLocation, CareerVacancy, TrainingCourse, KnowledgeArticle, EmployeeProfile, SIFRReport, StaffDocument } from './types';

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // MILKSHAKES
  { id: 'm1', name: 'Kinder Bueno', description: 'A creamy milkshake with smooth Kinder Bueno flavour. (340ml / 400ml)', category: 'milkshakes', price: 5, priceLarge: 6, calories: 0, tags: ['Creamy', 'Chocolate'], allergens: ['Dairy', 'Nuts', 'Gluten', 'Soya'], image: 'placeholder' },
  { id: 'm2', name: 'Ferrero Rocher', description: 'A rich chocolate and hazelnut-inspired milkshake. (340ml / 400ml)', category: 'milkshakes', price: 5, priceLarge: 6, calories: 0, tags: ['Creamy', 'Chocolate'], allergens: ['Dairy', 'Nuts', 'Gluten', 'Soya'], image: 'placeholder' },
  { id: 'm3', name: 'Oreo', description: 'A classic cookies-and-cream milkshake with Oreo flavour. (340ml / 400ml)', category: 'milkshakes', price: 5, priceLarge: 6, calories: 0, tags: ['Creamy', 'Classic', 'Chocolate'], allergens: ['Dairy', 'Gluten', 'Soya'], image: 'placeholder' },
  { id: 'm4', name: 'Snickers', description: 'A creamy milkshake with chocolate, caramel and peanut-style flavour. (340ml / 400ml)', category: 'milkshakes', price: 5, priceLarge: 6, calories: 0, tags: ['Creamy', 'Chocolate'], allergens: ['Dairy', 'Nuts', 'Soya'], image: 'placeholder' },
  { id: 'm5', name: 'KitKat', description: 'A smooth chocolate wafer-style milkshake. (340ml / 400ml)', category: 'milkshakes', price: 5, priceLarge: 6, calories: 0, tags: ['Creamy', 'Chocolate'], allergens: ['Dairy', 'Gluten', 'Soya'], image: 'placeholder' },
  { id: 'm6', name: 'Caramel', description: 'A sweet and creamy caramel milkshake. (340ml / 400ml)', category: 'milkshakes', price: 5, priceLarge: 6, calories: 0, tags: ['Creamy', 'Classic'], allergens: ['Dairy'], image: 'placeholder' },
  { id: 'm7', name: 'Biscoff', description: 'A creamy milkshake with warm spiced Biscoff. (340ml / 400ml)', category: 'milkshakes', price: 5, priceLarge: 6, calories: 0, tags: ['Creamy', 'Classic'], allergens: ['Dairy', 'Gluten', 'Soya'], image: 'placeholder' },
  { id: 'm8', name: 'Vanilla', description: 'A smooth and simple vanilla classic. (340ml / 400ml)', category: 'milkshakes', price: 5, priceLarge: 6, calories: 0, tags: ['Creamy', 'Classic'], allergens: ['Dairy'], image: 'placeholder' },
  { id: 'm9', name: 'Strawberry', description: 'A sweet and creamy strawberry milkshake. (340ml / 400ml)', category: 'milkshakes', price: 5, priceLarge: 6, calories: 0, tags: ['Creamy', 'Classic', 'Fruity'], allergens: ['Dairy'], image: 'placeholder' },
  { id: 'm10', name: 'Banana', description: 'A smooth and creamy banana milkshake. (340ml / 400ml)', category: 'milkshakes', price: 5, priceLarge: 6, calories: 0, tags: ['Creamy', 'Classic', 'Fruity'], allergens: ['Dairy'], image: 'placeholder' },
  
  // SMOOTHIES
  { id: 'sm1', name: 'Strawberry Banana', description: 'A fruity smoothie with strawberry and banana flavour. (400ml)', category: 'smoothies', price: 5, calories: 0, tags: ['Fruity', 'Cold'], allergens: [], image: 'placeholder' },
  { id: 'sm2', name: 'Acai', description: 'A berry-style smoothie with acai flavour. (400ml)', category: 'smoothies', price: 6, calories: 0, tags: ['Fruity', 'Signature'], allergens: [], image: 'placeholder' },
  { id: 'sm3', name: 'Mango Passion Fruit', description: 'A tropical smoothie with mango and passion fruit flavour. (400ml)', category: 'smoothies', price: 5, calories: 0, tags: ['Fruity', 'Cold'], allergens: [], image: 'placeholder' },
  { id: 'sm4', name: 'Berry Mix', description: 'A refreshing mixed berry smoothie. (400ml)', category: 'smoothies', price: 5, calories: 0, tags: ['Fruity', 'Cold'], allergens: [], image: 'placeholder' },

  // SOFT SERVE
  { id: 'ss1', name: 'Classic Cup', description: 'Smooth soft serve served in a classic cup.', category: 'soft_serve', price: 3, calories: 0, tags: ['Classic', 'Sweet'], allergens: ['Dairy'], image: 'placeholder' },
  { id: 'ss2', name: 'Premium Cup', description: 'Smooth soft serve served in a premium cup.', category: 'soft_serve', price: 4, calories: 0, tags: ['Signature', 'Sweet'], allergens: ['Dairy'], image: 'placeholder' },
  { id: 'ss3', name: 'Cone', description: 'Classic soft serve served in a cone.', category: 'soft_serve', price: 2.50, calories: 0, tags: ['Classic', 'Sweet'], allergens: ['Dairy', 'Gluten'], image: 'placeholder' },

  // SLUSH
  { id: 'sl1', name: 'Blue Slush', description: 'An icy, refreshing blue slush. (340ml / 400ml)', category: 'slush', price: 3, priceLarge: 4, calories: 0, tags: ['Cold', 'Fruity'], allergens: [], image: 'placeholder' },
  { id: 'sl2', name: 'Red Slush', description: 'An icy, refreshing red slush. (340ml / 400ml)', category: 'slush', price: 3, priceLarge: 4, calories: 0, tags: ['Cold', 'Fruity'], allergens: [], image: 'placeholder' },

  // EXTRAS
  { id: 'e1', name: 'Mix Flavours', description: 'Combine flavours for a customised drink.', category: 'extras', price: 0.80, calories: 0, tags: ['Customisable'], allergens: [], image: 'placeholder' },
  { id: 'e2', name: 'Whipped Cream', description: 'Add whipped cream for a soft, sweet finish.', category: 'extras', price: 1, calories: 0, tags: ['Sweet'], allergens: ['Dairy'], image: 'placeholder' },
  { id: 'e3', name: 'Extra Nutella', description: 'Add extra Nutella for a richer flavour.', category: 'extras', price: 1, calories: 0, tags: ['Chocolate'], allergens: ['Dairy', 'Nuts', 'Soya'], image: 'placeholder' },
  { id: 'e4', name: 'Cookie Crumbs', description: 'Add cookie crumbs for extra texture.', category: 'extras', price: 0.80, tags: ['Sweet'], calories: 0, allergens: ['Gluten', 'Dairy'], image: 'placeholder' },
  { id: 'e5', name: 'Marshmallows', description: 'Add marshmallows for a sweet finishing touch.', category: 'extras', price: 0.80, calories: 0, tags: ['Sweet'], allergens: [], image: 'placeholder' }
];

export const INITIAL_STORES: StoreLocation[] = [
  {
    id: 's1',
    name: 'Milk Pop Solihull',
    address: 'Touchwood Shopping Precinct, Homer Road, Solihull',
    postcode: 'B91 3GJ',
    openingHours: 'Mon - Sat: 09:00 - 21:00 | Sun: 11:00 - 17:00',
    status: 'open',
    coordinates: { lat: 52.4141, lng: -1.7794 },
    deliveryLinks: {
      deliveroo: 'https://deliveroo.co.uk',
      uberEats: 'https://ubereats.com'
    },
    phone: '+44 121 704 0090',
    email: 'solihull@milkpop.co.uk',
    image: 'solihull_store'
  },
  {
    id: 's2',
    name: 'Milk Pop Leicester',
    address: '14 Highcross Street, Leicester City Centre, Leicester',
    postcode: 'LE1 4FL',
    openingHours: 'Mon - Sun: 10:00 - 22:00',
    status: 'open',
    deliveryLinks: {
      deliveroo: 'https://deliveroo.co.uk',
      justEat: 'https://just-eat.co.uk'
    },
    phone: '+44 116 251 4030',
    email: 'leicester@milkpop.co.uk',
    image: 'leicester_store',
    coordinates: { lat: 52.6369, lng: -1.1398 }
  },
  {
    id: 's3',
    name: 'Milk Pop Birmingham',
    address: 'Bullring Shopping Centre, Birmingham',
    postcode: 'B5 4BU',
    openingHours: 'Coming Soon - Autumn 2026',
    status: 'coming_soon',
    deliveryLinks: {},
    phone: '+44 121 345 6789',
    email: 'birmingham@milkpop.co.uk',
    image: 'birmingham_store',
    coordinates: { lat: 52.4772, lng: -1.8942 }
  }
];

export const INITIAL_JOBS: CareerVacancy[] = [
  {
    id: 'v1',
    title: 'Hospitality Team Member',
    department: 'Front of House & Barista Ops',
    location: 'Solihull',
    salary: '£11.50 - £12.20 / hour',
    type: 'Part-time',
    roleDescription: 'In this energetic and friendly role, you will hold the key to creating unforgettable moments of happiness. You will prepare signature shakes, waffle cups, greet guests with authentic warmth, and preserve high hygienic and structural standards.',
    requirements: [
      'Genuine passion for hospitality, guests engagement, and retail excellence.',
      'Ability to thrive in a rapid, cooperative environment.',
      'Impeccable punctuality and professional hygiene values.',
      'Previous cashier or barista experience is appreciated but absolutely not required—we train you!'
    ],
    responsibilities: [
      'Operate high-spec blend counters, ensuring exact recipe compliance and visual formatting.',
      'Engage with guests cheerfully, offering customized pairing ideas across the dessert range.',
      'Maintain surgical sanitisation along raw storage sections and guest seating zones.'
    ]
  },
  {
    id: 'v2',
    title: 'Shift Supervisor',
    department: 'Store Management Operations',
    location: 'Leicester',
    salary: '£13.50 - £14.30 / hour',
    type: 'Full-time',
    roleDescription: 'The supervisor co-pilots daily team workflows, validating compliance across ingredients prep, food safety checklists, and cash close procedures, motivating staff to serve every beverage with outstanding quality.',
    requirements: [
      'Minimum of 1 year in a leadership or supervising capacity in food/retail.',
      'Robust problem-solving mindset and transparent, professional communication style.',
      'Sound understanding of basic health safety regulations and storage temperatures.'
    ],
    responsibilities: [
      'Supervise operational lines during high-traffic lunch and weekend peaks.',
      'Audit close checklists, register logs, prep levels, and stock balances.',
      'Lead short energizing huddles at shift start to communicate targets.'
    ]
  }
];

export const INITIAL_COURSES: TrainingCourse[] = [
  {
    id: 'c1',
    title: 'Module 1: Welcome to Milk Pop',
    description: 'It introduces every new team member to the heart of Milk Pop: our purpose, our standards, our customers, our working environment, and the role each person plays in helping the brand grow.',
    category: 'induction',
    progress: 0,
    points: 150,
    estimatedTime: '35–45 mins',
    badge: 'Ambassador Badge',
    assessmentId: 'a1'
  }
];

export const INITIAL_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'k1',
    title: 'Opening Station Verification Procedures',
    category: 'opening',
    lastUpdated: '15 May 2026',
    author: 'Daniel Cross (Ops Director)',
    readingTime: '6 mins',
    content: 'All raw storage nodes must be logged. Proper startup of high-speed shake churns ensures creamy foam profiles. Check milk delivery dates immediately upon receipt.',
    steps: [
      'Log into the temperature monitoring terminal. Confirm walk-in chillers are strictly between 1°C and 4°C.',
      'De-ice core blend nozzles using distilled hot water. Wipe stainless steel prep counters with approved sanitiser.',
      'Arrange biodegradable paper straws, customized lids, and premium takeaway collars in chronological dispenser queues.',
      'Calibrate caramel syrup pumps: verify a single squeeze dispenses exactly 15ml.'
    ]
  },
  {
    id: 'k2',
    title: 'Strict Allergen Cross-Contact Policies',
    category: 'recipes',
    lastUpdated: '12 Jan 2026',
    author: 'Elena Rostova (Compliance Leader)',
    readingTime: '5 mins',
    content: 'Pistachios and dairy are dominant elements. When an allergen request triggers, dedicated orange-rimmed blender cups must be sourced and washed separately.',
    steps: [
      'Wipe the primary station down completely while donning fresh secondary disposable gloves.',
      'Retrieve the dedicated clean blender canister designated for allergy preps.',
      'Gather fresh garnishes from sealed isolation chambers to avoid main bowl exposure.',
      'Label the finished premium container clearly with allergen warnings.'
    ]
  }
];

export const INITIAL_EMPLOYEES: EmployeeProfile[] = [
  {
    id: 'emp1',
    name: 'Lukas Cekanauskas',
    email: 'lukas@milkpop.co.uk',
    password: '123123',
    mustChangePassword: false,
    role: 'owner',
    storeId: 's1',
    storeName: 'Milk Pop HQ',
    nextShift: 'Flexible Executive Schedule',
    holidayBalance: 28.0,
    points: 1000,
    level: 10,
    badges: ['Founder', 'System Admin'],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    payRate: 0,
    payType: 'salary'
  }
];

export const INITIAL_SHIFTS: any[] = [];


export const INITIAL_SIFR_REPORTS: SIFRReport[] = [];

export const INITIAL_DOCUMENTS: StaffDocument[] = [];

/* ============================================================
   SALES, SETTINGS, DEALS & CHECKLIST SEEDS
   ============================================================ */
import { Order, Deal, SiteSettings, ChecklistTemplateItem } from './types';

export const INITIAL_ORDERS: Order[] = [];

/** The two combos printed on the brandbook menu: "1+1" and "1+1=3". */
export const INITIAL_DEALS: Deal[] = [
  {
    id: 'deal_two_shakes',
    name: 'Two Milkshakes Combo',
    description: 'Any two milkshakes together — the classic pair from our menu.',
    type: 'bundle_price',
    active: true,
    category: 'milkshakes',
    buyQty: 2,
    bundlePrice: 9,
    badge: '1+1'
  },
  {
    id: 'deal_third_free',
    name: 'Third Milkshake Free',
    description: 'Buy two milkshakes and the third one is on the house.',
    type: 'buy_x_get_y_free',
    active: true,
    category: 'milkshakes',
    buyQty: 2,
    freeQty: 1,
    badge: '1+1=3'
  }
];

export const INITIAL_SETTINGS: SiteSettings = {
  brandName: 'MILK POP',
  legalName: 'Milk Pop UK Limited',
  companyNumber: '12093847-B',
  vatNumber: 'GB 987 654 321',
  websiteUrl: 'MILKPOP.RU',
  instagramHandle: '@MILKPOP.SHAKES',
  instagramUrl: 'https://instagram.com/milkpop.shakes',
  facebookUrl: 'https://facebook.com',
  twitterUrl: 'https://twitter.com',
  phone: '+44 (0) 121 556 9000',
  email: 'hospitality@milkpop.co.uk',
  gdprEmail: 'gdpr@milkpop.co.uk',
  hqAddress: 'Milk Pop Corporate Headquarters,\n10 Colmore Row, Birmingham, B3 2QD',
  footerTagline: '“Every Milk Pop drink is designed to feel like a small moment of happiness — crafted with care, served with warmth, and made to be remembered.”',
  allergenNotice: 'Allergen Notice: Our dairy, custard ingredients, and specialized toppings are handled in environments processing peanuts, pistachios, hazelnuts, gluten-based cookies, and eggs. If you possess severe food intolerances, please ask a Store Barista for targeted batch disclosures.',
  announcementEnabled: false,
  announcementText: 'New strawberry milkshake has landed — try it today!',
  currencySymbol: '£',
  vatRatePercent: 20,
  defaultOpeningHours: 'Mon - Sat: 09:00 - 21:00 | Sun: 11:00 - 17:00'
};

/** Seeded from the previous hard-coded staff checklist so nothing is lost. */
export const INITIAL_CHECKLIST_TEMPLATES: ChecklistTemplateItem[] = [
  { id: 'ck_o1', label: 'Confirm walk-in chillers are between 1°C and 4°C and log the reading', category: 'opening', critical: true, sortOrder: 1 },
  { id: 'ck_o2', label: 'De-ice blend nozzles and sanitise stainless prep counters', category: 'opening', critical: true, sortOrder: 2 },
  { id: 'ck_o3', label: 'Stock paper straws, lids and takeaway collars at the pass', category: 'opening', critical: false, sortOrder: 3 },
  { id: 'ck_o4', label: 'Calibrate caramel syrup pumps (one squeeze = 15ml)', category: 'opening', critical: false, sortOrder: 4 },
  { id: 'ck_o5', label: 'Count the float and sign the till on', category: 'opening', critical: true, sortOrder: 5 },
  { id: 'ck_m1', label: 'Mid-day temperature check on all display fridges', category: 'midday', critical: true, sortOrder: 1 },
  { id: 'ck_m2', label: 'Wipe seating zones and restock napkin stations', category: 'midday', critical: false, sortOrder: 2 },
  { id: 'ck_m3', label: 'Rotate milk stock — check dates, FIFO order', category: 'midday', critical: true, sortOrder: 3 },
  { id: 'ck_m4', label: 'Empty and re-line front-of-house bins', category: 'midday', critical: false, sortOrder: 4 },
  { id: 'ck_c1', label: 'Strip, wash and sanitise shake churns and blender canisters', category: 'closing', critical: true, sortOrder: 1 },
  { id: 'ck_c2', label: 'Cash up the till and reconcile card terminal totals', category: 'closing', critical: true, sortOrder: 2 },
  { id: 'ck_c3', label: 'Record closing fridge temperatures in the log', category: 'closing', critical: true, sortOrder: 3 },
  { id: 'ck_c4', label: 'Mop floors, switch off signage and set the alarm', category: 'closing', critical: false, sortOrder: 4 }
];
