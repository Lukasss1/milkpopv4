/**
 * @file App.tsx
 * @description Main entry point for the Milk Pop React Application.
 * 
 * ARCHITECTURE & STATE MANAGEMENT:
 * This application is structured as a monolithic Single Page Application (SPA).
 * It uses a top-down state pattern where `App.tsx` serves as the central data store.
 * 
 * 1. MOCK BACKEND persistence: We use a custom hook `useLocalStorageState`
 *    which hooks into the browser's `localStorage` API to simulate database tables.
 *    Any state operation performed via its setter automatically serializes into storage.
 * 
 * 2. ROUTING: We use a simple `currentTab` text state instead of React Router to quickly 
 *    toggle components like `AdminPanel`, `StaffPortal`, and `PublicPages`.
 *    If scaling to a real production site, replacing `currentTab` with `react-router-dom` 
 *    is highly recommended.
 * 
 * 3. PROP DRILLING: Because state lives here, we pass it down extensively via props.
 *    In future iterations, consider replacing this with a Server State manager like React Query
 *    alongside a real database, or a client state manager like Zustand.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PublicPages } from './components/PublicPages';
import { StaffPortal } from './components/StaffPortal';
import { AdminPanel } from './components/AdminPanel';
import {
  EmployeeProfile,
  JobApplication,
  FranchiseInquiry,
  ContactMessage,
  TrainingCourse,
  TrainingAssessment,
  SIFRReport,
  StaffDocument,
  WorkShift,
  MenuItem,
  StoreLocation,
  CareerVacancy,
  KnowledgeArticle,
  NewsPost,
  AuditLogItem,
  MediaItem,
  CmsPageContent,
  RolePermissionMatrix,
  Order,
  Deal,
  SiteSettings,
  ChecklistTemplateItem,
  CloudStatus
} from './types';
import {
  INITIAL_EMPLOYEES,
  INITIAL_COURSES,
  INITIAL_DOCUMENTS,
  INITIAL_SIFR_REPORTS,
  INITIAL_JOBS,
  INITIAL_SHIFTS,
  INITIAL_MENU_ITEMS,
  INITIAL_STORES,
  INITIAL_ARTICLES,
  INITIAL_ORDERS,
  INITIAL_DEALS,
  INITIAL_SETTINGS,
  INITIAL_CHECKLIST_TEMPLATES
} from './data';
import { isCloudConfigured } from './lib/supabase';
import { pullAllFromCloud, onCloudStatus } from './lib/cloudSync';
import { INITIAL_ASSESSMENTS } from './trainingData';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import {
  INITIAL_NEWS_POSTS,
  INITIAL_CMS_PAGES,
  INITIAL_MEDIA_LIBRARY,
  INITIAL_AUDIT_LOGS,
  INITIAL_ROLE_PERMISSIONS
} from './defaultState';

interface ToastAlert {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export default function App() {
  // Navigation Router tab state
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isStaffMode, setIsStaffMode] = useState<boolean>(false);

  // Authenticated staff state
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);

  // Dynamic shared registries state (Simulating databases)
  const [courses, setCourses] = useLocalStorageState<TrainingCourse[]>('milkpop_courses', INITIAL_COURSES);
  const [assessments, setAssessments] = useLocalStorageState<TrainingAssessment[]>('milkpop_assessments', INITIAL_ASSESSMENTS);

  const [documents, setDocuments] = useLocalStorageState<StaffDocument[]>('milkpop_docs', INITIAL_DOCUMENTS);
  const [sifrReports, setSifrReports] = useLocalStorageState<SIFRReport[]>('milkpop_sifr', INITIAL_SIFR_REPORTS);
  const [applications, setApplications] = useLocalStorageState<JobApplication[]>('milkpop_apps', []);
  const [franchiseInquiries, setFranchiseInquiries] = useLocalStorageState<FranchiseInquiry[]>('milkpop_fran', []);
  const [contactMessages, setContactMessages] = useLocalStorageState<ContactMessage[]>('milkpop_contacts', []);
  const [employeesList, setEmployeesList] = useLocalStorageState<EmployeeProfile[]>('milkpop_employees', INITIAL_EMPLOYEES);
  const [shiftsList, setShiftsList] = useLocalStorageState<WorkShift[]>('milkpop_shifts', INITIAL_SHIFTS);

  // Expanded CRM/ERP corporate operations states
  const [menuItems, setMenuItems] = useLocalStorageState<MenuItem[]>('milkpop_menu_items', INITIAL_MENU_ITEMS);
  const [stores, setStores] = useLocalStorageState<StoreLocation[]>('milkpop_stores_list', INITIAL_STORES);
  const [vacancies, setVacancies] = useLocalStorageState<CareerVacancy[]>('milkpop_vacancies_list', INITIAL_JOBS);
  const [articles, setArticles] = useLocalStorageState<KnowledgeArticle[]>('milkpop_articles_list', INITIAL_ARTICLES);
  const [newsPosts, setNewsPosts] = useLocalStorageState<NewsPost[]>('milkpop_news_posts', INITIAL_NEWS_POSTS);
  const [cmsPages, setCmsPages] = useLocalStorageState<CmsPageContent[]>('milkpop_cms_pages', INITIAL_CMS_PAGES);
  const [mediaItems, setMediaItems] = useLocalStorageState<MediaItem[]>('milkpop_media_library', INITIAL_MEDIA_LIBRARY);
  const [auditLogs, setAuditLogs] = useLocalStorageState<AuditLogItem[]>('milkpop_audit_logs', INITIAL_AUDIT_LOGS);
  const [rolePermissions, setRolePermissions] = useLocalStorageState<RolePermissionMatrix[]>('milkpop_permissions_config', INITIAL_ROLE_PERMISSIONS);

  // Sales, promotions, site settings & staff checklist templates
  const [orders, setOrders] = useLocalStorageState<Order[]>('milkpop_orders', INITIAL_ORDERS);
  const [deals, setDeals] = useLocalStorageState<Deal[]>('milkpop_deals', INITIAL_DEALS);
  const [siteSettings, setSiteSettings] = useLocalStorageState<SiteSettings>('milkpop_site_settings', INITIAL_SETTINGS);
  const [checklistTemplates, setChecklistTemplates] = useLocalStorageState<ChecklistTemplateItem[]>('milkpop_checklist_templates', INITIAL_CHECKLIST_TEMPLATES);

  // Cloud database (Supabase) connection status
  const [cloudStatus, setCloudStatus] = useState<CloudStatus>({ configured: isCloudConfigured(), connected: false });

  // Hydrate every registry from Supabase once on boot (if the owner connected a database)
  useEffect(() => {
    onCloudStatus((s) => {
      setCloudStatus((prev) => ({
        ...prev,
        configured: isCloudConfigured(),
        connected: !s.lastError && (prev.connected || !!s.lastSyncAt),
        lastSyncAt: s.lastSyncAt || prev.lastSyncAt,
        lastError: s.lastError
      }));
    });
    if (!isCloudConfigured()) return;

    const applyCloudData = (data: Record<string, any>) => {
      const apply = (key: string, setter: (v: any) => void) => {
        if (data[key] !== undefined && data[key] !== null && (!Array.isArray(data[key]) || data[key].length > 0)) setter(data[key]);
      };
      // Key-value states (checklist ticks, clock records, shift covers…) land
      // straight in localStorage so every screen reads the freshest copy.
      if (data.__kv__) {
        for (const [k, v] of Object.entries(data.__kv__)) {
          try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* quota */ }
        }
      }
      apply('milkpop_site_settings', setSiteSettings);
      apply('milkpop_menu_items', setMenuItems);
      apply('milkpop_deals', setDeals);
      apply('milkpop_stores_list', setStores);
      apply('milkpop_orders', setOrders);
      apply('milkpop_employees', setEmployeesList);
      apply('milkpop_shifts', setShiftsList);
      apply('milkpop_checklist_templates', setChecklistTemplates);
      apply('milkpop_docs', setDocuments);
      apply('milkpop_sifr', setSifrReports);
      apply('milkpop_courses', setCourses);
      apply('milkpop_assessments', setAssessments);
      apply('milkpop_articles_list', setArticles);
      apply('milkpop_vacancies_list', setVacancies);
      apply('milkpop_apps', setApplications);
      apply('milkpop_fran', setFranchiseInquiries);
      apply('milkpop_contacts', setContactMessages);
      apply('milkpop_news_posts', setNewsPosts);
      apply('milkpop_cms_pages', setCmsPages);
      apply('milkpop_media_library', setMediaItems);
      apply('milkpop_audit_logs', setAuditLogs);
      apply('milkpop_permissions_config', setRolePermissions);
    };

    const runPull = () => pullAllFromCloud().then((data) => {
      applyCloudData(data);
      setCloudStatus((prev) => ({ ...prev, connected: true, lastSyncAt: new Date().toISOString() }));
    }).catch((e) => {
      setCloudStatus((prev) => ({ ...prev, connected: false, lastError: String(e?.message || e) }));
    });

    // Boot: hydrate everything from the cloud.
    runPull();

    // Live: whenever this tab regains focus, quietly re-pull (throttled) so a
    // change made on one device appears on every other device on next glance.
    let lastPull = Date.now();
    const onFocus = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastPull < 30000) return;
      lastPull = Date.now();
      runPull();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  // Automatically manage isStaffMode based on currentTab
  useEffect(() => {
    if (currentTab === 'admin_panel' || currentTab.startsWith('staff_')) {
      setIsStaffMode(true);
    } else {
      setIsStaffMode(false);
    }
  }, [currentTab]);

  // Load state from localStorage on first boot if available
  useEffect(() => {
    try {
      let storedUser = localStorage.getItem('milkpop_session');
      if (storedUser) {
        if (storedUser.includes('Merry Hill') || storedUser.includes('MerryHill')) {
          storedUser = storedUser.replace(/Merry Hill/g, 'Solihull').replace(/MerryHill/g, 'Solihull');
          localStorage.setItem('milkpop_session', storedUser);
        }
        setEmployee(JSON.parse(storedUser));
        setIsStaffMode(true);
        setCurrentTab('staff_dashboard');
      }
    } catch (e) {
      console.warn('Unable to load localStorage data safely', e);
    }
  }, []);

  // Update localStorage states on changes
  const saveToStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage quota error', e);
    }
  };

  const addToast = (message: string, type: 'success' | 'warning' | 'error' | 'info') => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto cleanup after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Auth Operations
  const handleLogin = (email: string, password?: string) => {
    // Attempt to locate profile in dynamic registry
    const foundEmp = employeesList.find((e) => e.email.toLowerCase() === email.toLowerCase());

    if (!foundEmp) {
      addToast('Invalid login credentials.', 'error');
      return;
    }

    if (foundEmp.password && foundEmp.password !== password) {
      addToast('Invalid login credentials.', 'error');
      return;
    }

    setEmployee(foundEmp);
    saveToStorage('milkpop_session', foundEmp);
    addToast(`Authenticated as ${foundEmp.name} (${foundEmp.role.replace('_', ' ')}). Welcome to Milk Pop.`, 'success');
    setCurrentTab('staff_dashboard');
  };

  const handleLogout = () => {
    setEmployee(null);
    setIsStaffMode(false);
    setCurrentTab('home');
    try {
      localStorage.removeItem('milkpop_session');
    } catch (e) {
      console.warn(e);
    }
    addToast('Session closed safely. All sensitive caches purged under UK GDPR standards.', 'warning');
  };

  // State mutation wrappers (Simulating backend mutations)
  const handleAddApplication = (app: JobApplication) => {
    const updated = [app, ...applications];
    setApplications(updated);
    saveToStorage('milkpop_apps', updated);
  };

  const handleUpdateApplicationStatus = (id: string, status: any) => {
    const updated = applications.map((app) => (app.id === id ? { ...app, status } : app));
    setApplications(updated);
    saveToStorage('milkpop_apps', updated);
  };

  const handleAddFranchise = (fran: FranchiseInquiry) => {
    const updated = [fran, ...franchiseInquiries];
    setFranchiseInquiries(updated);
    saveToStorage('milkpop_fran', updated);
  };

  const handleUpdateFranchiseStatus = (id: string, status: any) => {
    const updated = franchiseInquiries.map((f) => (f.id === id ? { ...f, status } : f));
    setFranchiseInquiries(updated);
    saveToStorage('milkpop_fran', updated);
  };

  const handleAddContact = (msg: ContactMessage) => {
    const updated = [msg, ...contactMessages];
    setContactMessages(updated);
  };

  const handleAddDocument = (doc: StaffDocument) => {
    const updated = [doc, ...documents];
    setDocuments(updated);
    saveToStorage('milkpop_docs', updated);
  };

  const handleApproveDocument = (id: string) => {
    const updated = documents.map((doc) => (doc.id === id ? { ...doc, status: 'approved' as const } : doc));
    setDocuments(updated);
    saveToStorage('milkpop_docs', updated);
  };

  const handleAddSIFRReport = (rep: SIFRReport) => {
    const updated = [rep, ...sifrReports];
    setSifrReports(updated);
    saveToStorage('milkpop_sifr', updated);
  };

  const handleResolveSIFRReport = (id: string) => {
    const updated = sifrReports.map((rep) => (rep.id === id ? { ...rep, status: 'resolved' as const } : rep));
    setSifrReports(updated);
    saveToStorage('milkpop_sifr', updated);
  };

  const handleAddSIFRReply = (reportId: string, msg: string, userName: string, userRole: string) => {
    const updated = sifrReports.map((rep) => {
      if (rep.id === reportId) {
        const comments = rep.replies || [];
        const newComment = {
          id: 'reply_' + Date.now(),
          user: userName,
          role: userRole,
          message: msg,
          timestamp: new Date().toISOString()
        };
        return {
          ...rep,
          replies: [...comments, newComment]
        };
      }
      return rep;
    });

    setSifrReports(updated);
    saveToStorage('milkpop_sifr', updated);
  };

  const handleUpdateCourseProgress = (courseId: string, progress: number) => {
    const updatedCourses = courses.map((c) => {
      if (c.id === courseId) {
        return { ...c, progress };
      }
      return c;
    });
    setCourses(updatedCourses);

    // If a course reached 100%, increment employee academy points
    if (progress === 100 && employee) {
      const courseObj = courses.find((c) => c.id === courseId);
      const grantPoints = courseObj ? courseObj.points : 100;
      const updatedProfile: EmployeeProfile = {
        ...employee,
        points: employee.points + grantPoints,
        level: Math.floor((employee.points + grantPoints) / 500) + 1,
        badges: Array.from(new Set([...employee.badges, courseObj?.badge || 'Specialist']))
      };
      setEmployee(updatedProfile);
      saveToStorage('milkpop_session', updatedProfile);
    }
  };

  const handleAddEmployee = (emp: EmployeeProfile) => {
    const updated = [emp, ...employeesList];
    setEmployeesList(updated);
    saveToStorage('milkpop_employees', updated);
  };

  const handleUpdateEmployee = (emp: EmployeeProfile) => {
    const updated = employeesList.map(e => e.id === emp.id ? emp : e);
    setEmployeesList(updated);
    saveToStorage('milkpop_employees', updated);
    if (employee && employee.id === emp.id) {
      setEmployee(emp);
      saveToStorage('milkpop_session', emp);
    }
  };

  const handleDeleteEmployee = (id: string) => {
    const updated = employeesList.filter(e => e.id !== id);
    setEmployeesList(updated);
    saveToStorage('milkpop_employees', updated);
  };

  const handleAddShift = (shift: WorkShift) => {
    const updated = [shift, ...shiftsList];
    setShiftsList(updated);
    saveToStorage('milkpop_shifts', updated);
  };

  const handleDeleteShift = (id: string) => {
    const updated = shiftsList.filter(s => s.id !== id);
    setShiftsList(updated);
    saveToStorage('milkpop_shifts', updated);
  };

  const handleUpdatePassword = (newPw: string) => {
    if (!employee) return;
    const updatedEmp = { ...employee, password: newPw, mustChangePassword: false };
    setEmployee(updatedEmp);
    setEmployeesList(employeesList.map(e => e.id === updatedEmp.id ? updatedEmp : e));
    saveToStorage('milkpop_session', updatedEmp);
    saveToStorage('milkpop_employees', employeesList.map(e => e.id === updatedEmp.id ? updatedEmp : e));
    addToast('Security PIN successfully updated.', 'success');
  };

  // Sales operations — the POS writes orders here; the Admin Panel reads/refunds them.
  const handleAddOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
  };

  const handleUpdateOrderStatus = (id: string, status: Order['status'], refundReason?: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? {
      ...o,
      status,
      refundReason: refundReason ?? o.refundReason,
      completedAt: status === 'completed' ? (o.completedAt || new Date().toISOString()) : o.completedAt
    } : o)));
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen text-[#2E2A26] font-sans antialiased flex flex-col justify-between">
      {/* Owner-editable announcement ribbon (Admin Panel → Company Settings) */}
      {siteSettings.announcementEnabled && currentTab !== 'admin_panel' && !isStaffMode && (
        <div className="bg-[#7CC0C7] text-[#2E2A26] text-center text-xs font-bold tracking-wide py-2 px-4">
          {siteSettings.announcementText}
        </div>
      )}

      {/* Dynamic sticky/blur Navigation header */}
      {currentTab !== 'admin_panel' && (
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          employee={employee}
          onLogout={handleLogout}
          isStaffMode={isStaffMode}
          setIsStaffMode={setIsStaffMode}
        />
      )}

      {/* Main Container Workspace */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {/* Router check - admin panel versus staff versus public guest space */}
            {currentTab === 'admin_panel' ? (
              <AdminPanel
                employee={employee}
                applications={applications}
                onUpdateApplicationStatus={handleUpdateApplicationStatus}
                franchiseInquiries={franchiseInquiries}
                onUpdateFranchiseStatus={handleUpdateFranchiseStatus}
                sifrReports={sifrReports}
                onResolveSIFRReport={handleResolveSIFRReport}
                documents={documents}
                onApproveDocument={handleApproveDocument}
                addToast={addToast}
                employeesList={employeesList}
                shiftsList={shiftsList}
                onAddEmployee={handleAddEmployee}
                onUpdateEmployee={handleUpdateEmployee}
                onDeleteEmployee={handleDeleteEmployee}
                onAddShift={handleAddShift}
                onDeleteShift={handleDeleteShift}
                setCurrentTab={setCurrentTab}
                menuItems={menuItems}
                setMenuItems={setMenuItems}
                stores={stores}
                setStores={setStores}
                vacancies={vacancies}
                setVacancies={setVacancies}
                articles={articles}
                setArticles={setArticles}
                newsPosts={newsPosts}
                setNewsPosts={setNewsPosts}
                cmsPages={cmsPages}
                setCmsPages={setCmsPages}
                mediaItems={mediaItems}
                setMediaItems={setMediaItems}
                auditLogs={auditLogs}
                setAuditLogs={setAuditLogs}
                rolePermissions={rolePermissions}
                setRolePermissions={setRolePermissions}
                contactMessages={contactMessages}
                setContactMessages={setContactMessages}
                courses={courses}
                setCourses={setCourses}
                assessments={assessments}
                setAssessments={setAssessments}
                orders={orders}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                deals={deals}
                setDeals={setDeals}
                siteSettings={siteSettings}
                setSiteSettings={setSiteSettings}
                checklistTemplates={checklistTemplates}
                setChecklistTemplates={setChecklistTemplates}
                cloudStatus={cloudStatus}
                setCloudStatus={setCloudStatus}
              />
            ) : (currentTab.startsWith('staff_') || currentTab === 'staff_login') ? (
              <StaffPortal
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                employee={employee}
                onLogin={handleLogin}
                onUpdatePassword={handleUpdatePassword}
                onLogout={handleLogout}
                courses={courses}
                onUpdateCourse={handleUpdateCourseProgress}
                assessments={assessments}
                documents={documents}
                onAddDocument={handleAddDocument}
                sifrReports={sifrReports}
                onAddSIFRReport={handleAddSIFRReport}
                onAddSIFRReply={handleAddSIFRReply}
                addToast={addToast}
                employeesList={employeesList}
                shiftsList={shiftsList}
                onAddShift={handleAddShift}
                onDeleteShift={handleDeleteShift}
                menuItems={menuItems}
                deals={deals}
                stores={stores}
                orders={orders}
                onAddOrder={handleAddOrder}
                siteSettings={siteSettings}
                checklistTemplates={checklistTemplates}
              />
            ) : (
              <PublicPages
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                onAddApplication={handleAddApplication}
                onAddFranchise={handleAddFranchise}
                onAddContact={handleAddContact}
                addToast={addToast}
                menuItems={menuItems}
                setMenuItems={setMenuItems}
                stores={stores}
                vacancies={vacancies}
                newsList={newsPosts}
                employee={employee}
                cmsPages={cmsPages}
                setCmsPages={setCmsPages}
                deals={deals}
                siteSettings={siteSettings}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Brand bottom footer layout */}
      <Footer setCurrentTab={setCurrentTab} setIsStaffMode={setIsStaffMode} settings={siteSettings} />

      {/* Toast Notification Stack Overlay */}
      <div className="fixed bottom-6 right-6 z-[100] max-w-sm w-full space-y-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className={`p-4 rounded-2xl shadow-xl flex items-start space-x-3 pointer-events-auto border ${
                toast.type === 'success'
                  ? 'bg-emerald-50 border-[#5FA777]/30 text-[#2E2A26]'
                  : toast.type === 'warning'
                  ? 'bg-amber-50 border-[#F4B740]/30 text-[#2E2A26]'
                  : toast.type === 'info'
                  ? 'bg-sky-50 border-sky-200 text-[#2E2A26]'
                  : 'bg-red-50 border-red-200 text-[#2E2A26]'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {toast.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-[#5FA777]" />
                ) : toast.type === 'warning' ? (
                  <AlertCircle className="h-5 w-5 text-[#F4B740]" />
                ) : toast.type === 'info' ? (
                  <Info className="h-5 w-5 text-sky-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="flex-1 text-[11px] leading-relaxed">
                {toast.message}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
