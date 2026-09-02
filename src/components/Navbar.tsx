import React from 'react';
import { Account, UserRole } from '../types';
import { 
  Tractor, 
  ShoppingBag, 
  User, 
  LogOut, 
  RotateCcw, 
  Package, 
  ShieldCheck,
  Store
} from 'lucide-react';
import { SettingsMenu } from './SettingsMenu';

interface NavbarProps {
  currentView: UserRole;
  onViewChange: (view: UserRole) => void;
  onRequestSwitchRole?: (view: UserRole) => void;
  currentUser: Account | null;
  onOpenAuth: (preferredRole?: UserRole) => void;
  onLogout: () => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenBuyerOrders: () => void;
  onResetData: () => void;
  onGoHome?: () => void;
  onOpenProfile?: () => void;
  onOpenPasswordChange?: () => void;
  onOpenContact?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  onRequestSwitchRole,
  currentUser,
  onOpenAuth,
  onLogout,
  cartCount,
  onOpenCart,
  onOpenBuyerOrders,
  onResetData,
  onGoHome,
  onOpenProfile,
  onOpenPasswordChange,
  onOpenContact,
}) => {
  const handleRoleClick = (targetRole: UserRole) => {
    if (onRequestSwitchRole) {
      onRequestSwitchRole(targetRole);
    } else {
      onViewChange(targetRole);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Top-Left Settings Button & Logo */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Top-Left Settings Dropdown Button */}
            <SettingsMenu
              onGoHome={() => (onGoHome ? onGoHome() : onViewChange('buyer'))}
              onOpenProfile={() => onOpenProfile && onOpenProfile()}
              onOpenPasswordChange={() => onOpenPasswordChange && onOpenPasswordChange()}
              onOpenOrders={onOpenBuyerOrders}
              onOpenContact={() => onOpenContact && onOpenContact()}
              onLogout={onLogout}
              currentUser={currentUser}
              currentRole={currentView}
              onOpenAuth={() => onOpenAuth(currentView)}
            />

            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => (onGoHome ? onGoHome() : onViewChange('buyer'))}
              title="AgriDirect Home"
            >
              <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-800 to-teal-900 bg-clip-text text-transparent">
                    AgriDirect
                  </span>
                  <span className="hidden md:inline-block bg-gradient-to-r from-amber-400 to-orange-500 text-white uppercase text-[9px] tracking-wider font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                    Fixed Pricing
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800/80 font-medium hidden md:block leading-tight">
                  Direct Farm-to-Consumer Protocol
                </p>
              </div>
            </div>
          </div>

          {/* Center: Portal Mode Switcher */}
          <div className="flex items-center bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
            <button
              id="nav-switch-farmer"
              onClick={() => handleRoleClick('farmer')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                currentView === 'farmer'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-emerald-800 hover:bg-white/60'
              }`}
            >
              <Tractor className="w-4 h-4" />
              <span>Farmer Portal</span>
            </button>
            <button
              id="nav-switch-buyer"
              onClick={() => handleRoleClick('buyer')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                currentView === 'buyer'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30'
                  : 'text-slate-600 hover:text-amber-800 hover:bg-white/60'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Buyer Market</span>
            </button>
          </div>

          {/* Right Actions: User Account, Cart, Reset */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Buyer Cart Icon */}
            {currentView === 'buyer' && (
              <button
                id="open-cart-btn"
                onClick={onOpenCart}
                className="relative p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors shadow-xs"
                title="View Shopping Basket"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[11px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center shadow-md shadow-rose-500/40">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Buyer Orders History Button */}
            {currentView === 'buyer' && (
              <button
                id="open-buyer-orders-btn"
                onClick={onOpenBuyerOrders}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-900 border border-amber-200 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors shadow-xs"
                title="Track Orders & View Receipts"
              >
                <Package className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">Orders</span>
              </button>
            )}

            {/* User Session or Auth Trigger */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5 shadow-xs">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-xs ${
                  currentUser.role === 'farmer' 
                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white' 
                    : 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white'
                }`}>
                  {currentUser.role === 'farmer' ? <Tractor className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className="hidden lg:block text-left pr-1.5 max-w-[160px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 leading-none truncate">
                      {currentUser.fullName}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase shrink-0 ${
                      currentUser.role === 'farmer'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {currentUser.role}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono truncate block" title={currentUser.email}>
                    {currentUser.email || `@${currentUser.username}`}
                  </span>
                </div>
                <button
                  id="logout-btn"
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="open-auth-btn"
                onClick={() => onOpenAuth(currentView)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-md shadow-emerald-600/25 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                <span>Sign In with Gmail</span>
              </button>
            )}

            {/* Clear Data / Reset tool button */}
            <button
              id="reset-data-btn"
              onClick={onResetData}
              title="Reset all dynamic data & accounts (Start completely fresh with no IDs)"
              className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
