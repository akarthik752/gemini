import React, { useState, useEffect } from 'react';
import { Account, UserRole, ProduceItem, Order, CartItem } from './types';
import { 
  getActiveSession, 
  setActiveSession, 
  getProduceItems, 
  getOrders, 
  subscribeToSync, 
  resetStorage 
} from './services/storage';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { FarmerDashboard } from './components/farmer/FarmerDashboard';
import { BuyerMarketplace } from './components/buyer/BuyerMarketplace';
import { CartDrawer } from './components/buyer/CartDrawer';
import { BuyerOrdersModal } from './components/buyer/BuyerOrdersModal';
import { ProductOrderModal } from './components/buyer/ProductOrderModal';
import { RoleSwitchModal } from './components/RoleSwitchModal';
import { SettingsModal } from './components/SettingsModal';
import { ContactModal } from './components/ContactModal';
import { 
  Tractor, 
  ShoppingBag, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Info,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<UserRole>('buyer');
  const [currentUser, setCurrentUser] = useState<Account | null>(() => getActiveSession());
  const [produceItems, setProduceItems] = useState<ProduceItem[]>(() => getProduceItems());
  const [orders, setOrders] = useState<Order[]>(() => getOrders());
  const [cart, setCart] = useState<CartItem[]>([]);

  // Modals & Drawers
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authPreferredRole, setAuthPreferredRole] = useState<UserRole>('farmer');
  const [isRoleSwitchModalOpen, setIsRoleSwitchModalOpen] = useState(false);
  const [pendingTargetRole, setPendingTargetRole] = useState<UserRole>('farmer');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'profile' | 'password'>('profile');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isBuyerOrdersOpen, setIsBuyerOrdersOpen] = useState(false);
  const [isProductOrderOpen, setIsProductOrderOpen] = useState(false);
  const [orderModalProduceItem, setOrderModalProduceItem] = useState<ProduceItem | null>(null);
  const [orderModalInitialQuantity, setOrderModalInitialQuantity] = useState<number>(1);
  const [notification, setNotification] = useState<string | null>(null);

  const handleOpenProductOrder = (item: ProduceItem, quantity: number = 1) => {
    setOrderModalProduceItem(item);
    setOrderModalInitialQuantity(quantity);
    setIsProductOrderOpen(true);
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Reload data from storage
  const reloadData = () => {
    setProduceItems(getProduceItems());
    setOrders(getOrders());
    setCurrentUser(getActiveSession());
  };

  // Subscribe to live synchronization (cross-tab / cross-component)
  useEffect(() => {
    const unsubscribe = subscribeToSync((event) => {
      reloadData();
      if (event.type === 'produce_updated') {
        showNotification('Produce listings & fixed prices updated');
      } else if (event.type === 'orders_updated') {
        showNotification('Order status updated');
      }
    });

    return () => unsubscribe();
  }, []);

  // Cart operations
  const handleAddToCart = (item: ProduceItem, quantity: number) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(ci => ci.item.id === item.id);
      if (existingIdx !== -1) {
        const updated = [...prev];
        const newQty = Math.min(item.quantity, updated[existingIdx].quantity + quantity);
        updated[existingIdx] = { ...updated[existingIdx], quantity: newQty };
        return updated;
      } else {
        return [...prev, { item, quantity: Math.min(item.quantity, quantity) }];
      }
    });
  };

  const handleUpdateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(itemId);
      return;
    }
    setCart(prev =>
      prev.map(ci => (ci.item.id === itemId ? { ...ci, quantity } : ci))
    );
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCart(prev => prev.filter(ci => ci.item.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleLogout = () => {
    setActiveSession(null);
    setCurrentUser(null);
    showNotification('Logged out successfully');
  };

  const handleResetAllData = () => {
    if (
      window.confirm(
        'Are you sure you want to reset all data? This will clear all dynamically registered accounts, listings, and orders so you can start with a 100% clean slate with no pre-existing IDs.'
      )
    ) {
      resetStorage();
      setCart([]);
      reloadData();
      showNotification('All data cleared. No pre-set IDs remain.');
    }
  };

  const openAuthWithRole = (role?: UserRole) => {
    setAuthPreferredRole(role || currentView);
    setIsAuthModalOpen(true);
  };

  const handleRequestSwitchRole = (targetRole: UserRole) => {
    // If user is already on this view and already signed in with that role, no change needed
    if (currentView === targetRole && currentUser?.role === targetRole) {
      return;
    }

    // Require authenticating with another Gmail account for the target role
    setPendingTargetRole(targetRole);
    setIsRoleSwitchModalOpen(true);
  };

  const handleRoleSwitchSuccess = (account: Account, targetRole: UserRole) => {
    setCurrentUser(account);
    setCurrentView(targetRole);
    showNotification(`Authenticated as ${account.fullName} (${account.email}) on ${targetRole === 'farmer' ? 'Farmer' : 'Buyer'} portal`);
  };

  const totalCartCount = cart.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-amber-50/20 to-slate-50 text-slate-900 flex flex-col">
      {/* Vibrant Top Status & Index Bar */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500 text-white text-xs font-semibold py-2 px-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-pulse shadow-sm shadow-amber-300"></span>
            <span className="font-bold tracking-wide">AgriDirect Network</span>
            <span className="opacity-40">|</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-medium backdrop-blur-xs">
              Direct Farm-to-Consumer Protocol
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-200" />
              100% Farmer Fixed Rates
            </span>
            <span className="opacity-40">•</span>
            <span>Zero Middlemen Markups</span>
            <span className="opacity-40">•</span>
            <span className="bg-emerald-700/60 px-2 py-0.5 rounded-full text-emerald-100 font-mono">
              Live Sync Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <Navbar
        currentView={currentView}
        onViewChange={handleRequestSwitchRole}
        onRequestSwitchRole={handleRequestSwitchRole}
        currentUser={currentUser}
        onOpenAuth={openAuthWithRole}
        onLogout={handleLogout}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenBuyerOrders={() => setIsBuyerOrdersOpen(true)}
        onResetData={handleResetAllData}
        onGoHome={() => setCurrentView('buyer')}
        onOpenProfile={() => {
          setSettingsInitialTab('profile');
          setIsSettingsModalOpen(true);
        }}
        onOpenPasswordChange={() => {
          setSettingsInitialTab('password');
          setIsSettingsModalOpen(true);
        }}
        onOpenContact={() => setIsContactModalOpen(true)}
      />

      {/* Real-time sync notification toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-5 py-3.5 rounded-2xl shadow-xl shadow-emerald-700/20 border border-emerald-400 flex items-center gap-3 text-xs font-bold animate-fadeIn">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-ping"></span>
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Body View */}
      <main className="flex-1 pb-16">
        {currentView === 'farmer' ? (
          // FARMER VIEW
          currentUser && currentUser.role === 'farmer' ? (
            <FarmerDashboard
              farmer={currentUser}
              produceItems={produceItems}
              orders={orders}
              onRefreshData={reloadData}
            />
          ) : (
            // Farmer Portal Guest or Role Mismatch Screen
            <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8 animate-fadeIn">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/30 flex items-center justify-center mx-auto">
                <Tractor className="w-10 h-10" />
              </div>

              <div className="space-y-3">
                <span className="inline-block uppercase text-xs font-bold tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  Producer Portal • Farmer Access
                </span>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
                  Welcome to the <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Farmer Hub</span>
                </h1>
                <p className="text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
                  {currentUser && currentUser.role === 'buyer' ? (
                    <>
                      You are currently signed in as a Buyer (<span className="font-semibold text-amber-700">{currentUser.fullName} • {currentUser.email}</span>). To manage crops and fix prices, authenticate with a Farmer Google / Gmail account.
                    </>
                  ) : (
                    <>
                      Sign in with your dedicated Farmer Google / Gmail account to list fresh crops, fix your pricing, and receive direct consumer orders.
                    </>
                  )}
                </p>
              </div>

              {/* Information Card */}
              <div className="bg-white rounded-2xl border border-emerald-100 p-8 shadow-xl shadow-emerald-100/50 text-left max-w-md mx-auto space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-600">Farmer Protocol Privileges</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">100% Direct</span>
                </div>
                <ul className="text-xs text-slate-700 space-y-3 font-medium">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold">✓</span>
                    <span>Direct produce item registration (Vegetables, Fruits, Grains, Dairy, Honey)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold">✓</span>
                    <span><strong>Fixed Price Setting:</strong> Producers hold 100% price control</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold">✓</span>
                    <span>Real-time price revisions broadcast immediately to consumer catalog</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold">✓</span>
                    <span>Direct order dispatching and settlement tracking</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button
                  id="portal-register-farmer-btn"
                  onClick={() => handleRequestSwitchRole('farmer')}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                >
                  <Tractor className="w-5 h-5" />
                  <span>Log In with Farmer Gmail</span>
                </button>
                <button
                  onClick={() => handleRequestSwitchRole('buyer')}
                  className="w-full sm:w-auto px-8 py-4 bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 text-sm font-bold rounded-2xl shadow-sm transition-all"
                >
                  Browse Buyer Marketplace
                </button>
              </div>
            </div>
          )
        ) : (
          // BUYER VIEW
          <BuyerMarketplace
            produceItems={produceItems}
            currentUser={currentUser}
            onAddToCart={handleAddToCart}
            onDirectOrder={handleOpenProductOrder}
            onOpenCart={() => setIsCartOpen(true)}
            onSwitchToFarmer={() => handleRequestSwitchRole('farmer')}
            onOpenAuth={() => openAuthWithRole('buyer')}
          />
        )}
      </main>

      {/* Vibrant Colorful Footer */}
      <footer className="border-t border-emerald-100 bg-white px-6 py-6 text-xs text-slate-600 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-sm">
              🌾
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm">AgriDirect Market</span>
              <span className="text-slate-400 mx-2">|</span>
              <span className="text-emerald-700 font-semibold">Direct Farm-to-Consumer Protocol</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="bg-emerald-50 text-emerald-800 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
              100% Farmer Fixed Prices
            </span>
            <span className="bg-amber-50 text-amber-800 font-semibold px-2.5 py-1 rounded-full border border-amber-200">
              Zero Bidding • Zero Hidden Fees
            </span>
            <span className="text-slate-400">© 2024 AgriDirect Global</span>
          </div>
        </div>
      </footer>

      {/* Modals and Drawers */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialRole={authPreferredRole}
        onSuccess={(account) => {
          setCurrentUser(account);
          setCurrentView(account.role);
          showNotification(`Signed in as ${account.fullName} (@${account.username})`);
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        currentUser={currentUser}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onOpenAuth={() => openAuthWithRole('buyer')}
        onOrderSuccess={() => {
          reloadData();
          showNotification('Order submitted to farmers!');
        }}
        onOpenOrders={() => setIsBuyerOrdersOpen(true)}
      />

      <BuyerOrdersModal
        isOpen={isBuyerOrdersOpen}
        onClose={() => setIsBuyerOrdersOpen(false)}
        buyer={currentUser}
        orders={orders}
      />

      <ProductOrderModal
        isOpen={isProductOrderOpen}
        onClose={() => setIsProductOrderOpen(false)}
        produceItem={orderModalProduceItem}
        currentUser={currentUser}
        initialQuantity={orderModalInitialQuantity}
        onOrderSuccess={(newOrder) => {
          reloadData();
          showNotification(`Order #${newOrder.id.slice(-6).toUpperCase()} placed with ${newOrder.farmName}!`);
        }}
        onOpenOrders={() => setIsBuyerOrdersOpen(true)}
      />

      <RoleSwitchModal
        isOpen={isRoleSwitchModalOpen}
        onClose={() => setIsRoleSwitchModalOpen(false)}
        targetRole={pendingTargetRole}
        currentRole={currentView}
        currentUser={currentUser}
        onSwitchSuccess={handleRoleSwitchSuccess}
      />

      {/* Settings Modal (Profile Details & Password Change) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentUser={currentUser}
        initialTab={settingsInitialTab}
        onUserUpdated={(updatedAccount) => {
          setCurrentUser(updatedAccount);
          reloadData();
          showNotification('Profile and account details saved successfully!');
        }}
        onOpenAuth={() => openAuthWithRole(currentView)}
      />

      {/* Contact & Support Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        userEmail={currentUser?.email}
      />
    </div>
  );
}
