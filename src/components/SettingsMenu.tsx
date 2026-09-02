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
  ShieldCheck
} from 'lucide-react';
import { Account, UserRole } from '../types';

interface SettingsMenuProps {
  onGoHome: () => void;
  onOpenProfile: () => void;
  onOpenPasswordChange: () => void;
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
  onOpenOrders,
  onOpenContact,
  onLogout,
  currentUser,
  currentRole,
  onOpenAuth,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        <span className="hidden xs:inline sm:inline">Settings</span>
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
                Quick Settings & Navigation
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
                  Sign In
                </button>
              </div>
            )}
          </div>

          {/* Menu Options Group */}
          <div className="p-1.5 space-y-0.5">
            {/* 1. Home */}
            <button
              id="settings-menu-home"
              type="button"
              onClick={() => handleAction(onGoHome)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-bold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/80 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <div className="leading-tight">Home</div>
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
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-bold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/80 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="leading-tight">Profile</div>
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
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-bold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/80 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <div className="leading-tight">Password Change</div>
                  <div className="text-[10px] font-normal text-slate-400">Manage login credentials</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
            </button>

            {/* 4. Orders */}
            <button
              id="settings-menu-orders"
              type="button"
              onClick={() => handleAction(onOpenOrders)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-bold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/80 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <div className="leading-tight">Orders</div>
                  <div className="text-[10px] font-normal text-slate-400">Order receipts & deliveries</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
            </button>

            {/* 5. Contact */}
            <button
              id="settings-menu-contact"
              type="button"
              onClick={() => handleAction(onOpenContact)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-bold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/80 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center group-hover:bg-cyan-100 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="leading-tight">Contact</div>
                  <div className="text-[10px] font-normal text-slate-400">Customer & farmer helpdesk</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
            </button>
          </div>

          {/* 6. Logout / Sign In Section */}
          <div className="p-1.5">
            {currentUser ? (
              <button
                id="settings-menu-logout"
                type="button"
                onClick={() => handleAction(onLogout)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="leading-tight">Logout</div>
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
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-bold text-emerald-800 hover:bg-emerald-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="leading-tight">Sign In / Register</div>
                    <div className="text-[10px] font-normal text-slate-500">Authenticate with Gmail</div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 transition-colors" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
