/**
 * @file StaffPortal.tsx
 * @description The internal intranet/portal for standard company employees ("Team Members" & "Supervisors").
 * 
 * ARCHITECTURE & COMPLIANCE:
 * Features access to personal schedules, the training academy (courses and assessments),
 * SIFR incident reporting, and document storage. 
 * 
 * Recommended Next Steps for Developers:
 * 1. Data Fetching Optimization: The portal relies on massive data arrays passed via props. 
 *    When migrating to a real database layer, each nested "tab" (e.g. `renderAcademy()`) should 
 *    independently fetch its own queries using tools like React Query, rather than passing 
 *    `courses`, `documents`, and `shiftsList` universally down from `App.tsx`.
 * 2. Component Splitting: Abstract the individual domains (`AcademyDashboard`, `RotaViewer`, `IncidentReporting`)
 *    into the `/src/components/staff/` directory.
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  Calendar,
  Award,
  BookOpen,
  FileText,
  Bookmark,
  Send,
  UploadCloud,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Search,
  MessageCircle,
  HelpCircle,
  Clock,
  Heart,
  PlusCircle,
  Lock,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  Coffee,
  Power,
  RotateCcw,
  Sparkles,
  Check,
  Share2,
  ListChecks,
  GraduationCap,
  Building
} from 'lucide-react';
import {
  EmployeeProfile,
  TrainingCourse,
  SIFRReport,
  StaffDocument,
  KnowledgeArticle,
  WorkShift,
  ClockStatus,
  ClockHistoryItem,
  MenuItem,
  Deal,
  StoreLocation,
  Order,
  SiteSettings,
  ChecklistTemplateItem,
  Payslip
} from '../types';
import { LogoVertical, LogoIcon } from '../brand';
import { schedulePush } from '../lib/cloudSync';
import { SalesPOS } from './SalesPOS';
import { WaveDivider } from './WaveDivider';
import {
  INITIAL_COURSES,
  INITIAL_ARTICLES,
  INITIAL_DOCUMENTS,
  INITIAL_SIFR_REPORTS
} from '../data';

interface ChecklistItem {
  id: string;
  task: string;
  category: 'opening' | 'midday' | 'closing';
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
  comment?: string;
}

interface ChecklistAuditLog {
  id: string;
  submittedAt: string;
  submittedBy: string;
  storeName: string;
  category: 'opening' | 'midday' | 'closing';
  completedCount: number;
  totalCount: number;
  items: ChecklistItem[];
}

const DEFAULT_CHECKLIST_ITEMS: ChecklistItem[] = [
  // Opening (5 items)
  { id: 'chk_op_1', task: 'Calibrate espresso grinders to 18g dry, 36g wet yield (30s draw time)', category: 'opening', completed: false },
  { id: 'chk_op_2', task: 'Record Walk-In freezer and refrigeration node temperatures on logs', category: 'opening', completed: false },
  { id: 'chk_op_3', task: 'Wash milk and syrup jug pitchers, place in sanitisation wells', category: 'opening', completed: false },
  { id: 'chk_op_4', task: 'Verify front-of-house point of sale tills are balanced at £150 float', category: 'opening', completed: false },
  { id: 'chk_op_5', task: 'Calibrate pH and chlorine levels on customer-facing water tap nodes', category: 'opening', completed: false },
  
  // Midday (5 items)
  { id: 'chk_mid_1', task: 'Purge and scrape steam wands to prevent milk buildup', category: 'midday', completed: false },
  { id: 'chk_mid_2', task: 'Sanitize prep tables, ice storage wells, and counter surfaces', category: 'midday', completed: false },
  { id: 'chk_mid_3', task: 'Re-fill take-away paper cups, pop lids, and straw dispenser trees', category: 'midday', completed: false },
  { id: 'chk_mid_4', task: 'Clear outside pavement tables, sweep entranceway and wash grates', category: 'midday', completed: false },
  { id: 'chk_mid_5', task: 'Run backwash cleaning cycle on Group 2 and Group 1 boiler heads', category: 'midday', completed: false },

  // Closing (5 items)
  { id: 'chk_cl_1', task: 'Break down and deep clean espresso group heads, screen plates, and baskets', category: 'closing', completed: false },
  { id: 'chk_cl_2', task: 'Disinfect ice pop mould cases and store in deep freeze storage matrix', category: 'closing', completed: false },
  { id: 'chk_cl_3', task: 'Empty and mop out waste milk catchment grates and kitchen floor area', category: 'closing', completed: false },
  { id: 'chk_cl_4', task: 'Perform POS end-of-day till reconciliation against system totals', category: 'closing', completed: false },
  { id: 'chk_cl_5', task: 'Shut down all FOH lights, lock back doors, and set intruder alarms', category: 'closing', completed: false }
];

interface AcademyLesson {
  title: string;
  content: string;
}

interface AcademyCourseDetail {
  id: string;
  lessons: AcademyLesson[];
  quizQuestions: {
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
  }[];
}

const ACADEMY_COURSE_DATA: Record<string, AcademyCourseDetail> = {
  c1: {
    id: 'c1',
    lessons: [
      { title: 'The Milk Pop Spark', content: 'Our vision centers on creating micro-moments of pure, child-like dessert wonder. Every visual layer of caramel sand crumble and butterfly pea flower syrup plays a part in our standard of theatrical beverage joy.' },
      { title: 'The Guest Host Creed', content: 'When guests cross our threshold, they are welcomed as old friends. A perfect greeting, custom garnish recommendations, and attentive hygiene form our operations foundation.' },
      { title: 'Store Ecosystems', content: 'From Touchwood Shopping Precinct to Leicester Highcross, our stores operate as high-vibe flagship hubs. Maintaining clear queues and immaculate countertops ensures every guest leaves with a smile.' }
    ],
    quizQuestions: [
      {
        question: 'What is the core service ethos of the Milk Pop brand?',
        options: ['Rapid factory-line volume output', 'Creating joy through every detail in micro-moments of wonder', 'Lowest-cost artificial sweeteners and powders', 'Disregarding garnish layers for delivery speed'],
        correctAnswerIndex: 1,
        explanation: 'Milk Pop is built on creating genuine joy through high-spec visual and edible craftsmanship.'
      },
      {
        question: 'Where are the roots of the original Milk Pop flagship store?',
        options: ['Touchwood Shopping Precinct, Solihull', 'Bullring Shopping Centre, Birmingham', 'London Soho Square', 'Leicester Highcross Centre'],
        correctAnswerIndex: 0,
        explanation: 'Our flagship store where the recipe blends were perfected is at Touchwood Shopping Precinct, Solihull.'
      },
      {
        question: 'What signature element distinguishes our premium milk recipes?',
        options: ['High-fructose corn syrup bases', 'Premium salted whipped foam & custom temperature-churned custard base', 'Industrial synthetic whey protein mixers', 'Standard shelf-stable milk carton shakes'],
        correctAnswerIndex: 1,
        explanation: 'We leverage a proprietary temperature-churned custard base topped with golden sea salt whip and crumbles.'
      }
    ]
  },
  c2: {
    id: 'c2',
    lessons: [
      { title: 'Espresso Extraction Physics', content: 'Our group boiler lines are designed to perform precisely. Standard barista dosing requests 18 grams of roasted house beans, yielding exactly 36 grams of wet espresso fluid over 28 to 32 seconds drawing time.' },
      { title: 'Microfoam Churning Standards', content: 'Texturing milk requires continuous circular whirlpooling. Steam wands must rest at a 15-degree angle, aerating the milk for 3-5 seconds before submerging to heat. Hold milk hold temperature strictly in the sweet spot between 60°C and 65°C to caramelize lactose sugars perfectly.' },
      { title: 'The Signature Golden Stack', content: 'To assemble the flagship Caramel Sand Dream: fill the custom glass with 250ml of vanilla stout custard, spiral 15ml of warm caramel syrup along inner wall profiles, add the fresh espresso draw, and finish with our signature salted whipped foam dome and shortbread crumbles.' }
    ],
    quizQuestions: [
      {
        question: 'What is our certified calibration recipe standard for a signature espresso draw?',
        options: ['10g dry grounds in, 20g out in 15 seconds', '18g dry grounds in, 36g wet yield out in 30 seconds (tolerance: 28-32s)', '14g dry grounds in, 60g output in 45 seconds', '22g dry grounds in, 44g output in 10 seconds'],
        correctAnswerIndex: 1,
        explanation: 'An 18g dry dose with a 36g water weight extraction time of 30 seconds delivers maximum caramel notes from our organic roasted blend.'
      },
      {
        question: 'What is the certified temperature range for drawing sweet, velvety milk microfoam?',
        options: ['30°C to 45°C (lukewarm)', '60°C to 65°C (Sweet Spot)', '85°C to 95°C (scalded)', '0°C to 5°C (cold blend)'],
        correctAnswerIndex: 1,
        explanation: 'Aerating to 60°C-65°C caramelizes lactose for sweetness. Exceeding 70°C scalds proteins and ruins the smooth microfoam matrix.'
      },
      {
        question: 'What is the correct structural assembly standard of the Caramel Sand Dream shake?',
        options: ['Artificial coffee syrup mixed in plain milk with vanilla whipped spray', 'Vanilla stout custard base, warm inner caramel wall glaze spiralling, fresh espresso, finished with a salted whipped dome and shortbread crumbles', 'Espresso shot dumped over cold water with crushed caramel ice bits', 'Syrup splash inside a plastic bottle shaken for 30 seconds'],
        correctAnswerIndex: 1,
        explanation: 'Our signature stack combines exact temperatures and visual wall spirals with high-tactility crumbles.'
      }
    ]
  },
  c3: {
    id: 'c3',
    lessons: [
      { title: 'Refrigeration Limits (HACCP)', content: 'Milk and dairy are highly sensitive raw materials. Our Walk-In chills and under-counter fridge modules must be kept constantly between 1°C and 4°C. Logging these temperatures twice per shift on digital checklists is a non-negotiable legal requirement.' },
      { title: 'Allergen Separation Protocol', content: 'Nut allergens like pistachios can trigger severe reactions. To isolate allergic elements, we have dedicated orange-banded blender canisters and scrapers. Baristas must wash their hands and put on fresh gloves before preparing allergen-safe orders.' },
      { title: 'Surface Sanitisation Care', content: 'All food-contact surfaces must be sanitised regularly. When spray is applied, the chemical sanitiser must dwell on the stainless steel tabletop for at least 30 seconds to dissolve microbial cell walls. Always wipe dry using single-use green lint-free cloths.' }
    ],
    quizQuestions: [
      {
        question: 'What is the legally mandated safe temperature range for milk walk-in refrigeration units?',
        options: ['5°C to 10°C', '1°C to 4°C', '-5°C to 0°C', '10°C to 15°C'],
        correctAnswerIndex: 1,
        explanation: 'Cold storage below 4°C keeps bacterial development passive, and keeping it above 1°C prevents dairy freeze crystallization.'
      },
      {
        question: 'What must a barista retrieve immediately when an allergen-safe order is triggered?',
        options: ['The first available clean metal canister from the counter', 'Dedicated orange-rimmed allergy canisters and fresh secondary disposable gloves', 'A generic take-away cup to handle hand-stirring in back', 'No special steps are needed if the cup is rinsed with warm tap water'],
        correctAnswerIndex: 1,
        explanation: 'Baristas must scrub their hands, don fresh clean gloves, and use orange-rimmed allergy canisters to avoid pistachio/dairy cross-contact.'
      },
      {
        question: 'How long should sanitiser dwell on food-contact counters before being wiped off?',
        options: ['At least 30 seconds to ensure chemical pathogen destruction', 'Zero seconds (spray and wipe immediately)', '10 minutes minimum', 'The counters do not require sanitising if they look shiny'],
        correctAnswerIndex: 0,
        explanation: 'Chemically, the active sanitation compounds require a minimum contact time of 30 seconds to eliminate micro-pathogens.'
      }
    ]
  },
  c4: {
    id: 'c4',
    lessons: [
      { title: 'The "Yes and Care" Philosophy', content: 'We never simply say "no" to custom requests. If a guest wants a completely vegan swap, suggest replacing dairy components with our premium soy-coconut whip alternatives and strawberry puree folds.' },
      { title: 'Peak Queue Navigation', content: 'During peak hours, lines can grow rapidly. Stay calm, maintain eye contact, greet the next customer even while completing the current shake, and direct them to their pickup tray with cheerful guidance.' },
      { title: 'Handling Guest Concerns', content: 'Customer feedback is a direct path to perfection. If a customer is unhappy with a beverage, apologize immediately, take custody of the issue, and prepare an immediate fresh rebuild with extra care. Register the occurrence on Sifr reports to help managers track issues.' }
    ],
    quizQuestions: [
      {
        question: 'If a guest notes their premium shake looks slightly flat, how should you respond?',
        options: ['Inform them cold cream naturally sinks and instruct them to drink faster', 'Apologize with warmth, take possession of the cup, and prepare an immediate fresh rebuild to golden photo-spec standards', 'Refer the guest to the terms on their printed ticket receipt', 'Suggest they purchase an alternative waffle cup desserts instead'],
        correctAnswerIndex: 1,
        explanation: 'We reclaim trust by showing active, cheerful concern, apologizing, and restoring their dessert to absolute benchmark perfection.'
      },
      {
        question: 'How should you manage high-traffic guest flows during peak shopping hours?',
        options: ['Move slower to make sure you do not get tired', 'Keep active eye contact, greet waiting queue guests with a smile, use single-squeeze POS shortcuts, and guide them to designated collection zones', 'Temporarily close the order tills to restock cup holders and clear benches', 'Ask the guests to wait outside the lobby precinct'],
        correctAnswerIndex: 1,
        explanation: 'Parallel processing, welcoming glances, and clear physical zone direction prevent queue fatigue and streamline delivery.'
      },
      {
        question: 'What is the best way to utilize custom options to delight our guests?',
        options: ['Refuse any alterations to preserve strict preparation speed', 'Actively suggest pairing honeycombs, warm caramel sand syrup, or oat milk swaps to match their diet', 'Charge double for custom options and keep list simple', 'Direct guests to the self-checkout terminal for standard profiles only'],
        correctAnswerIndex: 1,
        explanation: 'Personalizing dessert combinations makes visitors feel cared for and increases brand attachment.'
      }
    ]
  }
};

interface StaffPortalProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  employee: EmployeeProfile | null;
  onLogin: (email: string, password?: string) => void;
  onUpdatePassword?: (newPw: string) => void;
  onLogout: () => void;
  courses: TrainingCourse[];
  onUpdateCourse: (courseId: string, progress: number) => void;
  documents: StaffDocument[];
  onAddDocument: (doc: StaffDocument) => void;
  sifrReports: SIFRReport[];
  onAddSIFRReport: (rep: SIFRReport) => void;
  onAddSIFRReply: (reportId: string, msg: string, userName: string, userRole: string) => void;
  addToast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  employeesList: EmployeeProfile[];
  shiftsList: WorkShift[];
  onAddShift?: (shift: WorkShift) => void;
  onDeleteShift?: (id: string) => void;
  assessments?: any[];
  menuItems: MenuItem[];
  deals: Deal[];
  stores: StoreLocation[];
  orders: Order[];
  onAddOrder: (order: Order) => void;
  siteSettings: SiteSettings;
  checklistTemplates: ChecklistTemplateItem[];
  /** Shared timesheet log — lives in App state so managers can approve it. */
  clockHistory: ClockHistoryItem[];
  setClockHistory: React.Dispatch<React.SetStateAction<ClockHistoryItem[]>>;
  /** Generated payslips (read-only for staff). */
  payslips: Payslip[];
}

