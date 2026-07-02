import React from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';
import { BRAND, LogoVertical, DripEdge, WaveEdge, STICKERS } from '../brand';
import { SiteSettings } from '../types';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
  setIsStaffMode: (val: boolean) => void;
  settings: SiteSettings;
}

/**
 * Footer styled after the brandbook packaging system: a caramel field with the
 * white milk-drip edge above it, the white vertical logo (the brandbook's rule
 * for dark backgrounds) and the blue wave closing the page like the cup base.
 */
export const Footer: React.FC<FooterProps> = ({ setCurrentTab, setIsStaffMode, settings }) => {
  const handleNav = (tab: string, isHub = false) => {
    setIsStaffMode(isHub);
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#BD783A] text-white overflow-hidden">
      {/* White milk drips flowing from the page above into the caramel field */}
      <DripEdge color="#FFFFFF" className="h-14 sm:h-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-10 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand block — white logo per the brandbook dark-background rule */}
          <div className="space-y-5">
            <button onClick={() => handleNav('home')} className="cursor-pointer" aria-label="Milk Pop home">
              <LogoVertical color="#FFFFFF" className="h-24 w-auto" title="Milk Pop" />
            </button>
            <p className="text-xs text-white/85 leading-relaxed font-light max-w-xs">
              {settings.footerTagline}
            </p>
            <div className="flex items-center space-x-3 pt-1">
              {settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram" className="p-2 bg-white/15 hover:bg-white hover:text-[#BD783A] rounded-full transition-all text-white">
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {settings.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook" className="p-2 bg-white/15 hover:bg-white hover:text-[#BD783A] rounded-full transition-all text-white">
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {settings.twitterUrl && (
                <a href={settings.twitterUrl} target="_blank" rel="noreferrer" aria-label="Twitter / X" className="p-2 bg-white/15 hover:bg-white hover:text-[#BD783A] rounded-full transition-all text-white">
                  <Twitter className="h-4 w-4" />
                </a>
              )}
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-bold">
              {settings.websiteUrl} &nbsp;|&nbsp; {settings.instagramHandle}
            </p>
          </div>

          {/* Explore links */}
          <div className="space-y-4">
            <h4 className="text-2xs uppercase tracking-widest font-black text-white">Explore</h4>
            <ul className="space-y-2 text-xs font-light">
              <li><button onClick={() => handleNav('menu')} className="text-white/85 hover:text-white hover:underline transition-colors cursor-pointer">The Drink & Dessert Menu</button></li>
              <li><button onClick={() => handleNav('stores')} className="text-white/85 hover:text-white hover:underline transition-colors cursor-pointer">Our Store Locations</button></li>
              <li><button onClick={() => handleNav('careers')} className="text-white/85 hover:text-white hover:underline transition-colors cursor-pointer">Careers & Job Vacancies</button></li>
              <li><button onClick={() => handleNav('franchise')} className="text-white/85 hover:text-white hover:underline transition-colors cursor-pointer">Franchise Opportunities</button></li>
              <li><button onClick={() => handleNav('staff_login', true)} className="text-white/85 hover:text-white hover:underline transition-colors cursor-pointer">Staff Portal Login</button></li>
            </ul>
          </div>

          {/* Company links */}
          <div className="space-y-4">
            <h4 className="text-2xs uppercase tracking-widest font-black text-white">Company</h4>
            <ul className="space-y-2 text-xs font-light">
              <li><button onClick={() => handleNav('about')} className="text-white/85 hover:text-white hover:underline transition-colors cursor-pointer">Our Story & Mission</button></li>
              <li><button onClick={() => handleNav('contact')} className="text-white/85 hover:text-white hover:underline transition-colors cursor-pointer">Contact Customer Care</button></li>
              <li><button onClick={() => handleNav('news')} className="text-white/85 hover:text-white hover:underline transition-colors cursor-pointer">Company News & Press</button></li>
            </ul>
            <img src={STICKERS.bunny} alt="" aria-hidden="true" className="w-16 opacity-90 mp-float" style={{ ['--mp-tilt' as any]: '-6deg' }} />
          </div>

          {/* Contact details — driven by Site Settings (owner-editable) */}
          <div className="space-y-4">
            <h4 className="text-2xs uppercase tracking-widest font-black text-white">Contact Details</h4>
            <div className="space-y-3 text-xs text-white/85 font-light">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-white shrink-0 mt-0.5" />
                <span className="whitespace-pre-line">{settings.hqAddress}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-white" />
                <span>{settings.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-white" />
                <span>{settings.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal fine-print */}
        <div className="border-t border-white/25 pt-8 mt-4 text-center text-[10px] text-white/75 space-y-4">
          <p className="max-w-3xl mx-auto leading-relaxed font-light">{settings.allergenNotice}</p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-2xs pt-2">
            <span>© {new Date().getFullYear()} {settings.legalName}. All Rights Reserved. Co No: {settings.companyNumber}.</span>
            <div className="flex items-center space-x-3">
              <button onClick={() => handleNav('privacy')} className="hover:underline text-white/90 cursor-pointer">Privacy Policy</button>
              <span>•</span>
              <button onClick={() => handleNav('gdpr')} className="hover:underline text-white/90 cursor-pointer">UK GDPR Consent Policy</button>
              <span>•</span>
              <button onClick={() => handleNav('fdd')} className="hover:underline text-white/90 cursor-pointer">Franchise Disclosure (FDD)</button>
            </div>
          </div>
        </div>
      </div>

      {/* Blue wave base — like the bottom band of the brandbook cup */}
      <WaveEdge color={BRAND.blue} className="h-10 sm:h-14" />
    </footer>
  );
};
