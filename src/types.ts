export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: 'milkshakes' | 'smoothies' | 'soft_serve' | 'slush' | 'extras';
  price: number;
  priceLarge?: number;
  calories: number;
  tags: string[];
  allergens: string[];
  image: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  postcode: string;
  openingHours: string;
  status: 'open' | 'closed' | 'coming_soon';
  deliveryLinks: {
    deliveroo?: string;
    uberEats?: string;
    justEat?: string;
  };
  phone: string;
  email: string;
  image: string;
  coordinates: { lat: number; lng: number };
}

export interface CareerVacancy {
  id: string;
  title: string;
  department: string;
  location: string;
  salary: string;
  type: 'Full-time' | 'Part-time';
  roleDescription: string;
  requirements: string[];
  responsibilities: string[];
}

export interface JobApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  store: string;
  availability: string;
  experience: string;
  cvName: string;
  message: string;
  status: 'pending' | 'reviewing' | 'interview' | 'offer' | 'declined';
  appliedAt: string;
}

export interface FranchiseInquiry {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  budget: string;
  experience: string;
  message: string;
  status: 'pending' | 'reviewed' | 'contacted' | 'approved' | 'declined';
  submittedAt: string;
}

export interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  reason: string;
  message: string;
  submittedAt: string;
}

export type EmployeeRole =
  | 'team_member'
  | 'supervisor'
  | 'store_manager'
  | 'owner';

export interface EmployeeProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  mustChangePassword?: boolean;
  role: EmployeeRole;
  storeId: string;
  storeName: string;
  nextShift: string;
  holidayBalance: number;
  points: number;
  level: number;
  badges: string[];
  avatar: string;
  payRate?: number;
  payType?: 'hourly' | 'salary';
}

export interface TrainingQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'scenario' | 'drag_drop' | 'image_match';
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  categoryTag: string;
}

export interface TrainingAssessment {
  id: string;
  title: string;
  description: string;
  learningObjectives: string[];
  passingScore: number;
  slides?: {
    title: string;
    content: string;
  }[];
  questions: TrainingQuestion[];
  category: 'brand' | 'menu' | 'operations' | 'safety' | 'service';
  points: number;
  badge: string;
}

export interface TrainingCourse {
  id: string;
  title: string;
  description: string;
  category: 'induction' | 'customer_service' | 'products' | 'food_safety' | 'health_safety' | 'operations' | 'leadership';
  progress: number;
  points: number;
  estimatedTime: string;
  badge: string;
  assessmentId?: string;
}

export interface SIFRReport {
  id: string;
  title: string;
  category: 'attendance' | 'communication' | 'behaviour' | 'training' | 'customer_service' | 'health_safety' | 'operations' | 'teamwork' | 'other';
  date: string;
  involvedPeople: string;
  storeId: string;
  storeName: string;
  description: string;
  impact: string;
  suggestedAction: string;
  confidentiality: 'confidential' | 'standard';
  status: 'submitted' | 'under_review' | 'escalated' | 'action_required' | 'resolved' | 'closed';
  reporterName: string;
  reporterId: string;
  submittedAt: string;
  replies?: SIFRComment[];
}

export interface SIFRComment {
  id: string;
  user: string;
  role: string;
  message: string;
  timestamp: string;
}

export interface StaffDocument {
  id: string;
  name: string;
  type: string;
  category: 'contracts' | 'compliance' | 'payslips' | 'performance' | 'id_verification';
  uploadDate: string;
  status: 'approved' | 'pending' | 'action_required';
  url: string;
  approvedBy?: string;
  expiryDate?: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: 'recipes' | 'opening' | 'closing' | 'cleaning' | 'service' | 'equipment' | 'safety' | 'policies';
  lastUpdated: string;
  author: string;
  readingTime: string;
  content: string;
  steps?: string[];
}

export interface WorkShift {
  id: string;
  employeeId: string;
  employeeName: string;
  role: EmployeeRole;
  storeId: string;
  storeName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  type: 'opening' | 'mid' | 'closing' | 'delivery' | 'training';
  notes?: string;
}

export interface ClockStatus {
  employeeId: string;
  status: 'clocked_out' | 'clocked_in' | 'on_break';
  lastActivity: string; // ISO string
  clockInTime?: string; // ISO String
  breakStartTime?: string; // ISO String
  accumulatedBreakMs?: number; // Break duration in milliseconds
}

export interface ClockHistoryItem {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  clockIn: string; // ISO String
  clockOut?: string; // ISO String
  breakDurationMinutes?: number;
  totalDecimalHours?: number;
  approved?: boolean;
}

// Enterprise Admin Panel Types
export interface NewsPost {
  id: string;
  title: string;
  content: string;
  category: 'Store Opening' | 'New Product' | 'Team Story' | 'Announcement' | 'Promotion';
  date: string;
  status: 'draft' | 'published';
  image?: string;
  tagColor?: string;
}

