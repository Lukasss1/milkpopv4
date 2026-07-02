import React, { useState } from 'react';
import { Menu as MenuIcon, X, Sparkles, User, Briefcase, FileText, LogIn, LayoutDashboard } from 'lucide-react';
import { EmployeeProfile } from '../types';
import { LogoHorizontal, LogoIcon } from '../brand';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  employee: EmployeeProfile | null;
  onLogout: () => void;
  isStaffMode: boolean;
  setIsStaffMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  employee,
  onLogout,
  isStaffMode,
  setIsStaffMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Translate tab keys to user friendly names
  const handleTabClick = (tabKey: string) => {
    if (!tabKey.startsWith('staff_')) {
      setIsStaffMode(false);
    }
    setCurrentTab(tabKey);
    setMobileMenuOpen(false);
  };

  const customerNavItems = [
    { key: 'home', label: 'Home' },
    { key: 'menu', label: 'Menu' },
    { key: 'stores', label: 'Stores' },
    { key: 'careers', label: 'Careers' },
    { key: 'franchise', label: 'Franchise' },
    { key: 'about', label: 'About Us' },
    { key: 'contact', label: 'Contact' },
  ];

  const staffNavItems = [
    { key: 'staff_dashboard', label: 'Dashboard' },
    { key: 'staff_pos', label: 'Till / POS' },
    { key: 'staff_documents', label: 'Documents' },
    { key: 'staff_checklists', label: 'Checklists' },
    { key: 'staff_academy', label: 'Academy' },
    { key: 'staff_sifr', label: 'SIFR' },
    { key: 'staff_kb', label: 'Library' },
  ];

  const navItems = isStaffMode && employee ? staffNavItems : customerNavItems;

  return (
    <header className="sticky top-0 z-50 w-full mp-glass border-b border-[#EBDECE]/50 shadow-[0_1px_12px_rgba(46,42,38,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand area */}
          <button
            id="brand-logo-btn"
            onClick={() => handleTabClick('home')}
            className="flex items-center space-x-2 focus:outline-none cursor-pointer group text-left shrink-0"
          >
            {/* Official horizontal logo — the brandbook's recommended lock-up for site headers */}
            <LogoIcon className="h-9 w-auto sm:hidden group-hover:scale-105 transition-transform" title="Milk Pop" />
            <LogoHorizontal className="hidden sm:block h-9 w-auto group-hover:scale-[1.03] transition-transform" title="Milk Pop — home" />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Desktop navigation">
            {navItems.map((item) => (
              <button
                id={`nav-${item.key}`}
                key={item.key}
                onClick={() => handleTabClick(item.key)}
                className={`px-3 py-2 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                  currentTab === item.key
                    ? 'bg-[#BD783A] text-white shadow-sm'
                    : 'text-[#2E2A26] hover:bg-[#EBDECE]/50 hover:text-[#BD783A]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Quick Action Controls */}
          <div className="hidden lg:flex items-center space-x-3 shrink-0">
            {employee ? (
              <div className="flex items-center space-x-2 bg-[#EBDECE]/40 p-1.5 rounded-full pl-3">
                <div className="flex flex-col text-right hidden xl:flex">
                  <span className="text-2xs font-extrabold text-[#2E2A26] whitespace-nowrap">
                    {employee.name}
                  </span>
                  <span className="text-[9px] text-[#BD783A] font-black uppercase tracking-wider">
                    {employee.role.replace('_', ' ')}
                  </span>
                </div>
                {isStaffMode ? (
                  <button
                    id="return-customer-btn"
                    onClick={() => {
                      setIsStaffMode(false);
                      handleTabClick('home');
                    }}
                    className="px-3 py-1.5 bg-white text-[#2E2A26] hover:bg-[#EBDECE] rounded-full text-[10px] uppercase font-bold transition-all cursor-pointer whitespace-nowrap"
                  >
                    Customer View
                  </button>
                ) : (
                  <button
                    id="dashboard-goto-btn"
                    onClick={() => {
                      setIsStaffMode(true);
                      handleTabClick('staff_dashboard');
                    }}
                    className="p-2 rounded-full transition-all cursor-pointer bg-white hover:bg-[#BD783A]/10 text-[#2E2A26]"
                    title="Employee Hub Dashboard"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                  </button>
                )}
                <button
                  id="nav-logout-btn"
                  onClick={onLogout}
                  className="px-3 py-1.5 bg-[#2E2A26] text-white rounded-full text-[10px] uppercase font-bold hover:bg-[#BD783A]/90 transition-all cursor-pointer whitespace-nowrap"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button
                id="staff-login-btn"
                onClick={() => {
                  setIsStaffMode(true);
                  handleTabClick('staff_login');
                }}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-[#2E2A26] hover:bg-[#BD783A]/90 text-white rounded-full text-2xs uppercase tracking-wider font-extrabold shadow-sm transition-all cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Staff Portal</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Action Icon */}
          <div className="flex items-center lg:hidden space-x-2">
            {employee && (
              <button
                id="mob-hub-toggle"
                onClick={() => {
                  setIsStaffMode(true);
                  handleTabClick('staff_dashboard');
                }}
                className={`p-2 rounded-full cursor-pointer ${
                  isStaffMode ? 'bg-[#BD783A] text-white' : 'bg-[#EBDECE]/50 text-[#2E2A26]'
                }`}
                title="Employee Hub"
              >
                <LayoutDashboard className="h-4 w-4" />
              </button>
            )}
            <button
              id="mobile-menu-hamburger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-full text-[#2E2A26] bg-[#EBDECE]/30 hover:bg-[#EBDECE]/60 transition-all focus:outline-none cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Out Side Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-[#FFFFFF] border-b border-[#EBDECE] shadow-xl py-5 px-4 transition-all duration-300">
          <div className="flex flex-col space-y-2">
            <span className="text-[9px] uppercase tracking-widest text-[#BD783A] font-black px-3">
              {isStaffMode ? 'Staff Actions' : 'Explore Milk Pop'}
            </span>
            {navItems.map((item) => (
              <button
                id={`mob-nav-${item.key}`}
                key={item.key}
                onClick={() => handleTabClick(item.key)}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentTab === item.key
                    ? 'bg-[#BD783A] text-white'
                    : 'text-[#2E2A26] hover:bg-[#EBDECE]/30'
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="border-t border-[#EBDECE] pt-4 mt-2">
              {employee ? (
                <div className="flex flex-col space-y-3 px-2">
                  <div className="flex items-center space-x-2">
                    <div className="h-9 w-9 rounded-full bg-[#BD783A] text-white font-bold flex items-center justify-center">
                      {employee.name[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-[#2E2A26]">{employee.name}</h4>
                      <p className="text-[10px] text-[#BD783A] font-bold uppercase">
                        {employee.role.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {isStaffMode ? (
                      <button
                        id="mob-return-customer-btn"
                        onClick={() => {
                          setIsStaffMode(false);
                          handleTabClick('home');
                        }}
                        className="py-2.5 text-center bg-white border border-[#EBDECE] text-[#2E2A26] rounded-xl text-2xs uppercase tracking-wider font-extrabold"
                      >
                        Customer View
                      </button>
                    ) : (
                      <button
                        id="mob-hub-btn"
                        onClick={() => {
                          setIsStaffMode(true);
                          handleTabClick('staff_dashboard');
                        }}
                        className="py-2.5 text-center bg-[#EBDECE]/60 text-[#2E2A26] rounded-xl text-2xs uppercase tracking-wider font-extrabold"
                      >
                        Dashboard
                      </button>
                    )}
                    <button
                      id="mob-logout-btn"
                      onClick={() => {
                        onLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="py-2.5 text-center bg-red-100 text-red-700 rounded-xl text-2xs uppercase tracking-wider font-extrabold"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  id="mob-login-btn"
                  onClick={() => {
                    setIsStaffMode(true);
                    handleTabClick('staff_login');
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-[#2E2A26] hover:bg-[#BD783A] text-white rounded-xl text-xs font-bold tracking-wider uppercase shadow-sm cursor-pointer"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Employee Portal Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
