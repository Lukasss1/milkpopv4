import { NewsPost, CmsPageContent, MediaItem, AuditLogItem, RolePermissionMatrix } from './types';

export const INITIAL_NEWS_POSTS: NewsPost[] = [
  {
    id: 'n1',
    title: 'Grand Reveal: Solihull Mell Square Flagship Churn',
    content: 'A gorgeous 45-seat location designed by award-winning architects, utilizing cream sand wood frameworks and fluid blue packaging wall graphics.',
    date: '28 May 2026',
    category: 'Store Opening',
    status: 'published',
    tagColor: 'bg-[#7CC0C7]/50 text-sky-850'
  },
  {
    id: 'n2',
    title: 'Milkshake Blue Velvet Recipe Achieves Record Ratings',
    content: 'Utilising organic lavender butterfly pea and marshmallow foam, the Milkshake Blue Velvet achieved a 98% positive guest rating index last month.',
    date: '14 May 2026',
    category: 'New Product',
    status: 'published',
    tagColor: 'bg-green-50 text-green-800'
  },
  {
    id: 'n3',
    title: 'Milk Pop Launches Unified Business Operational Portal',
    content: 'Empowering store managers and team members by establishing direct connection channels for compliance, rota checking, and academy learning logs.',
    date: '02 April 2026',
    category: 'Team Story',
    status: 'published',
    tagColor: 'bg-amber-50 text-amber-850'
  }
];

export const INITIAL_CMS_PAGES: CmsPageContent[] = [
  {
    id: 'cms_home',
    pageName: 'Home',
    title: 'Home Page CMS',
    heroHeadline: 'Sip • Smile •\nEnjoy',
    heroSubheadline: 'Creamy milkshakes, refreshing smoothies, soft serve and slush — made for quick, feel-good moments while you shop.',
    heroImage: 'home_hero_banner',
    ctaText: 'View Menu',
    sectionContent: 'Delight in artisanal milkshakes, fluffy waffle dessert cups, and slow-churned gelato.',
    seoTitle: 'Milk Pop | Sip • Smile • Enjoy',
    seoDescription: 'Treat yourself to freshly spun indulgent shakes and creamy soft serve at Milk Pop.',
    status: 'published',
    lastEditedBy: 'System',
    lastEditedDate: new Date().toISOString()
  }
];

export const INITIAL_MEDIA_LIBRARY: MediaItem[] = [
  { id: 'med_1', name: 'caramel_shake.jpg', folder: 'products', size: '254 KB', type: 'image/jpeg', uploadedAt: '12 May 2026', url: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&q=80&w=300' },
  { id: 'med_2', name: 'blue_velvet.jpg', folder: 'products', size: '189 KB', type: 'image/jpeg', uploadedAt: '14 May 2026', url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=300' },
  { id: 'med_3', name: 'solihull_store.jpg', folder: 'stores', size: '1.2 MB', type: 'image/jpeg', uploadedAt: '10 May 2026', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=300' },
  { id: 'med_4', name: 'main_logo_black.png', folder: 'brand', size: '42 KB', type: 'image/png', uploadedAt: '01 April 2026', url: '/milk_pop_logo.png' }
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  { id: 'aud_1', operatorName: 'Marcus Vance', role: 'Store Manager', action: 'Published Weekly Rota Shift Block', timestamp: '2026-06-01T15:30:00Z', module: 'Rota Schedule' },
  { id: 'aud_2', operatorName: 'System Core', role: 'System Admin', action: 'Synchronized UK GDPR compliance documents pool', timestamp: '2026-06-01T12:00:00Z', module: 'Compliance' }
];

export const INITIAL_ROLE_PERMISSIONS: RolePermissionMatrix[] = [
  { role: 'owner' as any, view: true, create: true, edit: true, delete: true, approve: true, publish: true },
  { role: 'store_manager' as any, view: true, create: true, edit: true, delete: false, approve: true, publish: false },
  { role: 'supervisor' as any, view: true, create: false, edit: false, delete: false, approve: false, publish: false },
  { role: 'team_member' as any, view: false, create: false, edit: false, delete: false, approve: false, publish: false }
];
