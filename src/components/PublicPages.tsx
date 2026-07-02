/**
 * @file PublicPages.tsx
 * @description The main public-facing customer view, acting as the store-front.
 * 
 * ARCHITECTURE & CMS INTEGRATION:
 * This component handles rendering all public-facing elements: Home, Menus, Maps, and Forms.
 * It also includes "Live Editing Mode" via the `isEditingMode` flag. If a staff member with 
 * correct privileges logs in, they can visually mutate `draftCmsPages` and `draftMenuItems` locally.
 * 
 * Recommended Next Steps for Developers:
 * 1. Component Extraction: Abstract each tab (`renderHome`, `renderMenu`, `renderLocations`)
 *    into separate dedicated files (`HomeView.tsx`, `MenuView.tsx`).
 * 2. Search Engine Optimization (SEO): React Helmet should be integrated to properly inject 
 *    the `seoTitle` and `seoDescription` from `cmsPages` into the HTML `<head>`.
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  MapPin,
  Clock,
  Phone,
  Mail,
  Search,
  CheckCircle,
  MenuSquare,
  Gift,
  ArrowRight,
  ChevronRight,
  ShieldAlert,
  SlidersHorizontal,
  ExternalLink,
  Award,
  Users,
  Compass,
  FileCheck,
  Send,
  Calendar,
  Building,
  BookOpen,
  Star,
  Leaf,
  Heart,
  Coffee
} from 'lucide-react';
import { MenuItem, StoreLocation, CareerVacancy, JobApplication, FranchiseInquiry, ContactMessage, NewsPost, EmployeeProfile, CmsPageContent, Deal, SiteSettings } from '../types';
import { BRAND, LogoVertical, DripEdge, WaveEdge, MASCOT, STICKERS } from '../brand';
import { INITIAL_MENU_ITEMS, INITIAL_STORES, INITIAL_JOBS } from '../data';
import { WaveDivider } from './WaveDivider';
import { UKMapSVG, SOLIHULL_PIN_X, SOLIHULL_PIN_Y } from './UKMapSVG';
import { ImageUploadInline } from './ImageUploadInline';

interface PublicPagesProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onAddApplication: (app: JobApplication) => void;
  onAddFranchise: (fran: FranchiseInquiry) => void;
  onAddContact: (msg: ContactMessage) => void;
  addToast: (msg: string, type: 'success' | 'warning' | 'error') => void;
  menuItems?: MenuItem[];
  setMenuItems?: (items: MenuItem[]) => void;
  stores?: StoreLocation[];
  vacancies?: CareerVacancy[];
  newsList?: NewsPost[];
  employee?: EmployeeProfile | null;
  cmsPages?: CmsPageContent[];
  setCmsPages?: (pages: CmsPageContent[]) => void;
  deals: Deal[];
  siteSettings: SiteSettings;
}

export const PublicPages: React.FC<PublicPagesProps> = ({
  currentTab,
  setCurrentTab,
  onAddApplication,
  onAddFranchise,
  onAddContact,
  addToast,
  menuItems,
  setMenuItems,
  stores,
  vacancies,
  newsList,
  employee,
  cmsPages = [],
  setCmsPages,
  deals,
  siteSettings,
}) => {
  const [isEditingMode, setIsEditingMode] = useState(false);

  // ---- Motion system (Apple-style springs) ----
  const springRise = {
    hidden: { opacity: 0, y: 36 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 90, damping: 16 } }
  };
  const heroStagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } }
  };
  const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className }) => (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ type: 'spring', stiffness: 80, damping: 18, delay }}
    >
      {children}
    </motion.div>
  );
  const [draftCmsPages, setDraftCmsPages] = useState<CmsPageContent[]>(cmsPages);

  // Keep draft in sync with cmsPages until editing mode starts
  useEffect(() => {
    if (!isEditingMode) {
      setDraftCmsPages(cmsPages);
    }
  }, [cmsPages, isEditingMode]);

  const activeMenuItems = menuItems || INITIAL_MENU_ITEMS;
  const activeStores = stores || INITIAL_STORES;
  const activeVacancies = vacancies || INITIAL_JOBS;

  const [draftMenuItems, setDraftMenuItems] = useState<MenuItem[]>(activeMenuItems);

  useEffect(() => {
    if (!isEditingMode) {
      setDraftMenuItems(activeMenuItems);
    }
  }, [activeMenuItems, isEditingMode]);

  // Menu tab state filters
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDiet, setSelectedDiet] = useState<string>('all');

  // Store locator state
  const [storeSearch, setStoreSearch] = useState('');
  const [activeStoreId, setActiveStoreId] = useState<string>('s1');
  const [mapMode, setMapMode] = useState<'live' | 'vector'>('live');

  // Form states - Careers
  const [selectedJob, setSelectedJob] = useState<CareerVacancy | null>(null);

  useEffect(() => {
    if (!selectedJob && activeVacancies.length > 0) {
      setSelectedJob(activeVacancies[0]);
    }
  }, [activeVacancies, selectedJob]);
  const [cvFile, setCvFile] = useState<string>('');
  const [careerForm, setCareerForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    experience: '',
    preferredStore: 'Solihull',
    availability: '',
    message: ''
  });

  // Form states - Franchise
  const [franchiseForm, setFranchiseForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: 'United Kingdom',
    city: '',
    budget: '£100,000 - £150,000',
    experience: 'Yes, multi-site retail',
    message: ''
  });

  // Form states - Contact
  const [contactForm, setContactForm] = useState({
    fullName: '',
    email: '',
    reason: 'General feedback',
    message: ''
  });

  // Handlers
  const handleCareerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!careerForm.fullName || !careerForm.email || !careerForm.phone) {
      addToast('Please complete all required fields.', 'error');
      return;
    }
    const newApp: JobApplication = {
      id: 'app_' + Date.now(),
      fullName: careerForm.fullName,
      email: careerForm.email,
      phone: careerForm.phone,
      position: selectedJob?.title || 'Team Member',
      store: careerForm.preferredStore,
      availability: careerForm.availability,
      experience: careerForm.experience,
      cvName: cvFile || 'Sarah_Resume_RTW.pdf',
      message: careerForm.message,
      status: 'pending',
      appliedAt: new Date().toISOString()
    };
    onAddApplication(newApp);
    addToast(`Thank you ${careerForm.fullName}! Your application has been logged safely. Our recruitment manager will review it.`, 'success');
    setCareerForm({
      fullName: '',
      email: '',
      phone: '',
      experience: '',
      preferredStore: 'Solihull',
      availability: '',
      message: ''
    });
    setCvFile('');
  };

  const handleFranchiseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!franchiseForm.fullName || !franchiseForm.email || !franchiseForm.city) {
      addToast('Please enter your full name, email, and target city.', 'error');
      return;
    }
    const newFran: FranchiseInquiry = {
      id: 'fran_' + Date.now(),
      fullName: franchiseForm.fullName,
      email: franchiseForm.email,
      phone: franchiseForm.phone,
      country: franchiseForm.country,
      city: franchiseForm.city,
      budget: franchiseForm.budget,
      experience: franchiseForm.experience,
      message: franchiseForm.message,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };
    onAddFranchise(newFran);
    addToast('Franchise application submitted successfully. Legal assessment guidelines are now generating.', 'success');
    setFranchiseForm({
      fullName: '',
      email: '',
      phone: '',
      country: 'United Kingdom',
      city: '',
      budget: '£100,000 - £150,000',
      experience: 'Yes, multi-site retail',
      message: ''
    });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.fullName || !contactForm.email || !contactForm.message) {
      addToast('Please complete all contact enquiry boxes.', 'error');
      return;
    }
    const newMsg: ContactMessage = {
      id: 'msg_' + Date.now(),
      fullName: contactForm.fullName,
      email: contactForm.email,
      reason: contactForm.reason,
      message: contactForm.message,
      submittedAt: new Date().toISOString()
    };
    onAddContact(newMsg);
    addToast('Customer feedback successfully sent to Milk Pop Support Center.', 'success');
    setContactForm({
      fullName: '',
      email: '',
      reason: 'General feedback',
      message: ''
    });
  };

  // Rendering Helpers
  const renderProductGraphic = (item: MenuItem) => {
    let color = 'bg-[#BD783A]';
    if (item.category === 'smoothies') color = 'bg-[#7CC0C7]';
    if (item.category === 'soft_serve') color = 'bg-stone-200';
    if (item.category === 'slush') color = 'bg-sky-200';
    if (item.category === 'extras') color = 'bg-amber-300';
    
    let emoji = '🥤';
    if (item.category === 'smoothies') emoji = '🍹';
    if (item.category === 'soft_serve') emoji = '🍦';
    if (item.category === 'slush') emoji = '🍧';
    if (item.category === 'extras') emoji = '🍬';

    return (
      <div className={`w-full h-48 ${(!item.image || item.image === 'placeholder') ? color : ''} rounded-t-2xl relative overflow-hidden flex items-center justify-center p-6 group`}>
        {(!item.image || item.image === 'placeholder' || isEditingMode) ? (
          <>
            <div className={`absolute inset-0 ${color}`} />
            {/* Soft Organic Packaging Background Wave graphics */}
            <div className="absolute inset-0 bg-[#EBDECE]/40 transform -skew-y-12 translate-y-10 group-hover:translate-y-5 transition-transform duration-500" />
            <div className="absolute inset-0 bg-white/20 rounded-full w-24 h-24 -top-8 -left-8" />
            
            <span className="text-6xl relative z-10 drop-shadow-md transition-transform group-hover:scale-110 duration-300">
              {emoji}
            </span>
          </>
        ) : null}

        {item.image && item.image !== 'placeholder' && !isEditingMode && (
          <img src={item.image} className="absolute inset-0 w-full h-full object-cover" alt={item.name} />
        )}

        {isEditingMode && (
           <div className="absolute inset-0 z-20">
             <ImageUploadInline
               currentImageUrl={item.image !== 'placeholder' ? item.image : ''}
               onImageChange={(val) => handleEditDraftMenuItemImage(item.id, val)}
               className="w-full h-full"
               imgClassName="w-full h-full object-cover"
             />
           </div>
        )}
      </div>
    );
  };

  const handleEditDraft = (pageId: string, field: keyof CmsPageContent, value: string) => {
    setDraftCmsPages(prev => {
      if (!prev.find(p => p.id === pageId)) {
        return [...prev, {
          id: pageId,
          pageName: pageId,
          title: pageId,
          heroHeadline: '',
          heroSubheadline: '',
          heroImage: '',
          ctaText: '',
          sectionContent: '',
          seoTitle: '',
          seoDescription: '',
          status: 'draft',
          lastEditedBy: 'owner',
          lastEditedDate: new Date().toISOString()
        } as CmsPageContent].map(p => p.id === pageId ? { ...p, [field]: value } : p);
      }
      return prev.map(p => 
        p.id === pageId ? { ...p, [field]: value } : p
      );
    });
  };

  const handleEditDraftMenuItemImage = (id: string, imageUrl: string) => {
    setDraftMenuItems(prev => prev.map(item => 
      item.id === id ? { ...item, image: imageUrl } : item
    ));
  };

  const handlePublish = () => {
    if (setCmsPages) setCmsPages(draftCmsPages);
    if (setMenuItems) setMenuItems(draftMenuItems);
    addToast('Changes published successfully.', 'success');
    setIsEditingMode(false);
  };

  const currentHomeCms = isEditingMode 
    ? draftCmsPages.find(p => p.id === 'cms_home') 
    : cmsPages.find(p => p.id === 'cms_home');

  // A hero image only counts if it's a real uploaded asset (fixes the empty white circle)
  const hasRealHeroImage = !!currentHomeCms?.heroImage && currentHomeCms.heroImage.length > 12 && currentHomeCms.heroImage !== 'placeholder';

  const currentAboutCms = isEditingMode
    ? draftCmsPages.find(p => p.id === 'cms_about')
    : cmsPages.find(p => p.id === 'cms_about');

  const headlineValue = currentHomeCms?.heroHeadline || 'Sip • Smile • Enjoy';
  const subheadlineValue = currentHomeCms?.heroSubheadline || 'Creamy milkshakes, refreshing smoothies, soft serve and slush — made for quick, feel-good moments while you shop.';

  const isOwner = employee?.role === 'owner' || employee?.role === 'super_admin';

  return (
    <div className="bg-[#FFFFFF] min-h-screen text-[#2E2A26] relative">
      {(isOwner && !isEditingMode) && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsEditingMode(true)}
            className="flex items-center gap-2 bg-[#2E2A26] hover:bg-[#BD783A] text-white px-5 py-3 rounded-full font-bold uppercase tracking-wider text-xs shadow-xl transition-all"
          >
            <SlidersHorizontal className="h-4 w-4" />
            DEV TOOL
          </button>
        </div>
      )}

      {isEditingMode && (
        <div className="fixed top-0 left-0 w-full bg-indigo-900 border-b border-indigo-950 text-white z-[100] px-4 py-3 shadow-xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="bg-indigo-600 px-3 py-1 rounded-full text-2xs font-extrabold tracking-widest text-indigo-100 uppercase">
                Editing Mode
              </span>
              <span className="text-sm font-medium text-indigo-200">Changes are not live until published.</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setDraftCmsPages(cmsPages); // revert
                  setIsEditingMode(false);
                }}
                className="px-4 py-2 bg-indigo-800 hover:bg-indigo-700 rounded-lg text-xs font-bold transition-all text-white"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold tracking-wide transition-all shadow-md"
              >
                Publish Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={isEditingMode ? 'mt-14' : ''}>

      {/* ==================== HOME PAGE ==================== */}
      {currentTab === 'home' && (
        <div>
          {/* Hero — full-height caramel stage, staggered spring entrance, waving mascot */}
          <section className="relative overflow-hidden bg-[#BD783A]">
            {/* Depth: soft radial light behind the mascot, Apple-style */}
            <div className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(ellipse 62% 55% at 72% 42%, rgba(255,255,255,0.16), transparent 70%)' }} />
            <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#7CC0C7]/15 blur-3xl" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[82vh] pt-12 pb-16 sm:pb-20">
              <motion.div
                variants={heroStagger}
                initial="hidden"
                animate="show"
                className="lg:col-span-6 space-y-7 text-center lg:text-left"
              >
                <motion.div variants={springRise}>
                  <LogoVertical color="#FFFFFF" className="h-28 sm:h-40 w-auto mx-auto lg:mx-0 drop-shadow-lg" title="Milk Pop" />
                </motion.div>

                {isEditingMode ? (
                  <motion.div variants={springRise} className="space-y-4">
                    <textarea
                      value={headlineValue}
                      onChange={e => handleEditDraft('cms_home', 'heroHeadline', e.target.value)}
                      className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.02] text-white w-full bg-white/10 border-2 border-white/60 rounded-2xl p-3 outline-none focus:border-white resize-none overflow-hidden"
                      rows={2}
                    />
                    <textarea
                      value={subheadlineValue}
                      onChange={e => handleEditDraft('cms_home', 'heroSubheadline', e.target.value)}
                      className="text-base text-white w-full bg-white/10 border-2 border-white/60 rounded-2xl p-3 font-light leading-relaxed outline-none focus:border-white resize-none"
                      rows={3}
                    />
                  </motion.div>
                ) : (
                  <>
                    <motion.h1
                      variants={springRise}
                      className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.02] text-white whitespace-pre-wrap"
                    >
                      {headlineValue}
                    </motion.h1>
                    <motion.p
                      variants={springRise}
                      className="text-base sm:text-lg text-white/85 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed whitespace-pre-wrap"
                    >
                      {subheadlineValue}
                    </motion.p>
                  </>
                )}

                <motion.div variants={springRise} className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-3 pt-1">
                  <button
                    onClick={() => setCurrentTab('menu')}
                    className="w-full sm:w-auto px-9 py-4 bg-white text-[#2E2A26] font-bold rounded-full text-sm tracking-wide transition-all duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] shadow-lg hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.03] cursor-pointer"
                  >
                    View Menu
                  </button>
                  <button
                    onClick={() => setCurrentTab('stores')}
                    className="w-full sm:w-auto px-9 py-4 bg-white/10 backdrop-blur-md border border-white/50 hover:bg-white/20 hover:border-white text-white font-bold rounded-full text-sm tracking-wide transition-all duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 cursor-pointer"
                  >
                    Find a Store
                  </button>
                </motion.div>

                {deals.filter(d => d.active).length > 0 && (
                  <motion.div variants={springRise} className="flex flex-wrap justify-center lg:justify-start gap-2 pt-1">
                    {deals.filter(d => d.active).map(d => (
                      <span key={d.id} className="px-4 py-2 bg-white/12 backdrop-blur-md border border-white/35 rounded-full text-[11px] font-bold text-white tracking-wide">
                        <span className="text-[#AFE3E8] mr-1.5 font-black">{d.badge || '%'}</span>{d.name}
                      </span>
                    ))}
                  </motion.div>
                )}
              </motion.div>

              {/* Mascot stage */}
              <div className="lg:col-span-6 relative flex justify-center items-end lg:items-center">
                {(isEditingMode || hasRealHeroImage) ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 70, damping: 14, delay: 0.3 }}
                    className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-white/95 shadow-2xl overflow-hidden border-4 border-white/60 flex items-center justify-center"
                  >
                    {isEditingMode ? (
                      <ImageUploadInline
                        currentImageUrl={currentHomeCms?.heroImage || ''}
                        onImageChange={(val) => handleEditDraft('cms_home', 'heroImage', val)}
                        className="w-full h-full"
                        imgClassName="w-full h-full object-cover"
                      />
                    ) : (
                      <img src={currentHomeCms?.heroImage} className="w-full h-full object-cover" alt="Milk Pop hero" />
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7, y: 70 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 64, damping: 13, delay: 0.35 }}
                    className="relative"
                  >
                    {/* soft contact shadow under the mascot */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-2 w-2/3 h-8 bg-black/20 blur-2xl rounded-full" />
                    <div className="mp-bob">
                      <img
                        src={MASCOT.wave}
                        alt="The Milk Pop mascot waving hello"
                        className="mp-wave w-72 sm:w-96 lg:w-[30rem] h-auto relative z-10 drop-shadow-2xl select-none"
                        draggable={false}
                      />
                    </div>
                    <img src={STICKERS.swirl} alt="" aria-hidden="true"
                      className="mp-drift absolute -right-4 top-2 w-16 sm:w-24 opacity-90"
                      style={{ ['--mp-tilt' as any]: '8deg', animationDelay: '0.8s' }} />
                    <img src={STICKERS.cup} alt="" aria-hidden="true"
                      className="mp-drift absolute -left-10 bottom-16 w-14 sm:w-20 opacity-90"
                      style={{ ['--mp-tilt' as any]: '-10deg', animationDelay: '2s' }} />
                    <img src={STICKERS.mPink} alt="" aria-hidden="true"
                      className="mp-drift absolute -left-4 top-6 w-12 sm:w-16 opacity-80 blur-[1px]"
                      style={{ ['--mp-tilt' as any]: '-6deg', animationDelay: '3.4s' }} />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Scroll cue */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.8 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden sm:block"
              aria-hidden="true"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                className="h-9 w-6 rounded-full border-2 border-white/50 flex items-start justify-center p-1.5"
              >
                <div className="h-2 w-1 rounded-full bg-white/70" />
              </motion.div>
            </motion.div>

          </section>

          {/* Caramel drips flowing out of the hero into the white page — the brandbook cover motif */}
          <div className="leading-[0] -mt-px" aria-hidden="true">
            <DripEdge color="#BD783A" className="h-24 sm:h-40" />
          </div>

          {/* Core Brand promises bento block */}
          <section className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center space-y-3 mb-12">
            <div className="text-center space-y-3">
              <span className="text-[10px] bg-[#EBDECE]/50 px-3 py-1 rounded-full text-[#BD783A] font-black uppercase tracking-widest">
                Everyday Treats
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-[#2E2A26] tracking-tight">
                Simple, Sweet, Fast
              </h2>
            </div>
            </Reveal>

            <Reveal delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="mp-lift bg-white p-8 rounded-3xl border border-[#EBDECE]/40 shadow-xs space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#7CC0C7]/50 flex items-center justify-center mx-auto text-[#2E2A26]">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#2E2A26]">
                  Milkshake First
                </h3>
                <p className="text-xs text-[#2E2A26]/80 leading-relaxed">
                  Milkshakes are the heart of Milk Pop. We mix up classics like vanilla and strawberry, and premium treats like Kinder Bueno and Biscoff.
                </p>
              </div>

              <div className="mp-lift bg-white p-8 rounded-3xl border border-[#EBDECE]/40 shadow-xs space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#BD783A]/30 flex items-center justify-center mx-auto text-[#BD783A]">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#2E2A26]">
                  Premium-Cute
                </h3>
                <p className="text-xs text-[#2E2A26]/80 leading-relaxed">
                  Our kiosks are colourful, playful, and beautifully polished. We craft treats that look just as good as they taste, perfect for a shopping trip.
                </p>
              </div>

              <div className="mp-lift bg-white p-8 rounded-3xl border border-[#EBDECE]/40 shadow-xs space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#EBDECE] flex items-center justify-center mx-auto text-[#2E2A26]">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#2E2A26]">
                  Fast Service
                </h3>
                <p className="text-xs text-[#2E2A26]/80 leading-relaxed">
                  We know shopping centres are busy. Our team operates with speed, care, and a smile, delivering high-quality treats without the wait.
                </p>
              </div>
            </div>
            </Reveal>
          </section>

          {/* Featured Menu items slider */}
          <section className="py-20 bg-[#EBDECE]/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Reveal>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#BD783A] font-black">
                    Menu Highlights
                  </span>
                  <h2 className="font-display text-3xl font-black text-[#2E2A26] mt-1">
                    Try Our Favourites
                  </h2>
                </div>
                <button
                  onClick={() => setCurrentTab('menu')}
                  className="flex items-center space-x-1 text-xs font-black uppercase text-[#BD783A] hover:text-[#2E2A26] group cursor-pointer"
                >
                  <span>Explore All Treats</span>
                  <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              </Reveal>

              <Reveal delay={0.12}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {(isEditingMode ? draftMenuItems : activeMenuItems).slice(0, 4).map((item) => {
                  let bgColor = 'bg-[#BD783A]';
                  if (item.category === 'smoothies') bgColor = 'bg-[#7CC0C7]';
                  if (item.category === 'soft_serve') bgColor = 'bg-stone-200';
                  if (item.category === 'slush') bgColor = 'bg-sky-200';
                  if (item.category === 'extras') bgColor = 'bg-amber-300';
                  
                  return (
                  <div key={item.id} className="mp-lift bg-white rounded-3xl overflow-hidden border border-[#EBDECE]/40 shadow-xs flex flex-col justify-between">
                    <div className={`w-full h-40 ${(!item.image || item.image === 'placeholder') ? bgColor : ''} relative overflow-hidden flex items-center justify-center`}>
                      {(!item.image || item.image === 'placeholder' || isEditingMode) ? (
                        <>
                          <div className="absolute inset-0 bg-[#EBDECE]/20 transform -skew-y-12 translate-y-10" />
                          <span className="text-4xl relative z-10 drop-shadow-md">
                            {item.category === 'milkshakes' ? '🥤' : item.category === 'smoothies' ? '🍹' : item.category === 'soft_serve' ? '🍦' : item.category === 'slush' ? '🍧' : '🍬'}
                          </span>
                        </>
                      ) : null}
                      
                      {item.image && item.image !== 'placeholder' && !isEditingMode && (
                        <img src={item.image} className="absolute inset-0 w-full h-full object-cover" alt={item.name} />
                      )}

                      {isEditingMode && (
                         <div className="absolute inset-0 z-20">
                           <ImageUploadInline
                             currentImageUrl={item.image !== 'placeholder' ? item.image : ''}
                             onImageChange={(val) => handleEditDraftMenuItemImage(item.id, val)}
                             className="w-full h-full"
                             imgClassName="w-full h-full object-cover"
                           />
                         </div>
                      )}
                    </div>
                    
                    <div className="p-6 space-y-2 flex flex-col justify-between h-full">
                      <div>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap mb-2">
                            {item.tags.map((tag) => (
                              <span key={tag} className="bg-[#EBDECE]/50 text-[#2E2A26] px-2 py-0.5 rounded-full text-[9px] font-bold">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <h3 className="font-display font-black text-sm text-[#2E2A26]">
                            {item.name}
                          </h3>
                          <div className="text-right shrink-0">
                            <span className="font-mono font-bold text-sm text-[#BD783A]">£{item.price.toFixed(2)}</span>
                            {item.priceLarge && (
                              <span className="font-mono text-xs text-[#BD783A]/70 block mt-[-4px]">/ £{item.priceLarge.toFixed(2)}</span>
                            )}
                          </div>
                        {item.description && (
                          <p className="text-[11px] text-[#2E2A26]/75 line-clamp-2 leading-relaxed mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#EBDECE]/30">
                        <span className="text-[10px] font-black tracking-wider text-[#BD783A]">
                          FROM £{item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
              </Reveal>
            </div>
          </section>

          {/* Call-to-action blocks: Careers & Contact side-by-side */}
          <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Careers Block */}
            <Reveal className="h-full"><div className="mp-lift relative overflow-hidden h-full bg-[#7CC0C7]/20 p-8 rounded-3xl border border-[#7CC0C7]/40 space-y-4 flex flex-col justify-between">
              <img src={MASCOT.holdShake} alt="" aria-hidden="true" className="pointer-events-none absolute -right-6 -bottom-4 w-32 opacity-90 mp-float" style={{ ['--mp-tilt' as any]: '4deg' }} />
              <div className="space-y-3">
                <span className="text-[9px] bg-[#7CC0C7] text-[#2E2A26] px-3 py-1 rounded-full font-black uppercase tracking-wider">
                  Careers
                </span>
                <h3 className="font-display text-2xl font-black text-[#2E2A26]">
                  Join the Milk Pop Team
                </h3>
                <p className="text-xs text-[#2E2A26]/80 leading-relaxed">
                  We're hiring for our upcoming shopping centre kiosks. If you love fast-paced environments, delivering smiles, and making great treats, we'd love to hear from you.
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('careers')}
                className="mt-4 flex items-center justify-center space-x-1.5 bg-[#2E2A26] text-white px-5 py-3 rounded-full text-xs font-black uppercase tracking-wider hover:bg-[#BD783A] transition-colors self-start cursor-pointer"
              >
                <span>Current Openings</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div></Reveal>

            {/* Contact Block */}
            <Reveal delay={0.12} className="h-full"><div className="mp-lift h-full bg-[#EBDECE] p-8 rounded-3xl border border-[#BD783A]/30 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-[9px] bg-[#BD783A] text-white px-3 py-1 rounded-full font-black uppercase tracking-wider">
                  Contact
                </span>
                <h3 className="font-display text-2xl font-black text-[#2E2A26]">
                  Get In Touch
                </h3>
                <p className="text-xs text-[#2E2A26]/80 leading-relaxed">
                  Have a question, feedback, or business inquiry? Our team is always happy to chat. Reach out to us and we'll get back to you as soon as possible.
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('contact')}
                className="mt-4 flex items-center justify-center space-x-1.5 bg-[#BD783A] text-white px-5 py-3 rounded-full text-xs font-black uppercase tracking-wider hover:bg-[#2E2A26] transition-colors self-start cursor-pointer"
              >
                <span>Contact Us</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div></Reveal>
          </section>
        </div>
      )}

      {/* ==================== MENU PAGE ==================== */}
      {currentTab === 'menu' && (
        <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-10">
            <span className="text-[10px] bg-[#EBDECE]/50 px-3 py-1 rounded-full text-[#BD783A] font-black uppercase tracking-widest">
              Grown with Care
            </span>
            <h1 className="font-display text-4xl font-black text-[#2E2A26]">
              Our Premium Menu
            </h1>
            <p className="text-xs text-[#2E2A26]/75 max-w-md mx-auto">
              Swipe across our handcrafted specialities. Search ingredients or filter by key lifestyle diets.
            </p>
          </div>

          {/* Live combos — straight from the owner-managed Deals registry */}
          {deals.filter(d => d.active).length > 0 && (
            <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {deals.filter(d => d.active).map(d => (
                <div key={d.id} className="relative overflow-hidden bg-[#7CC0C7]/15 border border-[#7CC0C7]/60 rounded-3xl p-5 flex items-center gap-4">
                  <span className="shrink-0 h-12 w-12 rounded-full bg-[#BD783A] text-white flex items-center justify-center text-xs font-black">
                    {d.badge || '%'}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#2E2A26]">{d.name}</h3>
                    <p className="text-2xs text-[#2E2A26]/70 font-light">{d.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search and Filters Layout */}
          <div className="bg-white p-6 rounded-3xl border border-[#EBDECE]/40 shadow-xs mb-8 space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              {/* Search */}
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-[#BD783A]" />
                <input
                  id="menu-search-input"
                  type="text"
                  placeholder="Search shakes (e.g. Caramel, Cinnamon, Berry)..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#FFFFFF] border border-[#EBDECE] rounded-full text-xs text-[#2E2A26] placeholder-[#2E2A26]/40 focus:ring-2 focus:ring-[#BD783A] focus:outline-none"
                />
              </div>

              {/* Diet Filter */}
              <div className="flex items-center space-x-2 w-full md:w-auto">
                <SlidersHorizontal className="h-4 w-4 text-[#2E2A26]" />
                <select
                  id="diet-filter-select"
                  value={selectedDiet}
                  onChange={(e) => setSelectedDiet(e.target.value)}
                  className="w-full bg-[#FFFFFF] text-xs font-bold text-[#2E2A26] py-3 px-4 border border-[#EBDECE] rounded-full focus:outline-none focus:ring-2 focus:ring-[#BD783A]"
                >
                  <option value="all">All Diets</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan / Dairy-Free</option>
                  <option value="Dairy">Contains Dairy</option>
                  <option value="Gluten">Contains Gluten</option>
                </select>
              </div>
            </div>

            {/* Category selection bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {[
                { key: 'all', label: 'All Items' },
                { key: 'milkshakes', label: 'Milkshakes' },
                { key: 'smoothies', label: 'Smoothies' },
                { key: 'soft_serve', label: 'Soft Serve' },
                { key: 'slush', label: 'Slush' }
              ].map((cat) => (
                <button
                  id={`cat-filter-${cat.key}`}
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-wider font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.key
                      ? 'bg-[#BD783A] text-white shadow-xs'
                      : 'bg-[#FFFFFF] text-[#2E2A26] hover:bg-[#EBDECE]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Menu items grid */}
          {(() => {
            const itemsToFilter = isEditingMode ? draftMenuItems : activeMenuItems;
            const filteredItems = itemsToFilter.filter((item) => {
              if (item.category === 'extras') return false;
              const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
                item.description.toLowerCase().includes(menuSearch.toLowerCase());
              
              const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
              
              let matchesDiet = true;
              if (selectedDiet !== 'all') {
                if (selectedDiet === 'Vegetarian') {
                  matchesDiet = item.tags.includes('Vegetarian') || item.tags.includes('Vegan') || item.tags.includes('Dairy-Free');
                } else if (selectedDiet === 'Vegan') {
                  matchesDiet = item.tags.includes('Vegan') || item.tags.includes('Dairy-Free');
                } else {
                  matchesDiet = item.allergens.includes(selectedDiet);
                }
              }

              return matchesSearch && matchesCategory && matchesDiet;
            });

            if (filteredItems.length === 0) {
              return (
                <div className="text-center py-16 bg-white rounded-3xl border border-[#EBDECE]/40 space-y-2">
                  <ShieldAlert className="h-10 w-10 text-[#BD783A] mx-auto" />
                  <h3 className="text-sm font-bold">No drinks match your current filters</h3>
                  <p className="text-2xs text-[#2E2A26]/60 max-w-sm mx-auto">
                    Try modifying your search or clearing diet constraints to preview other flagship recipes.
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-3xl overflow-hidden border border-[#EBDECE]/40 shadow-2xs hover:shadow-md transition-all">
                    {renderProductGraphic(item)}

                    <div className="p-5 space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag) => (
                          <span key={tag} className="bg-[#7CC0C7]/40 text-[#2E2A26] text-[9px] font-black px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="font-display font-black text-sm text-[#2E2A26]">
                            {item.name}
                          </h3>
                          <div className="text-right shrink-0">
                            <span className="font-mono font-bold text-sm text-[#BD783A]">£{item.price.toFixed(2)}</span>
                            {item.priceLarge && (
                              <span className="font-mono text-xs text-[#BD783A]/70 block mt-[-4px]">/ £{item.priceLarge.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                        {item.description && (
                          <p className="text-2xs text-[#2E2A26]/80 leading-relaxed min-h-[36px] line-clamp-3">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Allergens block */}
                      {item.allergens.length > 0 && (
                        <div className="bg-[#FFFFFF] p-2 rounded-xl text-[9px] text-[#2E2A26]/80">
                          <span className="font-bold text-[#BD783A]">Allergens: </span>
                          {item.allergens.join(', ')}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-[#EBDECE]/20 mt-auto">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#BD783A] bg-[#BD783A]/10 px-2.5 py-1 rounded-full">
                          {item.category.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Legal Allergy Disclaimer Box */}
          <div className="mt-12 bg-amber-50 border border-[#BD783A]/30 p-6 rounded-3xl flex items-start space-x-3 max-w-3xl mx-auto">
            <ShieldAlert className="h-5 w-5 text-[#BD783A] shrink-0 mt-0.5" />
            <div className="text-2xs text-[#2E2A26]/80 leading-relaxed space-y-1.5">
              <h4 className="font-bold">Important Allergen Disclaimer</h4>
              <p>
                Nutrition and allergen information may vary by store and preparation method. Please speak to a team member at the blend counter before completing your order if you suffer from severe wheat, dairy, or tree nut allergies.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==================== STORE LOCATOR PAGE ==================== */}
      {currentTab === 'stores' && (
        <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-10">
            <span className="text-[10px] bg-[#EBDECE]/50 px-3 py-1 rounded-full text-[#BD783A] font-black uppercase tracking-widest">
              Store Locations
            </span>
            <h1 className="font-display text-4xl font-black text-[#2E2A26]">
              Find Milk Pop
            </h1>
            <p className="text-xs text-[#2E2A26]/75 max-w-md mx-auto">
              We're currently offering delicious treats exclusively in the West Midlands area, with more locations coming soon.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Store List column (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-[#BD783A]" />
                <input
                  id="store-search-box"
                  type="text"
                  placeholder="Insert post code, suburb, or city..."
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#EBDECE] rounded-full text-xs text-[#2E2A26] placeholder-[#2E2A26]/40 focus:outline-none focus:ring-2 focus:ring-[#BD783A]"
                />
              </div>

              {/* Stores rendering */}
              {(() => {
                const filteredStores = activeStores.filter((store) =>
                  store.name.toLowerCase().includes(storeSearch.toLowerCase()) ||
                  store.address.toLowerCase().includes(storeSearch.toLowerCase())
                );

                if (filteredStores.length === 0) {
                  return (
                    <div className="bg-white p-6 rounded-3xl border border-[#EBDECE] text-center py-10">
                      <p className="text-xs font-bold uppercase">No Locations Match</p>
                      <p className="text-2xs text-[#A5642B] mt-1">Try entering "Solihull" or "Birmingham"</p>
                    </div>
                  );
                }

                return filteredStores.map((store) => {
                  const isActive = activeStoreId === store.id;
                  return (
                    <div
                      key={store.id}
                      onClick={() => setActiveStoreId(store.id)}
                      className={`p-6 rounded-3xl border transition-all cursor-pointer text-left ${
                        isActive
                          ? 'border-[#BD783A] bg-[#FFFFFF] ring-2 ring-[#BD783A]/30 shadow-md'
                          : 'border-[#EBDECE]/50 bg-white hover:bg-[#FFFFFF]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-display font-black text-sm text-[#2E2A26]">
                          {store.name}
                        </h3>
                        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${
                          store.status === 'open'
                            ? 'bg-[#5FA777]/20 text-[#5FA777]'
                            : 'bg-amber-100 text-[#BD783A]'
                        }`}>
                          {store.status === 'open' ? 'Open Now' : 'Coming Soon'}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-[#2E2A26]/85">
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-[#BD783A] shrink-0 mt-0.5" />
                          <span>{store.address}, {store.postcode}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-[#BD783A]" />
                          <span>{store.openingHours}</span>
                        </div>
                        {store.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-[#BD783A]" />
                            <span>{store.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Delivery Buttons */}
                      {store.status === 'open' && (
                        <div className="pt-4 border-t border-[#EBDECE]/20 mt-4 flex items-center gap-2">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#A5642B]">Order Delivery:</span>
                          {store.deliveryLinks?.deliveroo && (
                            <a
                              href={store.deliveryLinks.deliveroo}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 bg-[#7CC0C7]/50 hover:bg-[#7CC0C7] text-[#2E2A26] rounded-full text-[10px] font-black uppercase tracking-wider flex items-center space-x-1 transition-colors"
                            >
                              <span>Deliveroo</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                          {store.deliveryLinks?.uberEats && (
                            <a
                              href={store.deliveryLinks.uberEats}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center space-x-1 transition-colors"
                            >
                              <span>UberEats</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            {/* Visualizer Column (7 cols) */}
            <div className="lg:col-span-7 bg-white p-4 rounded-3xl border border-[#EBDECE]/40 shadow-xs space-y-4 flex flex-col h-full min-h-[500px]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-2">
                <span className="text-[10px] font-black uppercase text-[#BD783A] tracking-widest flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5" /> UK Service Map
                </span>
              </div>

              {/* UK Contour Map replacing GPS Visualizer */}
              <div className="relative w-full flex-grow bg-[#FFFFFF]/50 rounded-2xl border border-[#EBDECE]/50 flex items-center justify-center overflow-hidden">
                {/* Decorative map styling curves and background */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#BD783A_1px,transparent_1px)] [background-size:24px_24px]" />

                {/* Realistic UK Map SVG */}
                <div className="relative w-full h-auto aspect-[400/480] max-w-[280px] sm:max-w-xs mx-auto">
                  <UKMapSVG className="w-full w-full drop-shadow-sm transition-transform duration-700 hover:scale-[1.02]" />
                  
                  {/* Pin Point for Solihull (West Midlands) */}
                  <div 
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 group"
                    style={{ left: `${(SOLIHULL_PIN_X / 400) * 100}%`, top: `${(SOLIHULL_PIN_Y / 480) * 100}%` }}
                  >
                    <div className="relative">
                      {/* Aura pulse effect */}
                      <div className="absolute -inset-4 bg-[#BD783A]/20 rounded-full animate-ping" />
                      
                      {/* Pin container */}
                      <div className="relative bg-[#BD783A] rounded-full w-10 h-10 flex items-center justify-center shadow-lg border-2 border-white cursor-pointer z-10 hover:bg-[#2E2A26] transition-colors">
                        <MapPin className="text-white h-5 w-5" />
                      </div>
                    </div>
                    
                    {/* Location Label */}
                    <div className="mt-3 bg-white border border-[#EBDECE] px-4 py-2 rounded-xl shadow-md flex items-center gap-2 group-hover:-translate-y-1 transition-transform">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse block" />
                      <div className="flex flex-col items-start pr-1">
                        <span className="font-display font-black text-xs text-[#2E2A26] uppercase tracking-wider leading-none">
                          Solihull
                        </span>
                        <span className="text-[8px] text-[#A5642B] uppercase font-bold tracking-widest mt-1 leading-none">
                          West Midlands
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-6 right-6 text-[10px] text-[#A5642B] uppercase font-black tracking-widest bg-white/80 px-3 py-1.5 rounded-full border border-[#EBDECE]/50 backdrop-blur-xs">
                    Current Active Zone
                  </div>
                </div>
              </div>

              {/* Map instructions summary */}
              <div className="bg-[#FFFFFF] p-4 rounded-2xl text-[11px] text-[#2E2A26]/75 leading-relaxed text-center">
                We are proud to serve the West Midlands region. Select our Solihull branch to view location specifics and operating hours.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CAREERS PAGE ==================== */}
      {currentTab === 'careers' && (
        <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <span className="text-[10px] bg-[#7CC0C7] text-[#2E2A26] px-3.5 py-1.5 rounded-full font-black uppercase tracking-widest">
              Build Your Future
            </span>
            <h1 className="font-display text-4xl font-black text-[#2E2A26]">
              Join the Team
            </h1>
            <p className="text-xs text-[#2E2A26]/75 max-w-md mx-auto">
              Our hospitality culture is our absolute core. We provide full training, and fair operational reporting.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-3xl border border-[#EBDECE]/40 text-center space-y-2">
              <span className="text-2xl">📈</span>
              <h3 className="font-bold text-xs uppercase tracking-wider">Growth Paths</h3>
              <p className="text-[11px] text-[#2E2A26]/70">We train Team Members to Supervisors, then Store Managers and beyond.</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-[#EBDECE]/40 text-center space-y-2">
              <span className="text-2xl">🌱</span>
              <h3 className="font-bold text-xs uppercase tracking-wider">HACCP Certs</h3>
              <p className="text-[11px] text-[#2E2A26]/70">Get fully funded professional Food Hygiene credentials on shift.</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-[#EBDECE]/40 text-center space-y-2">
              <span className="text-2xl">🕒</span>
              <h3 className="font-bold text-xs uppercase tracking-wider">Fair Rotas</h3>
              <p className="text-[11px] text-[#2E2A26]/70">Schedule notifications weeks in advance to organize your studies or family.</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-[#EBDECE]/40 text-center space-y-2">
              <span className="text-2xl">🥤</span>
              <h3 className="font-bold text-xs uppercase tracking-wider">Beverage Perks</h3>
              <p className="text-[11px] text-[#2E2A26]/70">Enjoy free signature shakes and dessert cups on every duty shift.</p>
            </div>
          </div>

          {/* Core Roles & Applications interface */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Vacancies list (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <h2 className="font-display text-sm uppercase tracking-widest font-black text-[#BD783A] px-1">
                Active Job Vacancies
              </h2>
              {activeVacancies.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-6 bg-white rounded-3xl border cursor-pointer transition-all ${
                    selectedJob?.id === job.id
                      ? 'border-[#BD783A] ring-2 ring-[#BD783A]/20 shadow-xs'
                      : 'border-[#EBDECE]/40 hover:border-[#BD783A]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display font-black text-xs text-[#2E2A26] uppercase tracking-wide">
                      {job.title}
                    </h3>
                    <span className="text-[9px] uppercase font-bold text-[#BD783A] bg-[#EBDECE]/50 px-2 py-0.5 rounded-full">
                      {job.type}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-gray-500 mb-1">{job.department} ({job.location})</p>
                  <p className="text-[11px] font-mono text-[#BD783A] font-black">{job.salary}</p>
                </div>
              ))}
            </div>

            {/* Selected Job details and Application form (7 cols) */}
            <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-[#EBDECE]/40 shadow-xs space-y-6">
              {selectedJob ? (
                <div className="space-y-6">
                  {/* Job Details Card */}
                  <div className="border-b border-[#EBDECE]/30 pb-6 space-y-3">
                    <h2 className="font-display text-lg font-black text-[#2E2A26] uppercase tracking-wide">
                      {selectedJob.title}
                    </h2>
                    <p className="text-[11px] text-[#2E2A26]/80 leading-relaxed font-light">
                      {selectedJob.roleDescription}
                    </p>

                    <div className="space-y-2">
                      <h4 className="text-2xs font-black uppercase text-[#BD783A] tracking-widest flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-[#5FA777]" /> Core Responsibilities
                      </h4>
                      <ul className="list-disc list-inside text-2xs text-[#2E2A26]/85 space-y-1 pl-1 font-light">
                        {selectedJob.responsibilities.map((resp, i) => (
                          <li key={i}>{resp}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2 pt-2">
                      <h4 className="text-2xs font-black uppercase text-[#BD783A] tracking-widest flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> Core Candidate Requirements
                      </h4>
                      <ul className="list-disc list-inside text-2xs text-[#2E2A26]/85 space-y-1 pl-1 font-light">
                        {selectedJob.requirements.map((req, i) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Application Form */}
                  <form onSubmit={handleCareerSubmit} className="space-y-4">
                    <h3 className="font-display text-sm font-black uppercase text-[#2E2A26]">
                      Submit Your Application
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-black tracking-wider text-gray-500 mb-1">
                          Full Name *
                        </label>
                        <input
                          id="app-name"
                          type="text"
                          required
                          value={careerForm.fullName}
                          onChange={(e) => setCareerForm({ ...careerForm, fullName: e.target.value })}
                          className="w-full text-xs p-3 bg-[#FFFFFF] border border-[#EBDECE] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#BD783A]"
                          placeholder="e.g. Sarah Jenkins"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-black tracking-wider text-gray-500 mb-1">
                          Email Address *
                        </label>
                        <input
                          id="app-email"
                          type="email"
                          required
                          value={careerForm.email}
                          onChange={(e) => setCareerForm({ ...careerForm, email: e.target.value })}
                          className="w-full text-xs p-3 bg-[#FFFFFF] border border-[#EBDECE] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#BD783A]"
                          placeholder="sarah@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-black tracking-wider text-gray-500 mb-1">
                          Contact Phone *
                        </label>
                        <input
                          id="app-phone"
                          type="tel"
                          required
                          value={careerForm.phone}
                          onChange={(e) => setCareerForm({ ...careerForm, phone: e.target.value })}
                          className="w-full text-xs p-3 bg-[#FFFFFF] border border-[#EBDECE] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#BD783A]"
                          placeholder="+44 7700 900077"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-black tracking-wider text-gray-500 mb-1">
                          Preferred Store Node
                        </label>
                        <select
                          id="app-store"
                          value={careerForm.preferredStore}
                          onChange={(e) => setCareerForm({ ...careerForm, preferredStore: e.target.value })}
                          className="w-full text-xs p-3 bg-[#FFFFFF] border border-[#EBDECE] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#BD783A]"
                        >
                          <option value="Solihull">Milk Pop Solihull</option>
                          <option value="Leicester">Milk Pop Leicester</option>
                          <option value="Birmingham">Milk Pop Birmingham (Coming Soon)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-wider text-gray-500 mb-1">
                        Weekly Availability & Hours (e.g. Weekends, 16 hours) *
                      </label>
                      <input
                        id="app-availability"
                        type="text"
                        required
                        value={careerForm.availability}
                        onChange={(e) => setCareerForm({ ...careerForm, availability: e.target.value })}
                        className="w-full text-xs p-3 bg-[#FFFFFF] border border-[#EBDECE] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#BD783A]"
                        placeholder="e.g. Saturdays & Sundays, up to 16 hours total"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-wider text-gray-500 mb-1">
                        Previous Hospitality Store Experience
                      </label>
                      <textarea
                        id="app-experience"
                        value={careerForm.experience}
                        onChange={(e) => setCareerForm({ ...careerForm, experience: e.target.value })}
                        className="w-full text-xs p-3 bg-[#FFFFFF] border border-[#EBDECE] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#BD783A] h-20"
                        placeholder="Outline any cashier, kitchen prep, or customer service jobs held previously..."
                      />
                    </div>

                    {/* Simulated CV Upload Component */}
                    <div className="bg-[#FFFFFF] border border-dashed border-[#BD783A]/40 p-4 rounded-xl space-y-2 text-center">
                      <p className="text-[10px] font-bold uppercase text-[#2E2A26]/85">Upload your resume resume (Word / PDF format)</p>
                      <div className="flex justify-center items-center gap-2">
                        <button
                          id="app-fake-upload"
                          type="button"
                          onClick={() => {
                            setCvFile('sarah_jenkins_resume_2026.pdf');
                            addToast('Document metadata parsed. Sarah_Resume_RTW.pdf added.', 'success');
                          }}
                          className="px-3 py-1.5 bg-[#2E2A26] text-white text-[10px] uppercase font-black rounded-lg hover:bg-[#BD783A] transition-colors cursor-pointer"
                        >
                          Simulate File Drop
                        </button>
                        {cvFile ? (
                          <span className="text-[10px] text-[#5FA777] font-semibold">{cvFile} ✅</span>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-light">No file selected</span>
                        )}
                      </div>
                    </div>

                    <button
                      id="app-submit-btn"
                      type="submit"
                      className="w-full py-3.5 bg-[#BD783A] hover:bg-[#2E2A26] text-white rounded-full text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Submit Career Application
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <p className="text-xs font-bold font-display uppercase">Select a role in the left list</p>
                  <p className="text-2xs text-gray-400">Preview vacancies and initialize forms.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== FRANCHISE PAGE ==================== */}
      {currentTab === 'franchise' && (
        <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-10">
            <span className="text-[10px] bg-[#BD783A] text-white px-3 py-1 rounded-full font-black uppercase tracking-widest">
              Partnership & Brand Growth
            </span>
            <h1 className="font-display text-4xl font-black text-[#2E2A26]">
              Grow With Milk Pop
            </h1>
            <p className="text-xs text-[#2E2A26]/75 max-w-md mx-auto">
              Our business model supports multi-site platforms with serious operational support.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Business values checklist (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#EBDECE]/30 p-8 rounded-3xl border border-[#BD783A]/30 space-y-4">
                <h3 className="font-display text-xs uppercase font-extrabold tracking-wider text-[#BD783A]">
                  Why Franchise With Us?
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-[#BD783A] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-2xs font-extrabold uppercase">Outstanding Net Margins</h4>
                      <p className="text-[10px] text-[#2E2A26]/80">Proprietary ingredient mixtures cut wastage ratios significantly.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-[#BD783A] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-2xs font-extrabold uppercase">Ready Architecture</h4>
                      <p className="text-[10px] text-[#2E2A26]/80">CAD models of custom caramel wave bars speed up shopping mall approvals.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-[#BD783A] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-2xs font-extrabold uppercase">Staff Portal Operation</h4>
                      <p className="text-[10px] text-[#2E2A26]/80">Utilise our centralized SIFR accountability and training suite from day 1.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements threshold card */}
              <div className="bg-white p-6 rounded-3xl border border-[#EBDECE] space-y-3 text-left">
                <h4 className="text-2xs font-bold text-gray-500 uppercase tracking-widest">Typical Minimum Parameters</h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-[#FFFFFF] p-3 rounded-2xl">
                    <span className="block text-sm font-mono font-black text-[#BD783A]">£50k</span>
                    <span className="text-[9px] uppercase tracking-wide text-gray-400 font-bold">Liquid Capital</span>
                  </div>
                  <div className="bg-[#FFFFFF] p-3 rounded-2xl">
                    <span className="block text-sm font-mono font-black text-[#BD783A]">2+ Years</span>
                    <span className="text-[9px] uppercase tracking-wide text-gray-400 font-bold">Quick Service Ops</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inquiry Form Column (7 cols) */}
            <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-[#EBDECE]/40 shadow-xs space-y-6 text-left">
              <h3 className="font-display text-sm font-black uppercase text-[#2E2A26]">
                Franchise Investment Inquiry
              </h3>

              <form onSubmit={handleFranchiseSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-wider text-gray-500 mb-1">Full Name</label>
                    <input
                      id="fran-name"
                      type="text"
                      required
                      value={franchiseForm.fullName}
                      onChange={(e) => setFranchiseForm({ ...franchiseForm, fullName: e.target.value })}
                      className="w-full text-xs p-3 bg-[#FFFFFF] border border-[#EBDECE] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#BD783A]"
                      placeholder="e.g. Johnathan Cross"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-wider text-gray-500 mb-1">Email Address</label>
                    <input
                      id="fran-email"
                      type="email"
                      required
                      value={franchiseForm.email}
                      onChange={(e) => setFranchiseForm({ ...franchiseForm, email: e.target.value })}
                      className="w-full text-xs p-3 bg-[#FFFFFF] border border-[#EBDECE] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#BD783A]"
                      placeholder="john@retailgroup.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-wider text-gray-500 mb-1">Target Operating City</label>
                    <input
                      id="fran-city"
                      type="text"
                      required
                      value={franchiseForm.city}
                      onChange={(e) => setFranchiseForm({ ...franchiseForm, city: e.target.value })}
                      className="w-full text-xs p-3 bg-[#FFFFFF] border border-[#EBDECE] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#BD783A]"
                      placeholder="e.g. Nottingham, Bristol, Leeds"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-wider text-gray-500 mb-1">Target Country</label>
                    <input
                      id="fran-country"
                      type="text"
                      required
                      value={franchiseForm.country}
                      onChange={(e) => setFranchiseForm({ ...franchiseForm, country: e.target.value })}
                      className="w-full text-xs p-3 bg-[#FFFFFF] border border-[#EBDECE] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#BD783A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-wider text-gray-500 mb-1">Investment Budget</label>
                    <select
                      id="fran-budget"
                      value={franchiseForm.budget}
                      onChange={(e) => setFranchiseForm({ ...franchiseForm, budget: e.target.value })}
                      className="w-full text-xs p-3 bg-[#FFFFFF] border border-[#EBDECE] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#BD783A]"
                    >
                      <option value="£50,000 - £100,000">£50,000 - £100,000</option>
                      <option value="£100,000 - £150,000">£100,000 - £150,000</option>
                      <option value="£150,000 - £300,000">£150,000 - £300,000</option>
                      <option value="£300,000+">£300,000+ (Multi-Unit Area)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-wider text-gray-500 mb-1">Hospitality Experience</label>
                    <select
                      id="fran-experience"
                      value={franchiseForm.experience}
                      onChange={(e) => setFranchiseForm({ ...franchiseForm, experience: e.target.value })}
                      className="w-full text-xs p-3 bg-[#FFFFFF] border border-[#EBDECE] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#BD783A]"
                    >
                      <option value="Yes, multi-site retail">Yes, Multi-site Retail / Coffee</option>
                      <option value="Single coffee unit">Yes, Single Unit Owner Operator</option>
                      <option value="Corporate background">No, Corporate investor only</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black tracking-wider text-gray-500 mb-1">Message & Brand Intentions</label>
                  <textarea
                    id="fran-msg"
                    value={franchiseForm.message}
                    onChange={(e) => setFranchiseForm({ ...franchiseForm, message: e.target.value })}
                    className="w-full text-xs p-3 bg-[#FFFFFF] border border-[#EBDECE] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#BD783A] h-24"
                    placeholder="Briefly state your target locations, operations timeline, and corporate capabilities..."
                  />
                </div>

                <div className="bg-amber-50 p-4 border border-[#BD783A]/30 rounded-xl">
                  <p className="text-[10px] text-gray-500 leading-relaxed font-light">
                    Disclaimer: Submitting an inquiry does not guarantee franchising approval or area locking rights. All opportunities are subject to rigorous suitability screens, asset checks, and explicit signoffs under a formal Franchise Disclosure Document (FDD).
                  </p>
                </div>

                <button
                  id="fran-submit-btn"
                  type="submit"
                  className="w-full py-4 bg-[#BD783A] hover:bg-[#2E2A26] text-white rounded-full text-xs tracking-wider uppercase font-extrabold transition-colors cursor-pointer"
                >
                  Send Inquiry Form
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ABOUT PAGE ==================== */}
      {currentTab === 'about' && (
        <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6">
          {/* Hero Header */}
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EBDECE]/50 rounded-full">
              <Star className="h-3 w-3 text-[#BD783A]" />
              <span className="text-[10px] text-[#2E2A26] font-black uppercase tracking-widest">Our Heritage & Ethos</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-black text-[#2E2A26] leading-tight max-w-3xl mx-auto tracking-tight">
              Elevating the simple joy of <span className="text-[#BD783A] italic">everyday indulgence.</span>
            </h1>
            <p className="text-sm md:text-base text-gray-500 max-w-xl mx-auto font-light leading-relaxed">
              Milk Pop was born from a desire to transform the nostalgic milkshake into a vehicle for culinary craftsmanship, ethical sourcing, and genuine hospitality.
            </p>
          </div>

          {/* Main Story & Values */}
          <div className="space-y-24 text-left">
            
            {/* The Craft (Image Left, Text Right) */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="aspect-square bg-[#FFFFFF] rounded-[40px] overflow-hidden relative group shadow-sm border border-[#EBDECE]">
                  {isEditingMode ? (
                    <ImageUploadInline
                      currentImageUrl={currentAboutCms?.aboutImage1 || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop'}
                      onImageChange={(val) => handleEditDraft('cms_about', 'aboutImage1', val)}
                      className="w-full h-full"
                      imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <img src={currentAboutCms?.aboutImage1 || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Cafe vibe" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2E2A26]/30 to-transparent pointer-events-none"></div>
              </div>
              <div className="space-y-6 md:pl-8">
                  <h2 className="font-display text-3xl font-black text-[#2E2A26]">The Craft of the Pour</h2>
                  <p className="text-sm text-[#2E2A26]/85 leading-relaxed font-light">
                      We don't do shortcuts. When we set out to build Milk Pop, we audited dozens of dairies to find the perfect fat content for our soft serve base. We treat our vanilla beans with the same reverence a sommelier treats grapes. 
                      <br/><br/>
                      The result is a product that speaks for itself. No artificial thickeners, no cloying syrups. Just the pure, unadulterated taste of exceptional ingredients combined with disciplined technique.
                  </p>
                  <div className="flex items-center gap-4 pt-4">
                      <div className="w-12 h-12 bg-[#EBDECE]/50 rounded-full flex items-center justify-center">
                          <Leaf className="h-5 w-5 text-[#BD783A]" />
                      </div>
                      <div>
                          <h4 className="font-bold text-xs text-[#2E2A26] uppercase tracking-wider">Locally Sourced</h4>
                          <span className="text-xs text-gray-500">100% Organic Midlands Dairy</span>
                      </div>
                  </div>
              </div>
            </div>

            {/* The Culture (Text Left, Image Right) */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 space-y-6 md:pr-8">
                  <h2 className="font-display text-3xl font-black text-[#2E2A26]">Our People, Our Pride</h2>
                  <p className="text-sm text-[#2E2A26]/85 leading-relaxed font-light">
                      More than the shakes, we are proud of the teams that craft them. Milk Pop is built on a foundation of respect, continuous growth, and shared joy. We believe that when our team is happy, valued, and empowered, that exact energy transfers straight across the counter.
                      <br/><br/>
                      Working at Milk Pop isn't a stepping stone; it's an opportunity to master the art of hospitality in an environment that celebrates your unique spark. We invest heavily in training, well-being, and creating a workplace where Monday mornings feel good.
                  </p>
                  <div className="flex items-center gap-4 pt-4">
                      <div className="w-12 h-12 bg-[#7CC0C7]/30 rounded-full flex items-center justify-center">
                          <Heart className="h-5 w-5 text-[#3b8c8d]" />
                      </div>
                      <div>
                          <h4 className="font-bold text-xs text-[#2E2A26] uppercase tracking-wider">Culture of Care</h4>
                          <span className="text-xs text-gray-500">Fair hours, real benefits, genuine support</span>
                      </div>
                  </div>
              </div>
              <div className="order-1 md:order-2 aspect-square bg-[#FFFFFF] rounded-[40px] overflow-hidden relative group shadow-sm border border-[#EBDECE]">
                  {isEditingMode ? (
                    <ImageUploadInline
                      currentImageUrl={currentAboutCms?.aboutImage2 || 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?q=80&w=2076&auto=format&fit=crop'}
                      onImageChange={(val) => handleEditDraft('cms_about', 'aboutImage2', val)}
                      className="w-full h-full"
                      imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <img src={currentAboutCms?.aboutImage2 || "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?q=80&w=2076&auto=format&fit=crop"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Team culture" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2E2A26]/30 to-transparent pointer-events-none"></div>
              </div>
            </div>

            {/* The Pillars (3 column grid) */}
            <div className="text-center space-y-12 bg-[#2E2A26] py-16 px-8 sm:px-12 rounded-[40px] text-white shadow-xl">
              <div className="max-w-2xl mx-auto space-y-4">
                <span className="text-[10px] text-[#BD783A] font-black uppercase tracking-widest">Our Promise</span>
                <h2 className="font-display text-4xl font-black text-[#FFFFFF]">The Milk Pop Pillars</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                  <div className="space-y-4 p-8 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                      <Sparkles className="h-8 w-8 text-[#BD783A]" />
                      <h3 className="font-bold text-base text-[#FFFFFF] uppercase tracking-wide">Uncompromising Quality</h3>
                      <p className="text-xs text-white/70 font-light leading-relaxed">
                          From the temperature of our freezers to the origin of our matcha, we obsess over every detail so our customers don't have to. Excellence is our baseline.
                      </p>
                  </div>
                  <div className="space-y-4 p-8 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                      <Coffee className="h-8 w-8 text-[#7CC0C7]" />
                      <h3 className="font-bold text-base text-[#FFFFFF] uppercase tracking-wide">Radical Hospitality</h3>
                      <p className="text-xs text-white/70 font-light leading-relaxed">
                          We don't just serve drinks; we serve moments. We train our teams to anticipate needs, read the room, and deliver interactions that leave a lasting positive mark.
                      </p>
                  </div>
                  <div className="space-y-4 p-8 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                      <Award className="h-8 w-8 text-[#EBDECE]" />
                      <h3 className="font-bold text-base text-[#FFFFFF] uppercase tracking-wide">Intentional Growth</h3>
                      <p className="text-xs text-white/70 font-light leading-relaxed">
                          We expand thoughtfully, ensuring that the magic of store number one is perfectly preserved in store number one hundred. Quality scales gracefully when rooted in culture.
                      </p>
                  </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================== CONTACT PAGE ==================== */}
      {currentTab === 'contact' && (
        <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-10">
            <span className="text-[10px] bg-[#EBDECE]/50 px-3 py-1 rounded-full text-[#BD783A] font-black uppercase tracking-widest">
              Guest Care
            </span>
            <h1 className="font-display text-4xl font-black text-[#2E2A26]">
              Contact Store Support
            </h1>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Our central hospitality officers monitor response times within 24 hours.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-[#EBDECE]/40 shadow-xs text-left grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 space-y-6 border-b md:border-b-0 md:border-r border-[#EBDECE]/40 pb-6 md:pb-0 md:pr-8">
              <h3 className="font-display text-[#BD783A] text-xs font-black uppercase tracking-wider">
                Support Routes
              </h3>
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold">General & Press</h4>
                  <p className="text-gray-500 text-2xs">info@milkpop.co.uk</p>
                </div>
                <div>
                  <h4 className="font-bold">Franchising Team</h4>
                  <p className="text-gray-500 text-2xs">franchise@milkpop.co.uk</p>
                </div>
                <div>
                  <h4 className="font-bold">Recruitment Hub</h4>
                  <p className="text-gray-500 text-2xs">careers@milkpop.co.uk</p>
                </div>
              </div>

              <div className="bg-[#7CC0C7]/20 p-4 rounded-2xl">
                <p className="text-[10px] text-gray-500 leading-relaxed font-light">
                  Looking for store opening diaries or phone coordinates? Skip the message queue and open the Store Locator instead.
                </p>
                <button
                  id="contact-stores-btn-redirect"
                  onClick={() => setCurrentTab('stores')}
                  className="mt-2 text-[10px] font-black text-[#BD783A] uppercase hover:underline cursor-pointer"
                >
                  Store Locator →
                </button>
              </div>
            </div>

            <form onSubmit={handleContactSubmit} className="md:col-span-7 space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-black tracking-wider text-gray-500 mb-1">
                  Full Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={contactForm.fullName}
                  onChange={(e) => setContactForm({ ...contactForm, fullName: e.target.value })}
                  className="w-full text-xs p-3 bg-[#FFFFFF] border border-[#EBDECE] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#BD783A]"
                  placeholder="e.g. Liam Foster"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-black tracking-wider text-gray-500 mb-1">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full text-xs p-3 bg-[#FFFFFF] border border-[#EBDECE] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#BD783A]"
                  placeholder="liam@gmail.com"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-black tracking-wider text-gray-500 mb-1">
                  Reason for Contact
                </label>
                <select
                  id="contact-reason"
                  value={contactForm.reason}
                  onChange={(e) => setContactForm({ ...contactForm, reason: e.target.value })}
                  className="w-full text-xs p-3 bg-[#FFFFFF] border border-[#EBDECE] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#BD783A]"
                >
                  <option value="General feedback">General Guest Feedback</option>
                  <option value="Career queries">Careers & Internships</option>
                  <option value="Partnerships">Wholesale & Event Caterings</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-black tracking-wider text-gray-500 mb-1">
                  Message Details
                </label>
                <textarea
                  id="contact-msg"
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full text-xs p-3 bg-[#FFFFFF] border border-[#EBDECE] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#BD783A] h-28"
                  placeholder="Insert your comments in detailed paragraphs..."
                />
              </div>

              <button
                id="contact-submit-btn"
                type="submit"
                className="w-full py-4 bg-[#BD783A] hover:bg-[#2E2A26] text-white rounded-full text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== NEWS PAGE ==================== */}
      {currentTab === 'news' && (
        <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <span className="text-[10px] bg-[#EBDECE] text-gray-700 px-3 py-1 rounded-full font-black uppercase tracking-widest">
              Company News
            </span>
            <h1 className="font-display text-4xl font-black text-[#2E2A26]">
              Press Releases & Updates
            </h1>
            <p className="text-xs text-yy700 max-w-sm mx-auto">
              Follow store grand openings, recipe announcements, and brand growth metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(newsList || [
              {
                id: 'n1',
                title: 'Grand Reveal: Solihull Mell Square Flagship Churn',
                content: 'A gorgeous 45-seat location designed by award-winning architects, utilizing cream sand wood frameworks and fluid blue packaging wall graphics.',
                date: '28 May 2026',
                category: 'Store Opening',
                tagColor: 'bg-[#7CC0C7]/50 text-sky-850'
              },
              {
                id: 'n2',
                title: 'Milkshake Blue Velvet Recipe Achieves Record Ratings',
                content: 'Utilising organic lavender butterfly pea and marshmallow foam, the Milkshake Blue Velvet achieved a 98% positive guest rating index last month.',
                date: '14 May 2026',
                category: 'New Product',
                tagColor: 'bg-green-100 text-green-805'
              },
              {
                id: 'n3',
                title: 'Milk Pop Launches Unified Business Operational Portal',
                content: 'Empowering store managers and team members by establishing direct connection channels for compliance, rota checking, and academy learning logs.',
                date: '02 April 2026',
                category: 'Team Story',
                tagColor: 'bg-amber-100 text-amber-805'
              }
            ]).filter((x: any) => x.status !== 'draft').map((art: any, idx: number) => (
              <div key={art.id || idx} className="bg-white rounded-3xl overflow-hidden border border-[#EBDECE]/40 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${art.tagColor || 'bg-stone-100 text-stone-700'}`}>
                      {art.category}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {art.date}
                    </span>
                  </div>

                  <h3 className="font-display text-[#2E2A26] font-black text-sm uppercase tracking-wide leading-snug">
                    {art.title}
                  </h3>

                  <p className="text-xs text-[#2E2A26]/85 leading-relaxed font-light lines-3">
                    {art.content}
                  </p>
                </div>

                <div className="px-6 pb-6 pt-3 border-t border-[#EBDECE]/20">
                  <button className="text-[10px] font-black uppercase text-[#BD783A] hover:underline flex items-center space-x-1 cursor-pointer">
                    <span>Read Article</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------- LEGAL & COMPLIANCE ----------- */}

      {currentTab === 'privacy' && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-8 animate-fade-in relative z-20">
          <h1 className="text-3xl font-display font-black tracking-tight uppercase text-[#2E2A26]">Privacy Policy</h1>
          <div className="prose prose-sm text-[#2E2A26]/80 space-y-4">
            <p className="font-bold">Last Updated: May 2026</p>
            <p>At Milk Pop, we respect your right to privacy. This privacy policy explains how we collect, share, and use personal information about you, and how you can exercise your privacy rights.</p>
            <h2 className="text-lg font-bold text-[#2E2A26] mt-6">Data Collection</h2>
            <p>We collect personal data you voluntarily provide to us when expressing an interest in obtaining information about us or our products, when participating in activities on the services, or otherwise when you contact us.</p>
            <h2 className="text-lg font-bold text-[#2E2A26] mt-6">How We Use Information</h2>
            <p>We use personal information collected via our services for a variety of business purposes, such as fulfilling and managing your orders, responding to your inquiries, delivering targeted advertising, and ensuring the security of our platform.</p>
          </div>
        </div>
      )}

      {currentTab === 'gdpr' && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-8 animate-fade-in relative z-20">
          <h1 className="text-3xl font-display font-black tracking-tight uppercase text-[#2E2A26]">UK GDPR Consent Policy</h1>
          <div className="prose prose-sm text-[#2E2A26]/80 space-y-4">
            <p className="font-bold">Compliance Statement</p>
            <p>Milk Pop UK Limited operates in strict accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.</p>
            <h2 className="text-lg font-bold text-[#2E2A26] mt-6">Your Rights</h2>
            <p>Under the UK GDPR, you possess several rights regarding our use of your personal data:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>The right of access:</strong> You have the right to obtain confirmation as to whether or not personal data concerning you are being processed.</li>
              <li><strong>The right to rectification:</strong> You have the right to request the rectification of inaccurate personal data concerning you.</li>
              <li><strong>The right to erasure ("right to be forgotten"):</strong> In certain circumstances, you have the right to request the erasure of your personal data.</li>
            </ul>
            <p className="mt-4">Please contact compliance@milkpop.co.uk to exercise any of your data rights.</p>
          </div>
        </div>
      )}

      {currentTab === 'fdd' && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-8 animate-fade-in relative z-20">
          <h1 className="text-3xl font-display font-black tracking-tight uppercase text-[#2E2A26]">Franchise Disclosure (FDD)</h1>
          <div className="prose prose-sm text-[#2E2A26]/80 space-y-4">
            <p className="font-bold">Corporate Legal Notice & Disclosure</p>
            <p>The information contained within our introductory franchise materials is not intended as an offer to sell, or the solicitation of an offer to buy, a franchise in any jurisdiction where such an offer is legally restricted.</p>
            <h2 className="text-lg font-bold text-[#2E2A26] mt-6">Financial Representations</h2>
            <p>Any financial performance representations or illustrative revenue projections provided during our onboarding phases are purely estimates based on company-owned flagship locations (such as Solihull and Leicester). Actual results may vary, and there is no guarantee you will achieve identical results.</p>
            <h2 className="text-lg font-bold text-[#2E2A26] mt-6">Requesting Formal Disclosure</h2>
            <p>Prospective franchise operators must complete the initial application stage and sign a Non-Disclosure Agreement (NDA) prior to receiving our full, legally binding Franchise Disclosure Document (FDD).</p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
