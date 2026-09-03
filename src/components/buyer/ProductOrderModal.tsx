import React, { useState, useEffect } from 'react';
import { ProduceItem, Account, Order } from '../../types';
import { placeOrder } from '../../services/storage';
import { getCategoryTheme } from './BuyerMarketplace';
import { usePreferences } from '../../context/PreferencesContext';
import {
  X,
  ShoppingBag,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  CheckCircle2,
  Tractor,
  Calendar,
  ArrowRight,
  AlertCircle,
  Truck,
  Sparkles,
  Package
} from 'lucide-react';

interface ProductOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  produceItem: ProduceItem | null;
  currentUser: Account | null;
  initialQuantity?: number;
  onOrderSuccess: (order: Order) => void;
  onOpenOrders: () => void;
}

export const ProductOrderModal: React.FC<ProductOrderModalProps> = ({
  isOpen,
  onClose,
  produceItem,
  currentUser,
  initialQuantity = 1,
  onOrderSuccess,
  onOpenOrders,
}) => {
  const { formatPrice, t } = usePreferences();
  const [quantity, setQuantity] = useState<number>(initialQuantity);
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerPhone, setBuyerPhone] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Sync state when modal opens or currentUser / produceItem changes
  useEffect(() => {
    if (isOpen) {
      setQuantity(Math.max(1, Math.min(produceItem ? produceItem.quantity : 1, initialQuantity)));
      setError(null);
      setPlacedOrder(null);
      setIsSubmitting(false);

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
  }, [isOpen, currentUser, produceItem, initialQuantity]);

  if (!isOpen || !produceItem) return null;

  const totalAmount = Number((produceItem.price * quantity).toFixed(2));
  const categoryTheme = getCategoryTheme(produceItem.category);

  const handleQuantityChange = (newQty: number) => {
    if (newQty < 1) return;
    if (newQty > produceItem.quantity) return;
    setQuantity(newQty);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = buyerName.trim();
    const cleanPhone = buyerPhone.trim();
    const cleanAddress = deliveryAddress.trim();

    if (!cleanName) {
      setError('Please enter your full name for the producer receipt.');
      return;
    }

    if (!cleanPhone) {
      setError('Please enter your contact phone number for delivery coordination.');
      return;
    }

    if (!cleanAddress) {
      setError('Please provide a complete delivery/shipping address.');
      return;
    }

    if (quantity > produceItem.quantity) {
      setError(`Only ${produceItem.quantity} ${produceItem.unit} currently available in stock.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const buyerInput = currentUser || {
        fullName: cleanName,
        phone: cleanPhone,
        location: cleanAddress,
        role: 'buyer' as const,
      };

      const result = placeOrder(
        buyerInput,
        [{ item: produceItem, quantity }],
        cleanAddress,
        cleanPhone,
        notes.trim() || undefined
      );

      if (!result.success || !result.ordersCreated || result.ordersCreated.length === 0) {
        setError(result.error || 'Failed to dispatch order. Please try again.');
        setIsSubmitting(false);
        return;
      }

      const createdOrder = result.ordersCreated[0];
      setPlacedOrder(createdOrder);
      setIsSubmitting(false);
      onOrderSuccess(createdOrder);
    } catch (err) {
      console.error('Checkout error:', err);
      setError('An unexpected error occurred while processing your order.');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPlacedOrder(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-100 block">
                Direct Producer Settlement
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                {placedOrder ? 'Order Confirmed!' : 'Product Order Page'}
              </h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {placedOrder ? (
            // Success Receipt View
            <div className="py-4 space-y-6 text-center animate-fadeIn">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                  Order Reference: #{placedOrder.id.slice(-6).toUpperCase()}
                </span>
                <h3 className="text-2xl font-black text-slate-900 pt-2">
                  Order Successfully Placed!
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Your order has been directly registered and dispatched to{' '}
                  <strong className="text-slate-900">{produceItem.farmerName}</strong> at{' '}
                  <strong className="text-slate-900">{produceItem.farmName}</strong>.
                </p>
              </div>

              {/* Order Receipt Summary Card */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-left text-xs space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                    Dispatched Item
                  </span>
                  <span className="font-bold text-slate-900">
                    {quantity} {produceItem.unit} × {produceItem.name}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span>Farmer Fixed Rate:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatPrice(produceItem.price)} / {produceItem.unit}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span>Delivery Destination:</span>
                  <span className="font-medium text-slate-900 text-right max-w-[200px] truncate">
                    {placedOrder.deliveryAddress}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span>Recipient:</span>
                  <span className="font-medium text-slate-900">
                    {placedOrder.buyerName} ({placedOrder.buyerPhone})
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-black text-slate-900 uppercase tracking-wider text-xs">
                    Total Settled to Farmer:
                  </span>
                  <span className="text-2xl font-black text-emerald-700">
                    {formatPrice(placedOrder.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Direct Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  id="view-in-my-orders-btn"
                  onClick={() => {
                    handleClose();
                    onOpenOrders();
                  }}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  <span>View in My Orders</span>
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Order More Produce
                </button>
              </div>
            </div>
          ) : (
            // Order Input Form
            <form onSubmit={handleSubmitOrder} className="space-y-5">
              {/* Product Spotlight Preview */}
              <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 items-center">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 shrink-0 relative">
                  {produceItem.imageUrl ? (
                    <img
                      src={produceItem.imageUrl}
                      alt={produceItem.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                      No Photo
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${categoryTheme.badge}`}>
                      {produceItem.category}
                    </span>
                    {produceItem.produceTag && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                        {produceItem.produceTag}
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base truncate mt-1">
                    {produceItem.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                    <Tractor className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{produceItem.farmName}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-emerald-700 font-mono">
                      {formatPrice(produceItem.price)}/{produceItem.unit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantity Stepper & Price Calculation */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-emerald-950 block">
                      Order Quantity ({produceItem.unit})
                    </label>
                    <span className="text-[11px] text-emerald-700 font-medium">
                      In Stock: {produceItem.quantity} {produceItem.unit} available
                    </span>
                  </div>

                  {/* Stepper Buttons */}
                  <div className="flex items-center border border-emerald-300 rounded-xl bg-white shadow-xs overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="w-10 h-10 text-slate-700 font-black text-base flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-700 transition-colors disabled:opacity-30"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={produceItem.quantity}
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) handleQuantityChange(val);
                      }}
                      className="w-14 h-10 text-center font-mono font-bold text-sm text-slate-900 focus:outline-none bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= produceItem.quantity}
                      className="w-10 h-10 text-slate-700 font-black text-base flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-700 transition-colors disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200 flex items-center justify-between text-xs">
                  <span className="text-emerald-900 font-bold uppercase tracking-wider">
                    Total Direct to Farmer:
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-950">
                      {formatPrice(totalAmount)}
                    </span>
                    <span className="text-[10px] text-emerald-700 block font-semibold">
                      Guaranteed fixed producer settlement
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Notice */}
              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-2.5 text-xs font-medium animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Delivery Destination Form */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 block">
                    Customer Delivery Information
                  </span>
                  {!currentUser && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      Instant Guest Checkout
                    </span>
                  )}
                </div>

                {/* Recipient Full Name */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="e.g. Eleanor Vance"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Contact Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 234-5678"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Complete Shipping Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="House/Apt, Street Address, City, State, ZIP"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Delivery Notes */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Gate code #421, leave cooler by side door"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="submit-product-order-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-800 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2.5 disabled:opacity-60"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                <span>
                  {isSubmitting ? 'Dispatching Order...' : `Confirm Direct Order (${formatPrice(totalAmount)})`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-center text-slate-400 font-medium">
                Direct agreement with {produceItem.farmName}. Guaranteed fixed pricing.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