export const StaffPortal: React.FC<StaffPortalProps> = ({
  currentTab,
  setCurrentTab,
  employee,
  onLogin,
  onUpdatePassword,
  onLogout,
  courses,
  onUpdateCourse,
  documents,
  onAddDocument,
  sifrReports,
  onAddSIFRReport,
  onAddSIFRReply,
  addToast,
  employeesList,
  shiftsList,
  onAddShift,
  onDeleteShift,
  assessments,
  menuItems,
  deals,
  stores,
  orders,
  onAddOrder,
  siteSettings,
  checklistTemplates,
  clockHistory,
  setClockHistory,
  payslips
}) => {
  // Login credentials simulation state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedSimRole, setSelectedSimRole] = useState('team_member');

  // Real-time ticking clock state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Persistent shift clock state
  const [clockStatus, setClockStatus] = useState<ClockStatus>(() => {
    // Attempt local storage fetch when component loads, otherwise default to clocked_out
    try {
      const storedSess = localStorage.getItem('milkpop_session');
      if (storedSess) {
        const emp = JSON.parse(storedSess) as EmployeeProfile;
        const storedClock = localStorage.getItem(`milkpop_clock_status_${emp.id}`);
        if (storedClock) return JSON.parse(storedClock);
      }
    } catch (e) {
      console.warn('Clock status read fail:', e);
    }
    return { employeeId: '', status: 'clocked_out', lastActivity: new Date().toISOString() };
  });

  // Timesheet history now arrives via props (shared App state + Supabase
  // `clock_history` table) so store managers / the owner can approve hours.

  // Coverage Swap board state
  const [coverRequests, setCoverRequests] = useState<{ [shiftId: string]: { requestedBy: string; message: string; date: string } }>(() => {
    try {
      const saved = localStorage.getItem('milkpop_shift_covers');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Roster weekday filter. Options: "all" or direct day code eg "Mon", "Tue" etc.
  const [rosterDayFilter, setRosterDayFilter] = useState<string>('all');

  // Clock Out brief user notes
  const [clockOutNotes, setClockOutNotes] = useState('');
  const [showClockOutNotesForm, setShowClockOutNotesForm] = useState(false);

  // Shift cover request text popup helper
  const [coverRequestMessageMap, setCoverRequestMessageMap] = useState<{ [shiftId: string]: string }>({});

  // Daily checklists state
  const [checklistTasks, setChecklistTasks] = useState<ChecklistItem[]>(() => {
    try {
      const saved = localStorage.getItem('milkpop_checklist_tasks');
      return saved ? JSON.parse(saved) : DEFAULT_CHECKLIST_ITEMS;
    } catch (e) {
      return DEFAULT_CHECKLIST_ITEMS;
    }
  });

  const [checklistAuditLogs, setChecklistAuditLogs] = useState<ChecklistAuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('milkpop_checklist_audits');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [activeChecklistCategory, setActiveChecklistCategory] = useState<'opening' | 'midday' | 'closing'>('opening');
  const [newChecklistCommentId, setNewChecklistCommentId] = useState<string | null>(null);
  const [checklistCommentText, setChecklistCommentText] = useState<string>('');

  // Academy interactive state
  const [activeAcademyCourse, setActiveAcademyCourse] = useState<TrainingCourse | null>(null);
  const [activeAcademyCourseLessonIndex, setActiveAcademyCourseLessonIndex] = useState<number>(0);
  const [showAcademyQuiz, setShowAcademyQuiz] = useState<boolean>(false);
  const [academyQuizUserAnswers, setAcademyQuizUserAnswers] = useState<Record<number, number>>({});
  const [academyQuizChecked, setAcademyQuizChecked] = useState<boolean>(false);
  const [academyQuizPassed, setAcademyQuizPassed] = useState<boolean>(false);

  // Owner-managed templates (Admin Panel -> Staff Checklists) drive the task list.
  // Completion state is preserved by template id; renamed items pick up the new label.
  useEffect(() => {
    if (!checklistTemplates || checklistTemplates.length === 0) return;
    setChecklistTasks((prev) => {
      const prevById = new Map<string, ChecklistItem>(prev.map((t: ChecklistItem) => [t.id, t]));
      return [...checklistTemplates]
        .sort((a, b) => a.category.localeCompare(b.category) || a.sortOrder - b.sortOrder)
        .map((tpl) => {
          const existing = prevById.get(tpl.id);
          return {
            id: tpl.id,
            task: tpl.label,
            category: tpl.category,
            completed: existing?.completed || false,
            completedBy: existing?.completedBy,
            completedAt: existing?.completedAt,
            comment: existing?.comment
          } as ChecklistItem;
        });
    });
  }, [checklistTemplates]);

  // Sync checklists to storage when updated
  useEffect(() => {
    try {
      localStorage.setItem('milkpop_checklist_tasks', JSON.stringify(checklistTasks));
      schedulePush('milkpop_checklist_tasks', checklistTasks);
    } catch (e) {}
  }, [checklistTasks]);

  useEffect(() => {
    try {
      localStorage.setItem('milkpop_checklist_audits', JSON.stringify(checklistAuditLogs));
      schedulePush('milkpop_checklist_audits', checklistAuditLogs);
    } catch (e) {}
  }, [checklistAuditLogs]);

  // Remove navigation tabs carousel scroll tracking as they are moved to navbar

  const handleToggleChecklistTask = (taskId: string) => {
    if (!employee) return;
    const updated = checklistTasks.map(task => {
      if (task.id === taskId) {
        if (!task.completed) {
          return {
            ...task,
            completed: true,
            completedBy: employee.name,
            completedAt: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
          };
        } else {
          return {
            ...task,
            completed: false,
            completedBy: undefined,
            completedAt: undefined
          };
        }
      }
      return task;
    });
    setChecklistTasks(updated);
    addToast('Task status updated! 🥛', 'success');
  };

  const handleSaveTaskComment = (taskId: string) => {
    const updated = checklistTasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          comment: checklistCommentText.trim() || undefined
        };
      }
      return task;
    });
    setChecklistTasks(updated);
    setNewChecklistCommentId(null);
    setChecklistCommentText('');
    addToast('Observation observation logged.', 'success');
  };

  const handleSubmitChecklistCategory = (category: 'opening' | 'midday' | 'closing') => {
    if (!employee) return;
    const categoryTasks = checklistTasks.filter(t => t.category === category);
    const completedTasks = categoryTasks.filter(t => t.completed);

    if (categoryTasks.length === 0) return;

    const newAuditLog: ChecklistAuditLog = {
      id: 'audit_' + Date.now(),
      submittedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      submittedBy: employee.name,
      storeName: employee.storeName,
      category,
      completedCount: completedTasks.length,
      totalCount: categoryTasks.length,
      items: JSON.parse(JSON.stringify(categoryTasks))
    };

    const updatedLogs = [newAuditLog, ...checklistAuditLogs];
    setChecklistAuditLogs(updatedLogs);

    // Sync checkist audits instantly to both namespaces for real-time compliance cross-over!
    try {
      localStorage.setItem('milkpop_checklist_audits', JSON.stringify(updatedLogs));
      schedulePush('milkpop_checklist_audits', updatedLogs);
    } catch(e){}

    // Clean checks for current category so we start fresh!
    const updatedTasks = checklistTasks.map(t => {
      if (t.category === category) {
        return {
          ...t,
          completed: false,
          completedBy: undefined,
          completedAt: undefined,
          comment: undefined
        };
      }
      return t;
    });
    setChecklistTasks(updatedTasks);
    
    // Grant bonus Training Points
    addToast(`Audit submitted. Registered in retail archives. 🌟 +50 Experience points awarded!`, 'success');
    
    const updatedProfile: EmployeeProfile = {
      ...employee,
      points: employee.points + 50,
      level: Math.floor((employee.points + 50) / 450) + 1
    };
    try {
      localStorage.setItem('milkpop_session', JSON.stringify(updatedProfile));
    } catch(e){}
  };

  const handleCheckAcademyQuizAnswers = () => {
    if (!activeAcademyCourse) return;
    const courseDetail = ACADEMY_COURSE_DATA[activeAcademyCourse.id];
    if (!courseDetail) return;

    let allCorrect = true;
    courseDetail.quizQuestions.forEach((q, idx) => {
      if (academyQuizUserAnswers[idx] !== q.correctAnswerIndex) {
        allCorrect = false;
      }
    });

    setAcademyQuizChecked(true);
    setAcademyQuizPassed(allCorrect);

    if (allCorrect) {
      onUpdateCourse(activeAcademyCourse.id, 100);
      addToast(`Quiz Passed at 100%! Completed "${activeAcademyCourse.title}" and unlocked the "${activeAcademyCourse.badge}"! 🏆`, 'success');
      
      if (employee) {
        const updatedBadges = Array.from(new Set([...employee.badges, activeAcademyCourse.badge]));
        const updatedPoints = employee.points + activeAcademyCourse.points;
        const updatedLevel = Math.floor(updatedPoints / 450) + 1;
        const updatedProf = {
          ...employee,
          badges: updatedBadges,
          points: updatedPoints,
          level: updatedLevel
        };
        try {
          localStorage.setItem('milkpop_session', JSON.stringify(updatedProf));
        } catch(e){}
      }
    } else {
      addToast('Validation Checklist Mismatch: Some responses were incorrect. Review notes and retry!', 'error');
    }
  };
  const [activeCoveringFormId, setActiveCoveringFormId] = useState<string | null>(null);

  // Sync clock status when active logged employee switches
  useEffect(() => {
    if (employee) {
      try {
        const saved = localStorage.getItem(`milkpop_clock_status_${employee.id}`);
        if (saved) {
          setClockStatus(JSON.parse(saved));
        } else {
          setClockStatus({ employeeId: employee.id, status: 'clocked_out', lastActivity: new Date().toISOString() });
        }
      } catch (e) {
        console.warn(e);
      }
    }
  }, [employee]);

  // Keep digital timer ticking safely
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Clock operations
  const handleClockIn = () => {
    if (!employee) return;
    const now = new Date().toISOString();
    const newStatus: ClockStatus = {
      employeeId: employee.id,
      status: 'clocked_in',
      lastActivity: now,
      clockInTime: now,
      accumulatedBreakMs: 0
    };
    setClockStatus(newStatus);
    try {
      localStorage.setItem(`milkpop_clock_status_${employee.id}`, JSON.stringify(newStatus));
      schedulePush(`milkpop_clock_status_${employee.id}`, newStatus);
    } catch (err) {
      console.warn(err);
    }
    addToast('Successfully Clocked In. Enjoy your shift! 🥛✨', 'success');
  };

  const handleStartBreak = () => {
    if (!employee || clockStatus.status !== 'clocked_in') return;
    const now = new Date().toISOString();
    const newStatus: ClockStatus = {
      ...clockStatus,
      status: 'on_break',
      lastActivity: now,
      breakStartTime: now
    };
    setClockStatus(newStatus);
    try {
      localStorage.setItem(`milkpop_clock_status_${employee.id}`, JSON.stringify(newStatus));
      schedulePush(`milkpop_clock_status_${employee.id}`, newStatus);
    } catch (err) {
      console.warn(err);
    }
    addToast('Break session started. Rest well! ☕️', 'warning');
  };

  const handleEndBreak = () => {
    if (!employee || clockStatus.status !== 'on_break' || !clockStatus.breakStartTime) return;
    const now = new Date().toISOString();
    const breakDurationMs = new Date(now).getTime() - new Date(clockStatus.breakStartTime).getTime();
    const prevAccumulated = clockStatus.accumulatedBreakMs || 0;

    const newStatus: ClockStatus = {
      ...clockStatus,
      status: 'clocked_in',
      lastActivity: now,
      breakStartTime: undefined,
      accumulatedBreakMs: prevAccumulated + breakDurationMs
    };
    setClockStatus(newStatus);
    try {
      localStorage.setItem(`milkpop_clock_status_${employee.id}`, JSON.stringify(newStatus));
      schedulePush(`milkpop_clock_status_${employee.id}`, newStatus);
    } catch (err) {
      console.warn(err);
    }
    addToast('Break completed. Welcome back to the floor!', 'success');
  };

  const handleClockOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee || (clockStatus.status !== 'clocked_in' && clockStatus.status !== 'on_break') || !clockStatus.clockInTime) return;

    const now = new Date().toISOString();
    let computedBreakMs = clockStatus.accumulatedBreakMs || 0;

    // Add extra break time if they clocked out while on break
    if (clockStatus.status === 'on_break' && clockStatus.breakStartTime) {
      computedBreakMs += new Date(now).getTime() - new Date(clockStatus.breakStartTime).getTime();
    }

    const startMs = new Date(clockStatus.clockInTime).getTime();
    const endMs = new Date(now).getTime();
    const workingDurationMs = Math.max(0, (endMs - startMs) - computedBreakMs);
    const breakMinutes = Math.round(computedBreakMs / 60000);
    const decimalHours = parseFloat((workingDurationMs / 3600000).toFixed(2));

    const newHistoryItem: ClockHistoryItem = {
      id: 'clock_' + Date.now(),
      employeeId: employee.id,
      employeeName: employee.name,
      date: new Date().toISOString().split('T')[0],
      clockIn: clockStatus.clockInTime,
      clockOut: now,
      breakDurationMinutes: breakMinutes,
      totalDecimalHours: decimalHours,
      approved: false,
      notes: clockOutNotes || undefined
    };

    // Shared App state — persisted to localStorage and mirrored to the
    // Supabase `clock_history` table automatically by useLocalStorageState.
    setClockHistory((prev) => [newHistoryItem, ...prev]);

    const resetClock: ClockStatus = {
      employeeId: employee.id,
      status: 'clocked_out',
      lastActivity: now
    };
    setClockStatus(resetClock);
    try {
      localStorage.setItem(`milkpop_clock_status_${employee.id}`, JSON.stringify(resetClock));
      schedulePush(`milkpop_clock_status_${employee.id}`, resetClock);
    } catch (err) {
      console.warn(err);
    }

    setShowClockOutNotesForm(false);
    setClockOutNotes('');
    addToast(`Clocked Out. ${decimalHours} hours logged — now pending manager approval. Enjoy your rest! 🏡`, 'success');
  };

  // Shift cover logic
  const handlePublishCoverRequest = (shiftId: string) => {
    if (!employee) return;
    const msg = coverRequestMessageMap[shiftId] || 'Needs cover due to sudden study/personal schedule clash.';
    const updated = {
      ...coverRequests,
      [shiftId]: {
        requestedBy: employee.name,
        message: msg,
        date: new Date().toISOString()
      }
    };
    setCoverRequests(updated);
    try {
      localStorage.setItem('milkpop_shift_covers', JSON.stringify(updated));
      schedulePush('milkpop_shift_covers', updated);
    } catch (err) {
      console.warn(err);
    }
    setActiveCoveringFormId(null);
    setCoverRequestMessageMap({ ...coverRequestMessageMap, [shiftId]: '' });
    addToast('Coverage swap request posted to the team community board. 📣', 'success');
  };

  const handleRetractCoverRequest = (shiftId: string) => {
    const updated = { ...coverRequests };
    delete updated[shiftId];
    setCoverRequests(updated);
    try {
      localStorage.setItem('milkpop_shift_covers', JSON.stringify(updated));
      schedulePush('milkpop_shift_covers', updated);
    } catch (err) {
      console.warn(err);
    }
    addToast('Coverage request withdrawn from team cycle.', 'warning');
  };

  const handleClaimCoverShift = (shift: WorkShift) => {
    if (!employee) return;
    if (shift.employeeId === employee.id) {
      addToast('Conception issue: You already own this shift event block!', 'error');
      return;
    }

    // Call state update helpers to reassign the shift directly to this user!
    // This is incredibly powerful and represents true elite roster logic.
    if (onDeleteShift && onAddShift) {
      // Step 1: Remove old assignee shift
      onDeleteShift(shift.id);

      // Step 2: Add same shift with new employee ID and name
      const swappedShift: WorkShift = {
        ...shift,
        employeeId: employee.id,
        employeeName: employee.name,
        role: employee.role,
        notes: `Shift coverage claimed by ${employee.name}`
      };
      onAddShift(swappedShift);

      // Step 3: Clear cover key
      const updatedCovers = { ...coverRequests };
      delete updatedCovers[shift.id];
      setCoverRequests(updatedCovers);
      try {
        localStorage.setItem('milkpop_shift_covers', JSON.stringify(updatedCovers));
        schedulePush('milkpop_shift_covers', updatedCovers);
      } catch (err) {}

      addToast(`Roster transfer secured! You are now scheduled for ${shift.date} (${shift.startTime}-${shift.endTime}). Thanks for supporting the team! ❤️`, 'success');
    } else {
      addToast('Shift operations interface pending loading on admin node. Re-try shortly.', 'warning');
    }
  };

  // Helper: check if a shift date corresponds to a specific day profile
  const getDayOfWeekName = (dateStr: string): string => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { weekday: 'short' }); // "Mon", "Tue"...
    } catch (e) {
      return '';
    }
  };

  // Helper: determine if a teammate is online right now based on shift list today
  const isTeammateCurrentlyShiftActive = (sh: WorkShift): boolean => {
    try {
      const todayString = new Date().toISOString().split('T')[0];
      if (sh.date !== todayString) return false;

      const [startHour, startMin] = sh.startTime.split(':').map(Number);
      const [endHour, endMin] = sh.endTime.split(':').map(Number);

      const dNow = new Date();
      const currentHour = dNow.getHours();
      const currentMin = dNow.getMinutes();

      const valNow = currentHour * 60 + currentMin;
      const valStart = startHour * 60 + startMin;
      const valEnd = endHour * 60 + endMin;

      return valNow >= valStart && valNow <= valEnd;
    } catch (e) {
      return false;
    }
  };

  // SIFR submission form states
  const [sifrForm, setSifrForm] = useState({
    title: '',
    category: 'operations' as any,
    date: new Date().toISOString().split('T')[0],
    involvedPeople: '',
    description: '',
    impact: '',
    suggestedAction: '',
    confidentiality: 'standard' as 'confidential' | 'standard'
  });

  // Document upload simulation forms
  const [docForm, setDocForm] = useState({
    name: '',
    category: 'compliance' as any
  });
  const [simUploadedDocName, setSimUploadedDocName] = useState('');

  // SIFR comment state map
  const [sifrComments, setSifrComments] = useState<{ [key: string]: string }>({});

  // Knowledge base search filter
  const [kbSearch, setKbSearch] = useState('');
  const [kbCategory, setKbCategory] = useState('all');

  // Staff Dashboard interactive rota view state
  const [dashboardRotaTab, setDashboardRotaTab] = useState<'my_rota' | 'store_team'>('my_rota');
  const daysScrollRef = useRef<HTMLDivElement>(null);
  
  const scrollDays = (direction: 'left' | 'right') => {
    if (daysScrollRef.current) {
      const scrollAmount = 250;
      daysScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      addToast('Please input secure credentials to continue.', 'error');
      return;
    }
    
    onLogin(loginEmail, loginPassword);
  };

  const handleSifrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sifrForm.title || !sifrForm.description || !sifrForm.suggestedAction) {
      addToast('Please complete all boxes on the SIFR form.', 'error');
      return;
    }
    if (!employee) return;

    const newReport: SIFRReport = {
      id: 'sifr_' + Date.now(),
      title: sifrForm.title,
      category: sifrForm.category,
      date: sifrForm.date,
      involvedPeople: sifrForm.involvedPeople || 'Self contribution only',
      storeId: employee.storeId,
      storeName: employee.storeName,
      description: sifrForm.description,
      impact: sifrForm.impact,
      suggestedAction: sifrForm.suggestedAction,
      confidentiality: sifrForm.confidentiality,
      status: 'submitted',
      reporterName: sifrForm.confidentiality === 'confidential' ? 'Anonymous Member' : employee.name,
      reporterId: employee.id,
      submittedAt: new Date().toISOString(),
      replies: []
    };

    onAddSIFRReport(newReport);
    addToast('The SIFR Operations Observation has been filed. Central managers will review accountability parameters.', 'success');
    
    // Clear Form
    setSifrForm({
      title: '',
      category: 'operations',
      date: new Date().toISOString().split('T')[0],
      involvedPeople: '',
      description: '',
      impact: '',
      suggestedAction: '',
      confidentiality: 'standard'
    });
  };

  const handleDocUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.name) {
      addToast('Please provide a descriptive file label.', 'error');
      return;
    }
    const newDoc: StaffDocument = {
      id: 'doc_' + Date.now(),
      name: docForm.name,
      type: 'PDF Signed Document',
      category: docForm.category,
      uploadDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      status: 'pending',
      url: '#'
    };
    onAddDocument(newDoc);
    addToast('Compliance document scheduled for store manager verification.', 'success');
    setDocForm({ name: '', category: 'compliance' });
    setSimUploadedDocName('');
  };

  const handleReplySubmit = (reportId: string) => {
    const text = sifrComments[reportId];
    if (!text || !text.trim() || !employee) return;

    onAddSIFRReply(reportId, text, employee.name, employee.role);
    addToast('Comment dispatched successfully.', 'success');
    setSifrComments({ ...sifrComments, [reportId]: '' });
  };

  const handleSimulateAcademy = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    if (course.progress >= 100) {
      addToast('Course is already completed at 100%!', 'warning');
      return;
    }

    const nextProgress = Math.min(course.progress + 25, 100);
    onUpdateCourse(courseId, nextProgress);

    if (nextProgress === 100) {
      addToast(`Perfect Score! You completed "${course.title}" and unlocked the "${course.badge}"!`, 'success');
    } else {
      addToast(`Simulated study hour completed: Progress is now ${nextProgress}% (+25%)!`, 'success');
    }
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen">
      {/* BACKGROUND DECORATIVE ACCENTS */}
      <div className="bg-[#2E2A26] text-white py-12 px-4 shadow-xs text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#BD783A]/10 rounded-full filter blur-xl" />
        <div className="absolute bottom-[-20px] left-0 w-full">
          <WaveDivider color="#FFFFFF" bgColor="#2E2A26" type="double" />
        </div>

        <div className="max-w-7xl mx-auto space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-1 bg-white/10 px-3 py-1 rounded-full text-xs text-[#EBDECE]">
            <Lock className="h-3 w-3 text-[#BD783A]" />
            <span className="font-bold tracking-wider uppercase text-[9px]">Internal Corporate Operations Network</span>
          </div>
          <h1 className="font-display text-3xl font-black text-[#FFFFFF]">
            {employee ? `Welcome back, ${employee.name}` : 'Milk Pop Staff Hub'}
          </h1>
          <p className="text-xs text-[#EBDECE]/85 max-w-sm mx-auto">
            {employee ? `Authorized Access Node: ${employee.storeName} Flagship Bar` : 'Secure credential gateway for team members and regional operations leaders.'}
          </p>
        </div>
      </div>

      {currentTab === 'staff_login' && !employee && (
        <div className="max-w-md mx-auto py-16 px-4">
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#EBDECE] shadow-sm flex flex-col justify-between text-left">
            <div className="space-y-6">
              <div className="space-y-3 text-center flex flex-col items-center">
                <LogoVertical className="h-20 w-auto" title="Milk Pop staff portal" />
                <h2 className="text-xl font-bold tracking-tight text-[#2E2A26]">Staff Portal Access</h2>
                <p className="text-xs text-neutral-500 leading-relaxed text-center">
                  Verify your secure credentials to log hours, organize shifts, access the academy courses, and handle compliance records.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2">
                <div>
                  <label className="block text-[10px] uppercase font-extrabold tracking-widest text-[#2E2A26]/70 mb-1.5 font-sans">
                    Employee Email
                  </label>
                  <input
                    id="staff-email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. sarah.j@milkpop.co.uk"
                    className="w-full text-xs p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-1 focus:ring-[#BD783A] focus:border-[#BD783A] focus:bg-white focus:outline-none transition-all placeholder:text-neutral-400 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-extrabold tracking-widest text-[#2E2A26]/70 mb-1.5 font-sans">
                    Security Pass PIN
                  </label>
                  <input
                    id="staff-pin"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-1 focus:ring-[#BD783A] focus:border-[#BD783A] focus:bg-white focus:outline-none transition-all placeholder:text-neutral-400 tracking-wider"
                  />
                </div>

                <div className="flex items-center justify-between text-2xs text-[#2E2A26] pt-1">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      className="rounded border-neutral-300 text-[#2E2A26] focus:ring-[#BD783A] h-3.5 w-3.5" 
                    />
                    <span className="text-neutral-500 font-medium select-none">Stay signed in</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => addToast('PIN recovery guidelines dispatched to store administrator.', 'success')}
                    className="hover:underline text-[#BD783A] font-extrabold"
                  >
                    Forgot PIN Code?
                  </button>
                </div>

                <button
                  id="staff-login-btn-final"
                  type="submit"
                  className="w-full py-4 mt-2 bg-[#2E2A26] hover:bg-[#BD783A] text-white rounded-full text-xs tracking-wider font-extrabold uppercase transition-colors duration-200 shadow-xs cursor-pointer flex items-center justify-center space-x-2"
                >
                  <span>Authenticate PIN</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </form>
            </div>

            <div className="border-t border-neutral-100 pt-6 mt-8">
              <p className="text-[10px] text-neutral-400 leading-relaxed font-light text-center">
                Milk Pop UK Retail Terminal. All sessions logged under UK GDPR safety audit criteria.
              </p>
            </div>
          </div>
        </div>
      )}

      {employee && employee.mustChangePassword ? (
        <div className="max-w-md mx-auto py-16 px-4">
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#EBDECE] shadow-sm flex flex-col justify-between text-left">
            <div className="space-y-6">
              <div className="space-y-2 text-center flex flex-col items-center">
                <div className="inline-flex p-3 bg-rose-50 rounded-2xl text-rose-500">
                  <Lock className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-[#2E2A26]">Update Default PIN</h2>
                <p className="text-xs text-neutral-500 leading-relaxed text-center">
                  To ensure the safety of your account, please update the temporary security PIN given to you at onboarding.
                </p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (newPassword !== confirmPassword) {
                  addToast('Passwords do not match.', 'error');
                  return;
                }
                if (newPassword.length < 8) {
                  addToast('PIN must be at least 8 characters long.', 'error');
                  return;
                }
                if (onUpdatePassword) onUpdatePassword(newPassword);
              }} className="space-y-4 pt-2">
                <div>
                  <label className="block text-[10px] uppercase font-extrabold tracking-widest text-[#2E2A26]/70 mb-1.5 font-sans">
                    New Security PIN
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-1 focus:ring-[#BD783A] focus:border-[#BD783A] focus:bg-white focus:outline-none transition-all placeholder:text-neutral-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-extrabold tracking-widest text-[#2E2A26]/70 mb-1.5 font-sans">
                    Confirm PIN
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-1 focus:ring-[#BD783A] focus:border-[#BD783A] focus:bg-white focus:outline-none transition-all placeholder:text-neutral-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs tracking-wider font-extrabold uppercase transition-colors duration-200 shadow-xs cursor-pointer flex items-center justify-center space-x-2"
                >
                  <span>Set Secure PIN</span>
                  <Check className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : employee && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* HUB COMPONENT MENU BAR */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBDECE]/50 pb-4">
            <h2 className="text-xl md:text-2xl font-black text-[#2E2A26] tracking-tight">
              {currentTab === 'staff_dashboard' && 'My Dashboard'}
              {currentTab === 'staff_pos' && 'Till — Point of Sale'}
              {currentTab === 'staff_documents' && 'My Document Center'}
              {currentTab === 'staff_checklists' && 'Shift Checklists'}
              {currentTab === 'staff_academy' && 'Training Academy'}
              {currentTab === 'staff_sifr' && 'SIFR Report Logs'}
              {currentTab === 'staff_kb' && 'Internal Operations Library'}
            </h2>

            {/* Quick jump to Admin Panel if authorized */}
            {(employee.role === 'store_manager' || employee.role === 'owner') && (
              <div className="shrink-0 flex justify-start sm:justify-end">
                <button
                  id="hub-tab-admin-dash"
                  onClick={() => setCurrentTab('admin_panel')}
                  className="px-5 py-2.5 bg-neutral-900 hover:bg-[#BD783A] text-white rounded-full text-2xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-md hover:-translate-y-0.5"
                >
                  <Building className="h-3 w-3" />
                  <span>Management Panel</span>
                </button>
              </div>
            )}
          </div>

          {/* ===================== STAFF PORTAL SUBVIEWS ===================== */}

          {/* SUBVIEW 1: STAFF DASHBOARD */}
          {currentTab === 'staff_dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
              {/* Left Column (8 cols): Clocking console, advanced roster filters */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* 1. CLOCK IN & OUT EXECUTIVE CONSOLE */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EBDECE] relative overflow-hidden">
                  {/* Subtle ambient status light */}
                  <div className={`absolute top-0 right-0 w-32 h-32 rounded-full filter blur-3xl opacity-20 transition-colors duration-500 pointer-events-none ${
                    clockStatus.status === 'clocked_in' ? 'bg-emerald-500' :
                    clockStatus.status === 'on_break' ? 'bg-amber-500' : 'bg-rose-500'
                  }`} />

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className={`h-2.5 w-2.5 rounded-full inline-block ${
                          clockStatus.status === 'clocked_in' ? 'bg-emerald-500 animate-pulse' :
                          clockStatus.status === 'on_break' ? 'bg-amber-500 animate-pulse' : 'bg-neutral-300'
                        }`} />
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
                          {clockStatus.status === 'clocked_in' ? 'Active Floor Duty' :
                           clockStatus.status === 'on_break' ? 'Rest Break Active' : 'Off Rotation Duty'}
                        </span>
                      </div>
                      
                      {/* Big clock readout */}
                      <div className="flex items-baseline space-x-2">
                        <h1 className="text-4xl font-mono font-extrabold text-[#2E2A26] tracking-tight">
                          {currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </h1>
                        <span className="text-xs font-mono font-bold text-neutral-400">UTC</span>
                      </div>

                      <p className="text-xs text-neutral-500 font-medium font-sans">
                        {currentTime.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>

                    {/* Clock control layout */}
                    <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                      {clockStatus.status === 'clocked_out' && (
                        <button
                          onClick={handleClockIn}
                          className="px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold uppercase tracking-wider rounded-2xl cursor-pointer flex items-center justify-center space-x-2 transition-all shadow-xs"
                        >
                          <Power className="w-4 h-4" />
                          <span>Clock In Shift</span>
                        </button>
                      )}

                      {clockStatus.status === 'clocked_in' && (
                        <>
                          <button
                            onClick={handleStartBreak}
                            className="px-5 py-4 bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold uppercase tracking-wider rounded-2xl cursor-pointer flex items-center justify-center space-x-2 transition-all shadow-xs"
                          >
                            <Coffee className="w-4 h-4" />
                            <span>Start Break</span>
                          </button>
                          <button
                            onClick={() => setShowClockOutNotesForm(true)}
                            className="px-5 py-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold uppercase tracking-wider rounded-2xl cursor-pointer flex items-center justify-center space-x-2 transition-all shadow-xs"
                          >
                            <Power className="w-4 h-4 animate-pulse" />
                            <span>Clock Out</span>
                          </button>
                        </>
                      )}

                      {clockStatus.status === 'on_break' && (
                        <>
                          <button
                            onClick={handleEndBreak}
                            className="px-5 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold uppercase tracking-wider rounded-2xl cursor-pointer flex items-center justify-center space-x-2 transition-all shadow-xs"
                          >
                            <Check className="w-4 h-4" />
                            <span>End Break</span>
                          </button>
                          <button
                            onClick={() => setShowClockOutNotesForm(true)}
                            className="px-5 py-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold uppercase tracking-wider rounded-2xl cursor-pointer flex items-center justify-center space-x-2 transition-all shadow-xs"
                          >
                            <Power className="w-4 h-4" />
                            <span>Clock Out</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Shift Calculator status info */}
                  {(clockStatus.status === 'clocked_in' || clockStatus.status === 'on_break') && clockStatus.clockInTime && (
                    <div className="mt-6 pt-5 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                      <div className="flex items-center space-x-2 bg-neutral-50 px-3.5 py-2 rounded-xl">
                        <Clock className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-500">Clocked In at:</span>
                        <strong className="text-neutral-800">
                          {new Date(clockStatus.clockInTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </strong>
                      </div>

                      <div className="flex items-center space-x-2 bg-neutral-50 px-3.5 py-2 rounded-xl">
                        <Coffee className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-500">Break Balance logged:</span>
                        <strong className="text-neutral-800">
                          {Math.round((clockStatus.accumulatedBreakMs || 0) / 60000)} mins
                        </strong>
                      </div>

                      <div className="bg-emerald-50 text-emerald-800 px-3.5 py-2 rounded-xl font-extrabold uppercase tracking-wider text-[10px]">
                        Active Duty: {Math.floor((() => {
                          const start = new Date(clockStatus.clockInTime).getTime();
                          const now = currentTime.getTime();
                          let breakM = clockStatus.accumulatedBreakMs || 0;
                          if (clockStatus.status === 'on_break' && clockStatus.breakStartTime) {
                            breakM += now - new Date(clockStatus.breakStartTime).getTime();
                          }
                          return Math.max(0, Math.floor((now - start - breakM) / 60000));
                        })() / 60)}h {(() => {
                          const start = new Date(clockStatus.clockInTime).getTime();
                          const now = currentTime.getTime();
                          let breakM = clockStatus.accumulatedBreakMs || 0;
                          if (clockStatus.status === 'on_break' && clockStatus.breakStartTime) {
                            breakM += now - new Date(clockStatus.breakStartTime).getTime();
                          }
                          return Math.max(0, Math.floor((now - start - breakM) / 60000));
                        })() % 60}m
                      </div>
                    </div>
                  )}

                  {/* Interactive Clock Out Notes popup drawer (inline to avoid iframe block issues) */}
                  {showClockOutNotesForm && (
                    <div className="mt-6 pt-6 border-t border-rose-100 bg-rose-50/20 p-5 rounded-2xl text-left space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-extrabold text-rose-900">shift summaries reports</h3>
                          <p className="text-2xs text-rose-800/80">Log any important handover observations before closing your terminal node.</p>
                        </div>
                        <button
                          onClick={() => setShowClockOutNotesForm(false)}
                          className="text-neutral-400 hover:text-neutral-600 font-extrabold text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      <form onSubmit={handleClockOutSubmit} className="space-y-3">
                        <textarea
                          value={clockOutNotes}
                          onChange={(e) => setClockOutNotes(e.target.value)}
                          placeholder="e.g., Ice storage re-stocked, till logs balance out fine. Machine elements self-cleaned."
                          className="w-full max-h-32 p-3 bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs placeholder:text-neutral-400"
                        />
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-2xs font-extrabold uppercase tracking-wide cursor-pointer"
                        >
                          Submit Checkout logs & Clock Out
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                {/* 2. ADVANCED INTERACTIVE ROSTER MODULE */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EBDECE] space-y-6">
                  
                  {/* module title & multi-view navigation controls */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-100 pb-5">
                    <div className="space-y-1">
                      <h4 className="font-display text-[9px] uppercase tracking-widest text-neutral-400 font-bold">advanced roster system</h4>
                      <h3 className="text-base font-extrabold text-[#2E2A26] flex items-center gap-1.5">
                        <span>Terminal Duty Timelines</span>
                        <span className="h-1.5 w-1.5 bg-[#BD783A] rounded-full inline-block" />
                        <span className="text-[#BD783A] text-xs font-normal">{employee.storeName}</span>
                      </h3>
                    </div>

                    {/* Navigation tab bar */}
                    <div className="bg-neutral-100 p-1 rounded-full flex items-center space-x-1 self-stretch md:self-auto overflow-x-auto scrollbar-none shrink-0">
                      {[
                        { key: 'my_rota', label: 'My Shifts' },
                        { key: 'store_team', label: 'Teammates' },
                        { key: 'open_swaps', label: 'Swaps Board 📣' }
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => {
                            setDashboardRotaTab(tab.key as any);
                          }}
                          className={`px-4 py-2 rounded-full text-[9px] font-extrabold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                            dashboardRotaTab === tab.key
                              ? 'bg-[#2E2A26] text-white shadow-xs'
                              : 'text-neutral-500 hover:text-neutral-900'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* WEEK CIRCLE SELECTION PANEL (Apple style) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-2xs">
                      <span className="text-neutral-400 font-bold uppercase tracking-wider">Scroll Days of Current Cycle</span>
                      <button
                        onClick={() => setRosterDayFilter('all')}
                        className={`font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider text-[8px] border transition-all cursor-pointer ${
                          rosterDayFilter === 'all'
                            ? 'bg-[#BD783A]/10 text-[#BD783A] border-[#BD783A]/30'
                            : 'text-neutral-400 hover:text-[#2E2A26] border-transparent'
                        }`}
                      >
                        All Cycle Days
                      </button>
                    </div>

                    <div className="relative flex items-center group">
                      <button
                        onClick={() => scrollDays('left')}
                        className="absolute left-0 z-10 p-1.5 bg-white/90 border border-neutral-200 rounded-full shadow-sm text-neutral-400 hover:text-[#2E2A26] -ml-2 transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      
                      {/* horizontal selector list */}
                      <div ref={daysScrollRef} className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none shrink-0 w-full scroll-smooth" style={{ scrollbarWidth: 'none' }}>
                        {(() => {
                          const now = new Date();
                          let day = now.getDay();
                          if (day === 0) day = 7;
                          const startOfWeek = new Date(now);
                          startOfWeek.setDate(now.getDate() - day + 1);
                          
                          const targetDays = [];
                          for(let i=0; i<28; i++) {
                            const d = new Date(startOfWeek);
                            d.setDate(startOfWeek.getDate() + i);
                            // pad month and day to ensure valid ISO format even in local timeframe
                             const yyyy = d.getFullYear();
                             const mm = String(d.getMonth() + 1).padStart(2, '0');
                             const dd = String(d.getDate()).padStart(2, '0');
                            targetDays.push({
                              dateCode: `${yyyy}-${mm}-${dd}`,
                              code: d.toLocaleDateString('en-GB', { weekday: 'short' }),
                              num: d.getDate().toString()
                            });
                          }
                          return targetDays.map((targetDay) => {
                            const isSelected = rosterDayFilter === targetDay.dateCode;
                            const hasShift = shiftsList.some(s => s.employeeId === employee.id && s.date === targetDay.dateCode);
                            
                            let buttonBg = 'bg-neutral-50/50 hover:bg-neutral-50 border-neutral-200 text-neutral-600';
                            if (isSelected) {
                              buttonBg = 'bg-[#2E2A26] border-[#2E2A26] text-white shadow-xs scale-102';
                            } else if (hasShift) {
                              buttonBg = 'bg-[#BD783A]/10 hover:bg-[#BD783A]/20 border-[#BD783A]/30 text-[#2E2A26] font-bold';
                            }

                            return (
                              <button
                                key={targetDay.dateCode}
                                type="button"
                                onClick={() => setRosterDayFilter(targetDay.dateCode)}
                                className={`flex flex-col items-center justify-center min-w-[55px] h-16 rounded-2xl border transition-all cursor-pointer ${buttonBg}`}
                              >
                                <span className={`text-[9px] uppercase font-bold tracking-wider ${isSelected ? 'opacity-60' : hasShift ? 'opacity-80 text-[#BD783A]' : 'opacity-60'}`}>
                                  {targetDay.code}
                                </span>
                                <span className="text-sm font-extrabold relative">
                                  {targetDay.num}
                                </span>
                              </button>
                            );
                          });
                        })()}
                      </div>
                      
                      <button
                        onClick={() => scrollDays('right')}
                        className="absolute right-0 z-10 p-1.5 bg-white/90 border border-neutral-200 rounded-full shadow-sm text-neutral-400 hover:text-[#2E2A26] -mr-2 transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* ACTIVE TAB RENDER BLOCK */}

                  {/* TIMELINE HELPER FUNCTIONS */}
                  {(() => {
                    const dayStartLimit = 7;
                    const dayEndLimit = 22;
                    const totalMinutes = (dayEndLimit - dayStartLimit) * 60;

                    const getShiftPosition = (startTimeStr: string, endTimeStr: string) => {
                        const parseTime = (str: string) => {
                            const [h, m] = str.split(':').map(Number);
                            return h * 60 + m;
                        };
                        const sMap = parseTime(startTimeStr);
                        let eMap = parseTime(endTimeStr);
                        if (eMap < sMap) eMap += 24 * 60; // handle overnight shifts roughly
                        
                        const dayStartMap = dayStartLimit * 60;
                        const startOffsetMinutes = Math.max(0, sMap - dayStartMap);
                        const durationMinutes = Math.max(0, eMap - Math.max(sMap, dayStartMap));
                        
                        const leftPercent = (startOffsetMinutes / totalMinutes) * 100;
                        const widthPercent = (durationMinutes / totalMinutes) * 100;
                        
                        return { left: `${Math.min(100, Math.max(0, leftPercent))}%`, width: `${Math.min(100, Math.max(0, widthPercent))}%` };
                    };
                    
                    const renderTimelineScale = () => (
                        <div className="absolute top-0 bottom-0 left-0 right-0 pointer-events-none flex justify-between z-0">
                            {[7, 10, 13, 16, 19, 22].map((hour, idx, arr) => (
                                <div key={hour} className="h-full border-l border-neutral-200/60 relative" style={{ width: idx === arr.length - 1 ? '0' : '100%' }}>
                                  <span className="text-[8px] font-mono font-extrabold text-[#D2C5B4] absolute -left-3 -top-5 px-1">{hour}:00</span>
                                </div>
                            ))}
                        </div>
                    );

                    return (
                      <>
                        {/* TAB 1: MY SHIFTS - Visual Timeline */}
                        {dashboardRotaTab === 'my_rota' && (
                          <div className="space-y-4">
                            {shiftsList.filter(s => s.employeeId === employee.id).length === 0 ? (
                              <div className="text-center py-10 bg-neutral-50/50 rounded-2xl border border-dashed border-neutral-200">
                                <p className="text-xs font-medium text-neutral-400">You have no shifts allocated in this cycle.</p>
                              </div>
                            ) : (
                              <div className="space-y-8 mt-6">
                                {shiftsList
                                  .filter(s => s.employeeId === employee.id)
                                  .filter(s => rosterDayFilter === 'all' || s.date === rosterDayFilter)
                                  .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
                                  .map((sh, index) => {
                                    const pendingCover = !!coverRequests[sh.id];
                                    const pos = getShiftPosition(sh.startTime, sh.endTime);
                                    
                                    return (
                                      <div key={sh.id} className="relative space-y-4">
                                        <div className="flex justify-between items-end mb-2">
                                          <div className="flex items-center gap-2">
                                            <h4 className="text-[10px] uppercase font-extrabold text-[#2E2A26] tracking-widest">
                                              {new Date(sh.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                                            </h4>
                                            <span className={`text-[8px] uppercase tracking-widest font-extrabold px-1.5 py-0.5 rounded inline-block ${
                                              sh.type === 'opening' ? 'bg-[#EBF7F2] text-[#3F8766]' :
                                              sh.type === 'closing' ? 'bg-[#FCF1F3] text-[#A24A5D]' :
                                              'bg-amber-50 text-[#BD783A]'
                                            }`}>
                                              {sh.type}
                                            </span>
                                          </div>
                                          {pendingCover && (
                                            <span className="text-[8px] font-extrabold tracking-widest bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded animate-pulse uppercase">
                                              Swap Pending
                                            </span>
                                          )}
                                        </div>

                                        <div className="relative pt-6 pb-2 min-h-[60px] bg-neutral-50/30 rounded-xl px-2">
                                            {renderTimelineScale()}
                                            <motion.div 
                                              initial={{ width: 0, opacity: 0 }}
                                              animate={{ width: pos.width, opacity: 1 }}
                                              transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                                              className="absolute top-6 bottom-2 rounded-lg bg-[#2E2A26] border border-[#2E2A26] shadow-xs flex items-center overflow-hidden z-10 group cursor-pointer"
                                              style={{ left: pos.left, minWidth: '40px' }}
                                            >
                                              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                                              <div className="px-2 truncate w-full flex justify-between items-center z-10 text-white/90">
                                                <span className="font-mono text-[9px] font-bold">{sh.startTime}</span>
                                                <span className="font-mono text-[9px] font-bold">{sh.endTime}</span>
                                              </div>
                                              {/* Hover tooltip essentially implicitly built into actions below */}
                                            </motion.div>
                                        </div>

                                        {/* Action buttons simple toggle */}
                                        <div className="flex justify-end pt-1">
                                            <button
                                              onClick={() => setActiveCoveringFormId(activeCoveringFormId === sh.id ? null : sh.id)}
                                              className="text-[9px] font-extrabold text-neutral-400 hover:text-[#BD783A] uppercase tracking-wider transition-colors"
                                            >
                                              {pendingCover ? 'Manage Swap Request' : 'Can no longer work?'}
                                            </button>
                                        </div>

                                        {/* Inline Quick coverage post note */}
                                        <AnimatePresence>
                                          {activeCoveringFormId === sh.id && (
                                            <motion.div 
                                              initial={{ opacity: 0, y: -10, height: 0 }}
                                              animate={{ opacity: 1, y: 0, height: 'auto' }}
                                              exit={{ opacity: 0, y: -10, height: 0 }}
                                              className="pt-2 bg-orange-50/20 p-4 border border-dashed border-orange-200 rounded-xl overflow-hidden"
                                            >
                                              <p className="text-2xs text-[#2E2A26] font-semibold mb-2">Write a short note so colleagues see why you need cover:</p>
                                              <div className="flex gap-2">
                                                <input
                                                  type="text"
                                                  placeholder="e.g. Urgent family commit clash or study exams cover needed."
                                                  value={coverRequestMessageMap[sh.id] || ''}
                                                  onChange={(e) => setCoverRequestMessageMap({
                                                    ...coverRequestMessageMap,
                                                    [sh.id]: e.target.value
                                                  })}
                                                  className="w-full text-xs p-2.5 bg-white border border-neutral-200 rounded-lg focus:outline-none"
                                                />
                                                <button
                                                  onClick={() => handlePublishCoverRequest(sh.id)}
                                                  className="px-4 bg-[#BD783A] hover:bg-[#2E2A26] text-white text-[9px] font-extrabold uppercase rounded-lg shrink-0 cursor-pointer transition-colors"
                                                >
                                                  {pendingCover ? 'Update' : 'Publish'}
                                                </button>
                                                {pendingCover && (
                                                  <button
                                                    onClick={() => handleRetractCoverRequest(sh.id)}
                                                    className="px-4 bg-neutral-200 text-neutral-700 hover:bg-neutral-300 font-extrabold text-[9px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                                                  >
                                                    Retract
                                                  </button>
                                                )}
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    );
                                  })}
                              </div>
                            )}
                          </div>
                        )}

                        {/* TAB 2: STORE TEAMMATES ROTATION - Horizontal Gantt View */}
                        {dashboardRotaTab === 'store_team' && (
                          <div className="space-y-8 mt-6">
                            {shiftsList.filter(s => s.storeId === employee.storeId && s.employeeId !== employee.id).length === 0 ? (
                              <div className="text-center py-10 bg-neutral-50/50 rounded-2xl border border-dashed border-neutral-200">
                                <p className="text-xs font-medium text-neutral-400">No colleague duty records found in this cycle.</p>
                              </div>
                            ) : (
                              <div className="space-y-8">
                                {Array.from(new Set(shiftsList.filter(s => rosterDayFilter === 'all' || s.date === rosterDayFilter).map(s => s.date))).sort().map((dateStr) => {
                                    const dailyShifts = shiftsList.filter(s => s.storeId === employee.storeId && s.employeeId !== employee.id && s.date === dateStr);
                                    if (dailyShifts.length === 0) return null;
                                    
                                    return (
                                        <div key={dateStr} className="space-y-4 relative">
                                            <h4 className="text-[10px] uppercase font-extrabold text-[#2E2A26] tracking-widest border-b border-neutral-100 pb-2">
                                              {new Date(dateStr as string).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                                            </h4>
                                            
                                            <div className="relative pt-6 pb-2 min-h-[100px] bg-neutral-50/40 rounded-2xl px-2">
                                                {renderTimelineScale()}
                                                
                                                <div className="relative z-10 flex flex-col gap-2 mt-2">
                                                    {dailyShifts.map((sh, idx) => {
                                                        const isActiveNow = isTeammateCurrentlyShiftActive(sh);
                                                        const pos = getShiftPosition(sh.startTime, sh.endTime);
                                                        return (
                                                            <div key={sh.id} className="relative h-10 w-full flex items-center group">
                                                                <motion.div 
                                                                    initial={{ width: 0, opacity: 0 }}
                                                                    animate={{ width: pos.width, opacity: 1 }}
                                                                    transition={{ duration: 0.6, delay: idx * 0.1, ease: 'easeOut' }}
                                                                    className={`absolute h-full rounded-xl flex items-center px-2 overflow-hidden shadow-xs cursor-default ${isActiveNow ? 'bg-emerald-500 text-white' : 'bg-[#EBDECE]/80 text-[#2E2A26]'}`}
                                                                    style={{ left: pos.left, minWidth: '120px' }}
                                                                >
                                                                    <div className="relative z-10 flex items-center justify-between w-full h-full pb-0.5">
                                                                         <span className="text-[10px] font-extrabold uppercase tracking-wide truncate pr-2 flex items-center gap-1.5">
                                                                           {isActiveNow && <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping block"></span>}
                                                                           {sh.employeeName}
                                                                         </span>
                                                                         <span className="font-mono text-[9px] font-bold opacity-70 whitespace-nowrap">{sh.startTime} - {sh.endTime}</span>
                                                                    </div>
                                                                </motion.div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    );
                  })()}

                  {/* TAB 3: OPEN COVERS SHEET */}
                  {dashboardRotaTab === 'open_swaps' && (
                    <div className="space-y-4">
                      {Object.keys(coverRequests).length === 0 ? (
                        <div className="text-center py-10 bg-neutral-50/50 rounded-2xl border border-dashed border-neutral-200 space-y-2">
                          <p className="text-xs font-semibold text-neutral-500">Perfect Coverage! 🌴</p>
                          <p className="text-2xs text-[#2E2A26]/70 max-w-sm mx-auto leading-relaxed">
                            Every single roster terminal block is locked down fine. Teammates are fully allocated with no swap assistance requests active today.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3.5">
                          <div className="bg-yellow-50/40 border border-yellow-200 rounded-2xl p-4 text-2xs leading-relaxed text-yellow-900">
                            ⭐ <strong>Roster Swaps Rules:</strong> When you claim another colleague's shift, their shift allocation immediately transfers to you. Make sure you are free to complete the shift!
                          </div>

                          {shiftsList
                            .filter(sh => !!coverRequests[sh.id])
                            .map((sh) => {
                              const requestInfo = coverRequests[sh.id];
                              const isSelfShift = (sh.employeeId === employee.id);
                              return (
                                <div
                                  key={sh.id}
                                  className="p-5 bg-white border border-neutral-300/60 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left shadow-2xs hover:shadow-xs transition-shadow"
                                >
                                  <div className="space-y-2.5 max-w-md">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-[9px] uppercase font-extrabold tracking-widest bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-md">
                                        Cover Wanted
                                      </span>
                                      <p className="text-[9px] text-neutral-400 font-mono">Posted: {new Date(requestInfo.date).toLocaleDateString('en-GB')}</p>
                                    </div>

                                    <div>
                                      <h3 className="text-xs font-bold text-neutral-800">
                                        Colleague <strong className="text-neutral-900">{sh.employeeName}</strong> needs cover on week rotation code
                                      </h3>
                                      <p className="text-xs font-extrabold text-[#BD783A] mt-0.5">
                                        {new Date(sh.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })} • {sh.startTime} - {sh.endTime} ({sh.type})
                                      </p>
                                    </div>

                                    <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 text-[11px] text-neutral-500 italic">
                                      "{requestInfo.message}"
                                    </div>
                                  </div>

                                  <div className="shrink-0 w-full md:w-auto">
                                    {isSelfShift ? (
                                      <button
                                        onClick={() => handleRetractCoverRequest(sh.id)}
                                        className="w-full md:w-auto px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-3xs font-extrabold uppercase tracking-wide cursor-pointer"
                                      >
                                        Retract Request
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleClaimCoverShift(sh)}
                                        className="w-full md:w-auto px-5 py-3 bg-[#2E2A26] hover:bg-emerald-600 text-white rounded-xl text-3xs font-extrabold uppercase tracking-widest cursor-pointer shadow-xs transition-all flex items-center justify-center space-x-1.5"
                                      >
                                        <Share2 className="w-3.5 h-3.5" />
                                        <span>Claim Roster Cover</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. QUICK LINKS MODULE SHORTCUTS */}
                <div className="space-y-4">
                  <h3 className="font-display text-xs uppercase font-extrabold tracking-widest text-[#BD783A]">Corporate Hub Module Shortcuts</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'My Documents', key: 'staff_documents', sym: '📂' },
                      { label: 'Training Academy', key: 'staff_academy', sym: '🎓' },
                      { label: 'Incident SIFRs', key: 'staff_sifr', sym: '📜' },
                      { label: 'Recipes Wiki', key: 'staff_kb', sym: '📖' }
                    ].map((link, i) => (
                      <button
                        id={`dash-quick-${link.key}`}
                        key={i}
                        onClick={() => setCurrentTab(link.key)}
                        className="bg-white p-6 rounded-2xl border border-[#EBDECE]/50 shadow-2xs hover:shadow-xs hover:border-[#BD783A] transition-all text-center space-y-2 cursor-pointer focus:outline-none"
                      >
                        <span className="text-xl block">{link.sym}</span>
                        <span className="block text-[10px] font-black uppercase tracking-wider text-gray-600">{link.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column (4 cols): Personal Timesheets, Achievements */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* PERSONAL TIMESHEET HISTORY / HISTORICAL PAYOUT COMPLIANCE */}
                <div className="bg-white p-6 rounded-3xl border border-[#EBDECE] space-y-4 text-left">
                  <div className="flex justify-between items-center">
                    <h3 className="font-display text-xs uppercase font-extrabold tracking-widest text-[#BD783A]">Personal Timesheets</h3>
                    <span className="text-[8px] tracking-wider uppercase font-extrabold bg-[#BD783A]/10 text-[#BD783A] px-2.5 py-0.5 rounded-full">
                      GDPR Verified
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {clockHistory.filter(ch => ch.employeeId === employee.id).length === 0 ? (
                      <p className="text-2xs text-neutral-400 italic">No previous clock logs recorded on this device yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {clockHistory
                          .filter(ch => ch.employeeId === employee.id)
                          .map((log) => {
                            const baseRate = employee.payRate || 11.44;
                            let hourlyRate = baseRate;
                            if (employee.payType === 'salary' || baseRate >= 500) {
                              if (baseRate >= 20000) {
                                hourlyRate = baseRate / 52 / 40; // Annual Salary to Hourly
                              } else {
                                hourlyRate = (baseRate * 12) / 52 / 40; // Monthly Salary to Hourly
                              }
                            }
                            const shiftPay = (log.totalDecimalHours || 0) * hourlyRate;
                            return (
                              <div key={log.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-left space-y-1">
                                <div className="flex justify-between items-baseline">
                                  <span className="text-2xs font-extrabold text-neutral-800">
                                    {new Date(log.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-mono font-bold text-neutral-600 bg-neutral-200/50 px-2 py-0.5 rounded-md">
                                      {log.totalDecimalHours} hrs
                                    </span>
                                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                                      £{shiftPay.toFixed(2)}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex justify-between items-center text-[10px] text-neutral-400">
                                  <span>
                                    {new Date(log.clockIn).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} - {log.clockOut ? new Date(log.clockOut).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                                  </span>
                                  {log.rejected ? (
                                    <span className="font-bold text-[8px] uppercase tracking-wider text-red-500">● Rejected</span>
                                  ) : log.approved ? (
                                    <span className="font-bold text-[8px] uppercase tracking-wider text-emerald-600" title={log.approvedBy ? `Approved by ${log.approvedBy}` : undefined}>● Approved</span>
                                  ) : (
                                    <span className="font-bold text-[8px] uppercase tracking-wider text-amber-500">● Pending approval</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}

                    {/* cumulative hours + previous month's pay */}
                    {(() => {
                      const baseRate = employee.payRate || 11.44;
                      let hourlyRate = baseRate;
                      if (employee.payType === 'salary' || baseRate >= 500) {
                        hourlyRate = baseRate >= 20000 ? baseRate / 52 / 40 : (baseRate * 12) / 52 / 40;
                      }
                      const now = new Date();
                      const thisKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                      const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                      const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
                      const prevLabel = prevDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

                      const myLogs = clockHistory.filter(ch => ch.employeeId === employee.id && !ch.rejected);
                      const thisMonthHrs = myLogs.filter(ch => ch.date.startsWith(thisKey)).reduce((a, c) => a + (c.totalDecimalHours || 0), 0);
                      // Previous pay: use the generated payslip if one exists, otherwise approved hours × rate
                      const prevPayslip = payslips.find(p => p.employeeId === employee.id && p.periodKey === prevKey);
                      const prevApprovedHrs = myLogs.filter(ch => ch.date.startsWith(prevKey) && ch.approved).reduce((a, c) => a + (c.totalDecimalHours || 0), 0);
                      const prevPay = prevPayslip ? prevPayslip.net : prevApprovedHrs * hourlyRate;

                      return (
                        <div className="p-4 bg-stone-900 text-white rounded-2xl space-y-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-[9px] uppercase tracking-widest opacity-60 font-medium block">Logged This Cycle</span>
                              <span className="text-base font-mono font-bold">
                                {thisMonthHrs.toFixed(1)} hrs
                                <span className="opacity-70 text-sm ml-2 font-normal">(£{(thisMonthHrs * hourlyRate).toFixed(2)})</span>
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center border-t border-white/15 pt-3">
                            <div>
                              <span className="text-[9px] uppercase tracking-widest opacity-60 font-medium block">Previous pay · {prevLabel}</span>
                              <span className="text-base font-mono font-bold text-emerald-300">£{prevPay.toFixed(2)}</span>
                              {!prevPayslip && prevApprovedHrs === 0 && (
                                <span className="block text-[9px] opacity-50">No approved hours recorded for {prevLabel}</span>
                              )}
                            </div>
                            <span className="text-[8px] bg-[#BD783A] text-white font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider">
                              PREVIOUS PAY
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* MY PAYSLIPS — issued by the office, arrives here + by e-mail */}
                <div className="bg-white p-6 rounded-3xl border border-[#EBDECE] space-y-4 text-left">
                  <h3 className="font-display text-xs uppercase font-extrabold tracking-widest text-[#BD783A]">My Payslips</h3>
                  {payslips.filter(p => p.employeeId === employee.id).length === 0 ? (
                    <p className="text-2xs text-neutral-400 italic">No payslips issued yet. They appear here when the office generates payroll.</p>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {payslips
                        .filter(p => p.employeeId === employee.id)
                        .sort((a, b) => b.periodKey.localeCompare(a.periodKey))
                        .map(p => (
                          <div key={p.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex justify-between items-center">
                            <div>
                              <span className="text-2xs font-extrabold text-neutral-800 block">{p.periodLabel}</span>
                              <span className="text-[9px] font-mono text-neutral-400">{p.hoursTotal.toFixed(1)} hrs @ £{p.hourlyRate.toFixed(2)}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-emerald-700 block">£{p.net.toFixed(2)}</span>
                              <span className={`text-[8px] font-black uppercase tracking-wider ${p.status === 'sent' ? 'text-emerald-600' : 'text-amber-500'}`}>
                                {p.status === 'sent' ? `Emailed ${p.sentAt ? new Date(p.sentAt).toLocaleDateString('en-GB') : ''}` : 'Issued'}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Gamified Achievements Box */}
                <div className="bg-white p-6 rounded-3xl border border-[#EBDECE] space-y-4">
                  <h3 className="font-display text-xs uppercase font-extrabold tracking-widest text-[#BD783A]">Achievement Badges</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {employee.badges.map((badge, idx) => (
                      <div key={idx} className="bg-gradient-to-br from-[#EBDECE]/20 to-[#BD783A]/10 p-3.5 rounded-2xl text-center space-y-1.5 border border-dashed border-[#EBDECE]/50">
                        <span className="text-xl">🌟</span>
                        <h4 className="text-[9px] font-extrabold uppercase text-[#2E2A26] leading-tight tracking-wider">{badge}</h4>
                      </div>
                    ))}
                    <div className="bg-neutral-50/50 border border-dashed border-neutral-200 p-3 rounded-2xl flex items-center justify-center">
                      <span className="text-3xs text-neutral-400 italic">2 locked</span>
                    </div>
                  </div>
                </div>

                {/* Operations Announcements Node */}
                <div className="bg-white p-6 rounded-3xl border border-[#EBDECE]/50 space-y-4 text-left">
                  <h3 className="font-display text-xs uppercase font-extrabold tracking-widest text-[#2E2A26]">Latest Operations Circulars</h3>
                  <div className="space-y-4">
                    <div className="border-l-2 border-[#BD783A] pl-3 space-y-1">
                      <span className="text-[9px] text-gray-400 font-mono block">15 May 2026</span>
                      <h4 className="text-xs font-bold leading-tight">Walk-In Temperature Logs Required</h4>
                      <p className="text-[10px] text-[#2E2A26]/75 leading-relaxed font-light">Ensure supervisors log deep-freeze nodes before Close Checklists process.</p>
                    </div>
                    <div className="border-l-2 border-[#BD783A] pl-3 space-y-1">
                      <span className="text-[9px] text-gray-400 font-mono block">19 May 2026</span>
                      <h4 className="text-xs font-bold leading-tight">Summer Slush Product Trial</h4>
                      <p className="text-[10px] text-[#2E2A26]/75 leading-relaxed font-light">Recipe guides for mango pop blend dispatched dynamically to Wiki library.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUBVIEW 2: DOCUMENT CENTRE */}
          {currentTab === 'staff_pos' && employee && (
            <SalesPOS
              employee={employee}
              menuItems={menuItems}
              deals={deals}
              stores={stores}
              orders={orders}
              onAddOrder={onAddOrder}
              siteSettings={siteSettings}
              addToast={addToast as any}
            />
          )}

          {currentTab === 'staff_documents' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
              {/* Document checklist list (8 cols) */}
              <div className="lg:col-span-8 bg-white p-8 rounded-3xl border border-[#EBDECE] space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="font-display text-md font-black text-[#2E2A26] uppercase tracking-wide">
                      My Document Locker
                    </h2>
                    <p className="text-2xs text-gray-400 mt-1">Verifications checklist mandated under UK GDPR and safety regulations.</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase text-gray-400">Total Checked: {documents.length}</span>
                </div>

                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-4 bg-[#FFFFFF] rounded-2xl border border-gray-100 flex items-center justify-between gap-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2.5 bg-white border rounded-xl">
                          <FileText className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#2E2A26]">{doc.name}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                            <span>Uploaded: {doc.uploadDate}</span>
                            <span>•</span>
                            <span className="uppercase text-[9px] font-black">{doc.category}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${
                          doc.status === 'approved'
                            ? 'bg-[#5FA777]/20 text-[#5FA777]'
                            : 'bg-amber-100 text-[#BD783A]'
                        }`}>
                          {doc.status}
                        </span>
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); addToast('Downloading secured vault metadata stream...', 'success'); }}
                          className="p-1 px-3 bg-white hover:bg-[#BD783A]/10 text-xs font-bold rounded-lg border text-[#2E2A26]"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance Status Widget (4 cols) */}
              <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-[#EBDECE] space-y-6">
                <h3 className="font-display text-xs uppercase font-extrabold tracking-widest text-[#BD783A]">Compliance Status</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 rounded-full bg-[#5FA777]" />
                      <span className="text-[10px] font-black uppercase text-[#2E2A26]">Right to Work</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500">Verified</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 rounded-full bg-[#5FA777]" />
                      <span className="text-[10px] font-black uppercase text-[#2E2A26]">Food Hygiene L2</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500">Exp. 2027</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 rounded-full bg-[#5FA777]" />
                      <span className="text-[10px] font-black uppercase text-[#2E2A26]">Employment Contract</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500">Signed</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 rounded-full bg-amber-400" />
                      <span className="text-[10px] font-black uppercase text-[#2E2A26]">Fire Safety Cert</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500">Renewal Due</span>
                  </div>
                </div>

                <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#EBDECE]/50 text-center">
                  <p className="text-2xs text-[#2E2A26] font-light leading-relaxed">
                    All core compliance documentation is up to date. Please contact your manager to renew any expiring certificates.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SUBVIEW CHECKLIST: SHIFT CHECKLISTS BOARD (Daily audit checks) */}
          {currentTab === 'staff_checklists' && (
            <div className="space-y-8 text-left font-sans animate-fade-in">
              <div className="bg-white p-6 rounded-3xl border border-[#EBDECE] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h2 className="font-display text-sm uppercase font-extrabold tracking-wider text-[#BD783A]">Store Operations Shift Checklists</h2>
                  <p className="text-2xs text-gray-400 mt-1">Check off required procedures chronologically. Observations will sync automatically with head office audit rooms.</p>
                </div>
                <div className="flex flex-wrap gap-2 text-2xs font-extrabold uppercase tracking-widest shrink-0">
                  <span className="px-4 py-2 rounded-xl bg-orange-50 text-[#BD783A] border border-orange-100">
                    {checklistTasks.filter(t => t.category === 'opening' && t.completed).length} / {checklistTasks.filter(t => t.category === 'opening').length} Op Checks
                  </span>
                  <span className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {checklistTasks.filter(t => t.category === 'midday' && t.completed).length} / {checklistTasks.filter(t => t.category === 'midday').length} Mid Checks
                  </span>
                  <span className="px-4 py-2 rounded-xl bg-stone-50 text-stone-600 border border-stone-200">
                    {checklistTasks.filter(t => t.category === 'closing' && t.completed).length} / {checklistTasks.filter(t => t.category === 'closing').length} Cl Checks
                  </span>
                </div>
              </div>

              {/* RETAIL AUDITS WORKSPACE */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-[#EBDECE]/70 shadow-sm space-y-6">
                  {/* Category Switch Tabs */}
                  <div className="grid grid-cols-3 gap-2 p-1 bg-[#FFFFFF] rounded-xl border border-neutral-200">
                    {[
                      { key: 'opening', label: 'Opening Checks', color: 'text-[#BD783A]' },
                      { key: 'midday', label: 'Mid-day Audits', color: 'text-indigo-600' },
                      { key: 'closing', label: 'Closing Routine', color: 'text-stone-700' }
                    ].map((cat) => (
                      <button
                        type="button"
                        id={`check-tab-${cat.key}`}
                        key={cat.key}
                        onClick={() => setActiveChecklistCategory(cat.key as any)}
                        className={`py-3 text-center rounded-lg text-2xs uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
                          activeChecklistCategory === cat.key
                            ? 'bg-white text-[#2E2A26] shadow-xs ring-1 ring-neutral-200'
                            : 'text-neutral-500 hover:text-neutral-800'
                        }`}
                      >
                        <span className={cat.color}>{cat.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Task List Grid */}
                  <div className="space-y-3 pt-2">
                    {checklistTasks.filter(t => t.category === activeChecklistCategory).map((task) => (
                      <div key={task.id} className="p-4 bg-[#FBFBFC] rounded-2xl border border-neutral-200/80 transition-all hover:bg-[#FBFBFC]/90 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleChecklistTask(task.id)}
                            className="flex items-start space-x-3 text-left focus:outline-none cursor-pointer flex-1"
                          >
                            <div className="shrink-0 mt-0.5">
                              {task.completed ? (
                                <CheckCircle className="h-5 w-5 text-[#5FA777]" />
                              ) : (
                                <div className="h-5 w-5 rounded-full border border-neutral-300 hover:border-[#BD783A] transition-colors" />
                              )}
                            </div>
                            <div>
                              <span className={`text-xs font-semibold leading-relaxed ${task.completed ? 'text-neutral-400 line-through' : 'text-[#2E2A26]'}`}>
                                {task.task}
                              </span>
                              {task.completed && (
                                <span className="block text-[9px] uppercase tracking-wider font-extrabold text-[#5FA777] mt-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 inline-block">
                                  ✓ Approved by {task.completedBy} at {task.completedAt}
                                </span>
                              )}
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setNewChecklistCommentId(task.id);
                              setChecklistCommentText(task.comment || '');
                            }}
                            className="text-2xs text-[#BD783A] font-extrabold hover:underline whitespace-nowrap"
                          >
                            {task.comment ? 'Edit Note' : 'Add Observation'}
                          </button>
                        </div>

                        {/* Observation Comment Box Row */}
                        {task.comment && (
                          <div className="bg-amber-50/50 border border-amber-100/70 p-3 rounded-xl text-3xs text-neutral-600 leading-normal font-light flex justify-between items-center ml-8">
                            <p><span className="font-extrabold uppercase text-amber-700 font-sans">Barista Log Note:</span> {task.comment}</p>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = checklistTasks.map(t => t.id === task.id ? { ...t, comment: undefined } : t);
                                setChecklistTasks(updated);
                                addToast('Note removed.', 'warning');
                              }}
                              className="text-[9px] text-[#2E2A26] hover:text-amber-700 font-bold"
                            >
                              Clear
                            </button>
                          </div>
                        )}

                        {newChecklistCommentId === task.id && (
                          <div className="ml-8 p-3 bg-white border border-neutral-200 rounded-xl space-y-2 animate-fade-in relative z-20">
                            <textarea
                              rows={2}
                              value={checklistCommentText}
                              onChange={(e) => setChecklistCommentText(e.target.value)}
                              placeholder="Record fridge temp values (e.g. 2.4°C), cash floats mismatch, boiler pressure calibration limits, or supplier shortages..."
                              className="w-full text-2xs p-2 text-neutral-800 border border-[#EBDECE] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#BD783A] font-medium"
                            />
                            <div className="flex justify-end space-x-2">
                              <button
                                type="button"
                                onClick={() => setNewChecklistCommentId(null)}
                                className="px-3 py-1 bg-stone-100 text-stone-600 rounded-md text-3xs font-extrabold uppercase"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveTaskComment(task.id)}
                                className="px-3 py-1 bg-[#2E2A26] text-white rounded-md text-3xs font-extrabold uppercase border-0 cursor-pointer"
                              >
                                Log Note
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Submission segment controls */}
                  {(() => {
                    const catTasks = checklistTasks.filter(t => t.category === activeChecklistCategory);
                    const doneCount = catTasks.filter(t => t.completed).length;
                    const progressVal = Math.round((doneCount / catTasks.length) * 100) || 0;

                    return (
                      <div className="space-y-4 pt-4 border-t border-neutral-100">
                        <div className="space-y-1 bg-stone-50/50 p-4 rounded-2xl border border-stone-200">
                          <div className="flex items-center justify-between text-2xs font-black">
                            <span className="text-gray-400 uppercase tracking-widest font-sans font-extrabold">Active Compliance Level</span>
                            <span className="text-[#BD783A] font-mono">{progressVal}% Done ({doneCount} of {catTasks.length})</span>
                          </div>
                          <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden border border-neutral-250">
                            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progressVal}%` }} />
                          </div>
                        </div>

                        <div className="flex justify-between items-center gap-4">
                          <p className="text-[10px] text-neutral-400 font-light leading-snug">
                            Once all key elements compile, close the shift block by submitting the final daily compliance report. Clean daily states reset to default for the next staff cohort.
                          </p>
                          <button
                            type="button"
                            onClick={() => handleSubmitChecklistCategory(activeChecklistCategory)}
                            className="bg-[#BD783A] hover:bg-[#2E2A26] text-white py-3.5 px-6 rounded-full text-2xs font-extrabold uppercase tracking-widest transition-colors shrink-0 cursor-pointer border-0 shadow-xs"
                          >
                            Submit Daily Audit Registry
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Audit history panel (4 cols) */}
                <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-[#EBDECE] space-y-4 shadow-sm">
                  <div className="flex items-center space-x-1.5 text-[#BD783A]">
                    <ListChecks className="h-4 w-4" />
                    <h3 className="font-display text-xs uppercase font-extrabold tracking-widest">Signed Retail Audits</h3>
                  </div>
                  <p className="text-3xs text-neutral-400 leading-relaxed font-light">
                    Historic logs filed during current session. These entries reside securely inside local repositories, providing immediate accountability records for Area Conductor review:
                  </p>

                  {checklistAuditLogs.length === 0 ? (
                    <div className="py-6 text-center border border-dashed border-[#EBDECE] rounded-2xl">
                      <p className="text-3xs text-neutral-400">No shift audits submitted today.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                      {checklistAuditLogs.map((log) => (
                        <div key={log.id} className="p-3 bg-[#FBFBFC] rounded-xl border border-neutral-150 text-3xs space-y-1.5">
                          <div className="flex justify-between items-center border-b border-neutral-100 pb-1.5">
                            <span className="font-bold text-[#BD783A] uppercase">{log.category} Checks</span>
                            <span className="font-mono text-emerald-600 font-black">{log.completedCount}/{log.totalCount} Done</span>
                          </div>
                          <div>
                            <p className="font-medium text-neutral-700">Conductor: {log.submittedBy}</p>
                            <p className="text-neutral-400">Signed At: {log.submittedAt}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SUBVIEW 3: TRAINING ACADEMY */}
          {currentTab === 'staff_academy' && (
            <div className="space-y-8 text-left font-sans animate-fade-in pb-12">
              <div className="bg-white p-6 rounded-3xl border border-[#EBDECE] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-sm uppercase font-extrabold tracking-wider text-[#BD783A]">Milk Pop Retail Academy & Growth Hub</h2>
                  <p className="text-2xs text-gray-400 mt-1">Acquire professional barista qualifications, study product details, complete health & safety modules, and earn badges.</p>
                </div>
                <div className="bg-[#7CC0C7]/30 px-6 py-3 rounded-2xl text-center shrink-0">
                  <span className="block text-2xs uppercase text-[#2E2A26] font-black tracking-widest">Global Rank</span>
                  <span className="block text-lg font-mono font-black text-[#2E2A26]">Level {employee.level} Conductor</span>
                </div>
              </div>

              
              {!activeAcademyCourse ? (
                /* Course Cards List Workspace */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(assessments || []).map((ass) => {
                      const completed = employee?.badges?.includes(ass.badge);
                      return (
                        <div key={ass.id} className="bg-white p-6 rounded-3xl border border-[#EBDECE]/45 shadow-3xs flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-black bg-[#EBDECE]/40 text-[#2E2A26] px-2.5 py-1 rounded-full">
                                {ass.category}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">EST: 20 MINS</span>
                            </div>

                            <h3 className="font-display font-black text-sm text-[#2E2A26] leading-snug">{ass.title}</h3>
                            <p className="text-2xs text-[#2E2A26]/80 font-light leading-relaxed">{ass.description}</p>
                          </div>

                          <div className="space-y-3">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-bold">
                                <span className="text-gray-400 uppercase tracking-widest font-sans font-extrabold">Status</span>
                                <span>{completed ? 'Certified' : 'Pending'}</span>
                              </div>
                              <div className="w-full bg-stone-150 h-2.5 rounded-full overflow-hidden border border-neutral-200">
                                <div className={`h-full ${completed ? 'bg-[#5FA777]' : 'bg-[#BD783A]'}`} style={{ width: completed ? '100%' : '10%' }} />
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-150">
                              <span className="text-[10px] text-[#BD783A] font-bold uppercase tracking-wider font-sans">Val: +{ass.points} Points</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveAcademyCourse(ass);
                                  setShowAcademyQuiz(false);
                                  setAcademyQuizUserAnswers({});
                                  setAcademyQuizChecked(false);
                                  setAcademyQuizPassed(false);
                                  addToast(`Launched Interactive Syllabus for: ${ass.title}`, 'success');
                                }}
                                className={`px-4 py-2 rounded-full text-2xs uppercase tracking-widest font-extrabold border-0 cursor-pointer transition-all ${
                                  completed
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100'
                                    : 'bg-[#2E2A26] text-white hover:bg-[#BD783A]'
                                }`}
                              >
                                {completed ? 'Review Assessment ✓' : 'Begin Lecture'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Interactive Course Workspace */
                <div className="bg-white rounded-3xl border border-[#EBDECE]/60 shadow-sm p-6 sm:p-8 space-y-6 relative z-10">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-100 pb-4 gap-4">
                    <button
                      type="button"
                      onClick={() => setActiveAcademyCourse(null)}
                      className="px-4 py-1.5 bg-neutral-100 hover:bg-[#EBDECE]/20 text-[#2E2A26] rounded-full text-2xs uppercase tracking-wider font-extrabold transition-all border-0 cursor-pointer"
                    >
                      ← Exit Learning Mode
                    </button>
                    
                    <div className="text-right">
                      <h4 className="font-display font-black text-sm text-[#2E2A26] uppercase tracking-wide inline-block mr-1">{activeAcademyCourse.title}</h4>
                      <span className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
                        {activeAcademyCourse.category}
                      </span>
                    </div>
                  </div>

                  {!showAcademyQuiz ? (
                    <div className="space-y-6">
                      {activeAcademyCourse.slides && activeAcademyCourse.slides.length > 0 ? (
                        <div className="space-y-6">
                           <div className="flex justify-between items-center text-xs font-mono text-neutral-400">
                             <span>Slide {activeAcademyCourseLessonIndex + 1} of {activeAcademyCourse.slides.length+1}</span>
                             <div className="h-1.5 w-32 bg-neutral-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#BD783A] transition-all" style={{ width: `${((activeAcademyCourseLessonIndex + 1) / (activeAcademyCourse.slides.length+1)) * 100}%` }} />
                             </div>
                           </div>
                           
                           {activeAcademyCourseLessonIndex < activeAcademyCourse.slides.length ? (
                             <div className="bg-[#FBFBFC] rounded-2xl border border-neutral-200 p-8 space-y-6 animate-fade-in shadow-sm">
                               <h3 className="font-display font-medium text-[#2E2A26] text-xl border-b pb-4">
                                 {activeAcademyCourse.slides[activeAcademyCourseLessonIndex].title}
                               </h3>
                               <div className="text-sm text-neutral-700 leading-loose whitespace-pre-wrap">
                                 {activeAcademyCourse.slides[activeAcademyCourseLessonIndex].content}
                               </div>
                             </div>
                           ) : (
                             <div className="bg-[#FBFBFC] rounded-2xl border border-neutral-200 p-8 space-y-6 animate-fade-in shadow-sm items-center flex flex-col text-center">
                               <h3 className="font-display font-medium text-[#2E2A26] text-xl border-b pb-4 w-full">
                                 Slides Completed
                               </h3>
                               <div className="text-sm text-neutral-700 leading-loose whitespace-pre-wrap pb-4">
                                 You have completed all learning material for this module. Are you ready to take the exam?
                               </div>
                               <button
                                 type="button"
                                 onClick={() => setShowAcademyQuiz(true)}
                                 className="px-8 py-3 bg-[#BD783A] hover:bg-[#2E2A26] text-white text-xs font-extrabold uppercase rounded-full cursor-pointer transition-all shadow-md"
                               >
                                 Take Exam
                               </button>
                             </div>
                           )}

                           <div className="flex justify-between pt-4 border-t border-neutral-100">
                             <button
                               type="button"
                               disabled={activeAcademyCourseLessonIndex === 0}
                               onClick={() => setActiveAcademyCourseLessonIndex(i => Math.max(0, i - 1))}
                               className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-[#2E2A26] text-2xs font-extrabold uppercase rounded-full cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                               Previous
                             </button>
                             {activeAcademyCourseLessonIndex < activeAcademyCourse.slides.length && (
                               <button
                                 type="button"
                                 onClick={() => setActiveAcademyCourseLessonIndex(i => Math.min(activeAcademyCourse.slides!.length, i + 1))}
                                 className="px-6 py-3 bg-[#2E2A26] hover:bg-[#BD783A] text-white text-2xs font-extrabold uppercase rounded-full cursor-pointer transition-all"
                               >
                                 Next Slide
                               </button>
                             )}
                           </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <h3 className="font-display font-medium text-neutral-950 text-md border-b pb-2">
                            Learning Objectives
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeAcademyCourse.learningObjectives?.map((obj, i) => (
                               <div key={i} className="flex items-start gap-2 bg-[#FFFFFF] p-4 rounded-xl">
                                 <div className="h-2 w-2 rounded-full bg-[#BD783A] mt-1.5 shrink-0" />
                                 <span className="text-xs font-semibold text-[#2E2A26]">{obj}</span>
                               </div>
                            ))}
                          </div>
                          <div className="flex justify-end pt-4 border-t border-neutral-100">
                            <button
                              type="button"
                              onClick={() => setShowAcademyQuiz(true)}
                              className="px-6 py-3 bg-[#BD783A] hover:bg-[#2E2A26] text-white text-2xs font-extrabold uppercase rounded-full cursor-pointer transition-all"
                            >
                              Proceed to Assessment
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6 text-left">
                      <div className="bg-[#FBFBFC] rounded-2xl border border-neutral-200 p-6 space-y-4">
                        <span className="text-[9px] uppercase tracking-widest font-black text-[#5FA777] bg-emerald-50 border border-[#5FA777] px-3 py-1 rounded-full inline-block">
                          FINAL ASSESSMENT: {activeAcademyCourse.title}
                        </span>
                        <p className="text-xs text-neutral-500 font-light leading-relaxed">
                          You must answer at least 16 out of {Math.min(20, activeAcademyCourse.questions?.length || 0)} questions correctly to pass and earn the {activeAcademyCourse.badge} badge.
                        </p>
                      </div>

                      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                        {activeAcademyCourse.questions?.slice(0, 20).map((q, qIdx) => {
                          const userSelectedText = academyQuizUserAnswers[qIdx];
                          const isUserIncorrect = userSelectedText !== undefined && userSelectedText !== q.correctAnswer;
                          
                          return (
                            <div key={qIdx} className="bg-white p-5 rounded-2xl border border-neutral-200/80 space-y-3">
                              <h4 className="text-xs font-bold text-[#2E2A26]">
                                {qIdx + 1}. {q.text}
                              </h4>
                              <div className="grid grid-cols-1 gap-2 pt-1">
                                {q.options.map((opt, oIdx) => {
                                  const isSelected = academyQuizUserAnswers[qIdx] === opt;
                                  const showColors = academyQuizChecked;
                                  const isCorrect = opt === q.correctAnswer;
                                  
                                  let btnStyle = 'bg-[#FBFBFC] hover:bg-neutral-100 border-neutral-205 text-[#2E2A26] font-medium';
                                  if (isSelected && !showColors) {
                                    btnStyle = 'bg-stone-900 border-stone-900 text-white font-bold';
                                  } else if (showColors) {
                                    if (isCorrect) {
                                      btnStyle = 'bg-emerald-50 border-[#5FA777]/50 text-emerald-950 font-bold';
                                    } else if (isSelected && !isCorrect) {
                                      btnStyle = 'bg-rose-50 border-rose-300 text-rose-900';
                                    }
                                  }

                                  return (
                                    <button
                                      type="button"
                                      key={oIdx}
                                      disabled={academyQuizChecked}
                                      onClick={() => setAcademyQuizUserAnswers(prev => ({ ...prev, [qIdx]: opt }))}
                                      className={`w-full text-left p-3 rounded-xl border text-2xs tracking-snug transition-all flex items-center space-x-2.5 cursor-pointer ${btnStyle}`}
                                    >
                                      <span>{opt}</span>
                                    </button>
                                  );
                                })}
                              </div>
                              {academyQuizChecked && isUserIncorrect && (
                                <p className="text-3xs text-rose-600 font-medium pl-6 bg-rose-50/50 p-2 rounded-lg border border-rose-100/40">
                                  {q.explanation}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 border-t pt-6 bg-[#FFFFFF] rounded-2xl mt-4">
                        <div>
                          {academyQuizChecked && (
                            <p className={`text-xs font-black ${academyQuizPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {academyQuizPassed 
                                ? `✓ ${Math.round((Object.values(academyQuizUserAnswers).filter((ans, i) => ans === activeAcademyCourse.questions[i].correctAnswer).length / Math.min(20, activeAcademyCourse.questions.length))*100)}% - EXCELLENT! BADGE EARNED.` 
                                : `✗ ${Math.round((Object.values(academyQuizUserAnswers).filter((ans, i) => ans === activeAcademyCourse.questions[i].correctAnswer).length / Math.min(20, activeAcademyCourse.questions.length))*100)}% - SCORE SUBSTANDARD. 16 QUESTIONS CORRECT REQUIRED.`}
                            </p>
                          )}
                        </div>

                        <div className="flex space-x-2 shrink-0">
                          {academyQuizChecked && !academyQuizPassed && (
                            <button
                              type="button"
                              onClick={() => {
                                setAcademyQuizUserAnswers({});
                                setAcademyQuizChecked(false);
                                setAcademyQuizPassed(false);
                                addToast('Logs reset. Review slides and retry!', 'warning');
                              }}
                              className="px-5 py-3 bg-neutral-900 text-white rounded-xl text-2xs uppercase tracking-widest font-extrabold border-0 cursor-pointer"
                            >
                              Retry Assessment
                            </button>
                          )}

                          {!academyQuizChecked ? (
                            <button
                              type="button"
                              onClick={() => {
                                const correctCount = Object.values(academyQuizUserAnswers).filter((ans, i) => ans === activeAcademyCourse.questions[i].correctAnswer).length;
                                const totalQuestions = Math.min(20, activeAcademyCourse.questions.length);
                                const isPass = correctCount >= Math.min(16, totalQuestions); // Need at least 16 or 100% if < 16
                                setAcademyQuizChecked(true);
                                setAcademyQuizPassed(isPass);
                                if (isPass) {
                                  addToast(`Congratulations! You earned the ${activeAcademyCourse.badge} badge.`, 'success');
                                  // Could update employee here with actual persistence 
                                } else {
                                  addToast('Assessment failed. Review and retry.', 'error');
                                }
                              }}
                              disabled={Object.keys(academyQuizUserAnswers).length < Math.min(20, activeAcademyCourse.questions.length)}
                              className="px-6 py-3.5 bg-emerald-600 disabled:opacity-40 hover:bg-neutral-950 text-white rounded-xl text-2xs uppercase tracking-widest font-extrabold border-0 cursor-pointer"
                            >
                              Submit Assessment
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setActiveAcademyCourse(null)}
                              className="px-6 py-3.5 bg-[#2E2A26] text-white rounded-xl text-2xs uppercase tracking-widest font-extrabold border-0 cursor-pointer"
                            >
                              Back to Academy
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SUBVIEW 4: SIFR SYSTEM */}
          {currentTab === 'staff_sifr' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
              {/* Submission Logs Column (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-[#EBDECE] flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-md font-black text-[#5FA777] uppercase tracking-wide">SIFR Incident Registers</h2>
                    <p className="text-2xs text-gray-400 mt-1">Staff Incident and Feedback Reports submitted for Leicester and Solihull.</p>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase">Operational observations</span>
                </div>

                <div className="space-y-6">
                  {sifrReports.map((rep) => (
                    <div key={rep.id} className="bg-white p-6 rounded-3xl border border-[#EBDECE]/50 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="space-y-0.5">
                          <h3 className="font-display font-black text-xs text-[#2E2A26] uppercase tracking-wide">
                            {rep.title}
                          </h3>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400">
                            <span>Category: {rep.category}</span>
                            <span>•</span>
                            <span>Store Node: {rep.storeName}</span>
                          </div>
                        </div>

                        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${
                          rep.status === 'resolved'
                            ? 'bg-[#5FA777]/20 text-[#5FA777]'
                            : 'bg-amber-100 text-[#BD783A]'
                        }`}>
                          {rep.status}
                        </span>
                      </div>

                      {/* Content block */}
                      <div className="bg-[#FFFFFF] p-4 rounded-2xl text-xs space-y-2 text-[#2E2A26]/85 font-light">
                        <p><span className="font-bold text-[#2E2A26]">Observation Description: </span>{rep.description}</p>
                        <p><span className="font-bold text-[#2E2A26]">Impact Parameters: </span>{rep.impact}</p>
                        <p><span className="font-bold text-[#2E2A26]">Suggested Remediative Action: </span>{rep.suggestedAction}</p>
                      </div>

                      {/* Replies loop */}
                      {rep.replies && rep.replies.length > 0 && (
                        <div className="space-y-3 pt-3 border-t border-gray-100">
                          <h4 className="text-[10px] uppercase font-black tracking-widest text-[#BD783A]">Comments & Actions</h4>
                          {rep.replies.map((comment) => (
                            <div key={comment.id} className="bg-[#7CC0C7]/10 p-3 rounded-xl space-y-1">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-extrabold">{comment.user} ({comment.role.replace('_', ' ')})</span>
                                <span className="text-gray-400 font-mono">{new Date(comment.timestamp).toLocaleDateString()}</span>
                              </div>
                              <p className="text-2xs text-gray-600 font-light leading-relaxed">{comment.message}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply form */}
                      <div className="flex items-center gap-3 pt-2">
                        <input
                          id={`sifr-comment-input-${rep.id}`}
                          type="text"
                          placeholder="Type response observation details..."
                          value={sifrComments[rep.id] || ''}
                          onChange={(e) => setSifrComments({ ...sifrComments, [rep.id]: e.target.value })}
                          className="flex-1 text-2xs p-2.5 bg-[#FFFFFF] border rounded-lg focus:outline-none"
                        />
                        <button
                          id={`sifr-comment-submit-${rep.id}`}
                          type="button"
                          onClick={() => handleReplySubmit(rep.id)}
                          className="p-2.5 bg-[#2E2A26] text-white rounded-lg hover:bg-[#BD783A] cursor-pointer"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submission Form (4 cols) */}
              <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-[#EBDECE] space-y-4">
                <h3 className="font-display text-xs uppercase font-extrabold tracking-widest text-[#5FA777]">Post SIFR Observation</h3>

                <form onSubmit={handleSifrSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-wider text-gray-500 mb-1">Observation Title</label>
                    <input
                      id="sifr-title-input"
                      type="text"
                      required
                      placeholder="e.g. Blenders Seal Calibration Error"
                      value={sifrForm.title}
                      onChange={(e) => setSifrForm({ ...sifrForm, title: e.target.value })}
                      className="w-full text-xs p-3 bg-[#FFFFFF] border border-[#EBDECE] rounded-xl focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-wider text-gray-500 mb-1">Category</label>
                      <select
                        id="sifr-category-select"
                        value={sifrForm.category}
                        onChange={(e) => setSifrForm({ ...sifrForm, category: e.target.value as any })}
                        className="w-full text-xs p-2.5 bg-[#FFFFFF] border rounded-xl"
                      >
                        <option value="attendance">Attendance</option>
                        <option value="operations">Operations</option>
                        <option value="health_safety">Safety</option>
                        <option value="customer_service">Guest Care</option>
                        <option value="teamwork">Teamwork</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-wider text-gray-500 mb-1">Confidential</label>
                      <select
                        id="sifr-confidential-select"
                        value={sifrForm.confidentiality}
                        onChange={(e) => setSifrForm({ ...sifrForm, confidentiality: e.target.value as any })}
                        className="w-full text-xs p-2.5 bg-[#FFFFFF] border rounded-xl"
                      >
                        <option value="standard">Show Name</option>
                        <option value="confidential">Confidential</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-wider text-gray-500 mb-1">Involved Personnel</label>
                    <input
                      id="sifr-personnel-input"
                      type="text"
                      placeholder="Marcus, Sarah Jenkins"
                      value={sifrForm.involvedPeople}
                      onChange={(e) => setSifrForm({ ...sifrForm, involvedPeople: e.target.value })}
                      className="w-full text-xs p-3 bg-[#FFFFFF] border border-[#EBDECE] rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-wider text-gray-500 mb-1">Description of Incident</label>
                    <textarea
                      id="sifr-desc-input"
                      required
                      placeholder="State what you observed objectively..."
                      value={sifrForm.description}
                      onChange={(e) => setSifrForm({ ...sifrForm, description: e.target.value })}
                      className="w-full text-xs p-3 bg-[#FFFFFF] border border-[#EBDECE] rounded-xl focus:outline-none h-20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-wider text-gray-500 mb-1">Operational Impact</label>
                    <textarea
                      id="sifr-impact-input"
                      required
                      placeholder="How does this impact recipe safety or speed?"
                      value={sifrForm.impact}
                      onChange={(e) => setSifrForm({ ...sifrForm, impact: e.target.value })}
                      className="w-full text-xs p-3 bg-[#FFFFFF] border border-[#EBDECE] rounded-xl focus:outline-none h-16"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-wider text-gray-500 mb-1">Suggested Remediative Action</label>
                    <textarea
                      id="sifr-action-input"
                      required
                      placeholder="What should the team do to stop this happening?"
                      value={sifrForm.suggestedAction}
                      onChange={(e) => setSifrForm({ ...sifrForm, suggestedAction: e.target.value })}
                      className="w-full text-xs p-3 bg-[#FFFFFF] border border-[#EBDECE] rounded-xl focus:outline-none h-16"
                    />
                  </div>

                  <button
                    id="sifr-form-submit-btn"
                    type="submit"
                    className="w-full py-3.5 bg-[#5FA777] hover:bg-[#2E2A26] text-white rounded-full text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    File SIFR Verification
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* SUBVIEW 5: KNOWLEDGE BASE */}
          {currentTab === 'staff_kb' && (
            <div className="space-y-6 text-left">
              {/* Search Bar */}
              <div className="bg-white p-6 rounded-3xl border border-[#EBDECE] flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-3.5 h-4 w-4 text-[#BD783A]" />
                  <input
                    id="kb-search-input"
                    type="text"
                    placeholder="Search operations recipes, sanitisation routines, close guides..."
                    value={kbSearch}
                    onChange={(e) => setKbSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-[#FFFFFF] border border-[#EBDECE] rounded-full text-xs focus:ring-1 focus:ring-[#BD783A] focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pb-1 overflow-x-auto w-full md:w-auto">
                  {['all', 'recipes', 'opening', 'closing', 'cleaning'].map((cat) => (
                    <button
                      id={`kb-cat-filter-${cat}`}
                      key={cat}
                      onClick={() => setKbCategory(cat)}
                      className={`px-4 py-2 rounded-full text-2xs uppercase font-extrabold whitespace-nowrap cursor-pointer ${
                        kbCategory === cat ? 'bg-[#BD783A] text-white' : 'bg-stone-100 text-[#2E2A26]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Articles matching list */}
              {(() => {
                const filteredKB = INITIAL_ARTICLES.filter((art) => {
                  const matchTxt = art.title.toLowerCase().includes(kbSearch.toLowerCase()) ||
                    art.content.toLowerCase().includes(kbSearch.toLowerCase());
                  const matchCat = kbCategory === 'all' || art.category === kbCategory;
                  return matchTxt && matchCat;
                });

                if (filteredKB.length === 0) {
                  return (
                    <div className="bg-white p-12 text-center rounded-3xl border">
                      <HelpCircle className="h-8 w-8 text-[#BD783A] mx-auto mb-2" />
                      <p className="text-xs font-bold font-display uppercase">No operations guides located.</p>
                      <p className="text-2xs text-gray-400 mt-1">Try entering "Allergen" or "Calibrate".</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredKB.map((art) => (
                      <div key={art.id} className="bg-white p-6 rounded-3xl border border-[#EBDECE]/40 shadow-2xs space-y-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-[#BD783A] font-extrabold uppercase tracking-widest">{art.category}</span>
                            <span className="text-gray-400 font-mono">Updated: {art.lastUpdated}</span>
                          </div>
                          <h3 className="font-display font-black text-xs uppercase tracking-wide">{art.title}</h3>
                          <p className="text-2xs text-gray-500 font-mono">Author: {art.author} • Read Space: {art.readingTime}</p>
                        </div>

                        <p className="text-2xs text-gray-600 leading-relaxed font-light">{art.content}</p>

                        {art.steps && (
                          <div className="space-y-2 border-t border-gray-100 pt-3">
                            <span className="text-[9px] uppercase font-black text-[#BD783A] tracking-widest block">Core Calibration Steps</span>
                            <ul className="space-y-1 text-2xs text-gray-600 font-light list-decimal list-inside pl-1">
                              {art.steps.map((st, i) => (
                                <li key={i}>{st}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
