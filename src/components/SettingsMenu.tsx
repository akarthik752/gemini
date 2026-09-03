import React, { useState, useRef, useEffect } from 'react';
import { 
  Settings, 
  Home, 
  User, 
  KeyRound, 
  Package, 
  MessageSquare, 
  LogOut, 
  ChevronRight,
  ShieldCheck,
  Globe,
  Coins,
  MapPin
} from 'lucide-react';
import { Account, UserRole } from '../types';
import { usePreferences } from '../context/PreferencesContext';

interface SettingsMenuProps {
  onGoHome: () => void;
  onOpenProfile: () => void;
  onOpenPasswordChange: () => void;
  onOpenLanguage: () => void;
  onOpenCurrency: () => void;
  onOpenCountry?: () => void;
  onOpenOrders: () => void;
  onOpenContact: () => void;
  onLogout: () => void;
  currentUser: Account | null;
  currentRole: UserRole;
  onOpenAuth: () => void;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({
  onGoHome,
  onOpenProfile,
  onOpenPasswordChange,
  onOpenLanguage,
  onOpenCurrency,
  onOpenCountry,
  onOpenOrders,
  onOpenContact,
  onLogout,
  currentUser,
  currentRole,
  onOpenAuth,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { language, currency, selectedCountry, t } = usePreferences();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleAction = (actionFn: () => void) => {
    setIsOpen(false);
    actionFn();
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Top Left Settings Button */}
      <button
        id="top-left-settings-btn"
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl border transition-all text-xs font-bold shadow-xs ${
          isOpen
            ? 'bg-emerald-700 text-white border-emerald-800 ring-2 ring-emerald-400/40'
            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
        }`}
        title="Open Settings Menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Settings className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-90 text-white' : 'text-emerald-700'}`} />
        <span className="hidden xs:inline sm:inline">{t('settings', 'Settings')}</span>
        <span className="text-[11px] font-mono font-black text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60 hidden sm:inline">
          {currency.symbol}
        </span>
      </button>

      {/* Settings Dropdown Popover */}
      {isOpen && (
        <div
          id="settings-dropdown-menu"
          className="absolute left-0 mt-2 w-72 sm:w-80 rounded-3xl bg-white shadow-2xl border border-slate-200 py-2.5 z-50 animate-fadeIn divide-y divide-slate-100 focus:outline-none"
        >
          {/* Header context */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-emerald-50/40 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                {t('settings', 'Settings & Navigation')}
              </span>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {currentRole}
              </span>
            </div>
            {currentUser ? (
              <div className="mt-1.5 truncate">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {currentUser.fullName}
                </div>
                <div className="text-[11px] text-slate-500 font-mono truncate">
                  {currentUser.email}
                </div>
              </div>
            ) : (
              <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                <span>Guest Visitor</span>
                <button
                  type="button"
                  onClick={() => handleAction(onOpenAuth)}
                  className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3" />
                  {t('signIn', 'Sign In')}
                </button>
              </div>
            )}

            {/* Quick Language & Currency Status Bar */}
            <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center gap-2">
              <button
                type="button"
                id="settings-quick-lang-btn"
                onClick={() => handleAction(onOpenLanguage)}
                className="flex-1 px-2.5 py-1.5 rounded-xl bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50/50 text-[11px] font-bold text-blue-900 flex items-center justify-between transition-colors shadow-2xs"
                title="Change Language"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span>{language.flag}</span>
                  <span className="truncate">{language.nativeName}</span>
                </div>
                <span className="text-[9px] uppercase font-mono text-blue-600 bg-blue-100/60 px-1 rounded">
                  Lang
                </span>
              </button>

              <button
                type="button"
                id="settings-quick-curr-btn"
                onClick={() => handleAction(onOpenCurrency)}
                className="flex-1 px-2.5 py-1.5 rounded-xl bg-white border border-amber-200 hover:border-amber-400 hover:bg-amber-50/50 text-[11px] font-bold text-amber-950 flex items-center justify-between transition-colors shadow-2xs"
                title="Change Price Currency"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span>{currency.flag}</span>
                  <span className="truncate font-mono">{currency.symbol} {currency.code}</span>
                </div>
                <span className="text-[9px] uppercase font-mono text-amber-700 bg-amber-100/60 px-1 rounded">
                  Price
                </span>
              </button>
            </div>
          </div>

          {/* Menu Options Group */}
          <div className="p-1.5 space-y-0.5">
            {/* 1. Home */}
            <button
              id="settings-menu-home"
              type="button"
              onClick={() => handleAction(onGoHome)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/80 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <Home className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="leading-tight">{t('home', 'Home')}</div>
                  <div className="text-[10px] font-normal text-slate-400">Return to main marketplace</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
            </button>

            {/* 2. Profile */}
            <button
              id="settings-menu-profile"
              type="button"
              onClick={() => handleAction(onOpenProfile)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/80 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="leading-tight">{t('profile', 'Profile')}</div>
                  <div className="text-[10px] font-normal text-slate-400">Personal details & farm bio</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
            </button>

            {/* 3. Password Change */}
            <button
              id="settings-menu-password"
              type="button"
              onClick={() => handleAction(onOpenPasswordChange)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/80 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <KeyRound className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="leading-tight">{t('passwordChange', 'Password Change')}</div>
                  <div className="text-[10px] font-normal text-slate-400">Manage login credentials</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
            </button>

            {/* 4. Language Change */}
            <button
              id="settings-menu-language"
              type="button"
              onClick={() => handleAction(onOpenLanguage)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-700 hover:text-blue-800 hover:bg-blue-50/80 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="leading-tight flex items-center gap-1.5">
                    <span>{t('language', 'Language')}</span>
                    <span className="text-[10px] font-mono text-blue-700 bg-blue-100/80 px-1 rounded font-bold">
                      {language.flag} {language.nativeName}
                    </span>
                  </div>
                  <div className="text-[10px] font-normal text-slate-400">Choose from 30+ world languages</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
            </button>

            {/* 5. Currency & Price Change */}
            <button
              id="settings-menu-currency"
              type="button"
              onClick={() => handleAction(onOpenCurrency)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-700 hover:text-amber-800 hover:bg-amber-50/80 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <Coins className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="leading-tight flex items-center gap-1.5">
                    <span>{t('currency', 'Price Currency')}</span>
                    <span className="text-[10px] font-mono text-amber-800 bg-amber-100/80 px-1 rounded font-bold">
                      {currency.symbol} {currency.code}
                    </span>
                  </div>
                  <div className="text-[10px] font-normal text-slate-400">Rupees (₹), Euro (€), Dollar ($), etc.</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-600 transition-colors" />
            </button>

            {/* 6. Country & Regional Availability */}
            <button
              id="settings-menu-country"
              type="button"
              onClick={() => handleAction(() => onOpenCountry && onOpenCountry())}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-700 hover:text-rose-800 hover:bg-rose-50/80 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="leading-tight flex items-center gap-1.5">
                    <span>Country & Region</span>
                    <span className="text-[10px] font-mono text-rose-800 bg-rose-100/80 px-1 rounded font-bold">
                      {selectedCountry?.flag} {selectedCountry?.name}
                    </span>
                  </div>
                  <div className="text-[10px] font-normal text-slate-400">Sourcing availability & local harvest</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-rose-600 transition-colors" />
            </button>

            {/* 7. Orders */}
            <button
              id="settings-menu-orders"
              type="button"
              onClick={() => handleAction(onOpenOrders)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/80 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <Package className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="leading-tight">{t('orders', 'Orders')}</div>
                  <div className="text-[10px] font-normal text-slate-400">Order receipts & deliveries</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
            </button>

            {/* 7. Contact */}
            <button
              id="settings-menu-contact"
              type="button"
              onClick={() => handleAction(onOpenContact)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/80 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center group-hover:bg-cyan-100 transition-colors">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="leading-tight">{t('contact', 'Contact Support')}</div>
                  <div className="text-[10px] font-normal text-slate-400">Customer & farmer helpdesk</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
            </button>
          </div>

          {/* 8. Logout / Sign In Section */}
          <div className="p-1.5">
            {currentUser ? (
              <button
                id="settings-menu-logout"
                type="button"
                onClick={() => handleAction(onLogout)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                    <LogOut className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="leading-tight">{t('logout', 'Logout')}</div>
                    <div className="text-[10px] font-normal text-rose-500">Sign out of current account</div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-rose-300 group-hover:text-rose-600 transition-colors" />
              </button>
            ) : (
              <button
                id="settings-menu-login"
                type="button"
                onClick={() => handleAction(onOpenAuth)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-bold text-emerald-800 hover:bg-emerald-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="leading-tight">{t('signIn', 'Sign In with Gmail')}</div>
                    <div className="text-[10px] font-normal text-slate-400">Access registered credentials</div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:text-emerald-600 transition-colors" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
