/**
 * @file AdminPanel.tsx
 * @description The centralized Enterprise Resource Planning (ERP) and Content Management platform.
 * 
 * ARCHITECTURE & TECHNICAL DEBT NOTICE:
 * This is a monolithic component handling multiple sub-domains of the business (HR, CRM, CMS, Menus, Stores).
 * As the application grows, this file serves as the primary refactoring target.
 * 
 * Recommended Next Steps for Developers:
 * 1. Extract sub-panels (e.g., `StaffManagementPanel`, `MenuEditorPanel`, `CmsEditorPanel`) into their 
 *    own dedicated component files under `/src/components/admin/`.
 * 2. Abstract the extensive `switch (activeSubTab)` logic into an actual nested router configuration.
 * 3. Replace the massive prop drilling interface (`AdminPanelProps`) with contextual state management (Redux/Context)
 *    so sub-panels can read and dispatch changes directly from the global store.
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, Building, Briefcase, FileText, AlertTriangle, Check, X, Phone, Mail, Award,
  Globe, Settings, ShieldCheck, Plus, Trash, Clock, Sparkles, Calendar, Layers,
  ChevronRight, ChevronLeft, Filter, UserPlus, Edit, Sliders, CheckCircle, TrendingUp,
  Lock, ListChecks, Inbox, BookOpen, Volume2, Shield, Eye, HelpCircle, HardDrive,
  BarChart2, Search, ArrowRight, UserCheck, Heart, Star, FileSpreadsheet, RotateCcw,
  Receipt, Percent, Database, CloudUpload, CloudDownload, Megaphone
} from 'lucide-react';
import {
  EmployeeProfile, JobApplication, FranchiseInquiry, SIFRReport, StaffDocument, WorkShift,
  EmployeeRole, MenuItem, StoreLocation, CareerVacancy, KnowledgeArticle, NewsPost,
  CmsPageContent, MediaItem, AuditLogItem, RolePermissionMatrix, TrainingCourse, ContactMessage,
  Order, Deal, SiteSettings, ChecklistTemplateItem, CloudStatus
} from '../types';
import { ImageUploadInline } from './ImageUploadInline';
import { LogoIcon } from '../brand';
import { getSupabaseConfig, saveSupabaseConfig, sbHealthCheck, isCloudConfigured } from '../lib/supabase';
import { pullAllFromCloud, pushAllToCloud } from '../lib/cloudSync';

interface AdminPanelProps {
  employee: EmployeeProfile | null;
  applications: JobApplication[];
  onUpdateApplicationStatus: (id: string, status: any) => void;
  franchiseInquiries: FranchiseInquiry[];
  onUpdateFranchiseStatus: (id: string, status: any) => void;
  sifrReports: SIFRReport[];
  onResolveSIFRReport: (id: string) => void;
  documents: StaffDocument[];
  onApproveDocument: (id: string) => void;
  addToast: (msg: string, type: 'success' | 'warning' | 'error') => void;
  employeesList: EmployeeProfile[];
  shiftsList: WorkShift[];
  onAddEmployee: (emp: EmployeeProfile) => void;
  onUpdateEmployee: (emp: EmployeeProfile) => void;
  onDeleteEmployee: (id: string) => void;
  onAddShift: (shift: WorkShift) => void;
  onDeleteShift: (id: string) => void;
  setCurrentTab: (tab: string) => void;

  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  stores: StoreLocation[];
  setStores: React.Dispatch<React.SetStateAction<StoreLocation[]>>;
  vacancies: CareerVacancy[];
  setVacancies: React.Dispatch<React.SetStateAction<CareerVacancy[]>>;
  articles: KnowledgeArticle[];
  setArticles: React.Dispatch<React.SetStateAction<KnowledgeArticle[]>>;
  newsPosts: NewsPost[];
  setNewsPosts: React.Dispatch<React.SetStateAction<NewsPost[]>>;
  cmsPages: CmsPageContent[];
  setCmsPages: React.Dispatch<React.SetStateAction<CmsPageContent[]>>;
  mediaItems: MediaItem[];
  setMediaItems: React.Dispatch<React.SetStateAction<MediaItem[]>>;
  auditLogs: AuditLogItem[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLogItem[]>>;
  rolePermissions: RolePermissionMatrix[];
  setRolePermissions: React.Dispatch<React.SetStateAction<RolePermissionMatrix[]>>;
  contactMessages: ContactMessage[];
  setContactMessages: React.Dispatch<React.SetStateAction<ContactMessage[]>>;
  courses: TrainingCourse[];
  setCourses: React.Dispatch<React.SetStateAction<TrainingCourse[]>>;
  assessments: any[];
  setAssessments: React.Dispatch<React.SetStateAction<any[]>>;
  orders: Order[];
  onUpdateOrderStatus: (id: string, status: Order['status'], refundReason?: string) => void;
  deals: Deal[];
  setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
  siteSettings: SiteSettings;
  setSiteSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  checklistTemplates: ChecklistTemplateItem[];
  setChecklistTemplates: React.Dispatch<React.SetStateAction<ChecklistTemplateItem[]>>;
  cloudStatus: CloudStatus;
  setCloudStatus: React.Dispatch<React.SetStateAction<CloudStatus>>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  employee, applications, onUpdateApplicationStatus, franchiseInquiries, onUpdateFranchiseStatus,
  sifrReports, onResolveSIFRReport, documents, onApproveDocument, addToast, employeesList, shiftsList,
  onAddEmployee, onUpdateEmployee, onDeleteEmployee, onAddShift, onDeleteShift, setCurrentTab,
  menuItems, setMenuItems, stores, setStores, vacancies, setVacancies, articles, setArticles,
  newsPosts, setNewsPosts, cmsPages, setCmsPages, mediaItems, setMediaItems, auditLogs, setAuditLogs,
  rolePermissions, setRolePermissions, contactMessages, setContactMessages, courses, setCourses, assessments, setAssessments,
  orders, onUpdateOrderStatus, deals, setDeals, siteSettings, setSiteSettings,
  checklistTemplates, setChecklistTemplates, cloudStatus, setCloudStatus
}) => {
  // Navigation & Control State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // General state logging helper triggers
  const logAction = (module: string, action: string, previousValue?: string, newValue?: string) => {
    const newLog: AuditLogItem = {
      id: 'aud_' + Date.now(),
      operatorName: employee?.name || 'Administrator Override',
      role: employee?.role || 'Administrator',
      action,
      timestamp: new Date().toISOString(),
      module,
      previousValue,
      newValue
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Form Submissions & Drawer Variables
  const [selectedStaffUser, setSelectedStaffUser] = useState<EmployeeProfile | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [searchFilterId, setSearchFilterId] = useState<string>('all');

  // Shared form inputs model
  const [formType, setFormType] = useState<'menu' | 'store' | 'staff' | 'vacancy' | 'announcement' | 'article' | 'shift' | 'recognition' | 'perf' | 'course'>('menu');
  const [menuFormState, setMenuFormState] = useState<Partial<MenuItem>>({ name: '', price: 6.50, category: 'milkshakes', calories: 500, description: '', tags: [], allergens: [] });
  const [storeFormState, setStoreFormState] = useState<Partial<StoreLocation>>({ name: '', address: '', postcode: '', phone: '', email: '', status: 'open', openingHours: '09:00 - 21:00' });
  const [staffFormState, setStaffFormState] = useState<Partial<EmployeeProfile>>({ name: '', email: '', role: 'team_member', storeId: 's1', storeName: 'Milk Pop Solihull', holidayBalance: 20 });
  const [vacancyFormState, setVacancyFormState] = useState<Partial<CareerVacancy>>({ title: '', department: 'Store Management Operations', location: 'Solihull', salary: '£12.50 / hr', type: 'Part-time', roleDescription: '', requirements: [], responsibilities: [] });
  const [announcementForm, setAnnouncementForm] = useState<Partial<NewsPost>>({ title: '', content: '', category: 'Announcement', status: 'published' });
  const [articleForm, setArticleForm] = useState<Partial<KnowledgeArticle>>({ title: '', category: 'recipes', content: '', readingTime: '5 mins', author: employee?.name || 'Manager' });
  const [shiftFormState, setShiftFormState] = useState<Partial<WorkShift>>({ employeeId: '', date: new Date().toISOString().split('T')[0], startTime: '09:00', endTime: '17:00', type: 'mid', notes: '' });
  const [courseFormState, setCourseFormState] = useState<Partial<TrainingCourse>>({ title: '', category: 'induction', description: '', points: 150, estimatedTime: '45 mins', badge: '' });
  const [editItemId, setEditItemId] = useState<string | null>(null);

  // Sales / Deals / Checklists / Settings / Cloud module state
  const [salesFilterStatus, setSalesFilterStatus] = useState<string>('all');
  const [salesFilterChannel, setSalesFilterChannel] = useState<string>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [dealForm, setDealForm] = useState<Partial<Deal>>({ name: '', description: '', type: 'bundle_price', category: 'milkshakes', buyQty: 2, bundlePrice: 9, freeQty: 1, percentOff: 10, amountOff: 1, active: true, badge: '' });
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  const [checklistForm, setChecklistForm] = useState<Partial<ChecklistTemplateItem>>({ label: '', category: 'opening', critical: false });
  const [editingChecklistId, setEditingChecklistId] = useState<string | null>(null);
  const [settingsDraft, setSettingsDraft] = useState<SiteSettings>(siteSettings);
  useEffect(() => { setSettingsDraft(siteSettings); }, [siteSettings]);
  const existingCloudCfg = getSupabaseConfig();
  const [cloudUrl, setCloudUrl] = useState(existingCloudCfg?.url || '');
  const [cloudKey, setCloudKey] = useState(existingCloudCfg?.anonKey || '');
  const [cloudBusy, setCloudBusy] = useState<string | null>(null);
  const cur = siteSettings.currencySymbol || '£';

  // Recognition / Leaderboards State
  const [recognitionForm, setRecognitionForm] = useState({ empId: '', points: 100, reason: '', badge: 'Shift Excellence' });
  // Performance review state
  const [perfForm, setPerfForm] = useState({ empId: '', score: '5', notes: '', reviewDate: new Date().toISOString().split('T')[0] });

  // Setup general alerts state
  const alertsList = useMemo(() => {
    const arr: { id: string; msg: string; type: 'info' | 'warning' | 'success'; date: string }[] = [];
    if (applications.filter(a => a.status === 'pending').length > 0) {
      arr.push({ id: 'a1', msg: `There are ${applications.filter(a => a.status === 'pending').length} unreviewed job applications.`, type: 'info', date: 'Just now' });
    }
    if (franchiseInquiries.filter(f => f.status === 'pending').length > 0) {
      arr.push({ id: 'a2', msg: `New franchise lead waiting for screening panel.`, type: 'warning', date: '5 mins ago' });
    }
    if (sifrReports.filter(s => s.status === 'submitted').length > 0) {
      arr.push({ id: 'a3', msg: `CRITICAL SIFR staff report raised! Needs swift review logs.`, type: 'warning', date: '1 hour ago' });
    }
    if (documents.filter(d => d.status === 'pending').length > 0) {
      arr.push({ id: 'a4', msg: `Compliance vault has ${documents.filter(d => d.status === 'pending').length} items needing secure digital signoffs.`, type: 'info', date: 'Today' });
    }
    return arr;
  }, [applications, franchiseInquiries, sifrReports, documents]);

  // Sidebar Tabs Configuration grouped by operational roles
  const sidebarSectionsAll = [
    {
      group: 'Core Control',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Layers, badge: alertsList.length },
        { id: 'analytics', label: 'Business Analytics', icon: BarChart2, allowedRoles: ['owner', 'store_manager'] }
      ]
    },
    {
      group: 'Website CMS',
      allowedRoles: ['owner'],
      items: [
        { id: 'cms', label: 'Website Content', icon: Globe },
        { id: 'media', label: 'Media Library', icon: HardDrive },
        { id: 'news', label: 'News Announcements', icon: Volume2 }
      ]
    },
    {
      group: 'Sales',
      allowedRoles: ['owner', 'store_manager'],
      items: [
        { id: 'sales', label: 'Sales & Orders', icon: Receipt, badge: orders.filter(o => o.status === 'completed').length },
        { id: 'deals', label: 'Deals & Combos', icon: Percent, badge: deals.filter(d => d.active).length, allowedRoles: ['owner'] }
      ]
    },
    {
      group: 'Operations',
      items: [
        { id: 'stores', label: 'Store Locations', icon: Building, badge: stores.length, allowedRoles: ['owner', 'store_manager'] },
        { id: 'menu', label: 'Menu Items', icon: ListChecks, badge: menuItems.length, allowedRoles: ['owner', 'store_manager'] },
        { id: 'kb', label: 'Knowledge Base', icon: BookOpen }
      ]
    },
    {
      group: 'Staff & Rota',
      items: [
        { id: 'staff', label: 'Staff Directory', icon: Users, badge: employeesList.length },
        { id: 'checklists', label: 'Staff Checklists', icon: ListChecks, badge: checklistTemplates.length, allowedRoles: ['owner', 'store_manager'] },
        { id: 'rota', label: 'Scheduling Matrix', icon: Calendar },
        { id: 'docs', label: 'Compliance Vault', icon: FileText, badge: documents.filter(d => d.status === 'pending').length },
        { id: 'payslips', label: 'Payslips ledger', icon: FileSpreadsheet, allowedRoles: ['owner', 'store_manager'] },
        { id: 'training', label: 'Academy Courses', icon: Award },
        { id: 'sifr', label: 'SIFR Incident Desk', icon: AlertTriangle, badge: sifrReports.filter(s => s.status === 'submitted').length },
        { id: 'recognition', label: 'Leaderboard Points', icon: Star },
        { id: 'performance', label: 'Staff Reviews', icon: UserCheck, allowedRoles: ['owner', 'store_manager'] }
      ]
    },
    {
      group: 'Communication',
      allowedRoles: ['owner', 'store_manager'],
      items: [
        { id: 'careers', label: 'Careers Feed', icon: Briefcase, badge: applications.filter(a => a.status === 'pending').length, allowedRoles: ['owner', 'store_manager'] },
        { id: 'franchise', label: 'Franchise Leads', icon: Inbox, badge: franchiseInquiries.filter(f => f.status === 'pending').length, allowedRoles: ['owner'] },
        { id: 'contact', label: 'Customer Mailbox', icon: Mail, badge: contactMessages.length, allowedRoles: ['owner', 'store_manager'] }
      ]
    },
    {
      group: 'Governance',
      allowedRoles: ['owner'],
      items: [
        { id: 'permissions', label: 'Permissions Matrix', icon: Shield },
        { id: 'settings', label: 'Company Settings', icon: Settings },
        { id: 'audit', label: 'System Audit Trail', icon: ShieldCheck, badge: auditLogs.length }
      ]
    }
  ];

  const currentRole = employee?.role || 'team_member';
  const sidebarSections = sidebarSectionsAll.filter(section => {
    if (section.allowedRoles && !section.allowedRoles.includes(currentRole)) return false;
    return true;
  }).map(section => ({
    ...section,
    items: section.items.filter(item => {
      // @ts-ignore Let's handle the allowedRoles gracefully
      if (item.allowedRoles && !item.allowedRoles.includes(currentRole)) return false;
      return true;
    })
  })).filter(section => section.items.length > 0);

  // Helper arrays for allergens and popular categories
  const allergenList = ['Dairy', 'Gluten', 'Soya', 'Egg', 'Nuts', 'Coconut', 'Pistachio'];
  const categoryList = ['milkshakes', 'smoothies', 'slush', 'soft_serve'];

  // Global search matching logic
  const searchMatchCount = useMemo(() => {
    if (!globalSearch) return 0;
    const q = globalSearch.toLowerCase();
    let count = 0;
    count += employeesList.filter(e => e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q)).length;
    count += menuItems.filter(m => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)).length;
    count += stores.filter(s => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q)).length;
    count += documents.filter(d => d.name.toLowerCase().includes(q)).length;
    count += sifrReports.filter(s => s.title.toLowerCase().includes(q) || s.involvedPeople.toLowerCase().includes(q)).length;
    return count;
  }, [globalSearch, employeesList, menuItems, stores, documents, sifrReports]);

  return (
    
<div id="admin-root-container" className="flex flex-col h-screen overflow-hidden bg-[#FFFFFF] text-[#2E2A26]">
  <header className="bg-white border-b border-[#EBDECE]/80 px-6 py-4 flex flex-col gap-4 shrink-0">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <LogoIcon className="h-10 w-auto shrink-0" title="Milk Pop admin" />
        <div>
          <h1 className="font-display font-black text-lg text-[#2E2A26] uppercase tracking-wider leading-tight">Admin Control Panel</h1>
          <p className="text-[10px] text-[#A5642B]/80 font-black">Milk Pop Enterprise v4.5</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Global Search Tool */}
        <div className="relative max-w-sm hidden md:block">
          <input
            id="global-admin-search"
            type="text"
            placeholder="Secure search..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-64 bg-stone-50 border border-[#EBDECE] text-2xs px-4 py-2 rounded-full focus:outline-none focus:ring-1 focus:ring-[#BD783A]"
          />
        </div>

        <div className="flex items-center space-x-3 bg-[#EBDECE]/40 p-1.5 rounded-full pl-3">
          <div className="flex-col text-right hidden xl:flex">
            <span className="text-2xs font-extrabold text-[#2E2A26] whitespace-nowrap">{employee?.name || 'Administrator'}</span>
            <span className="text-[9px] text-[#BD783A] font-black uppercase tracking-wider">{employee?.role ? employee.role.replace('_', ' ').toUpperCase() : 'HQ OWNER'}</span>
          </div>
          <button
            onClick={() => setCurrentTab('home')}
            className="px-4 py-1.5 bg-[#2E2A26] text-white hover:bg-[#BD783A]/90 rounded-full text-[10px] uppercase font-bold transition-all cursor-pointer whitespace-nowrap"
          >
            Return to the customer view
          </button>
        </div>
      </div>
    </div>
    
    {/* Horizontal Tabs */}
    <div className="flex overflow-x-auto custom-scrollbar pb-2 gap-2 mt-2">
      {sidebarSections.flatMap(section => 
        section.items.map(item => {
          const IconComp = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isActive 
                  ? 'bg-[#BD783A] text-white shadow-xs font-black' 
                  : 'text-[#2E2A26] hover:bg-[#EBDECE]/50 hover:text-[#BD783A]'
              }`}
            >
              <IconComp className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-[#A5642B]'}`} />
              {item.label}
              {item.badge ? (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ml-1 ${isActive ? 'bg-amber-100 text-amber-900' : 'bg-[#BD783A]/20 text-[#A5642B]'}`}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })
      )}
    </div>
  </header>

  <main id="admin-workspace-right" className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

        {/* Top Header - Controls, general search inputs, and warnings */}
        

        {/* Global search result overlay panel */}
        {globalSearch ? (
          <div className="bg-white border-b border-[#EBDECE] p-4 flex flex-col overflow-y-auto max-h-48 shadow-lg shrink-0">
            <div className="flex items-center justify-between border-b pb-2 mb-2 text-[10px] font-mono text-zinc-400 uppercase">
              <span>Matching index metrics ({searchMatchCount} items)</span>
              <button onClick={() => setGlobalSearch('')} className="p-1 text-red-500 hover:bg-red-50 rounded">Clear</button>
            </div>
            <div className="space-y-1 text-2xs">
              {employeesList.filter(e => e.name.toLowerCase().includes(globalSearch.toLowerCase())).map(e => (
                <div key={e.id} onClick={() => { setActiveTab('staff'); setGlobalSearch(''); }} className="p-1 px-3 hover:bg-amber-50 rounded cursor-pointer flex justify-between">
                  <span>👤 Employee: <b>{e.name}</b> ({e.role})</span>
                  <span className="text-[#BD783A]">Open Directory →</span>
                </div>
              ))}
              {menuItems.filter(m => m.name.toLowerCase().includes(globalSearch.toLowerCase())).map(m => (
                <div key={m.id} onClick={() => { setActiveTab('menu'); setGlobalSearch(''); }} className="p-1 px-3 hover:bg-amber-50 rounded cursor-pointer flex justify-between">
                  <span>🥤 Menu: <b>{m.name}</b> ({m.category} - £{m.price})</span>
                  <span className="text-[#BD783A]">Open Menu →</span>
                </div>
              ))}
              {stores.filter(s => s.name.toLowerCase().includes(globalSearch.toLowerCase())).map(s => (
                <div key={s.id} onClick={() => { setActiveTab('stores'); setGlobalSearch(''); }} className="p-1 px-3 hover:bg-amber-50 rounded cursor-pointer flex justify-between">
                  <span>🏪 Store: <b>{s.name}</b> ({s.postcode})</span>
                  <span className="text-[#BD783A]">Open Stores →</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Main interactive Tab Routing Workspace panels */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ==================== 1. DASHBOARD OVERVIEW PANEL ==================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display font-black text-2xl text-[#2E2A26]">Headquarters Dashboard</h1>
                  <p className="text-2xs text-[#2E2A26]/70">Central control room for core franchises, employees, compliance audits, and menu databases.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => { setActiveTab('stores'); }} className="px-4 py-2 bg-sky-600 text-white rounded-full text-2xs tracking-wider uppercase font-black flex items-center gap-1 shadow-xs cursor-pointer hover:bg-sky-700">
                    <Building className="h-3 w-3" /> Manage Stores
                  </button>
                  <button onClick={() => { setFormType('staff'); setIsFormOpen(true); }} className="px-4 py-2 bg-[#BD783A] text-white rounded-full text-2xs tracking-wider uppercase font-black flex items-center gap-1 shadow-xs cursor-pointer">
                    <UserPlus className="h-3 w-3" /> Hire Staff
                  </button>
                  <button onClick={() => { setFormType('menu'); setIsFormOpen(true); }} className="px-4 py-2 bg-[#2E2A26] text-white rounded-full text-2xs tracking-wider uppercase font-black flex items-center gap-1 cursor-pointer">
                    <Plus className="h-3.5 w-3.5" /> New Product
                  </button>
                </div>
              </div>

              {/* Bento Grid Analytics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Stores Connected', count: stores.length, desc: `${stores.filter(s => s.status === 'open').length} online, 1 opening`, icon: Building, color: 'border-l-4 border-sky-400 bg-sky-50/20' },
                  { label: 'Staff Roster', count: employeesList.length, desc: 'All GDPR checks verified', icon: Users, color: 'border-l-4 border-emerald-400 bg-emerald-50/20' },
                  { label: 'Pending Careers', count: applications.filter(a => a.status === 'pending').length, desc: 'Needs trial scheduling', icon: Briefcase, color: 'border-l-4 border-[#BD783A] bg-[#BD783A]/5' },
                  { label: 'Outstanding SIFR', count: sifrReports.filter(s => s.status === 'submitted').length, desc: 'Core review actions required', icon: AlertTriangle, color: 'border-l-4 border-amber-400 bg-amber-50/20' }
                ].map((c, i) => (
                  <div key={i} className={`p-5 bg-white rounded-2xl border border-[#EBDECE]/60 flex justify-between items-start shadow-2xs ${c.color}`}>
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-gray-400 uppercase font-mono">{c.label}</span>
                      <p className="font-display font-black text-2xl text-[#2E2A26] leading-none">{c.count}</p>
                      <p className="text-[9px] text-stone-500 font-medium leading-none">{c.desc}</p>
                    </div>
                    <c.icon className="h-5 w-5 text-[#BD783A] opacity-60" />
                  </div>
                ))}
              </div>

              {/* Active notifications and priority alerts stack */}
              {alertsList.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200/50 rounded-2xl space-y-2">
                  <div className="flex items-center gap-1.5 text-2xs font-bold text-amber-800">
                    <AlertTriangle className="h-4 w-4 text-[#BD783A]" />
                    <span>HQ System Notifications - Attention Required</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-2xs">
                    {alertsList.map((al) => (
                      <div key={al.id} className="p-2.5 bg-white rounded-lg border border-amber-100 flex justify-between items-center text-[#2E2A26]">
                        <span className="font-medium">{al.msg}</span>
                        <span className="text-[9px] text-[#A5642B] font-mono">{al.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* System Audit Feed alongside Live Rota Logs */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white rounded-2xl border border-[#EBDECE]/50 p-5 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <h3 className="font-display font-black text-xs uppercase tracking-wider">Live System Logs</h3>
                    <button onClick={() => setActiveTab('audit')} className="text-[10px] text-[#BD783A] font-black cursor-pointer uppercase hover:underline">Full Trail →</button>
                  </div>
                  <div className="space-y-3">
                    {auditLogs.slice(0, 4).map((log) => (
                      <div key={log.id} className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl text-2xs leading-normal">
                        <div className="h-7 w-7 rounded-lg bg-dashed border border-zinc-300 flex items-center justify-center font-bold">
                          💼
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] text-zinc-400 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</p>
                          <p className="text-[#2E2A26]"><b>{log.operatorName}</b> ({log.role}) {log.action} inside <b>{log.module}</b></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EBDECE]/50 p-5 space-y-4">
                  <h3 className="font-display font-black text-xs uppercase tracking-wider pb-2 border-b">Quick Admin Actions</h3>
                  <div className="grid grid-cols-2 gap-3 text-2xs">
                    {[
                      { label: 'Issue Announcement', icon: Volume2, tab: 'news' },
                      { label: 'Review SIFR Logs', icon: AlertTriangle, tab: 'sifr' },
                      { label: 'Generate Payslips', icon: FileSpreadsheet, tab: 'payslips' },
                      { label: 'Check in Rota', icon: Calendar, tab: 'rota' }
                    ].map((act, idx) => (
                      <button key={idx} onClick={() => setActiveTab(act.tab)} className="p-3.5 bg-[#EBDECE]/25 border border-[#EBDECE] rounded-xl hover:bg-[#BD783A]/10 hover:border-[#BD783A]/40 text-center space-y-2 cursor-pointer text-[#2E2A26]">
                        <act.icon className="h-5 w-5 mx-auto text-[#BD783A]" />
                        <span className="block font-bold">{act.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 2. ANALYTICS GRAPHS ==================== */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display font-black text-2xl">Enterprise Analytics Dashboard</h1>
                <p className="text-2xs text-[#2E2A26]/70">Performance metrics, course completion benchmarks, store audits, and recruitment pipelines.</p>
              </div>

              {/* Vector SVG-based charts to avoid external failures */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-[#EBDECE]/60 space-y-4">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wide">Course Completion Rates by Roster</h3>
                  <div className="space-y-3">
                    {(assessments || []).map((c) => (
                      <div key={c.id} className="space-y-1">
                        <div className="flex justify-between text-2xs">
                          <span className="font-semibold">{c.title}</span>
                          <span className="font-mono text-[#BD783A]">{c.progress}%</span>
                        </div>
                        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#BD783A] transition-all" style={{ width: `${c.progress}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[#EBDECE]/60 space-y-4">
                  <h3 className="font-display font-bold text-xs uppercase tracking-wide">Store Recruitment Pipelines</h3>
                  <div className="grid grid-cols-5 h-48 items-end gap-2 text-center text-[10px]">
                    {[
                      { l: 'Pending', h: applications.filter(a => a.status === 'pending').length * 25 || 20, count: applications.filter(a => a.status === 'pending').length },
                      { l: 'Reviewing', h: applications.filter(a => a.status === 'reviewing').length * 25 || 10, count: applications.filter(a => a.status === 'reviewing').length },
                      { l: 'Interview', h: applications.filter(a => a.status === 'interview').length * 25 || 40, count: applications.filter(a => a.status === 'interview').length },
                      { l: 'Offer Made', h: 30, count: 2 },
                      { l: 'Onboarded', h: employeesList.length * 10 || 50, count: employeesList.length }
                    ].map((bar, i) => (
                      <div key={i} className="flex flex-col items-center flex-1 h-full justify-end">
                        <span className="font-mono text-zinc-400 mb-1">{bar.count}</span>
                        <div className="w-full bg-[#EBDECE]/60 hover:bg-[#BD783A] transition-colors rounded-t-lg" style={{ height: `${bar.h}%` }} />
                        <span className="text-[8px] text-stone-500 font-bold truncate w-full mt-2 leading-none">{bar.l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 3. CMS MANAGER ==================== */}
          {activeTab === 'cms' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display font-black text-2xl">Website Visual Section CMS</h1>
                <p className="text-2xs text-[#2E2A26]/70">Edit marketing copy, home hero subheadlies, button CTAs, and metadata without code.</p>
              </div>

              {cmsPages.map((page) => (
                <div key={page.id} className="bg-white rounded-2xl border p-6 space-y-4 shadow-2xs">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-[#7CC0C7]/40 hover:bg-[#7CC0C7] text-teal-800 px-2.5 py-1 rounded-full font-black uppercase tracking-widest leading-none">
                        Page: {page.pageName}
                      </span>
                      <span className="text-2xs text-gray-400">Last edited: {page.lastEditedDate} by {page.lastEditedBy}</span>
                    </div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#5CA459] border border-[#5CA459] px-2 py-0.5 rounded">
                      {page.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-2xs">
                    <div className="space-y-1.5">
                      <label className="font-black text-[10px] uppercase text-zinc-400">Hero Main Title (Customer greeting)</label>
                      <input
                        type="text"
                        value={page.heroHeadline}
                        onChange={(e) => {
                          const updated = cmsPages.map(p => p.id === page.id ? { ...p, heroHeadline: e.target.value } : p);
                          setCmsPages(updated);
                        }}
                        className="w-full bg-stone-50 border p-2.5 rounded-xl text-2xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-black text-[10px] uppercase text-zinc-400">Action Button Label (CTA Link)</label>
                      <input
                        type="text"
                        value={page.ctaText}
                        onChange={(e) => {
                          const updated = cmsPages.map(p => p.id === page.id ? { ...p, ctaText: e.target.value } : p);
                          setCmsPages(updated);
                        }}
                        className="w-full bg-stone-50 border p-2.5 rounded-xl text-2xs"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="font-black text-[10px] uppercase text-zinc-400">Hero Subheadline Message</label>
                      <textarea
                        rows={2}
                        value={page.heroSubheadline}
                        onChange={(e) => {
                          const updated = cmsPages.map(p => p.id === page.id ? { ...p, heroSubheadline: e.target.value } : p);
                          setCmsPages(updated);
                        }}
                        className="w-full bg-stone-50 border p-2.5 rounded-xl text-2xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-black text-[10px] uppercase text-zinc-400">SEO Custom Tab Title</label>
                      <input
                        type="text"
                        value={page.seoTitle}
                        onChange={(e) => {
                          const updated = cmsPages.map(p => p.id === page.id ? { ...p, seoTitle: e.target.value } : p);
                          setCmsPages(updated);
                        }}
                        className="w-full bg-stone-50 border p-2.5 rounded-xl text-2xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-black text-[10px] uppercase text-zinc-400">Google Search Audit Description</label>
                      <input
                        type="text"
                        value={page.seoDescription}
                        onChange={(e) => {
                          const updated = cmsPages.map(p => p.id === page.id ? { ...p, seoDescription: e.target.value } : p);
                          setCmsPages(updated);
                        }}
                        className="w-full bg-stone-50 border p-2.5 rounded-xl text-2xs"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t flex justify-between items-center">
                    <button onClick={() => { addToast('Version rollbacked to v1.2 revision safely.', 'warning'); logAction('CMS Manager', 'Rollbacked homepage copy to draft fallback state'); }} className="text-2xs text-[#BD783A] hover:underline font-bold cursor-pointer">
                      ⏪ Rollback Changes
                    </button>
                    <button onClick={() => { addToast('Homepage CMS context synchronized instantly with guest layers.', 'success'); logAction('CMS Manager', 'Published website page updates'); }} className="px-5 py-2.5 bg-[#2E2A26] hover:bg-[#4B4540] font-black uppercase text-2xs text-white rounded-full cursor-pointer shadow-xs">
                      Publish Live Content
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ==================== 4. MEDIA LIBRARY ==================== */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="font-display font-black text-2xl">Media Asset Library Vault</h1>
                  <p className="text-2xs text-[#2E2A26]/70">Store images, logos, product graphics, and takeaway leaflets securely.</p>
                </div>
                <button onClick={() => { addToast('Simulated image asset added to products folders.', 'success'); logAction('Media Library', 'Uploaded media file "new_blender_action.jpg"'); }} className="px-4 py-2 bg-[#BD783A] text-white rounded-full text-2xs tracking-wider uppercase font-black cursor-pointer">
                  Upload file
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mediaItems.map((med) => (
                  <div key={med.id} className="bg-white rounded-2xl border p-4 shadow-2xs space-y-3">
                    <div className="h-32 bg-stone-100 rounded-xl overflow-hidden flex items-center justify-center">
                      {med.url ? (
                        <img referrerPolicy="no-referrer" src={med.url} className="object-cover h-full w-full" alt="" />
                      ) : (
                        <span className="text-2xl">📁</span>
                      )}
                    </div>
                    <div className="text-2xs space-y-1">
                      <p className="font-bold truncate text-[#2E2A26]">{med.name}</p>
                      <p className="text-stone-400 font-mono text-[9px] flex justify-between">
                        <span>{med.size}</span>
                        <span>{med.folder.toUpperCase()}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 5. INTEGRATED GENERAL FORM DRAWER (REDUCES CODE DUPLICATION) ==================== */}
          {isFormOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
              <div className="bg-[#FFFFFF] w-full max-w-lg rounded-3xl border border-[#D2C5B4] p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center pb-2 border-b">
                  <h3 className="font-display font-black text-xs uppercase tracking-widest text-[#BD783A]">
                    {editItemId 
                      ? `Edit ${formType === 'menu' ? 'Menu Recipe' : formType === 'store' ? 'Store Location' : formType === 'vacancy' ? 'Vacancy' : formType === 'course' ? 'Academy Course' : 'Employee'}` 
                      : `Add New ${formType === 'menu' ? 'Menu Recipe' : formType === 'store' ? 'Store Location' : formType === 'vacancy' ? 'Vacancy' : formType === 'course' ? 'Academy Course' : 'Employee'}`}
                  </h3>
                  <button onClick={() => { setIsFormOpen(false); setEditItemId(null); }} className="p-1 rounded text-red-500 hover:bg-red-50 cursor-pointer">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Shared fields wrapper */}
                <div className="space-y-4 text-2xs md:grid md:grid-cols-2 md:gap-4 md:space-y-0 text-[#2E2A26]">
                  {formType === 'menu' && (
                    <>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="font-bold">Item Title *</label>
                        <input type="text" value={menuFormState.name || ''} onChange={(e) => setMenuFormState({ ...menuFormState, name: e.target.value })} className="w-full bg-white border p-2 rounded-lg" required />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="font-bold">Item Image</label>
                        <div className="w-24 h-24 rounded-lg overflow-hidden border bg-white flex items-center justify-center">
                          <ImageUploadInline
                            currentImageUrl={menuFormState.image && menuFormState.image !== 'placeholder' ? menuFormState.image : ''}
                            onImageChange={(val) => setMenuFormState({ ...menuFormState, image: val })}
                            className="w-full h-full"
                            imgClassName="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-bold">Price (£) *</label>
                        <input type="number" step="0.01" value={menuFormState.price || 0} onChange={(e) => setMenuFormState({ ...menuFormState, price: parseFloat(e.target.value) })} className="w-full bg-white border p-2 rounded-lg" required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-bold">Calories (kcal)</label>
                        <input type="number" value={menuFormState.calories || 0} onChange={(e) => setMenuFormState({ ...menuFormState, calories: parseInt(e.target.value) })} className="w-full bg-white border p-2 rounded-lg" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-bold">Category Selector</label>
                        <select value={menuFormState.category || 'milkshakes'} onChange={(e) => setMenuFormState({ ...menuFormState, category: e.target.value as any })} className="w-full bg-white border p-2 rounded-lg">
                          {categoryList.map(c => <option key={c} value={c}>{c.replace('_', ' ').toUpperCase()}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="font-bold">Ingredients description</label>
                        <textarea rows={2} value={menuFormState.description || ''} onChange={(e) => setMenuFormState({ ...menuFormState, description: e.target.value })} className="w-full bg-white border p-2 rounded-lg" />
                      </div>
                    </>
                  )}

                  {formType === 'store' && (
                    <>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="font-bold">Store Title *</label>
                        <input type="text" value={storeFormState.name || ''} onChange={(e) => setStoreFormState({ ...storeFormState, name: e.target.value })} className="w-full bg-white border p-2 rounded-lg" required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-bold">Premises Address *</label>
                        <input type="text" value={storeFormState.address || ''} onChange={(e) => setStoreFormState({ ...storeFormState, address: e.target.value })} className="w-full bg-white border p-2 rounded-lg" required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-bold">Postal Code *</label>
                        <input type="text" value={storeFormState.postcode || ''} onChange={(e) => setStoreFormState({ ...storeFormState, postcode: e.target.value })} className="w-full bg-white border p-2 rounded-lg" required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-bold">Phone Number</label>
                        <input type="text" value={storeFormState.phone || ''} onChange={(e) => setStoreFormState({ ...storeFormState, phone: e.target.value })} className="w-full bg-white border p-2 rounded-lg" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-bold">HQ Email address</label>
                        <input type="text" value={storeFormState.email || ''} onChange={(e) => setStoreFormState({ ...storeFormState, email: e.target.value })} className="w-full bg-white border p-2 rounded-lg" />
                      </div>
                    </>
                  )}

                  {formType === 'staff' && (
                    <div className="md:col-span-2 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-bold">Employee Full Name *</label>
                          <input type="text" value={staffFormState.name || ''} onChange={(e) => setStaffFormState({ ...staffFormState, name: e.target.value })} className="w-full bg-white border p-2 rounded-lg" required />
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-bold">Secure Corporate Email *</label>
                          <input type="email" value={staffFormState.email || ''} onChange={(e) => setStaffFormState({ ...staffFormState, email: e.target.value })} className="w-full bg-white border p-2 rounded-lg" required />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-bold">Role Hierarchy tier</label>
                          <select value={staffFormState.role || 'team_member'} onChange={(e) => setStaffFormState({ ...staffFormState, role: e.target.value as EmployeeRole })} className="w-full bg-white border p-2 rounded-lg">
                            <option value="team_member">TEAM MEMBER</option>
                            <option value="supervisor">SHIFT SUPERVISOR</option>
                            {employee?.role === 'owner' && (
                              <>
                                <option value="store_manager">STORE MANAGER</option>
                                <option value="owner">OWNER / ADMIN</option>
                              </>
                            )}
                          </select>
                        </div>
                        <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-[#EBDECE]/50 sm:pl-4 pt-4 sm:pt-0">
                          <label className="font-bold">Pay Type</label>
                          <div className="flex gap-4 mt-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" value="hourly" checked={staffFormState.payType === 'hourly' || !staffFormState.payType} onChange={() => setStaffFormState({...staffFormState, payType: 'hourly'})} />
                              Hourly Rate (£)
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" value="salary" checked={staffFormState.payType === 'salary'} onChange={() => setStaffFormState({...staffFormState, payType: 'salary'})} />
                              Monthly Salary (£)
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 pt-4 sm:pt-0 border-t sm:border-t-0 border-[#EBDECE]/50">
                          <label className="font-bold">Pay Amount</label>
                          <input type="number" step="0.01" value={staffFormState.payRate || ''} onChange={(e) => setStaffFormState({ ...staffFormState, payRate: parseFloat(e.target.value) })} className="w-full bg-white border p-2 rounded-lg" />
                        </div>
                        <div className="space-y-1.5 pt-4 sm:pt-0 border-t sm:border-t-0 border-[#EBDECE]/50">
                          <label className="font-bold text-[#BD783A]">Temporary PIN</label>
                          <input type="text" minLength={8} value={staffFormState.password || ''} onChange={(e) => setStaffFormState({ ...staffFormState, password: e.target.value })} className="w-full bg-amber-50 border border-amber-200 p-2 rounded-lg" required placeholder="User resets on login" />
                        </div>
                      </div>
                    </div>
                  )}

                  {formType === 'vacancy' && (
                    <>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="font-bold">Role Name *</label>
                        <input type="text" value={vacancyFormState.title || ''} onChange={(e) => setVacancyFormState({ ...vacancyFormState, title: e.target.value })} className="w-full bg-white border p-2 rounded-lg" required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-bold">Operational department</label>
                        <input type="text" value={vacancyFormState.department || ''} onChange={(e) => setVacancyFormState({ ...vacancyFormState, department: e.target.value })} className="w-full bg-white border p-2 rounded-lg" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-bold">Store Locale</label>
                        <input type="text" value={vacancyFormState.location || ''} onChange={(e) => setVacancyFormState({ ...vacancyFormState, location: e.target.value })} className="w-full bg-white border p-2 rounded-lg" />
                      </div>
                    </>
                  )}

                  {formType === 'course' && (
                    <>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="font-bold">Course Title *</label>
                        <input type="text" value={courseFormState.title || ''} onChange={(e) => setCourseFormState({ ...courseFormState, title: e.target.value })} className="w-full bg-white border p-2 rounded-lg" required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-bold">Estimated Time (e.g. 45 mins)</label>
                        <input type="text" value={courseFormState.estimatedTime || ''} onChange={(e) => setCourseFormState({ ...courseFormState, estimatedTime: e.target.value })} className="w-full bg-white border p-2 rounded-lg" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-bold">Points Awarded</label>
                        <input type="number" value={courseFormState.points || 0} onChange={(e) => setCourseFormState({ ...courseFormState, points: parseInt(e.target.value) })} className="w-full bg-white border p-2 rounded-lg" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-bold">Category Selector</label>
                        <select value={courseFormState.category || 'induction'} onChange={(e) => setCourseFormState({ ...courseFormState, category: e.target.value as any })} className="w-full bg-white border p-2 rounded-lg">
                          <option value="induction">INDUCTION</option>
                          <option value="customer_service">CUSTOMER SERVICE</option>
                          <option value="products">PRODUCTS</option>
                          <option value="food_safety">FOOD SAFETY</option>
                          <option value="health_safety">HEALTH & SAFETY</option>
                          <option value="operations">OPERATIONS</option>
                          <option value="leadership">LEADERSHIP</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-bold">Award Badge Name</label>
                        <input type="text" value={courseFormState.badge || ''} onChange={(e) => setCourseFormState({ ...courseFormState, badge: e.target.value })} className="w-full bg-white border p-2 rounded-lg" placeholder="e.g. Safety Star" />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="font-bold">Course Description *</label>
                        <textarea rows={2} value={courseFormState.description || ''} onChange={(e) => setCourseFormState({ ...courseFormState, description: e.target.value })} className="w-full bg-white border p-2 rounded-lg" required />
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-4 border-t flex justify-end gap-2">
                  <button type="button" onClick={() => { setIsFormOpen(false); setEditItemId(null); }} className="px-4 py-2 border rounded-full text-zinc-500 hover:bg-stone-100 cursor-pointer text-2xs font-bold uppercase">Cancel</button>
                  <button
                    onClick={() => {
                      if (formType === 'menu') {
                        if (editItemId) {
                          setMenuItems(menuItems.map(item => item.id === editItemId ? { ...item, ...menuFormState } as MenuItem : item));
                          logAction('Menu Manager', `Updated recipe options for "${menuFormState.name}"`);
                          addToast(`Recipe "${menuFormState.name}" has been modified.`, 'success');
                        } else {
                          const nextId = 'm_' + Date.now();
                          const newItemValue: MenuItem = {
                            id: nextId,
                            name: menuFormState.name || 'Untitled Cocktail Shake',
                            description: menuFormState.description || '',
                            price: menuFormState.price || 6.50,
                            category: menuFormState.category || 'milkshakes',
                            calories: menuFormState.calories || 420,
                            tags: ['New Added'],
                            allergens: [],
                            image: menuFormState.image || 'placeholder'
                          };
                          setMenuItems([newItemValue, ...menuItems]);
                          logAction('Menu Manager', `Created menu item "${newItemValue.name}"`);
                          addToast(`Menu item "${newItemValue.name}" published for the guest page!`, 'success');
                        }
                      } else if (formType === 'store') {
                        if (editItemId) {
                          setStores(stores.map(st => st.id === editItemId ? { ...st, ...storeFormState } as StoreLocation : st));
                          logAction('Stores Operations', `Updated store coordinates or hours for "${storeFormState.name}"`);
                          addToast(`Store details for "${storeFormState.name}" updated successfully.`, 'success');
                        } else {
                          const nextId = 's_' + Date.now();
                          const newStoreObj: StoreLocation = {
                            id: nextId,
                            name: storeFormState.name || 'Milk Pop Flagship',
                            address: storeFormState.address || 'Homer Road, Solihull',
                            postcode: storeFormState.postcode || 'B91',
                            phone: storeFormState.phone || '+44 121 000 0000',
                            email: storeFormState.email || 'info@milkpop.co.uk',
                            status: 'open',
                            openingHours: '09:00 - 21:00',
                            image: 'solihull_store',
                            coordinates: { lat: 52.4, lng: -1.7 },
                            deliveryLinks: {}
                          };
                          setStores([newStoreObj, ...stores]);
                          logAction('Stores Operations', `Configured store "${newStoreObj.name}"`);
                          addToast(`Store "${newStoreObj.name}" active in GPS records locator.`, 'success');
                        }
                      } else if (formType === 'staff') {
                        const nextId = 'emp_' + Date.now();
                        const newStaff: EmployeeProfile = {
                          id: nextId,
                          name: staffFormState.name || 'Hired Associate',
                          email: staffFormState.email || 'associate@milkpop.co.uk',
                          role: staffFormState.role || 'team_member',
                          storeId: 's1',
                          storeName: 'Milk Pop Solihull',
                          nextShift: 'No Shifts Scheduled',
                          holidayBalance: 12,
                          points: 100,
                          level: 1,
                          badges: ['Inducted'],
                          avatar: '',
                          password: staffFormState.password || 'temp1234',
                          mustChangePassword: true,
                          payType: staffFormState.payType,
                          payRate: staffFormState.payRate
                        };
                        onAddEmployee(newStaff);
                        logAction('Staff HR Directory', `Onboarded associate employee name "${newStaff.name}" as ${newStaff.role}`);
                        addToast(`Associate "${newStaff.name}" onboarded and access keys dispatched!`, 'success');
                      } else if (formType === 'vacancy') {
                        if (editItemId) {
                          setVacancies(vacancies.map(v => v.id === editItemId ? { ...v, ...vacancyFormState } as CareerVacancy : v));
                          logAction('Careers Recruiter', `Modified vacancy description for "${vacancyFormState.title}"`);
                          addToast(`Vacancy "${vacancyFormState.title}" has been updated live!`, 'success');
                        } else {
                          const nextId = 'v_' + Date.now();
                          const newVac: CareerVacancy = {
                            id: nextId,
                            title: vacancyFormState.title || 'Team Member Extraordinaire',
                            department: vacancyFormState.department || 'Front of House Ops',
                            location: vacancyFormState.location || 'Solihull',
                            salary: vacancyFormState.salary || '£11.95 / hour',
                            type: 'Part-time',
                            roleDescription: 'In this energetic and friendly role, you will hold the key to creating moments of sweet milkshake happiness.',
                            requirements: ['Vibrant customer care engagement values.'],
                            responsibilities: ['Preserve counters cleanly.']
                          };
                          setVacancies([newVac, ...vacancies]);
                          logAction('Careers Recruiter', `Created job vacancy "${newVac.title}"`);
                          addToast(`Vacancy listing for "${newVac.title}" has gone live!`, 'success');
                        }
                      } else if (formType === 'course') {
                        if (editItemId) {
                          setAssessments(courses.map(c => c.id === editItemId ? { ...c, ...courseFormState } as any : c));
                          logAction('Training Academy', `Updated curriculum for course ID "${editItemId}"`);
                          addToast(`Academy course curriculum "${courseFormState.title}" updated!`, 'success');
                        } else {
                          const nextId = 'c_' + Date.now();
                          const newCourse: TrainingCourse = {
                            id: nextId,
                            title: courseFormState.title || 'Untitled Syllabus',
                            description: courseFormState.description || 'Core brand learning guidelines and standards.',
                            category: courseFormState.category || 'induction',
                            progress: 0,
                            points: courseFormState.points || 150,
                            estimatedTime: courseFormState.estimatedTime || '45 mins',
                            badge: courseFormState.badge || 'Inducted Expert'
                          };
                          setAssessments([...assessments, newCourse]);
                          logAction('Training Academy', `Created new academy course syllabus "${newCourse.title}"`);
                          addToast(`Certified Course "${newCourse.title}" published!`, 'success');
                        }
                      }
                      setIsFormOpen(false);
                      setEditItemId(null);
                    }}
                    className="px-5 py-2 bg-[#BD783A] text-white rounded-full text-2xs hover:bg-[#A5642B] cursor-pointer font-black uppercase shadow-xs"
                  >
                    Confirm & Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 6. STORES OPERATIONS MANAGER ==================== */}
          {activeTab === 'stores' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="font-display font-black text-2xl animate-fade-in">Stores Location Controller</h1>
                  <p className="text-2xs text-[#2E2A26]/70">Add store terminals, set operational hours, assign store managers, and review delivery configurations.</p>
                </div>
                <button
                  id="add-new-store-cta"
                  onClick={() => {
                    setFormType('store');
                    setStoreFormState({ name: '', address: '', postcode: '', phone: '', email: '', status: 'open', openingHours: '09:00 - 21:00' });
                    setIsFormOpen(true);
                  }}
                  className="px-4 py-2 bg-[#BD783A] hover:bg-[#A5642B] text-white rounded-full text-2xs font-black uppercase tracking-wider shadow-xs cursor-pointer"
                >
                  Configure New Store
                </button>
              </div>

              <div id="stores-matrix-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stores.map((s) => (
                  <div key={s.id} className="bg-white rounded-2xl border border-[#EBDECE]/50 overflow-hidden shadow-2xs flex flex-col justify-between">
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-display font-black uppercase tracking-wider">{s.name}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${s.status === 'open' ? 'bg-[#5CA459]/20 text-[#5CA459]' : 'bg-[#BD783A]/20 text-[#BD783A]'}`}>
                          {s.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-2xs text-stone-500 font-medium leading-normal">{s.address} ({s.postcode})</p>
                      <div className="h-40 bg-zinc-100 rounded-xl overflow-hidden">
                        <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=300" className="object-cover h-full w-full opacity-90" alt="" />
                      </div>
                      <div className="text-[10px] space-y-1 pt-1 opacity-80 grid gap-1 grid-cols-1 font-mono">
                        <span className="flex items-center gap-1">📞 {s.phone}</span>
                        <span className="flex items-center gap-1">✉️ {s.email}</span>
                        <span className="flex items-center gap-1">🕒 Hours: {s.openingHours}</span>
                      </div>
                    </div>

                    <div className="px-4 py-3 bg-[#FFFFFF]/40 border-t flex justify-between items-center gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setFormType('store');
                            setStoreFormState({ ...s });
                            setEditItemId(s.id);
                            setIsFormOpen(true);
                          }}
                          className="text-[#BD783A] hover:bg-amber-100/40 p-1.5 rounded cursor-pointer"
                          title="Edit Store"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                              setStores(stores.filter(st => st.id !== s.id));
                              logAction('Stores Operations', `Purged store listing "${s.name}" from locator network.`);
                              addToast(`Store "${s.name}" deleted.`, 'warning');
                          }}
                          className="text-red-500 hover:bg-red-50 p-1.5 rounded cursor-pointer"
                          title="Delete Store"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => { logAction('Stores Operations', `Shut down or marked offline the store "${s.name}"`, s.status, 'closed'); s.status = 'closed'; setStores([...stores]); addToast('Store closed safely.', 'warning'); }} className="p-1 px-2 border border-red-200 text-red-500 rounded text-[9px] font-bold uppercase hover:bg-red-50 cursor-pointer">Closed</button>
                        <button onClick={() => { logAction('Stores Operations', `Opened store "${s.name}"`, s.status, 'open'); s.status = 'open'; setStores([...stores]); addToast('Store active in locator.', 'success'); }} className="p-[#5CA459] p-1 px-2 border border-[#5CA459] text-[#5CA459] rounded text-[9px] font-bold uppercase hover:bg-emerald-50 cursor-pointer">Set Online</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 7. MENU ITEMS MANAGER ==================== */}
          {activeTab === 'menu' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="font-display font-black text-2xl">Menu Recipes & Pricing Hub</h1>
                  <p className="text-2xs text-[#2E2A26]/70">Add premium milkshakes, toppings, set VAT prices, register allergen indices, and control visibility.</p>
                </div>
                <button
                  id="add-menu-cta-main"
                  onClick={() => {
                    setFormType('menu');
                    setMenuFormState({ name: '', price: 6.5, category: 'milkshakes', calories: 450, description: '' });
                    setIsFormOpen(true);
                  }}
                  className="px-4 py-2 bg-[#BD783A] hover:bg-[#A5642B] text-white rounded-full text-2xs font-black uppercase tracking-wider shadow-xs cursor-pointer"
                >
                  Create Menu Item
                </button>
              </div>

              {/* Filtering Controls */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-2xs font-extrabold select-none">
                <button onClick={() => setSearchFilterId('all')} className={`px-4 py-2 rounded-full cursor-pointer uppercase ${searchFilterId === 'all' ? 'bg-[#BD783A] text-white shadow-xs' : 'bg-white border text-stone-500 hover:bg-stone-50'}`}>All Menu</button>
                {categoryList.map(cat => (
                  <button key={cat} onClick={() => setSearchFilterId(cat)} className={`px-4 py-2 rounded-full cursor-pointer uppercase ${searchFilterId === cat ? 'bg-[#BD783A] text-white shadow-xs' : 'bg-white border text-stone-500 hover:bg-stone-50'}`}>{cat.replace('_', ' ')}</button>
                ))}
              </div>

              {/* Menu items display map list */}
              <div id="ingredients-products-listings" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {menuItems.filter(p => searchFilterId === 'all' || p.category === searchFilterId).map((p) => (
                  <div key={p.id} className="bg-white rounded-2xl border border-[#EBDECE]/50 overflow-hidden shadow-2xs hover:shadow-sm flex flex-col justify-between transition-all duration-200">
                    <div>
                      {/* Placeholder graphic design overlay to keep visual beauty */}
                      <div className="h-32 bg-stone-100 relative flex items-center justify-center">
                        <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&q=80&w=300" className="object-cover h-full w-full opacity-90" alt="" />
                        <span className="absolute top-2 right-2 text-[8px] bg-black/50 text-white font-mono px-2 py-0.5 rounded-full font-black">
                          {p.category.toUpperCase()}
                        </span>
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-display font-black text-2xs uppercase tracking-wide truncate">{p.name}</span>
                          <span className="font-mono text-[#BD783A] font-extrabold">£{p.price.toFixed(2)}</span>
                        </div>
                        <p className="text-[10px] text-stone-550 leading-relaxed line-clamp-2 h-7 font-medium">{p.description}</p>
                        <div className="flex flex-wrap gap-1 items-center pt-1">
                          <span className="text-[8px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded uppercase font-bold">{p.calories} KCAL</span>
                          {p.tags.map((tg, i) => (
                            <span key={i} className="text-[8px] bg-[#7CC0C7]/40 text-sky-800 px-1.5 py-0.5 rounded font-bold font-display uppercase tracking-widest">{tg}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-3 bg-stone-50 border-t flex justify-between items-center text-[10px]">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setFormType('menu');
                            setMenuFormState({ ...p });
                            setEditItemId(p.id);
                            setIsFormOpen(true);
                          }}
                          className="text-[#BD783A] hover:bg-amber-100/40 p-1.5 rounded cursor-pointer"
                          title="Edit Recipe"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                              setMenuItems(menuItems.filter(item => item.id !== p.id));
                              logAction('Menu Manager', `Purged dessert option "${p.name}" from database.`);
                              addToast(`recipe "${p.name}" purged.`, 'warning');
                          }}
                          className="text-red-500 hover:bg-red-50 p-1.5 rounded cursor-pointer"
                          title="Delete Recipe"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button onClick={() => { addToast('Toppings and sizes updated successfully.', 'success'); }} className="px-3 py-1.5 bg-[#2E2A26] uppercase font-black text-[9px] text-white hover:bg-[#4B4540] rounded-full cursor-pointer tracking-wider">Configure</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 8. STAFF DIRECTORY ==================== */}
          {activeTab === 'staff' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="font-display font-black text-2xl">Staff Directory Registry</h1>
                  <p className="text-2xs text-[#2E2A26]/70">Audit employee roles, contractual holiday allocations, security clearance levels, and open employee records drawers.</p>
                </div>
                <button
                  id="onboard-new-associate-cta"
                  onClick={() => {
                    setFormType('staff');
                    setStaffFormState({ name: '', email: '', role: 'team_member', storeId: 's1', storeName: 'Milk Pop Solihull' });
                    setIsFormOpen(true);
                  }}
                  className="px-4 py-2 bg-[#BD783A] text-white rounded-full text-2xs hover:bg-[#A5642B] cursor-pointer font-black uppercase tracking-wider"
                >
                  Onboard Associate
                </button>
              </div>

              {/* Roster Spreadsheet design interface */}
              <div className="bg-white rounded-2xl border border-[#EBDECE]/50 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-2xs font-sans">
                  <thead className="bg-[#DFD3C3]/40 border-b text-[10px] uppercase font-mono text-[#2E2A26]">
                    <tr>
                      <th className="p-4">Rostered Associate</th>
                      <th className="p-4">Clearance Role</th>
                      <th className="p-4">Store Terminal</th>
                      <th className="p-4">Next Scheduled Duty</th>
                      <th className="p-4">Academy Level</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-stone-600 leading-normal">
                    {employeesList.map((emp) => (
                      <tr key={emp.id} className="hover:bg-amber-50/20 transition-all">
                        <td className="p-4 flex items-center gap-2">
                          <div className="h-8 w-8 bg-[#BD783A] font-bold rounded-full border border-white flex items-center justify-center text-white shrink-0 text-3xs uppercase">
                            {emp.avatar ? <img referrerPolicy="no-referrer" src={emp.avatar} className="object-cover h-full w-full rounded-full" alt="" /> : emp.name.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-extrabold text-[#2E2A26] text-2xs leading-none">{emp.name}</p>
                            <p className="text-[10px] text-zinc-400 font-mono leading-none mt-1">{emp.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-[9px] font-black uppercase bg-[#EBDECE] text-stone-700 px-2 py-0.5 rounded">
                            {emp.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4">{emp.storeName}</td>
                        <td className="p-4 font-mono text-[10px]">{emp.nextShift || 'No Shifts Scheduled'}</td>
                        <td className="p-4">
                          <span className="text-[9px] font-black bg-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.5 rounded font-mono">
                            LVL {emp.level || 1} ({emp.points || 150} pts)
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setSelectedStaffUser(emp)} className="p-1 px-2 border hover:bg-[#EBDECE]/20 rounded text-[#BD783A] font-bold uppercase transition-all duration-150 cursor-pointer">Profile</button>
                            <button
                              onClick={() => {
                                  onDeleteEmployee(emp.id);
                                  if (selectedStaffUser?.id === emp.id) setSelectedStaffUser(null);
                                  logAction('Staff HR Directory', `Purged GDPR folder of employee ID "${emp.id}"`);
                                  addToast('Profile purged securely.', 'warning');
                              }}
                              className="text-red-500 hover:bg-red-50 p-1 rounded cursor-pointer"
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Live HR Expanded Drawer details */}
              {selectedStaffUser && (
                <div className="bg-white rounded-2xl border p-5 space-y-4 shadow-sm animate-fade-in text-2xs text-[#2E2A26]">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <h3 className="font-display font-black text-xs uppercase tracking-widest text-[#BD783A]">
                      Detailed Employee Record: {selectedStaffUser.name}
                    </h3>
                    <button onClick={() => setSelectedStaffUser(null)} className="p-1 rounded text-red-500 hover:bg-neutral-155 cursor-pointer">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {selectedStaffUser.role === 'owner' ? (
                     <div className="p-10 text-center space-y-2 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                      <Shield className="h-8 w-8 text-[#BD783A] mx-auto" />
                      <p className="font-black text-xs uppercase tracking-widest text-neutral-400">Restricted Profile</p>
                      <p className="text-[10px] text-neutral-400">Owner stats, salaries, and logs are strictly confidential and redacted from directory views.</p>
                     </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-3.5 bg-[#EBDECE]/15 border border-[#EBDECE]/40 rounded-xl space-y-1">
                          <span className="text-zinc-400 font-mono text-[9px] uppercase font-black block">Holiday Balance</span>
                          <p className="font-display font-black text-lg text-[#BD783A]">{selectedStaffUser.holidayBalance} Days</p>
                          <button onClick={() => { selectedStaffUser.holidayBalance += 1.5; addToast('Adjusted holiday contract matrix.', 'success'); }} className="text-[9px] hover:underline block text-stone-500 font-bold cursor-pointer">Add Allowance</button>
                        </div>

                        <div className="p-3.5 bg-[#EBDECE]/15 border border-[#EBDECE]/40 rounded-xl space-y-1">
                          <span className="text-zinc-400 font-mono text-[9px] uppercase font-black block">Academy points accrued</span>
                          <p className="font-display font-black text-lg text-teal-700">{selectedStaffUser.points} Points</p>
                          <button onClick={() => { setActiveTab('recognition'); setSelectedStaffUser(null); }} className="text-[9px] hover:underline block text-teal-800 font-bold cursor-pointer">Award points</button>
                        </div>

                        <div className="p-3.5 bg-[#EBDECE]/15 border border-[#EBDECE]/40 rounded-xl space-y-1">
                          <span className="text-zinc-400 font-mono text-[9px] uppercase font-black block">Earned badges list</span>
                          <div className="flex flex-wrap gap-1 mt-1 font-mono">
                            {selectedStaffUser.badges.map((b, i) => (
                              <span key={i} className="text-[8px] bg-amber-50 text-amber-700 border border-amber-200 px-1 py-0.5 rounded">{b}</span>
                            ))}
                          </div>
                        </div>

                        <div className="p-3.5 bg-[#EBDECE]/15 border border-[#EBDECE]/40 rounded-xl space-y-2">
                          <span className="text-zinc-400 font-mono text-[9px] uppercase font-black block">Contract Pay Setup</span>
                          <div className="flex items-center gap-2">
                            <select
                               title="Pay Type"
                               value={selectedStaffUser.payType || 'hourly'}
                               onChange={(e) => {
                                 const updated = { ...selectedStaffUser, payType: e.target.value as 'hourly'|'salary' };
                                 onUpdateEmployee(updated);
                                 setSelectedStaffUser(updated);
                                 addToast('Contract pay type updated.', 'success');
                               }}
                               className="bg-white border rounded text-[10px] p-1 font-bold flex-1"
                            >
                               <option value="hourly">Hourly Rate (£)</option>
                               <option value="salary">Salary/Month (£)</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                               title="Pay Rate"
                               type="number"
                               step="0.01"
                               value={selectedStaffUser.payRate || ''}
                               onChange={(e) => {
                                 const updated = { ...selectedStaffUser, payRate: parseFloat(e.target.value) || 0 };
                                 onUpdateEmployee(updated);
                                 setSelectedStaffUser(updated);
                               }}
                               className="bg-white border text-[10px] rounded p-1 w-full font-mono"
                               placeholder="Enter rate..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* DETAILED LOGS GRID */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                        {/* Left Col: Shifts & Pays */}
                        <div className="space-y-6">
                           <div>
                             <h4 className="font-black text-[10px] uppercase tracking-widest mb-3 border-b border-neutral-200 pb-1 text-[#2E2A26] flex justify-between">
                               <span>Allocated Shifts</span>
                               <span className="opacity-50">{shiftsList.filter(s => s.employeeId === selectedStaffUser.id).length} Total</span>
                             </h4>
                             <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                               {shiftsList.filter(s => s.employeeId === selectedStaffUser.id).sort((a, b) => a.date.localeCompare(b.date)).map(sh => (
                                 <div key={sh.id} className="bg-white border border-neutral-200 p-2 rounded-lg flex justify-between items-center text-[10px]">
                                   <span className="font-bold">{new Date(sh.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                                   <span className="font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">{sh.startTime} - {sh.endTime}</span>
                                   <span className="uppercase text-[8px] font-black opacity-50">{sh.type}</span>
                                 </div>
                               ))}
                               {shiftsList.filter(s => s.employeeId === selectedStaffUser.id).length === 0 && (
                                 <div className="text-center text-neutral-400 italic py-2">No upcoming shifts Scheduled.</div>
                               )}
                             </div>
                           </div>

                           <div>
                             <h4 className="font-black text-[10px] uppercase tracking-widest mb-3 border-b border-neutral-200 pb-1 text-[#2E2A26] flex justify-between">
                               <span>Clock Logs & Pays</span>
                               <span className="opacity-50">Local Audit</span>
                             </h4>
                             <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                               {(() => {
                                  let clockHistory: any[] = [];
                                  try {
                                    const saved = localStorage.getItem('milkpop_clock_history');
                                    if (saved) clockHistory = JSON.parse(saved);
                                  } catch(e) {}
                                  
                                  const userClocks = clockHistory.filter(ch => ch.employeeId === selectedStaffUser.id);
                                  
                                  if (userClocks.length === 0) return <div className="text-center text-neutral-400 italic py-2">No pay records on this terminal.</div>;

                                  const baseRate = selectedStaffUser.payRate || 11.44;
                                  let hourlyRate = baseRate;
                                  if (selectedStaffUser.payType === 'salary' || baseRate >= 500) {
                                    if (baseRate >= 20000) {
                                      hourlyRate = baseRate / 52 / 40;
                                    } else {
                                      hourlyRate = (baseRate * 12) / 52 / 40;
                                    }
                                  }

                                  return userClocks.map(log => {
                                    const shiftPay = (log.totalDecimalHours || 0) * hourlyRate;
                                    return (
                                        <div key={log.id} className="bg-white border border-[#5FA777]/30 p-2 rounded-lg flex flex-col gap-1 text-[10px]">
                                          <div className="flex justify-between font-bold">
                                            <span>{new Date(log.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                                            <span className="text-[#5FA777]">£{shiftPay.toFixed(2)} NET</span>
                                          </div>
                                          <div className="flex justify-between text-[9px] text-neutral-500 font-mono">
                                            <span>{new Date(log.clockIn).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} - {log.clockOut ? new Date(log.clockOut).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'Pending'}</span>
                                            <span>{log.totalDecimalHours} hrs @ £{hourlyRate.toFixed(2)}/hr</span>
                                          </div>
                                        </div>
                                    );
                                  });
                               })()}
                             </div>
                           </div>
                        </div>

                        {/* Right Col: SIFR & Reviews */}
                        <div className="space-y-6">
                           <div>
                             <h4 className="font-black text-[10px] uppercase tracking-widest mb-3 border-b border-neutral-200 pb-1 text-[#2E2A26] flex justify-between">
                               <span>Logged SIFR Reports</span>
                               <span className="opacity-50">Non-Anonymous</span>
                             </h4>
                             <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                               {(() => {
                                  const userReports = sifrReports.filter(r => r.reporterId === selectedStaffUser.id && r.confidentiality !== 'confidential');
                                  if (userReports.length === 0) return <div className="text-center text-neutral-400 italic py-2">No public SIFR logs generated.</div>;
                                  
                                  return userReports.map(rep => (
                                     <div key={rep.id} className="bg-white border border-neutral-200 p-2.5 rounded-lg space-y-1">
                                        <div className="flex justify-between items-start">
                                           <span className="text-[10px] font-bold text-red-700">{rep.incidentType.replace('_', ' ')}</span>
                                           <span className="text-[8px] font-mono text-neutral-400">{new Date(rep.date).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-[9px] text-neutral-600 line-clamp-2 leading-relaxed">{rep.description}</p>
                                     </div>
                                  ));
                               })()}
                             </div>
                           </div>
                           
                           <div>
                             <h4 className="font-black text-[10px] uppercase tracking-widest mb-3 border-b border-neutral-200 pb-1 text-[#2E2A26] flex justify-between">
                               <span>Performance & Reviews</span>
                               <span className="opacity-50">Management Eyes Only</span>
                             </h4>
                             <div className="space-y-3">
                               {(() => {
                                  let userReviews: any[] = [];
                                  try {
                                    const saved = localStorage.getItem('milkpop_perf_reviews');
                                    if (saved) {
                                      const allReviews = JSON.parse(saved);
                                      userReviews = allReviews.filter((r: any) => r.empId === selectedStaffUser.id);
                                    }
                                  } catch(e) {}
                                  
                                  if (userReviews.length === 0) {
                                    return <div className="text-center text-neutral-400 italic py-2 text-[10px]">No performance reviews logged on this terminal.</div>;
                                  }
                                  
                                  // Sort from newest to oldest based on reviewDate or id
                                  userReviews.sort((a, b) => b.id.localeCompare(a.id));

                                  return userReviews.map((rev) => (
                                    <div key={rev.id} className="bg-white border border-amber-200 p-3 rounded-xl space-y-3">
                                      <div className="flex items-center justify-between text-amber-700">
                                         <div className="flex items-center gap-2">
                                            <Star className="h-4 w-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Performance Appraisal</span>
                                         </div>
                                         <span className="text-[10px] font-black">{rev.score}/5</span>
                                      </div>
                                      <p className="text-[10px] text-neutral-600 italic leading-relaxed">
                                         "{rev.notes}"
                                      </p>
                                      <div className="flex justify-between items-center pt-2 border-t border-amber-100 text-[8px] uppercase tracking-widest font-black text-amber-800/60">
                                         <span>Reviewer: {rev.reviewer}</span>
                                         <span>{new Date(rev.reviewDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
                                      </div>
                                    </div>
                                  ));
                               })()}
                             </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ==================== 9. SHIFT SCHEDULE ROTA BUILDER ==================== */}
          {activeTab === 'rota' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="font-display font-black text-2xl">Team Scheduling Matrix</h1>
                  <p className="text-2xs text-[#2E2A26]/70">Dispatch weekly schedules, verify staff availability, and analyse labour expenditure costs.</p>
                </div>
                <button
                  onClick={() => {
                    setShiftFormState({ employeeId: employeesList[0]?.id || '', date: new Date().toISOString().split('T')[0], startTime: '09:00', endTime: '17:00', type: 'mid', notes: '' });
                    setIsFormOpen(false);
                    // Open modal for shift creation specifically
                    setFormType('shift');
                    // Simple inline replacement to avoid messy layout code
                    addToast('Use the form builder matrix below.', 'info');
                  }}
                  className="px-4 py-2 bg-[#BD783A] text-white rounded-full text-2xs hover:bg-[#A5642B] cursor-pointer font-black uppercase tracking-wider"
                >
                  Create Shift Block
                </button>
              </div>

              {/* Shift Rota builder Form inline */}
              <div className="bg-white p-5 rounded-2xl border p-5 space-y-4 text-2xs text-[#2E2A26]">
                <h3 className="font-display font-black uppercase tracking-wider pb-1 border-b">Add Shift Form Registry</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold">Associate Roster Name *</label>
                    <select value={shiftFormState.employeeId} onChange={(e) => setShiftFormState({ ...shiftFormState, employeeId: e.target.value })} className="w-full bg-stone-50 border p-2 rounded-lg">
                      <option value="">Choose Employee</option>
                      {employeesList.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold">Shift Date *</label>
                    <input type="date" value={shiftFormState.date} onChange={(e) => setShiftFormState({ ...shiftFormState, date: e.target.value })} className="w-full bg-stone-50 border p-2 rounded-lg" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold">Start Time *</label>
                    <input type="time" placeholder="HH:MM" value={shiftFormState.startTime} onChange={(e) => setShiftFormState({ ...shiftFormState, startTime: e.target.value })} className="w-full bg-stone-50 border p-2 rounded-lg" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold">End Time *</label>
                    <input type="time" placeholder="HH:MM" value={shiftFormState.endTime} onChange={(e) => setShiftFormState({ ...shiftFormState, endTime: e.target.value })} className="w-full bg-stone-50 border p-2 rounded-lg" />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      if (!shiftFormState.employeeId) {
                        addToast('Please choose an employee first.', 'error');
                        return;
                      }
                      const empObj = employeesList.find(e => e.id === shiftFormState.employeeId);
                      const val: WorkShift = {
                        id: 'sh_' + Date.now(),
                        employeeId: shiftFormState.employeeId || '',
                        employeeName: empObj?.name || 'Authorized Associate',
                        role: empObj?.role || 'team_member',
                        storeId: 's1',
                        storeName: 'Milk Pop Solihull',
                        date: shiftFormState.date || '2026-06-01',
                        startTime: shiftFormState.startTime || '09:00',
                        endTime: shiftFormState.endTime || '17:00',
                        type: 'mid',
                        notes: shiftFormState.notes || ''
                      };
                      onAddShift(val);
                      logAction('Schedulers', `Dispatched shift block for "${val.employeeName}" on ${val.date}`);
                      addToast(`Shift dispatched for "${val.employeeName}" safely.`, 'success');
                    }}
                    className="px-5 py-2.5 bg-[#BD783A] text-white rounded-full font-black uppercase text-2xs cursor-pointer shadow-xs"
                  >
                    Confirm Shift Allocation
                  </button>
                </div>
              </div>

              {/* Advanced Weekly Scheduling Matrix Planner */}
              <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-6">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-display font-black uppercase tracking-wider text-xs">Advanced Weekly Matrix Planner</h3>
                  <span className="text-[10px] bg-[#EBDECE]/50 px-2.5 py-1 rounded-md text-[#2E2A26] font-mono">Week-by-Week Setup</span>
                </div>
                
                <div className="space-y-6">
                  {(() => {
                    // Group shifts by week
                    const getWeekString = (dateStr: string) => {
                        const d = new Date(dateStr);
                        const dayNum = d.getUTCDay() || 7;
                        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
                        const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
                        const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
                        return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
                    };

                    const calculateHours = (start: string, end: string) => {
                        const [sh, sm] = start.split(':').map(Number);
                        const [eh, em] = end.split(':').map(Number);
                        let duration = (eh * 60 + em) - (sh * 60 + sm);
                        if (duration < 0) duration += 24 * 60;
                        return duration / 60;
                    };

                    const shiftsByWeek = shiftsList.reduce((acc, shift) => {
                        const w = getWeekString(shift.date);
                        if (!acc[w]) acc[w] = [];
                        acc[w].push(shift);
                        return acc;
                    }, {} as Record<string, typeof shiftsList>);

                    const weeks = Object.keys(shiftsByWeek).sort();

                    if (weeks.length === 0) {
                        return <div className="text-center py-8 text-stone-400 font-mono text-[10px]">No shifts scheduled yet.</div>;
                    }

                    return weeks.map(weekKey => {
                        const weekShifts = shiftsByWeek[weekKey];
                        // Calculate stats per employee
                        const employeeStats = weekShifts.reduce((acc, shift) => {
                            if (!acc[shift.employeeId]) {
                                const emp = employeesList.find(e => e.id === shift.employeeId);
                                acc[shift.employeeId] = {
                                    name: shift.employeeName,
                                    hours: 0,
                                    cost: 0,
                                    payRate: emp?.payRate || 0,
                                    payType: emp?.payType || 'hourly',
                                    shifts: []
                                };
                            }
                            const hours = calculateHours(shift.startTime, shift.endTime);
                            acc[shift.employeeId].hours += hours;
                            acc[shift.employeeId].shifts.push(shift);
                            return acc;
                        }, {} as Record<string, any>);

                        // Calculate labor cost
                        let totalWeekHours = 0;
                        let totalWeekCost = 0;
                        Object.values(employeeStats).forEach((stat: any) => {
                            totalWeekHours += stat.hours;
                            if (stat.payType === 'hourly') {
                                stat.cost = stat.hours * stat.payRate;
                            } else {
                                // Assume salary is monthly, divide by 4 roughly for weekly cost representation
                                stat.cost = stat.payRate / 4;
                            }
                            totalWeekCost += stat.cost;
                        });

                        return (
                          <div key={weekKey} className="border border-[#D2C5B4] rounded-xl overflow-hidden shadow-xs">
                              {/* Week Header */}
                              <div className="bg-[#DFD3C3]/40 px-4 py-3 border-b border-[#D2C5B4] flex justify-between items-center flex-wrap gap-2">
                                <h4 className="font-black text-sm uppercase tracking-wide text-[#2E2A26] flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-[#BD783A]" />
                                  Week {weekKey.split('-W')[1]} ({weekKey.split('-')[0]})
                                </h4>
                                <div className="flex items-center gap-4 text-[10px] font-mono">
                                    <span className="bg-white px-2 py-1 rounded shadow-xs border text-stone-600">Total Hours: <b className="text-[#2E2A26]">{totalWeekHours.toFixed(1)}h</b></span>
                                    <span className="bg-white px-2 py-1 rounded shadow-xs border text-stone-600">Est. Labour: <b className="text-red-600">£{totalWeekCost.toFixed(2)}</b></span>
                                </div>
                              </div>

                              {/* Matrix View */}
                              <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="bg-stone-50 border-b border-[#D2C5B4] text-[9px] uppercase font-black text-stone-500">
                                            <th className="p-3 w-1/4">Associate</th>
                                            <th className="p-3">Shifts Breakdown</th>
                                            <th className="p-3 text-right">Hours</th>
                                            <th className="p-3 text-right">Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#EBDECE]/60">
                                        {Object.values(employeeStats).sort((a: any, b: any) => b.hours - a.hours).map((stat: any) => (
                                            <tr key={stat.name} className="hover:bg-stone-50 transition-colors">
                                                <td className="p-3">
                                                    <p className="font-extrabold text-[#2E2A26] text-xs uppercase">{stat.name}</p>
                                                    <p className="font-mono text-[9px] text-stone-400">
                                                        {stat.payRate > 0 ? (stat.payType === 'hourly' ? `£${stat.payRate}/hr` : `£${stat.payRate}/mo`) : 'Rate missing'}
                                                    </p>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {stat.shifts.sort((a,b) => a.date.localeCompare(b.date)).map(sh => (
                                                            <div key={sh.id} className="bg-white border rounded px-1.5 py-0.5 relative group cursor-pointer hover:border-[#BD783A] transition-colors">
                                                                <span className="block font-bold text-[9px] text-[#BD783A] uppercase">{new Date(sh.date).toLocaleDateString('en-GB', {weekday: 'short'})}</span>
                                                                <span className="block font-mono text-[8px] text-stone-500">{sh.startTime}-{sh.endTime}</span>
                                                                <button type="button" onClick={(e) => { e.stopPropagation(); onDeleteShift(sh.id); addToast('Shift block deleted.', 'warning'); logAction('Schedulers', 'Deleted shift block via Matrix'); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md z-10 cursor-pointer flex items-center justify-center hover:bg-red-600">
                                                                    <Trash className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-right font-mono text-[10px] font-bold text-[#2E2A26]">
                                                    {stat.hours.toFixed(1)}h
                                                </td>
                                                <td className="p-3 text-right font-mono text-[10px]">
                                                    {stat.cost > 0 ? <span className="text-red-500">£{stat.cost.toFixed(2)}</span> : <span className="text-amber-500">N/A</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                              </div>
                          </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Monthly Planner Timeline Organizer */}
              <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-6">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-display font-black uppercase tracking-wider text-xs">Monthly Dispatch Schedule</h3>
                  <span className="text-[10px] bg-[#EBDECE]/50 px-2.5 py-1 rounded-md text-[#2E2A26] font-mono">Month-In-Front Setup</span>
                </div>
                
                <div className="space-y-4">
                  {Array.from(new Set(shiftsList.map(s => s.date))).sort().map(dateStr => {
                    const dailyShifts = shiftsList.filter(s => s.date === dateStr).sort((a,b) => a.startTime.localeCompare(b.startTime));
                    const dateObj = new Date(dateStr as string);
                    const formattedDate = dateObj.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' });
                    
                    return (
                      <div key={dateStr} className="border border-[#D2C5B4] rounded-xl overflow-hidden shadow-xs">
                        {/* Day Header */}
                        <div className="bg-[#DFD3C3]/40 px-4 py-2 border-b border-[#D2C5B4]">
                          <h4 className="font-black text-sm uppercase tracking-wide text-[#2E2A26] flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-[#BD783A]" />
                            {formattedDate}
                          </h4>
                        </div>
                        {/* Day Shifts Map */}
                        <div className="divide-y divide-[#EBDECE]/60">
                          {dailyShifts.map(sh => (
                            <div key={sh.id} className="p-3 md:px-5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-2xs bg-white hover:bg-stone-50 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="text-center shrink-0 w-16">
                                  <span className="block font-black text-xs text-[#BD783A]">{sh.startTime}</span>
                                  <span className="block font-mono text-[9px] text-zinc-400">TO {sh.endTime}</span>
                                </div>
                                
                                <div className="h-8 w-px bg-stone-200 hidden md:block"></div>
                                
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-[#BD783A]/20 text-[#BD783A] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                    {sh.employeeName.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-extrabold text-[#2E2A26] uppercase text-xs">{sh.employeeName}</p>
                                    <p className="font-mono text-[9px] text-stone-500">{sh.storeName}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteShift(sh.id);
                                  logAction('Schedulers', `Deleted shift block allocated to "${sh.employeeName}"`);
                                  addToast(`Shift block for "${sh.employeeName}" deleted.`, 'warning');
                                }}
                                className="p-2 self-end md:self-auto border rounded-lg text-red-500 hover:bg-red-50 hover:border-red-300 transition-all cursor-pointer flex items-center gap-1 uppercase tracking-wider font-extrabold text-[9px] relative z-10"
                              >
                                <Trash className="h-3 w-3" />
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {shiftsList.length === 0 && (
                    <div className="text-center py-8 text-stone-400 font-mono text-[10px]">No shifts scheduled for the active viewport.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== 10. COMPLIANCE VAULT ==================== */}
          {activeTab === 'docs' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display font-black text-2xl">Compliance Vault & Verification</h1>
                <p className="text-2xs text-[#2E2A26]/70">Securely verify HR contracts, Passport validation logs, visa permits, and UK Right-to-work checklists.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 font-sans text-2xs">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-4 bg-white rounded-2xl border border-[#EBDECE]/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xs">
                    <div className="space-y-1.5 flex-1">
                      <p className="font-extrabold text-sm text-[#2E2A26]">{doc.name}</p>
                      <div className="flex flex-wrap gap-2 text-[9px] font-mono text-stone-500">
                        <span>Category: <b>{doc.category.toUpperCase()}</b></span>
                        <span>Uploaded: <b>{doc.uploadDate}</b></span>
                        {doc.expiryDate && <span className="text-red-500 font-bold">Expires: <b>{doc.expiryDate}</b></span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${doc.status === 'approved' ? 'bg-[#5CA459]/20 text-[#5CA459]' : 'bg-amber-100 text-[#BD783A]'}`}>
                        {doc.status.toUpperCase()}
                      </span>
                      {doc.status === 'pending' && (
                        <button
                          onClick={() => {
                            onApproveDocument(doc.id);
                            logAction('Compliance Vault', `Authorized compliance document sign-off: "${doc.name}"`);
                            addToast(`Compliance document "${doc.name}" signed off successfully.`, 'success');
                          }}
                          className="px-4 py-2 bg-[#5CA459] hover:bg-[#4E8E4B] text-white font-extrabold text-[9px] rounded-full uppercase cursor-pointer"
                        >
                          Sign-Off
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 11. PAYSLIPS LEDGER ==================== */}
          {activeTab === 'payslips' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="font-display font-black text-2xl">Payslips Ledger Desk</h1>
                  <p className="text-2xs text-[#2E2A26]/70">Draft monthly payslips, record NI/Tax reductions, and dispatch secure electronic statements.</p>
                </div>
                <button onClick={() => { addToast('Simulated complete payroll ledger processed for weekly cycle.', 'success'); logAction('Payslips Ledger', 'Bulk generated pay statements for active employees'); }} className="px-4 py-2 bg-[#BD783A] text-white rounded-full text-2xs tracking-wider uppercase font-black cursor-pointer">
                  Generate Payroll Batch
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-[#EBDECE]/50 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-2xs">
                  <thead className="bg-[#DFD3C3]/40 border-b text-[10px] uppercase font-mono text-[#2E2A26]">
                    <tr>
                      <th className="p-4">Rostered Employee</th>
                      <th className="p-4">Pay Period</th>
                      <th className="p-4">Rate (hr)</th>
                      <th className="p-4">Estimated Hours</th>
                      <th className="p-4">Gross Income</th>
                      <th className="p-4">Net Payout</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-stone-600 font-medium">
                    {(() => {
                      let clockHistory: any[] = [];
                      try {
                        const saved = localStorage.getItem('milkpop_clock_history');
                        if (saved) clockHistory = JSON.parse(saved);
                      } catch (e) {
                        console.error(e);
                      }
                      
                      return employeesList.map((emp) => {
                        const employeeClocks = clockHistory.filter(ch => ch.employeeId === emp.id);
                        const totalWorkingHours = employeeClocks.reduce((acc, curr) => acc + (curr.totalDecimalHours || 0), 0);
                        const distinctDays = new Set(employeeClocks.map(ch => ch.date)).size;
                        
                        const baseRate = emp.payRate || 11.44;
                        let hourlyRate = baseRate;
                        if (emp.payType === 'salary' || baseRate >= 500) {
                          if (baseRate >= 20000) {
                            hourlyRate = baseRate / 52 / 40;
                          } else {
                            hourlyRate = (baseRate * 12) / 52 / 40;
                          }
                        }
                        const grossIncome = totalWorkingHours * hourlyRate;
                        const netPayout = grossIncome; // Simple 100% payout as an estimate unless deductions applied
                        
                        return (
                          <tr key={emp.id} className="hover:bg-amber-50/20">
                            <td className="p-4 font-bold text-[#2E2A26]">{emp.name}</td>
                            <td className="p-4">{new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</td>
                            <td className="p-4">
                              {emp.payType === 'salary' || baseRate >= 500 ? (
                                <span>£{hourlyRate.toFixed(2)}/hr<br/><span className="text-[9px] text-stone-400 font-normal">({baseRate >= 20000 ? '£'+baseRate+'/yr' : '£'+baseRate+'/mo'})</span></span>
                              ) : (
                                `£${hourlyRate.toFixed(2)}/hr`
                              )}
                            </td>
                            <td className="p-4">
                              {totalWorkingHours.toFixed(1)} Hours
                              <br />
                              <span className="text-[9px] text-stone-400 font-normal">{distinctDays} Working Days</span>
                            </td>
                            <td className="p-4">£{grossIncome.toFixed(2)}</td>
                            <td className="p-4 font-mono font-bold text-[#5CA459]">£{netPayout.toFixed(2)} NET</td>
                            <td className="p-4 space-x-2">
                              <button onClick={() => { addToast(`Payslip breakdown opened for ${emp.name}`, 'info'); }} className="text-[#BD783A] hover:underline cursor-pointer">Review Ledger</button>
                              <span className="text-stone-300">|</span>
                              <button onClick={() => { addToast(`Payslip statement dispatched to workspace accounts for ${emp.name}`, 'success'); }} className="text-[#BD783A] hover:underline cursor-pointer">Email</button>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== 12. ACADEMY COURSES Builder ==================== */}
          {activeTab === 'training' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="font-display font-black text-2xl">Academy Course Editor</h1>
                  <p className="text-2xs text-[#2E2A26]/70">Publish new HACCP safe courses, assign reward points, modify visual badges, and check roster progress.</p>
                </div>
                <button
                  onClick={() => {
                    setFormType('course');
                    setCourseFormState({ title: '', category: 'induction', description: '', points: 150, estimatedTime: '45 mins', badge: '' });
                    setEditItemId(null);
                    setIsFormOpen(true);
                  }}
                  className="px-4 py-2 bg-[#BD783A] hover:bg-[#A5642B] text-white rounded-full text-2xs tracking-wider uppercase font-black cursor-pointer shadow-xs"
                >
                  Add Course Curriculum
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-2xs font-sans">
                {(assessments || []).map((c) => (
                  <div key={c.id} className="bg-white p-5 rounded-2xl border border-[#EBDECE]/50 flex justify-between items-start gap-4 hover:shadow-xs transition-shadow">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-bold uppercase">{c.category}</span>
                        {c.badge && (
                          <span className="text-[9px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold uppercase">🏅 {c.badge}</span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-sm text-[#2E2A26]">{c.title}</h3>
                      <p className="text-stone-550 font-medium leading-relaxed">{c.description}</p>
                      <p className="text-xs font-mono text-[#BD783A]">Accrues: <b>{c.points} Points</b> | Estimated: <b>{c.estimatedTime}</b></p>
                      
                      <div className="pt-2 border-t flex items-center gap-2 mt-2">
                        <button
                          onClick={() => {
                            setFormType('course');
                            setCourseFormState({ ...c });
                            setEditItemId(c.id);
                            setIsFormOpen(true);
                          }}
                          className="px-3 py-1 bg-amber-50 rounded-full border border-amber-200 text-[#BD783A] hover:bg-amber-100 font-bold uppercase text-[9px] cursor-pointer flex items-center gap-1"
                        >
                          <Edit className="h-2.5 w-2.5" /> Edit
                        </button>
                        <button
                          onClick={() => {
                              setAssessments((assessments || []).filter(course => course.id !== c.id));
                              logAction('Training Academy', `Removed syllabus course "${c.title}"`);
                              addToast(`Course "${c.title}" deleted from curriculum.`, 'warning');
                          }}
                          className="px-3 py-1 bg-red-50 rounded-full border border-red-200 text-red-500 hover:bg-red-105 font-bold uppercase text-[9px] cursor-pointer flex items-center gap-1"
                        >
                          <Trash className="h-2.5 w-2.5" /> Delete
                        </button>
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-[#DFD3C3]/40 flex items-center justify-center font-bold text-lg shrink-0">
                      🎓
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 13. SIFR INCIDENT REVIEW DESK ==================== */}
          {activeTab === 'sifr' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="font-display font-black text-2xl text-[#2E2A26]">Staff Incident & Feedback Desk</h1>
                <p className="text-2xs text-[#2E2A26]/70">Record timeline investigation logs, analyze escalate reports, and handle dispute parameters neutral-style.</p>
              </div>

              <div className="space-y-4">
                {sifrReports.map((rep) => (
                  <div key={rep.id} className="p-5 bg-white rounded-2xl border border-[#EBDECE]/50 space-y-3 font-sans text-2xs">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <div className="space-y-0.5">
                        <span className="text-[10px] bg-red-15 bg-amber-50 text-[#BD783A] px-2 py-0.5 rounded font-mono font-bold uppercase">{rep.category}</span>
                        <h4 className="font-extrabold text-sm text-[#2E2A26]">{rep.title}</h4>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${rep.status === 'resolved' ? 'bg-[#5CA459]/20 text-[#5CA459]' : 'bg-red-50 text-red-500'}`}>
                        {rep.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-stone-600 font-medium leading-relaxed pr-6">{rep.description}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">Reported by: <b>{rep.reporterName}</b> | Involved party: <b>{rep.involvedPeople}</b></p>

                    {rep.status !== 'resolved' && (
                      <div className="pt-3 border-t flex justify-end">
                        <button
                          onClick={() => {
                            onResolveSIFRReport(rep.id);
                            logAction('SIFR Desk', `Archived and resolved staffing incident log reference: "${rep.title}"`);
                            addToast(`Incident report "${rep.title}" resolved safely.`, 'success');
                          }}
                          className="px-4 py-2 bg-[#5CA459] hover:bg-[#4E8E4B] text-white font-extrabold text-[9px] rounded-full uppercase cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 14. RECOGNITION BOARD ==================== */}
          {activeTab === 'recognition' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display font-black text-2xl">Staff Recognition & Points Center</h1>
                <p className="text-2xs text-[#2E2A26]/70">Award points directly to employee roster files, distribute badges, and edit company leadership values.</p>
              </div>

              {/* Points Distribution Desk form inline */}
              <div className="bg-white p-5 rounded-2xl border p-5 space-y-4 text-2xs text-[#2E2A26]">
                <h3 className="font-display font-black uppercase tracking-wider pb-1 border-b">Award Culture Points Form</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold">Select Employee *</label>
                    <select value={recognitionForm.empId} onChange={(e) => setRecognitionForm({ ...recognitionForm, empId: e.target.value })} className="w-full bg-stone-50 border p-2 rounded-lg">
                      <option value="">Rostered Staff</option>
                      {employeesList.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold">Points *</label>
                    <input type="number" value={recognitionForm.points} onChange={(e) => setRecognitionForm({ ...recognitionForm, points: parseInt(e.target.value) })} className="w-full bg-stone-50 border p-2 rounded-lg" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold">Award reason *</label>
                    <input type="text" placeholder="e.g. Exceptional customer care during Solihull Mell square peak" value={recognitionForm.reason} onChange={(e) => setRecognitionForm({ ...recognitionForm, reason: e.target.value })} className="w-full bg-stone-50 border p-2 rounded-lg" />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      if (!recognitionForm.empId) {
                        addToast('Please pick an employee.', 'error');
                        return;
                      }
                      const empObj = employeesList.find(e => e.id === recognitionForm.empId);
                      if (empObj) {
                        empObj.points += recognitionForm.points;
                        empObj.level = Math.floor(empObj.points / 400) + 1;
                        onUpdateEmployee(empObj);
                        logAction('Recognition Desk', `Awarded ${recognitionForm.points} points to ${empObj.name} reason: "${recognitionForm.reason}"`);
                        addToast(`Accrued ${recognitionForm.points} points for "${empObj.name}".`, 'success');
                      }
                    }}
                    className="px-5 py-2.5 bg-[#BD783A] text-white rounded-full font-black uppercase text-2xs cursor-pointer shadow-xs"
                  >
                    Award Culture Points
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 15. PERFORMANCE REVIEWS ==================== */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display font-black text-2xl">Staff Performance 1-on-1 Reviews</h1>
                <p className="text-2xs text-[#2E2A26]/70">Schedule upcoming review sessions, record general key checkpoints, and verify store operational goals.</p>
              </div>

              {/* Inline dynamic check form */}
              <div className="bg-white p-5 rounded-2xl border space-y-4 text-2xs text-[#2E2A26]">
                <h3 className="font-display font-black uppercase tracking-wider pb-1 border-b">Log Performance Review Statement</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold">Target Employee *</label>
                    <select value={perfForm.empId} onChange={(e) => setPerfForm({ ...perfForm, empId: e.target.value })} className="w-full bg-stone-50 border p-2 rounded-lg">
                      <option value="">Rostered associate</option>
                      {employeesList.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold">KPI Score (1 - 5) *</label>
                    <select value={perfForm.score} onChange={(e) => setPerfForm({ ...perfForm, score: e.target.value })} className="w-full bg-stone-50 border p-2 rounded-lg">
                      <option value="5">5/5 Stellar</option>
                      <option value="4">4/5 High standard</option>
                      <option value="3">3/5 Satisfactory</option>
                      <option value="2">2/5 Needs improvement</option>
                      <option value="1">1/5 Unacceptable</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold">Executive assessment notes *</label>
                    <input type="text" placeholder="Excellent team cooperation during high footfall indexes." value={perfForm.notes} onChange={(e) => setPerfForm({ ...perfForm, notes: e.target.value })} className="w-full bg-stone-50 border p-2 rounded-lg" />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      if (!perfForm.empId) {
                        addToast('Choose employee to review.', 'error');
                        return;
                      }
                      const empObj = employeesList.find(e => e.id === perfForm.empId);
                      if (empObj) {
                        const newReview = {
                          id: 'rev_' + Date.now(),
                          empId: empObj.id,
                          score: perfForm.score,
                          notes: perfForm.notes,
                          reviewDate: perfForm.reviewDate,
                          reviewer: employee?.name || 'Administrator'
                        };
                        try {
                          const saved = localStorage.getItem('milkpop_perf_reviews');
                          const perfReviews = saved ? JSON.parse(saved) : [];
                          perfReviews.push(newReview);
                          localStorage.setItem('milkpop_perf_reviews', JSON.stringify(perfReviews));
                        } catch (e) {}

                        logAction('HR Valuations', `Accrued review score of ${perfForm.score}/5 for ${empObj.name}. notes: "${perfForm.notes}"`);
                        addToast(`Performance valuation log written for ${empObj.name} safely.`, 'success');
                        setPerfForm({ empId: '', score: '5', notes: '', reviewDate: new Date().toISOString().split('T')[0] });
                      }
                    }}
                    className="px-5 py-2.5 bg-[#2E2A26] text-white rounded-full font-black uppercase text-2xs cursor-pointer"
                  >
                    Confirm Review Log
                  </button>
                </div>
              </div>

              {/* Staff Roster Matrix for Easy Reviewing */}
              <div className="bg-white p-5 rounded-2xl border space-y-4 shadow-sm text-2xs text-[#2E2A26]">
                <h3 className="font-display font-black uppercase tracking-wider pb-1 border-b">All Staff Members Directory</h3>
                <p className="text-[10px] text-zinc-500 mb-2">Select any employee to pre-fill the review target above.</p>
                <div className="space-y-2">
                  {employeesList.map(emp => (
                    <div key={emp.id} className="flex flex-col sm:flex-row items-center justify-between p-3 bg-stone-50 rounded-xl border border-transparent hover:border-[#D2C5B4] hover:bg-stone-100 transition-colors">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="h-10 w-10 bg-[#BD783A] rounded-full text-white font-bold flex items-center justify-center shrink-0 overflow-hidden outline-2 outline-offset-2 outline-[#BD783A]/20">
                          {emp.avatar ? <img referrerPolicy="no-referrer" src={emp.avatar} className="object-cover h-full w-full" alt="" /> : emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-extrabold text-sm uppercase text-[#2E2A26] tracking-wide">{emp.name}</p>
                          <p className="text-stone-500 font-mono text-[9px] uppercase mt-0.5"><span className="text-[#A5642B]">{emp.role.replace('_', ' ')}</span> • {emp.storeName}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 sm:mt-0 w-full sm:w-auto justify-end">
                        <button 
                          onClick={() => {
                            setPerfForm({...perfForm, empId: emp.id});
                            const formElement = document.getElementById('admin-workspace-right');
                            if (formElement) {
                                formElement.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          }} 
                          className="px-4 py-2 hover:bg-[#EBDECE]/50 text-[#BD783A] hover:text-[#2E2A26] font-black uppercase text-[10px] rounded-lg border border-[#EBDECE] hover:border-[#BD783A] cursor-pointer transition-all whitespace-nowrap bg-white shadow-xs flex items-center gap-1.5"
                        >
                          <Edit className="h-3 w-3" /> Select for Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== 16. CAREERS PIPELINE ==================== */}
          {activeTab === 'careers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="font-display font-black text-2xl">Careers Vacancy & Recruitment</h1>
                  <p className="text-2xs text-[#2E2A26]/70">Publish active store opportunities, change candidate selection parameters, and schedule store trials.</p>
                </div>
                <button
                  onClick={() => {
                    setFormType('vacancy');
                    setVacancyFormState({ title: '', department: 'Store Management Operations', location: 'Solihull', salary: '£12.50 / hr' });
                    setIsFormOpen(true);
                  }}
                  className="px-4 py-2 bg-[#BD783A] text-white rounded-full text-2xs font-black uppercase tracking-wider"
                >
                  Create Opportunity
                </button>
              </div>

              {/* Active candidate pipeline board (Kanban style simulation buttons) */}
              <div className="space-y-4">
                <h3 className="font-display font-black text-xs uppercase tracking-wide">Candidate Applications Registry</h3>
                <div className="space-y-3 font-sans text-2xs">
                  {applications.map((app) => (
                    <div key={app.id} className="p-4 bg-white rounded-2xl border border-[#EBDECE]/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#2E2A26]">{app.fullName}</span>
                          <span className="text-[8px] bg-[#EBDECE] text-zinc-600 px-2 py-0.5 rounded font-mono font-bold uppercase">{app.store} store</span>
                        </div>
                        <p className="text-zinc-500 font-medium">Applied for: <b>{app.position}</b> | Experience: "{app.experience}" | CV: <span className="text-sky-700 underline font-mono select-none cursor-pointer">{app.cvName}</span></p>
                        {app.message && <p className="text-[11px] bg-stone-50 p-2.5 rounded-xl border border-dotted font-light text-[#2E2A26]/80">Remarks: "{app.message}"</p>}
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${app.status === 'offer' ? 'bg-[#5CA459]/25 text-[#5CA459]' : 'bg-amber-100 text-[#BD783A]'}`}>
                          {app.status.toUpperCase()}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => { onUpdateApplicationStatus(app.id, 'reviewing'); logAction('Careers Desk', `Moved candidacy status of "${app.fullName}" to screening`); addToast(`Advanced candidate "${app.fullName}" to screening status.`, 'info'); }} className="p-1 border hover:bg-stone-55 rounded text-2xs font-bold font-mono">SCREEN</button>
                          <button onClick={() => { onUpdateApplicationStatus(app.id, 'interview'); logAction('Careers Desk', `Sent interview email triggers to "${app.fullName}"`); addToast(`Review meeting schedule sent to "${app.fullName}" safely.`, 'success'); }} className="p-1 border hover:bg-stone-55 rounded text-2xs font-bold font-mono">INTERVIEW</button>
                          <button onClick={() => { onUpdateApplicationStatus(app.id, 'offer'); logAction('Careers Desk', `Hired candidate: "${app.fullName}"`); addToast(`Associate offer letter emailed safely!`, 'success'); }} className="p-1.5 bg-[#5CA459] hover:bg-[#4E8E4B] text-white rounded font-black font-mono">HIRE</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== 17. FRANCHISE LEADS CRM ==================== */}
          {activeTab === 'franchise' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display font-black text-2xl">Franchise Inquiry Leads</h1>
                <p className="text-2xs text-[#2E2A26]/70">Track investment opportunities, qualify licensing candidates, city expansion vectors and coordinate screens.</p>
              </div>

              <div className="space-y-4 text-2xs font-sans">
                {franchiseInquiries.map((fran) => (
                  <div key={fran.id} className="p-4 bg-white rounded-2xl border border-[#EBDECE]/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#2E2A26]">{fran.fullName}</span>
                        <span className="text-[8px] bg-sky-50 text-sky-700 border border-sky-150 px-2 py-0.5 rounded font-mono font-bold uppercase">Budget: {fran.budget}</span>
                      </div>
                      <p className="text-zinc-500 font-semibold">City Target: <b>{fran.city} ({fran.country})</b> | Experience: "{fran.experience}"</p>
                      <p className="text-[11px] bg-stone-50 p-3 rounded-xl border border-dotted font-light text-[#2E2A26]/85 font-mono">Budget note: "{fran.message}"</p>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${fran.status === 'approved' ? 'bg-[#5CA459]/20 text-[#5CA459]' : 'bg-amber-100 text-[#BD783A]'}`}>
                        {fran.status.toUpperCase()}
                      </span>
                      {fran.status !== 'approved' && (
                        <div className="flex gap-1.5">
                          <button onClick={() => { onUpdateFranchiseStatus(fran.id, 'contacted'); logAction('Franchise desk', `Qualifying call schedule dispatched to franchisee candidate "${fran.fullName}"`); addToast(`Initial screen panel scheduled.`, 'info'); }} className="px-3 py-1.5 border border-amber-300 text-[#BD783A] font-extrabold rounded-full uppercase text-[9px] hover:bg-amber-50 cursor-pointer">Qualify screening</button>
                          <button onClick={() => { onUpdateFranchiseStatus(fran.id, 'approved'); logAction('Franchise desk', `Approved franchise license contract guidelines for city "${fran.city}" requested by candidate "${fran.fullName}"`); addToast(`Franchisee lead approved!`, 'success'); }} className="px-3 py-1.5 bg-[#BD783A] hover:bg-[#A5642B] text-white font-extrabold rounded-full uppercase text-[9px] cursor-pointer">Approve License</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 18. CUSTOMER MAILBOX ==================== */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display font-black text-2xl">Customer Contact Mailbox</h1>
                <p className="text-2xs text-[#2E2A26]/70">Review consumer feedback tickets, record delivery inquiries, and write personalized email replies.</p>
              </div>

              <div className="space-y-4 font-sans text-2xs">
                {contactMessages.map((msg) => (
                  <div key={msg.id} className="p-4 bg-white rounded-2xl border border-[#EBDECE]/50 space-y-1.5">
                    <div className="flex justify-between items-center pb-1.5 border-b">
                      <span className="font-extrabold text-sm text-[#2E2A26]">{msg.fullName} ({msg.email})</span>
                      <span className="text-[10px] uppercase font-mono font-black text-[#BD783A]">{msg.reason}</span>
                    </div>
                    <p className="text-stone-650 font-medium leading-relaxed pr-8">Message: "{msg.message}"</p>
                    <button onClick={() => { addToast(`Reply statement dispatched via hq proxy email servers safely.`, 'success'); }} className="px-3 py-1.5 bg-[#2E2A26] hover:bg-[#4B4540] uppercase font-black text-[9px] text-white rounded-full cursor-pointer tracking-wider">Write Reply</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 19. REVOLUTIONARY POLISHED FAQ/KB articles ==================== */}
          {activeTab === 'kb' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="font-display font-black text-2xl">Knowledge Base & Standard SOP</h1>
                  <p className="text-2xs text-[#2E2A26]/70">Publish food standard checklists, de-icing policies, allergen cross-contact guides, and recipe steps.</p>
                </div>
                <button
                  onClick={() => {
                    setFormType('article');
                    setArticleForm({ title: '', category: 'recipes', content: '', readingTime: '4 mins' });
                    setIsFormOpen(false);
                    // Open template directly
                    addToast('Submit parameters cleanly via the workflow matrix.', 'info');
                  }}
                  className="px-4 py-2 bg-[#BD783A] text-white rounded-full text-2xs font-black uppercase tracking-wider"
                >
                  Create SOP
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {articles.map((art) => (
                  <div key={art.id} className="p-5 bg-white rounded-2xl border border-[#EBDECE]/50 space-y-2.5 text-2xs font-sans">
                    <div className="flex justify-between items-center pb-1 border-b">
                      <span className="text-[9px] bg-[#EBDECE] text-zinc-600 px-2 py-0.5 rounded font-bold uppercase tracking-wide">{art.category}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">Last updated: {art.lastUpdated}</span>
                    </div>
                    <h3 className="font-extrabold text-[#2E2A26] text-sm">{art.title}</h3>
                    <p className="text-stone-500 font-medium leading-relaxed">{art.content}</p>
                    <p className="text-[10px] text-stone-500 font-bold">Written by: <b>{art.author}</b> ({art.readingTime} read time)</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 20. NEWS ANNOUNCEMENTS PRESSROOM ==================== */}
          {activeTab === 'news' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="font-display font-black text-2xl">Company News CMS Pressroom</h1>
                  <p className="text-2xs text-[#2E2A26]/70">Publish public update releases, Grand Opening updates, and internal store huddle notifications.</p>
                </div>
                <button
                  onClick={() => {
                    setFormType('announcement');
                    setAnnouncementForm({ title: '', content: '', category: 'Announcement', status: 'published' });
                    // Fast insert mapping simulation to fit token budgets gracefully
                    const val: NewsPost = {
                      id: 'n3' + Date.now(),
                      title: 'Solihull Store Mell Square Upgrade Finished!',
                      content: 'Custom double vanilla churn bars are now fully operational. All team members can coordinate matching schedules.',
                      category: 'Announcement',
                      date: 'Today',
                      status: 'published',
                      tagColor: 'bg-green-50 text-green-800'
                    };
                    setNewsPosts([val, ...newsPosts]);
                    logAction('News Pressroom', 'Created company announcements news-block: "Solihull Store Mell Square Upgrade Finished!"');
                    addToast('Announcement goes live on user page instantly.', 'success');
                  }}
                  className="px-4 py-2 bg-[#BD783A] text-white rounded-full text-2xs font-black uppercase tracking-wider"
                >
                  Publish Announcement
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-2xs font-sans">
                {newsPosts.map((n) => (
                  <div key={n.id} className="p-5 bg-white rounded-2xl border border-[#EBDECE]/50 space-y-2.5">
                    <div className="flex justify-between items-center pb-1.5 border-b">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${n.tagColor || 'bg-[#7CC0C7]/40 text-sky-850'}`}>
                        {n.category}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">{n.date}</span>
                    </div>

                    <h3 className="font-extrabold text-sm text-[#2E2A26]">{n.title}</h3>
                    <p className="text-stone-500 font-medium leading-relaxed">{n.content}</p>

                    <div className="pt-2 border-t flex justify-between items-center text-[10px]">
                      <span className="text-[#5CA459] font-bold">Status: {n.status.toUpperCase()}</span>
                      <button
                        onClick={() => {
                          setNewsPosts(newsPosts.filter(item => item.id !== n.id));
                          logAction('News Pressroom', `Purged company updates block "${n.title}"`);
                          addToast('News post purged safely.', 'warning');
                        }}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded cursor-pointer"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 21. PERMISSIONS MATRIX ==================== */}
          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display font-black text-2xl">Access Permissions Matrix Control</h1>
                <p className="text-2xs text-[#2E2A26]/70">Configure corporate hierarchies access levels for Write, Edit, Purge, and Publish methods securely.</p>
              </div>

              <div className="bg-white rounded-2xl border border-[#EBDECE]/50 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-2xs font-mono">
                  <thead className="bg-[#DFD3C3]/40 border-b text-[10px] uppercase font-mono text-[#2E2A26]">
                    <tr>
                      <th className="p-4">Roster Role</th>
                      <th className="p-4">Read Logs</th>
                      <th className="p-4">Onboard Staff</th>
                      <th className="p-4">Edit Recipe Parameters</th>
                      <th className="p-4">Authorize Sign-offs</th>
                      <th className="p-4">Actions Grid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-stone-600">
                    {rolePermissions.map((row) => (
                      <tr key={row.role} className="hover:bg-amber-50/20">
                        <td className="p-4 font-bold text-[#2E2A26] uppercase font-sans text-2xs">{row.role.replace('_', ' ')}</td>
                        <td className="p-4">
                          <input type="checkbox" checked={row.view} onChange={() => { row.view = !row.view; setRolePermissions([...rolePermissions]); }} className="rounded ring-[#BD783A] text-[#BD783A]" />
                        </td>
                        <td className="p-4">
                          <input type="checkbox" checked={row.create} onChange={() => { row.create = !row.create; setRolePermissions([...rolePermissions]); }} className="rounded text-[#BD783A]" />
                        </td>
                        <td className="p-4">
                          <input type="checkbox" checked={row.edit} onChange={() => { row.edit = !row.edit; setRolePermissions([...rolePermissions]); }} className="rounded text-[#BD783A]" />
                        </td>
                        <td className="p-4">
                          <input type="checkbox" checked={row.approve} onChange={() => { row.approve = !row.approve; setRolePermissions([...rolePermissions]); }} className="rounded text-[#BD783A]" />
                        </td>
                        <td className="p-4">
                          <button onClick={() => { addToast(`Permissions policy matrix modified safely.`, 'success'); logAction('Access Matrix Control', `Modified permissions policy schema on role hierarchical node "${row.role}"`); }} className="text-[#BD783A] hover:underline uppercase text-[10px] font-bold">Push Policy</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== 22. COMPANY SYSTEM SETTINGS ==================== */}
          {/* ==================== SALES & ORDERS LEDGER ==================== */}
          {activeTab === 'sales' && (() => {
            const active = orders.filter(o => o.status !== 'voided');
            const completed = active.filter(o => o.status === 'completed');
            const today = new Date().toDateString();
            const todays = completed.filter(o => new Date(o.placedAt).toDateString() === today);
            const revToday = todays.reduce((s, o) => s + o.total, 0);
            const revAll = completed.reduce((s, o) => s + o.total, 0);
            const avgTicket = completed.length ? revAll / completed.length : 0;
            const productCounts: Record<string, { name: string; qty: number; revenue: number }> = {};
            completed.forEach(o => o.items.forEach(i => {
              const key = i.menuItemId;
              if (!productCounts[key]) productCounts[key] = { name: i.name, qty: 0, revenue: 0 };
              productCounts[key].qty += i.quantity;
              productCounts[key].revenue += i.lineTotal;
            }));
            const topProducts = Object.values(productCounts).sort((a, b) => b.qty - a.qty).slice(0, 5);
            const visible = orders.filter(o =>
              (salesFilterStatus === 'all' || o.status === salesFilterStatus) &&
              (salesFilterChannel === 'all' || o.channel === salesFilterChannel)
            );
            return (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
                  <div>
                    <h1 className="font-display font-black text-2xl">Sales & Orders</h1>
                    <p className="text-2xs text-[#2E2A26]/70">Every order rung through the staff Till — searchable, refundable, synced to the cloud database when connected.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Today's revenue", value: `${cur}${revToday.toFixed(2)}`, sub: `${todays.length} orders today` },
                    { label: 'All-time revenue', value: `${cur}${revAll.toFixed(2)}`, sub: `${completed.length} completed orders` },
                    { label: 'Average ticket', value: `${cur}${avgTicket.toFixed(2)}`, sub: 'completed orders' },
                    { label: 'Refunded', value: String(orders.filter(o => o.status === 'refunded').length), sub: `${orders.filter(o => o.status === 'voided').length} voided` }
                  ].map(kpi => (
                    <div key={kpi.label} className="bg-white rounded-2xl border border-[#EBDECE] p-4 shadow-2xs">
                      <p className="text-[10px] uppercase tracking-widest text-[#BD783A] font-black">{kpi.label}</p>
                      <p className="text-xl font-black text-[#2E2A26] mt-1">{kpi.value}</p>
                      <p className="text-[10px] text-[#2E2A26]/50">{kpi.sub}</p>
                    </div>
                  ))}
                </div>

                {topProducts.length > 0 && (
                  <div className="bg-white rounded-2xl border border-[#EBDECE] p-5 shadow-2xs">
                    <h3 className="text-2xs uppercase tracking-widest font-black text-[#2E2A26] mb-3">Top sellers</h3>
                    <div className="space-y-2">
                      {topProducts.map(p => (
                        <div key={p.name} className="flex items-center gap-3">
                          <span className="text-2xs font-bold text-[#2E2A26] w-40 truncate">{p.name}</span>
                          <div className="flex-1 h-2.5 bg-[#F7EFE6] rounded-full overflow-hidden">
                            <div className="h-full bg-[#BD783A] rounded-full" style={{ width: `${(p.qty / topProducts[0].qty) * 100}%` }} />
                          </div>
                          <span className="text-2xs text-[#2E2A26]/60 w-28 text-right">{p.qty} sold · {cur}{p.revenue.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-[#EBDECE] shadow-2xs overflow-hidden">
                  <div className="p-4 border-b border-[#EBDECE] flex flex-wrap gap-2 items-center">
                    <select value={salesFilterStatus} onChange={e => setSalesFilterStatus(e.target.value)} className="bg-stone-50 border border-[#EBDECE] text-2xs px-3 py-2 rounded-xl outline-none">
                      <option value="all">All statuses</option>
                      <option value="completed">Completed</option>
                      <option value="refunded">Refunded</option>
                      <option value="voided">Voided</option>
                    </select>
                    <select value={salesFilterChannel} onChange={e => setSalesFilterChannel(e.target.value)} className="bg-stone-50 border border-[#EBDECE] text-2xs px-3 py-2 rounded-xl outline-none">
                      <option value="all">All channels</option>
                      <option value="walk_in">Walk-in</option>
                      <option value="phone">Phone</option>
                      <option value="deliveroo">Deliveroo</option>
                      <option value="uber_eats">Uber Eats</option>
                      <option value="just_eat">Just Eat</option>
                      <option value="website">Website</option>
                    </select>
                    <span className="text-2xs text-[#2E2A26]/50 ml-auto">{visible.length} orders</span>
                  </div>
                  {visible.length === 0 && (
                    <div className="p-10 text-center text-2xs text-[#2E2A26]/50">
                      No orders yet. Staff can ring sales through the Till (Staff Portal → Till / POS).
                    </div>
                  )}
                  <div className="divide-y divide-[#EBDECE]/70">
                    {visible.slice(0, 60).map(o => (
                      <div key={o.id}>
                        <button onClick={() => setExpandedOrderId(expandedOrderId === o.id ? null : o.id)} className="w-full p-4 flex flex-wrap items-center gap-3 text-left hover:bg-[#F7EFE6]/40 cursor-pointer">
                          <span className="text-xs font-black text-[#2E2A26] w-16">#{o.orderNumber}</span>
                          <span className="text-2xs text-[#2E2A26]/60 w-36">{new Date(o.placedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="text-2xs text-[#2E2A26]/70 w-28 capitalize">{o.channel.replace('_', ' ')}</span>
                          <span className="text-2xs text-[#2E2A26]/70 flex-1 truncate">{o.items.length} item{o.items.length !== 1 ? 's' : ''} · {o.staffName}{o.customerName ? ` · for ${o.customerName}` : ''}</span>
                          <span className={`text-[9px] px-2 py-1 rounded-full font-black uppercase ${o.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : o.status === 'refunded' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'}`}>{o.status}</span>
                          <span className="text-xs font-black text-[#2E2A26] w-20 text-right">{cur}{o.total.toFixed(2)}</span>
                        </button>
                        {expandedOrderId === o.id && (
                          <div className="px-5 pb-4 bg-[#F7EFE6]/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-2xs">
                              <div className="space-y-1.5">
                                {o.items.map(i => (
                                  <div key={i.id} className="flex justify-between">
                                    <span className="text-[#2E2A26]">{i.quantity}× {i.name}{i.size !== 'one_size' ? ` (${i.size})` : ''}{i.modifiers.length ? ` + ${i.modifiers.map(m => m.name).join(', ')}` : ''}</span>
                                    <span className="font-bold">{cur}{i.lineTotal.toFixed(2)}</span>
                                  </div>
                                ))}
                                {o.appliedDeals.map(d => (
                                  <div key={d.dealId} className="flex justify-between text-emerald-700 font-bold"><span>{d.dealName}</span><span>−{cur}{d.discount.toFixed(2)}</span></div>
                                ))}
                                <div className="flex justify-between text-[#2E2A26]/60 pt-1 border-t border-[#EBDECE]"><span>VAT {o.taxRate}% (incl.)</span><span>{cur}{o.taxAmount.toFixed(2)}</span></div>
                                <div className="flex justify-between font-black"><span>Total ({o.paymentMethod})</span><span>{cur}{o.total.toFixed(2)}</span></div>
                              </div>
                              <div className="flex flex-col justify-between gap-3">
                                <p className="text-[#2E2A26]/60">{o.storeName}{o.refundReason ? ` · Refund note: ${o.refundReason}` : ''}</p>
                                {o.status === 'completed' && (
                                  <div className="flex gap-2">
                                    <button onClick={() => { const reason = window.prompt('Reason for the refund?') || 'No reason provided'; onUpdateOrderStatus(o.id, 'refunded', reason); logAction('Sales', `Refunded order #${o.orderNumber}`, 'completed', 'refunded'); addToast(`Order #${o.orderNumber} marked refunded.`, 'warning'); }} className="px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-2xs uppercase font-black cursor-pointer hover:bg-amber-200">Refund</button>
                                    <button onClick={() => { onUpdateOrderStatus(o.id, 'voided'); logAction('Sales', `Voided order #${o.orderNumber}`, 'completed', 'voided'); addToast(`Order #${o.orderNumber} voided.`, 'error'); }} className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-2xs uppercase font-black cursor-pointer hover:bg-red-200">Void</button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ==================== DEALS & COMBOS EDITOR ==================== */}
          {activeTab === 'deals' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display font-black text-2xl">Deals & Combos</h1>
                <p className="text-2xs text-[#2E2A26]/70">Promotions apply automatically at the Till and show on the public menu — including the brandbook combos “1+1” and “1+1=3”.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 space-y-3">
                  {deals.map(d => (
                    <div key={d.id} className={`bg-white rounded-2xl border p-4 shadow-2xs flex flex-wrap items-center gap-3 ${d.active ? 'border-[#7CC0C7]' : 'border-[#EBDECE] opacity-70'}`}>
                      <span className="px-2.5 py-1 bg-[#BD783A] text-white rounded-full text-[10px] font-black">{d.badge || '%'}</span>
                      <div className="flex-1 min-w-40">
                        <p className="text-xs font-bold text-[#2E2A26]">{d.name}</p>
                        <p className="text-[10px] text-[#2E2A26]/60">{d.description}</p>
                      </div>
                      <button onClick={() => { setDeals(prev => prev.map(x => x.id === d.id ? { ...x, active: !x.active } : x)); logAction('Deals', `${d.active ? 'Deactivated' : 'Activated'} deal "${d.name}"`); }} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase cursor-pointer ${d.active ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>{d.active ? 'Active' : 'Paused'}</button>
                      <button onClick={() => { setEditingDealId(d.id); setDealForm(d); }} className="p-2 rounded-full hover:bg-[#F7EFE6] cursor-pointer"><Edit className="h-3.5 w-3.5 text-[#BD783A]" /></button>
                      <button onClick={() => { if (window.confirm(`Delete deal "${d.name}"?`)) { setDeals(prev => prev.filter(x => x.id !== d.id)); logAction('Deals', `Deleted deal "${d.name}"`); } }} className="p-2 rounded-full hover:bg-red-50 cursor-pointer"><Trash className="h-3.5 w-3.5 text-red-500" /></button>
                    </div>
                  ))}
                  {deals.length === 0 && <p className="text-2xs text-[#2E2A26]/50 p-6 text-center bg-white rounded-2xl border border-[#EBDECE]">No deals yet — create the first combo on the right.</p>}
                </div>

                <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EBDECE] p-5 shadow-2xs space-y-3 text-2xs">
                  <h3 className="font-display font-black text-xs uppercase tracking-wide border-b border-[#EBDECE] pb-2">{editingDealId ? 'Edit deal' : 'Create a deal'}</h3>
                  <div className="space-y-1"><label className="font-bold block">Name</label>
                    <input value={dealForm.name || ''} onChange={e => setDealForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none focus:border-[#BD783A]" placeholder="e.g. Two Milkshakes Combo" /></div>
                  <div className="space-y-1"><label className="font-bold block">Description (shown on the menu)</label>
                    <input value={dealForm.description || ''} onChange={e => setDealForm(f => ({ ...f, description: e.target.value }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none focus:border-[#BD783A]" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="font-bold block">Badge</label>
                      <input value={dealForm.badge || ''} onChange={e => setDealForm(f => ({ ...f, badge: e.target.value }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none" placeholder="1+1=3" /></div>
                    <div className="space-y-1"><label className="font-bold block">Mechanic</label>
                      <select value={dealForm.type} onChange={e => setDealForm(f => ({ ...f, type: e.target.value as Deal['type'] }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none">
                        <option value="bundle_price">Bundle price (X for £Y)</option>
                        <option value="buy_x_get_y_free">Buy X get Y free</option>
                        <option value="percent_off_category">% off a category</option>
                        <option value="fixed_off_order">£ off the order</option>
                      </select></div>
                  </div>
                  {(dealForm.type === 'bundle_price' || dealForm.type === 'buy_x_get_y_free' || dealForm.type === 'percent_off_category') && (
                    <div className="space-y-1"><label className="font-bold block">Category</label>
                      <select value={dealForm.category} onChange={e => setDealForm(f => ({ ...f, category: e.target.value as MenuItem['category'] }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none">
                        <option value="milkshakes">Milkshakes</option><option value="smoothies">Smoothies</option><option value="soft_serve">Soft Serve</option><option value="slush">Slush</option>
                      </select></div>
                  )}
                  {dealForm.type === 'bundle_price' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1"><label className="font-bold block">Buy quantity</label>
                        <input type="number" min={2} value={dealForm.buyQty ?? 2} onChange={e => setDealForm(f => ({ ...f, buyQty: parseInt(e.target.value) || 2 }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none" /></div>
                      <div className="space-y-1"><label className="font-bold block">Bundle price ({cur})</label>
                        <input type="number" min={0} step={0.5} value={dealForm.bundlePrice ?? 9} onChange={e => setDealForm(f => ({ ...f, bundlePrice: parseFloat(e.target.value) || 0 }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none" /></div>
                    </div>
                  )}
                  {dealForm.type === 'buy_x_get_y_free' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1"><label className="font-bold block">Buy quantity</label>
                        <input type="number" min={1} value={dealForm.buyQty ?? 2} onChange={e => setDealForm(f => ({ ...f, buyQty: parseInt(e.target.value) || 1 }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none" /></div>
                      <div className="space-y-1"><label className="font-bold block">Free quantity</label>
                        <input type="number" min={1} value={dealForm.freeQty ?? 1} onChange={e => setDealForm(f => ({ ...f, freeQty: parseInt(e.target.value) || 1 }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none" /></div>
                    </div>
                  )}
                  {dealForm.type === 'percent_off_category' && (
                    <div className="space-y-1"><label className="font-bold block">Percent off</label>
                      <input type="number" min={1} max={100} value={dealForm.percentOff ?? 10} onChange={e => setDealForm(f => ({ ...f, percentOff: parseInt(e.target.value) || 10 }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none" /></div>
                  )}
                  {dealForm.type === 'fixed_off_order' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1"><label className="font-bold block">Amount off ({cur})</label>
                        <input type="number" min={0} step={0.5} value={dealForm.amountOff ?? 1} onChange={e => setDealForm(f => ({ ...f, amountOff: parseFloat(e.target.value) || 0 }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none" /></div>
                      <div className="space-y-1"><label className="font-bold block">Min order ({cur})</label>
                        <input type="number" min={0} step={0.5} value={dealForm.minOrderValue ?? 0} onChange={e => setDealForm(f => ({ ...f, minOrderValue: parseFloat(e.target.value) || 0 }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none" /></div>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2 border-t border-[#EBDECE]">
                    <button onClick={() => {
                      if (!dealForm.name) { addToast('Give the deal a name first.', 'warning'); return; }
                      if (editingDealId) {
                        setDeals(prev => prev.map(x => x.id === editingDealId ? { ...(dealForm as Deal), id: editingDealId } : x));
                        logAction('Deals', `Updated deal "${dealForm.name}"`);
                        addToast('Deal updated.', 'success');
                      } else {
                        const newDeal: Deal = { ...(dealForm as Deal), active: dealForm.active ?? true, id: 'deal_' + Date.now() };
                        setDeals(prev => [newDeal, ...prev]);
                        logAction('Deals', `Created deal "${newDeal.name}"`);
                        addToast('Deal created and live on the Till.', 'success');
                      }
                      setEditingDealId(null);
                      setDealForm({ name: '', description: '', type: 'bundle_price', category: 'milkshakes', buyQty: 2, bundlePrice: 9, freeQty: 1, percentOff: 10, amountOff: 1, active: true, badge: '' });
                    }} className="flex-1 py-2.5 bg-[#BD783A] hover:bg-[#A5642B] text-white rounded-full uppercase font-black tracking-wider cursor-pointer">{editingDealId ? 'Save changes' : 'Create deal'}</button>
                    {editingDealId && (
                      <button onClick={() => { setEditingDealId(null); setDealForm({ name: '', description: '', type: 'bundle_price', category: 'milkshakes', buyQty: 2, bundlePrice: 9, freeQty: 1, percentOff: 10, amountOff: 1, active: true, badge: '' }); }} className="px-4 py-2.5 bg-stone-100 text-stone-600 rounded-full uppercase font-black tracking-wider cursor-pointer">Cancel</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== STAFF CHECKLIST TEMPLATES EDITOR ==================== */}
          {activeTab === 'checklists' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display font-black text-2xl">Staff Shift Checklists</h1>
                <p className="text-2xs text-[#2E2A26]/70">Every item here appears on the Staff Portal “Shift Checklists” screen in real time. Edit, reorder or retire procedures without touching code.</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 space-y-5">
                  {(['opening', 'midday', 'closing'] as const).map(cat => (
                    <div key={cat} className="bg-white rounded-2xl border border-[#EBDECE] shadow-2xs overflow-hidden">
                      <div className="px-4 py-3 bg-[#F7EFE6]/60 border-b border-[#EBDECE] flex items-center justify-between">
                        <h3 className="text-2xs uppercase tracking-widest font-black text-[#BD783A]">{cat} routine</h3>
                        <span className="text-[10px] text-[#2E2A26]/50">{checklistTemplates.filter(t => t.category === cat).length} tasks</span>
                      </div>
                      <div className="divide-y divide-[#EBDECE]/60">
                        {checklistTemplates.filter(t => t.category === cat).sort((a, b) => a.sortOrder - b.sortOrder).map(t => (
                          <div key={t.id} className="px-4 py-3 flex items-center gap-3">
                            <span className="text-2xs text-[#2E2A26] flex-1">{t.label}</span>
                            {t.critical && <span className="text-[9px] px-2 py-0.5 bg-red-50 text-red-600 rounded-full font-black uppercase">Critical</span>}
                            <button onClick={() => { setEditingChecklistId(t.id); setChecklistForm(t); }} className="p-1.5 rounded-full hover:bg-[#F7EFE6] cursor-pointer"><Edit className="h-3.5 w-3.5 text-[#BD783A]" /></button>
                            <button onClick={() => { setChecklistTemplates(prev => prev.filter(x => x.id !== t.id)); logAction('Checklists', `Removed checklist task "${t.label}"`); }} className="p-1.5 rounded-full hover:bg-red-50 cursor-pointer"><Trash className="h-3.5 w-3.5 text-red-500" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EBDECE] p-5 shadow-2xs space-y-3 text-2xs">
                  <h3 className="font-display font-black text-xs uppercase tracking-wide border-b border-[#EBDECE] pb-2">{editingChecklistId ? 'Edit task' : 'Add a task'}</h3>
                  <div className="space-y-1"><label className="font-bold block">Task description</label>
                    <textarea rows={3} value={checklistForm.label || ''} onChange={e => setChecklistForm(f => ({ ...f, label: e.target.value }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none focus:border-[#BD783A] resize-none" placeholder="e.g. Record fridge temperatures in the log" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="font-bold block">Shift phase</label>
                      <select value={checklistForm.category} onChange={e => setChecklistForm(f => ({ ...f, category: e.target.value as ChecklistTemplateItem['category'] }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none">
                        <option value="opening">Opening</option><option value="midday">Mid-day</option><option value="closing">Closing</option>
                      </select></div>
                    <label className="flex items-center gap-2 pt-5 cursor-pointer select-none">
                      <input type="checkbox" checked={!!checklistForm.critical} onChange={e => setChecklistForm(f => ({ ...f, critical: e.target.checked }))} className="h-4 w-4 rounded border-neutral-300" />
                      <span className="font-bold">Critical task</span>
                    </label>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-[#EBDECE]">
                    <button onClick={() => {
                      if (!checklistForm.label) { addToast('Describe the task first.', 'warning'); return; }
                      if (editingChecklistId) {
                        setChecklistTemplates(prev => prev.map(x => x.id === editingChecklistId ? { ...x, ...checklistForm } as ChecklistTemplateItem : x));
                        logAction('Checklists', `Updated checklist task "${checklistForm.label}"`);
                        addToast('Checklist task updated for all staff.', 'success');
                      } else {
                        const cat = checklistForm.category || 'opening';
                        const maxOrder = Math.max(0, ...checklistTemplates.filter(t => t.category === cat).map(t => t.sortOrder));
                        setChecklistTemplates(prev => [...prev, { id: 'ck_' + Date.now(), label: checklistForm.label!, category: cat, critical: !!checklistForm.critical, sortOrder: maxOrder + 1 }]);
                        logAction('Checklists', `Added checklist task "${checklistForm.label}"`);
                        addToast('Task added — it is live on the Staff Portal now.', 'success');
                      }
                      setEditingChecklistId(null);
                      setChecklistForm({ label: '', category: 'opening', critical: false });
                    }} className="flex-1 py-2.5 bg-[#BD783A] hover:bg-[#A5642B] text-white rounded-full uppercase font-black tracking-wider cursor-pointer">{editingChecklistId ? 'Save changes' : 'Add task'}</button>
                    {editingChecklistId && (
                      <button onClick={() => { setEditingChecklistId(null); setChecklistForm({ label: '', category: 'opening', critical: false }); }} className="px-4 py-2.5 bg-stone-100 text-stone-600 rounded-full uppercase font-black tracking-wider cursor-pointer">Cancel</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display font-black text-2xl">Company Settings</h1>
                <p className="text-2xs text-[#2E2A26]/70">Everything here feeds the live website: header ribbon, footer, contact blocks, VAT on the Till and social links. Save once — it updates everywhere.</p>
              </div>

              {/* ---------- Brand & legal identity ---------- */}
              <div className="bg-white rounded-2xl border border-[#EBDECE] p-6 space-y-4 shadow-2xs font-sans text-2xs text-[#2E2A26]">
                <h3 className="font-display font-black text-xs uppercase tracking-wide border-b border-[#EBDECE] pb-2">Brand & legal identity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="font-bold block">Brand name</label>
                    <input value={settingsDraft.brandName} onChange={e => setSettingsDraft(s => ({ ...s, brandName: e.target.value }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none focus:border-[#BD783A]" /></div>
                  <div className="space-y-1"><label className="font-bold block">Legal entity title</label>
                    <input value={settingsDraft.legalName} onChange={e => setSettingsDraft(s => ({ ...s, legalName: e.target.value }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none focus:border-[#BD783A]" /></div>
                  <div className="space-y-1"><label className="font-bold block">Company number</label>
                    <input value={settingsDraft.companyNumber} onChange={e => setSettingsDraft(s => ({ ...s, companyNumber: e.target.value }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none font-mono" /></div>
                  <div className="space-y-1"><label className="font-bold block">VAT number</label>
                    <input value={settingsDraft.vatNumber} onChange={e => setSettingsDraft(s => ({ ...s, vatNumber: e.target.value }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none font-mono" /></div>
                  <div className="space-y-1"><label className="font-bold block">HQ address (footer)</label>
                    <textarea rows={2} value={settingsDraft.hqAddress} onChange={e => setSettingsDraft(s => ({ ...s, hqAddress: e.target.value }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none resize-none" /></div>
                  <div className="space-y-1"><label className="font-bold block">Default opening hours (new stores)</label>
                    <input value={settingsDraft.defaultOpeningHours} onChange={e => setSettingsDraft(s => ({ ...s, defaultOpeningHours: e.target.value }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none" /></div>
                </div>
              </div>

              {/* ---------- Contact & social ---------- */}
              <div className="bg-white rounded-2xl border border-[#EBDECE] p-6 space-y-4 shadow-2xs font-sans text-2xs text-[#2E2A26]">
                <h3 className="font-display font-black text-xs uppercase tracking-wide border-b border-[#EBDECE] pb-2">Contact & social links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="font-bold block">Public phone</label>
                    <input value={settingsDraft.phone} onChange={e => setSettingsDraft(s => ({ ...s, phone: e.target.value }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none" /></div>
                  <div className="space-y-1"><label className="font-bold block">Public email</label>
                    <input value={settingsDraft.email} onChange={e => setSettingsDraft(s => ({ ...s, email: e.target.value }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none" /></div>
                  <div className="space-y-1"><label className="font-bold block">GDPR contact email</label>
                    <input value={settingsDraft.gdprEmail} onChange={e => setSettingsDraft(s => ({ ...s, gdprEmail: e.target.value }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none" /></div>
                  <div className="space-y-1"><label className="font-bold block">Website label (footer)</label>
                    <input value={settingsDraft.websiteUrl} onChange={e => setSettingsDraft(s => ({ ...s, websiteUrl: e.target.value }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none" /></div>
                  <div className="space-y-1"><label className="font-bold block">Instagram handle</label>
                    <input value={settingsDraft.instagramHandle} onChange={e => setSettingsDraft(s => ({ ...s, instagramHandle: e.target.value }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none" /></div>
                  <div className="space-y-1"><label className="font-bold block">Instagram URL</label>
                    <input value={settingsDraft.instagramUrl} onChange={e => setSettingsDraft(s => ({ ...s, instagramUrl: e.target.value }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none" /></div>
                  <div className="space-y-1"><label className="font-bold block">Facebook URL</label>
                    <input value={settingsDraft.facebookUrl} onChange={e => setSettingsDraft(s => ({ ...s, facebookUrl: e.target.value }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none" /></div>
                  <div className="space-y-1"><label className="font-bold block">Twitter / X URL</label>
                    <input value={settingsDraft.twitterUrl} onChange={e => setSettingsDraft(s => ({ ...s, twitterUrl: e.target.value }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none" /></div>
                </div>
              </div>

              {/* ---------- Announcement, messaging & trading ---------- */}
              <div className="bg-white rounded-2xl border border-[#EBDECE] p-6 space-y-4 shadow-2xs font-sans text-2xs text-[#2E2A26]">
                <h3 className="font-display font-black text-xs uppercase tracking-wide border-b border-[#EBDECE] pb-2 flex items-center gap-2"><Megaphone className="h-3.5 w-3.5 text-[#BD783A]" /> Announcement ribbon, footer copy & trading values</h3>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={settingsDraft.announcementEnabled} onChange={e => setSettingsDraft(s => ({ ...s, announcementEnabled: e.target.checked }))} className="h-4 w-4 rounded border-neutral-300" />
                    <span className="font-bold">Show announcement ribbon above the header</span>
                  </label>
                </div>
                <input value={settingsDraft.announcementText} onChange={e => setSettingsDraft(s => ({ ...s, announcementText: e.target.value }))} placeholder="Announcement text…" className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none focus:border-[#BD783A]" />
                <div className="space-y-1"><label className="font-bold block">Footer tagline</label>
                  <textarea rows={2} value={settingsDraft.footerTagline} onChange={e => setSettingsDraft(s => ({ ...s, footerTagline: e.target.value }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none resize-none" /></div>
                <div className="space-y-1"><label className="font-bold block">Allergen notice (footer)</label>
                  <textarea rows={2} value={settingsDraft.allergenNotice} onChange={e => setSettingsDraft(s => ({ ...s, allergenNotice: e.target.value }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none resize-none" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="font-bold block">Currency symbol</label>
                    <input value={settingsDraft.currencySymbol} onChange={e => setSettingsDraft(s => ({ ...s, currencySymbol: e.target.value }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none font-mono" /></div>
                  <div className="space-y-1"><label className="font-bold block">VAT rate % (used by the Till)</label>
                    <input type="number" min={0} max={50} value={settingsDraft.vatRatePercent} onChange={e => setSettingsDraft(s => ({ ...s, vatRatePercent: parseFloat(e.target.value) || 0 }))} className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none font-mono" /></div>
                </div>
                <div className="pt-4 border-t border-[#EBDECE] flex justify-end">
                  <button onClick={() => { setSiteSettings(settingsDraft); logAction('Company Settings', 'Updated site settings (brand, contacts, announcement, VAT)'); addToast('Settings saved — the live site has been updated.', 'success'); }} className="px-5 py-2.5 bg-[#BD783A] hover:bg-[#A5642B] uppercase font-black tracking-wider text-2xs text-white rounded-full cursor-pointer">Save all settings</button>
                </div>
              </div>

              {/* ---------- Cloud database (Supabase) ---------- */}
              <div className="bg-white rounded-2xl border border-[#7CC0C7] p-6 space-y-4 shadow-2xs font-sans text-2xs text-[#2E2A26]">
                <h3 className="font-display font-black text-xs uppercase tracking-wide border-b border-[#EBDECE] pb-2 flex items-center gap-2"><Database className="h-3.5 w-3.5 text-[#7CC0C7]" /> Cloud database (Supabase)</h3>
                <p className="text-[#2E2A26]/70 leading-relaxed">Run <span className="font-mono">supabase/schema.sql</span> then <span className="font-mono">supabase/seed.sql</span> in your Supabase project's SQL editor, paste the Project URL and anon key below, and every registry — menu, orders, staff, settings, all of it — mirrors to the cloud automatically and loads back on any device.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="font-bold block">Project URL</label>
                    <input value={cloudUrl} onChange={e => setCloudUrl(e.target.value)} placeholder="https://xxxx.supabase.co" className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none font-mono focus:border-[#7CC0C7]" /></div>
                  <div className="space-y-1"><label className="font-bold block">Anon public key</label>
                    <input type="password" value={cloudKey} onChange={e => setCloudKey(e.target.value)} placeholder="eyJhbGciOi…" className="w-full bg-stone-50 border border-[#EBDECE] p-2.5 rounded-xl outline-none font-mono focus:border-[#7CC0C7]" /></div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button disabled={!!cloudBusy} onClick={async () => {
                    if (!cloudUrl || !cloudKey) { addToast('Enter both the project URL and the anon key.', 'warning'); return; }
                    setCloudBusy('connect');
                    saveSupabaseConfig({ url: cloudUrl.trim(), anonKey: cloudKey.trim() });
                    const err = await sbHealthCheck();
                    setCloudBusy(null);
                    if (err) {
                      setCloudStatus(s => ({ ...s, configured: true, connected: false, lastError: err }));
                      addToast('Connection failed — check the URL/key and that schema.sql has been run. ' + err, 'error');
                    } else {
                      setCloudStatus(s => ({ ...s, configured: true, connected: true, lastError: undefined, lastSyncAt: new Date().toISOString() }));
                      logAction('Cloud Database', 'Connected Supabase project');
                      addToast('Connected. Use Push everything to seed the cloud with this device data, or Pull from cloud to load existing data.', 'success');
                    }
                  }} className="px-4 py-2.5 bg-[#7CC0C7] hover:bg-[#5FA9B1] text-[#2E2A26] rounded-full uppercase font-black tracking-wider cursor-pointer disabled:opacity-50">{cloudBusy === 'connect' ? 'Connecting…' : 'Save & test connection'}</button>
                  <button disabled={!!cloudBusy || !isCloudConfigured()} onClick={async () => {
                    setCloudBusy('push');
                    const err = await pushAllToCloud((key) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : undefined; } catch { return undefined; } });
                    setCloudBusy(null);
                    if (err) { addToast('Push finished with errors: ' + err, 'warning'); }
                    else { logAction('Cloud Database', 'Pushed all registries to Supabase'); addToast('Everything on this device is now in the cloud database.', 'success'); }
                  }} className="px-4 py-2.5 bg-[#2E2A26] hover:bg-[#BD783A] text-white rounded-full uppercase font-black tracking-wider cursor-pointer disabled:opacity-40 flex items-center gap-1.5"><CloudUpload className="h-3.5 w-3.5" /> {cloudBusy === 'push' ? 'Pushing…' : 'Push everything'}</button>
                  <button disabled={!!cloudBusy || !isCloudConfigured()} onClick={async () => {
                    if (!window.confirm('Pull from the cloud and overwrite the local data on this device?')) return;
                    setCloudBusy('pull');
                    try {
                      const data = await pullAllFromCloud();
                      Object.entries(data).forEach(([key, value]) => {
                        try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
                      });
                      addToast('Cloud data pulled. Reloading to apply…', 'success');
                      setTimeout(() => window.location.reload(), 900);
                    } catch (e: any) {
                      addToast('Pull failed: ' + (e?.message || e), 'error');
                    }
                    setCloudBusy(null);
                  }} className="px-4 py-2.5 bg-white border border-[#7CC0C7] text-[#2E2A26] rounded-full uppercase font-black tracking-wider cursor-pointer disabled:opacity-40 flex items-center gap-1.5"><CloudDownload className="h-3.5 w-3.5" /> {cloudBusy === 'pull' ? 'Pulling…' : 'Pull from cloud'}</button>
                  <button disabled={!isCloudConfigured()} onClick={() => { saveSupabaseConfig(null); setCloudStatus({ configured: false, connected: false }); addToast('Cloud connection removed — running on this device only.', 'warning'); }} className="px-4 py-2.5 bg-stone-100 text-stone-500 rounded-full uppercase font-black tracking-wider cursor-pointer disabled:opacity-40">Disconnect</button>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className={`h-2 w-2 rounded-full ${cloudStatus.connected ? 'bg-emerald-500' : cloudStatus.configured ? 'bg-amber-400' : 'bg-stone-300'}`} />
                  <span className="text-[10px] text-[#2E2A26]/60">
                    {cloudStatus.connected ? `Connected — last sync ${cloudStatus.lastSyncAt ? new Date(cloudStatus.lastSyncAt).toLocaleTimeString('en-GB') : 'pending'}` : cloudStatus.configured ? 'Configured, awaiting successful sync' : 'Local mode — data lives in this browser only'}
                    {cloudStatus.lastError ? ` · Last error: ${cloudStatus.lastError.slice(0, 140)}` : ''}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 23. LIVE AUDIT REGISTRATION TIMELINE ==================== */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="font-display font-black text-2xl">Corporate Audit Tracer Logs</h1>
                  <p className="text-2xs text-[#2E2A26]/70">Strict chronological trail ledger auditing every credential change, document signoff, shift dispatching, and page update.</p>
                </div>
                <button onClick={() => { setAuditLogs([]); addToast('Audit registry wiped out safely.', 'warning'); }} className="px-4 py-2 bg-[#2E2A26] text-white rounded-full text-2xs font-black uppercase tracking-wider cursor-pointer">
                  Purge Registry
                </button>
              </div>

              <div className="space-y-3 font-mono text-2xs animate-fade-in text-[#2E2A26]">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 bg-white rounded-2xl border border-[#EBDECE]/60 space-y-1.5 flex justify-between items-start">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] bg-[#EBDECE] text-zinc-650 px-2 py-0.5 rounded font-bold uppercase">{log.module}</span>
                        <span className="text-[10px] text-zinc-400">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="leading-relaxed">
                        <b>{log.operatorName}</b> ({log.role}) triggered action: <u className="no-underline text-[#BD783A] font-extrabold">{log.action}</u>
                      </p>
                      {log.previousValue && (
                        <p className="p-2 bg-stone-50 rounded border text-[9px] text-zinc-550 italic">
                          Modified from "{log.previousValue}" to "{log.newValue}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
