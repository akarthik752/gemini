import React, { useState } from 'react';
import { Order, Account } from '../../types';
import { usePreferences } from '../../context/PreferencesContext';
import {
  X,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  Calendar,
  Phone,
  Search,
  Tractor,
  ExternalLink,
  Receipt
} from 'lucide-react';

interface BuyerOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  buyer: Account | null;
  orders: Order[];
}

export const BuyerOrdersModal: React.FC<BuyerOrdersModalProps> = ({
  isOpen,
  onClose,
  buyer,
  orders,
}) => {
  const { formatPrice, t } = usePreferences();
  const [filterQuery, setFilterQuery] = useState('');

  if (!isOpen) return null;

  // If user is logged in, filter their orders; otherwise display all recently placed consumer orders
  const baseOrders = buyer
    ? orders.filter(o => o.buyerId === buyer.id || (buyer.phone && o.buyerPhone === buyer.phone))
    : orders;

  const filteredOrders = baseOrders.filter(order => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(q) ||
      order.farmName.toLowerCase().includes(q) ||
      order.buyerName.toLowerCase().includes(q) ||
      order.items.some(i => i.itemName.toLowerCase().includes(q))
    );
  });

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pending Producer Dispatch</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-sky-100 text-sky-900 border border-sky-300">
            <CheckCircle2 className="w-3 h-3 text-sky-600" />
            <span>Confirmed by Farmer</span>
          </span>
        );
      case 'dispatched':
        return (
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-300">
            <Truck className="w-3 h-3 text-purple-600" />
            <span>Dispatched & In Transit</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Delivered & Settled</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="uppercase text-[10px] font-extrabold tracking-wider text-emerald-100 block">
                Direct Harvest Manifest
              </span>
              <h2 className="text-xl font-black text-white leading-tight">
                My Orders & Receipts
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                {buyer ? (
                  <>Buyer: <strong className="text-white">{buyer.fullName}</strong> (@{buyer.username})</>
                ) : (
                  <>Active Market Session ({baseOrders.length} order{baseOrders.length === 1 ? '' : 's'})</>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar if multiple orders */}
        {baseOrders.length > 2 && (
          <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Search orders by item name, reference or farm..."
                className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}

        {/* List */}
        <div className="p-6 overflow-y-auto space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Receipt className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Orders Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {filterQuery
                  ? 'No orders matched your search keyword.'
                  : 'You have not placed any orders yet. Select fresh produce from local farmers and confirm your direct order.'}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition-all shadow-xs space-y-3.5"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      #{order.id.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                      <Tractor className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{order.farmName}</span>
                    </div>
                  </div>

                  {getStatusBadge(order.status)}
                </div>

                {/* Items */}
                <div className="space-y-2 text-xs">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-slate-50/80 p-2.5 rounded-xl text-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="font-semibold text-slate-900">
                          {item.quantity} {item.unit} × {item.itemName}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        {formatPrice(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Delivery Information */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-xs text-slate-700 font-medium">
                        {order.deliveryAddress}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <span>Recipient: <strong className="text-slate-700">{order.buyerName}</strong></span>
                      <span>•</span>
                      <span>Phone: <strong className="text-slate-700">{order.buyerPhone}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0">
                    <span className="text-[10px] text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total:</span>
                      <span className="text-base font-black text-emerald-700">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