export interface AuditLogItem {
  id: string;
  operatorName: string;
  role: string;
  action: string;
  timestamp: string;
  module: string;
  previousValue?: string;
  newValue?: string;
}

export interface MediaItem {
  id: string;
  name: string;
  folder: 'products' | 'stores' | 'banners' | 'documents' | 'brand';
  size: string;
  type: string;
  uploadedAt: string;
  url: string;
}

export interface CmsPageContent {
  id: string;
  pageName: string;
  title: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroImage: string;
  aboutImage1?: string;
  aboutImage2?: string;
  ctaText: string;
  sectionContent: string;
  seoTitle: string;
  seoDescription: string;
  status: 'draft' | 'published';
  lastEditedBy: string;
  lastEditedDate: string;
}

export interface RolePermissionMatrix {
  role: EmployeeRole;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
  publish: boolean;
}




/* ============================================================
   SALES / POS SYSTEM
   Mirrors the Supabase tables: orders, order_items,
   order_item_modifiers, deals (see supabase/schema.sql).
   ============================================================ */

export type OrderChannel = 'walk_in' | 'phone' | 'website' | 'deliveroo' | 'uber_eats' | 'just_eat';
export type OrderStatus = 'open' | 'completed' | 'refunded' | 'voided';
export type PaymentMethod = 'cash' | 'card' | 'online' | 'gift_card';
export type ItemSize = 'regular' | 'large' | 'one_size';

export interface OrderItemModifier {
  id: string;
  menuItemId: string;   // references an 'extras' menu item
  name: string;
  price: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  category: MenuItem['category'];
  size: ItemSize;
  unitPrice: number;        // price of the chosen size at time of sale
  quantity: number;
  modifiers: OrderItemModifier[];
  lineTotal: number;        // (unitPrice + modifiers) * quantity, before deals
  notes?: string;
}

export interface AppliedDeal {
  dealId: string;
  dealName: string;
  discount: number;         // positive number subtracted from the order
}

export interface Order {
  id: string;
  orderNumber: number;       // human-friendly sequential number per device
  storeId: string;
  storeName: string;
  channel: OrderChannel;
  items: OrderItem[];
  appliedDeals: AppliedDeal[];
  subtotal: number;          // sum of line totals
  discountTotal: number;     // sum of applied deals
  taxRate: number;           // VAT % captured at time of sale
  taxAmount: number;         // portion of total that is VAT (VAT-inclusive pricing)
  total: number;             // subtotal - discounts (gross, VAT inclusive)
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  changeGiven?: number;
  status: OrderStatus;
  customerName?: string;
  staffId: string;
  staffName: string;
  placedAt: string;          // ISO
  completedAt?: string;
  refundReason?: string;
}

/** Configurable promotions, e.g. the brandbook combos "1+1" and "1+1=3". */
export interface Deal {
  id: string;
  name: string;
  description: string;
  type: 'bundle_price' | 'buy_x_get_y_free' | 'percent_off_category' | 'fixed_off_order';
  active: boolean;
  /* bundle_price: buy `buyQty` of category for `bundlePrice` */
  category?: MenuItem['category'];
  buyQty?: number;
  bundlePrice?: number;
  /* buy_x_get_y_free */
  freeQty?: number;
  /* percent_off_category */
  percentOff?: number;
  /* fixed_off_order */
  amountOff?: number;
  minOrderValue?: number;
  badge?: string;            // short label shown on menu/POS, e.g. "1+1=3"
}

/* ============================================================
   SITE SETTINGS — one editable record driving Navbar, Footer,
   contact info, VAT, currency and the announcement bar.
   ============================================================ */
export interface SiteSettings {
  brandName: string;
  legalName: string;
  companyNumber: string;
  vatNumber: string;
  websiteUrl: string;
  instagramHandle: string;
  instagramUrl: string;
  facebookUrl: string;
  twitterUrl: string;
  phone: string;
  email: string;
  gdprEmail: string;
  hqAddress: string;
  footerTagline: string;
  allergenNotice: string;
  announcementEnabled: boolean;
  announcementText: string;
  currencySymbol: string;    // e.g. '£'
  vatRatePercent: number;    // e.g. 20
  defaultOpeningHours: string;
}

/* ============================================================
   STAFF CHECKLIST TEMPLATES — owner-editable in the Admin Panel,
   consumed by the Staff Portal "Shift Checklists" screen.
   ============================================================ */
export interface ChecklistTemplateItem {
  id: string;
  label: string;
  category: 'opening' | 'midday' | 'closing';
  critical: boolean;         // must be done before shift sign-off
  sortOrder: number;
}

/** Cloud connection status for the Supabase sync layer. */
export interface CloudStatus {
  configured: boolean;
  connected: boolean;
  lastSyncAt?: string;
  lastError?: string;
}
