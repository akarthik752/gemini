import React, { useState } from 'react';
import { CartItem, Account } from '../../types';
import { placeOrder } from '../../services/storage';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currentUser: Account | null;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onOpenAuth: () => void;
  onOrderSuccess: () => void;
  onOpenOrders: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  currentUser,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenAuth,
  onOrderSuccess,
  onOpenOrders,
}) => {
  const [buyerName, setBuyerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderSummaryText, setOrderSummaryText] = useState('');
  const [createdOrderRef, setCreatedOrderRef] = useState<string | null>(null);

  // Sync inputs when opened or when currentUser updates
  React.useEffect(() => {
    if (isOpen) {
      setError(null);
      if (currentUser) {
        setBuyerName(currentUser.fullName || '');
        setBuyerPhone(currentUser.phone || '');
        setDeliveryAddress(currentUser.location || '');
      } else {
        setBuyerName('');
        setBuyerPhone('');
        setDeliveryAddress('');
      }
      setNotes('');
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Calculate totals based on farmer's fixed prices
  const totalAmount = cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = buyerName.trim();
    const cleanAddress = deliveryAddress.trim();
    const cleanPhone = buyerPhone.trim();

    if (!cleanName) {
      setError('Please provide your full name.');
      return;
    }

    if (!cleanAddress) {
      setError('Please provide a complete shipping / delivery address.');
      return;
    }

    if (!cleanPhone) {
      setError('Please provide a contact phone number.');
      return;
    }

    const buyerInput = currentUser || {
      fullName: cleanName,
      phone: cleanPhone,
      location: cleanAddress,
      role: 'buyer' as const,
    };

    const result = placeOrder(
      buyerInput,
      cart,
      cleanAddress,
      cleanPhone,
      notes.trim() || undefined
    );

    if (!result.success) {
      setError(result.error || 'Failed to place order.');
      return;
    }

    const firstOrder = result.ordersCreated?.[0];
    setCreatedOrderRef(firstOrder ? firstOrder.id.slice(-6).toUpperCase() : null);
    setIsSuccess(true);
    setOrderSummaryText(`Order confirmed! Dispatched to ${result.ordersCreated?.length || 1} farm producer(s).`);
    onClearCart();
    onOrderSuccess();
  };

  const handleClose = () => {
    setIsSuccess(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={handleClose} 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          {/* Colorful Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs text-white flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-100 block">
                  Consumer Order Manifest
                </span>
                <h2 className="text-xl font-black text-white leading-tight">
                  Your Produce Basket
                </h2>
                <span className="text-xs text-emerald-100 font-medium">
                  {cart.length} item{cart.length === 1 ? '' : 's'} at fixed farmer settlement rates
                </span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          {isSuccess ? (
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              {createdOrderRef && (
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                  Order Ref: #{createdOrderRef}
                </span>
              )}
              <h3 className="text-2xl font-black text-slate-900">
                Order Confirmed!
              </h3>
              <p className="text-xs text-slate-600 max-w-xs leading-relaxed font-medium">
                {orderSummaryText} The farmers have received your dispatch manifest and will fulfill your delivery.
              </p>
              <div className="flex flex-col w-full gap-2.5 pt-4">
                <button
                  id="cart-view-my-orders-btn"
                  onClick={() => {
                    handleClose();
                    onOpenOrders();
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>View in My Orders</span>
                </button>
                <button
                  onClick={handleClose}
                  className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-800">Basket is currently empty</h3>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Explore the marketplace and select farm produce with transparent farmer-fixed prices.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-3">
                {cart.map(({ item, quantity }) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-emerald-200 transition-all flex gap-3 items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">
                          {item.name}
                        </h4>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 mt-0.5">
                          {item.farmName}
                        </div>
                        <div className="text-xs font-black text-slate-800 mt-1">
                          ${item.price.toFixed(2)} <span className="font-sans not-italic text-[10px] text-slate-500">/{item.unit}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-1 rounded-xl bg-white border border-slate-200 p-0.5 shadow-xs">
                        <button
                          onClick={() => onUpdateQuantity(item.id, quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs hover:bg-slate-200"
                        >
                          -
                        </button>
                        <span className="text-xs font-mono font-bold min-w-[24px] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                          disabled={quantity >= item.quantity}
                          className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs hover:bg-slate-200 disabled:opacity-30"
                        >
                          +
                        </button>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-black text-slate-900">
                        ${(item.price * quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Checkout Form */}
              <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                    Delivery Destination & Buyer
                  </span>
                  {!currentUser ? (
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      className="text-[10px] text-emerald-700 font-bold hover:underline"
                    >
                      Already have an ID? Sign in
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-700 font-bold">
                      Ordering as @{currentUser.username}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="e.g. John Miller"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                    Shipping Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="House/Apartment, Street, City"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                    Contact Phone <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                    Delivery Special Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Leave by front porch gate"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                {/* Subtotal Calculation */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span className="uppercase text-[10px] tracking-wider font-bold">Produce Subtotal:</span>
                    <span className="font-mono font-bold text-slate-900">${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="uppercase text-[10px] tracking-wider font-bold">Farmer Fixed Price:</span>
                    <span className="text-emerald-700 uppercase text-[10px] font-black tracking-wider bg-emerald-100 px-2 py-0.5 rounded-full">100% Guaranteed</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                    <span className="uppercase text-xs font-black tracking-wider text-slate-900">Total Payable:</span>
                    <span className="text-2xl font-black text-slate-900">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  id="place-order-btn"
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Order with Producer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
