import React from 'react';
import { UserRole, Account } from '../types';
import { usePreferences } from '../context/PreferencesContext';
import { 
  Tractor, 
  ShoppingBag, 
  Package, 
  Settings, 
  SlidersHorizontal
} from 'lucide-react';

interface MobileBottomNavProps {
  currentView: UserRole;
  onViewChange: (role: UserRole) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenOrders: () => void;
  onOpenSettings: () => void;
  currentUser: Account | null;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onViewChange,
  cartCount,
  onOpenCart,
  onOpenOrders,
  onOpenSettings,
  currentUser,
}) => {
  const { t } = usePreferences();

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 py-1.5 safe-area-pb"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* 1. Farmer Hub */}
        <button
          id="mobile-nav-farmer"
          onClick={() => onViewChange('farmer')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
            currentView === 'farmer'
              ? 'text-emerald-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${
            currentView === 'farmer' ? 'bg-emerald-100/80 scale-110 shadow-xs' : ''
          }`}>
            <Tractor className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-bold">
            {t('farmerPortal', 'Farmer')}
          </span>
          {currentView === 'farmer' && (
            <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-emerald-600" />
          )}
        </button>

        {/* 2. Buyer Marketplace */}
        <button
          id="mobile-nav-buyer"
          onClick={() => onViewChange('buyer')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
            currentView === 'buyer'
              ? 'text-amber-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${
            currentView === 'buyer' ? 'bg-amber-100/80 scale-110 shadow-xs' : ''
          }`}>
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-bold">
            {t('buyerMarketplace', 'Market')}
          </span>
          {currentView === 'buyer' && (
            <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-amber-600" />
          )}
        </button>

        {/* 3. Shopping Basket with Counter */}
        <button
          id="mobile-nav-cart"
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative text-slate-500 hover:text-emerald-700"
        >
          <div className="p-1 rounded-xl relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-black h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-bold">
            {t('basket', 'Basket')}
          </span>
        </button>

        {/* 4. Order Tracking & Receipts */}
        <button
          id="mobile-nav-orders"
          onClick={onOpenOrders}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all text-slate-500 hover:text-amber-700"
        >
          <div className="p-1 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-bold">
            {t('orders', 'Orders')}
          </span>
        </button>

        {/* 5. Settings / Profile */}
        <button
          id="mobile-nav-settings"
          onClick={onOpenSettings}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all text-slate-500 hover:text-slate-800"
        >
          <div className="p-1 rounded-xl">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-bold">
            {t('settings', 'Settings')}
          </span>
        </button>
      </div>
    </nav>
  );
};
