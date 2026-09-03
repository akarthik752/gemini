import React, { useState } from 'react';
import { Account, ProduceItem, Order, OrderStatus } from '../../types';
import { 
  updateProduceQuantity, 
  deleteProduceItem, 
  updateOrderStatus 
} from '../../services/storage';
import { FixPriceModal } from './FixPriceModal';
import { AddProduceModal } from './AddProduceModal';
import { usePreferences } from '../../context/PreferencesContext';
import { 
  Tractor, 
  Plus, 
  DollarSign, 
  Package, 
  Clock, 
  Trash2, 
  TrendingUp, 
  MapPin, 
  CheckCircle2, 
  Truck, 
  ShoppingBag, 
  Edit3,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface FarmerDashboardProps {
  farmer: Account;
  produceItems: ProduceItem[];
  orders: Order[];
  onRefreshData: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  farmer,
  produceItems,
  orders,
  onRefreshData,
}) => {
  const { formatPrice, t, currency } = usePreferences();
  const [activeTab, setActiveTab] = useState<'produce' | 'orders'>('produce');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [itemToFixPrice, setItemToFixPrice] = useState<ProduceItem | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Filter items that belong to this farmer
  const myItems = produceItems.filter(item => item.farmerId === farmer.id);

  // Filter orders intended for this farmer
  const myOrders = orders.filter(order => order.farmerId === farmer.id);

  // Computed stats
  const totalStockUnits = myItems.reduce((sum, it) => sum + it.quantity, 0);
  const pendingOrdersCount = myOrders.filter(o => o.status === 'pending').length;
  const totalRevenue = myOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Filtered by search
  const displayedItems = myItems.filter(item => 
    item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    item.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleStockAdjust = (itemId: string, delta: number) => {
    updateProduceQuantity(itemId, delta, farmer.id);
    onRefreshData();
  };

  const handleDeleteItem = (itemId: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from your listings?`)) {
      deleteProduceItem(itemId, farmer.id);
      onRefreshData();
    }
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus, farmer.id);
    onRefreshData();
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Farmer Profile Hero Banner - Control Panel 01 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-5 sm:p-8 md:p-12 shadow-xl shadow-emerald-950/20 space-y-5 sm:space-y-6">
        {/* Ambient background glow */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-400/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 uppercase text-xs font-extrabold tracking-widest text-amber-300 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs border border-white/10">
              <Tractor className="w-3.5 h-3.5 text-amber-300" />
              Producer Management • Dynamic Farmer ID
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {farmer.farmName || `${farmer.fullName}'s Farm`}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-emerald-100 font-medium">
              <span className="bg-emerald-900/60 px-3 py-1 rounded-full text-white font-bold">
                Proprietor: {farmer.fullName} ({farmer.email || `@${farmer.username}`})
              </span>
              <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                <MapPin className="w-3.5 h-3.5 text-amber-300" />
                {farmer.location}
              </span>
              <span className="bg-white/10 px-3 py-1 rounded-full">Contact: {farmer.phone}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 relative z-10 w-full sm:w-auto">
            <button
              id="farmer-add-item-cta"
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto px-5 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-900 font-black uppercase text-xs tracking-wider rounded-2xl shadow-xl shadow-amber-500/30 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Produce & Fix Price</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vivid Colorful Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between opacity-90 mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider truncate">Active Produce</span>
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-100 shrink-0 ml-1" />
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-black truncate">
            {myItems.length}
          </div>
          <span className="text-[10px] sm:text-xs text-emerald-100 font-medium mt-1 sm:mt-2 block truncate">Live at your fixed prices</span>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between opacity-90 mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider truncate">Total Stock</span>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-100 shrink-0 ml-1" />
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-black truncate">
            {totalStockUnits}
          </div>
          <span className="text-[10px] sm:text-xs text-cyan-100 font-medium mt-1 sm:mt-2 block truncate">Available inventory units</span>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between opacity-90 mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider truncate">Orders Received</span>
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-amber-100 shrink-0 ml-1" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black truncate">
              {myOrders.length}
            </span>
            {pendingOrdersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-white text-orange-600 text-[10px] sm:text-xs font-black uppercase shrink-0">
                {pendingOrdersCount} new
              </span>
            )}
          </div>
          <span className="text-[10px] sm:text-xs text-amber-100 font-medium mt-1 sm:mt-2 block truncate">Direct from buyers</span>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-lg shadow-purple-600/20 flex flex-col justify-between">
          <div className="flex items-center justify-between opacity-90 mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider truncate">Total Revenue</span>
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-purple-100 shrink-0 ml-1" />
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-black truncate">
            {formatPrice(totalRevenue)}
          </div>
          <span className="text-[10px] sm:text-xs text-purple-100 font-medium mt-1 sm:mt-2 block truncate">At your fixed rates</span>
        </div>
      </div>

      {/* Tabs: Produce Listings vs Orders */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <button
              id="tab-farmer-produce"
              onClick={() => setActiveTab('produce')}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-xs ${
                activeTab === 'produce'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Active Listings & Fixed Rates</span>
              <span className="text-xs px-2 py-0.2 rounded-full bg-white/20 text-white font-mono">
                {myItems.length}
              </span>
            </button>

            <button
              id="tab-farmer-orders"
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-xs ${
                activeTab === 'orders'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Customer Orders</span>
              {pendingOrdersCount > 0 && (
                <span className="text-xs px-2 py-0.2 rounded-full bg-white text-orange-600 font-mono font-bold">
                  {pendingOrdersCount}
                </span>
              )}
            </button>
          </div>

          {activeTab === 'produce' && (
            <div className="w-full sm:w-auto">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search inventory items..."
                className="w-full sm:w-64 px-4 py-2 text-xs bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}
        </div>

        {/* Tab 1: Produce Inventory & Fixed Pricing Table/Cards */}
        {activeTab === 'produce' && (
          <div>
            {displayedItems.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-4">
                  <Tractor className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  No Produce Listed Yet
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Add your harvest crops, vegetables, grains, or dairy and set your fixed price. Any price you fix will be immediately synchronized across the buyer marketplace!
                </p>
                <button
                  id="empty-add-produce-btn"
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish First Produce Item</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 shadow-sm"
                  >
                    {/* Item Image & Tags */}
                    <div className="relative h-44 bg-slate-100 overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-serif text-3xl italic text-slate-300">
                          HARVEST
                        </div>
                      )}

                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-extrabold rounded-lg shadow-sm">
                          {item.category}
                        </span>
                        {item.produceTag && (
                          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-xs text-emerald-800 text-[10px] font-bold rounded-lg shadow-sm border border-emerald-100">
                            {item.produceTag}
                          </span>
                        )}
                      </div>

                      <div className="absolute top-3 right-3">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg shadow-sm ${
                          item.status === 'available'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : item.status === 'low_stock'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {item.status === 'available' ? 'In Stock' : item.status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 leading-snug group-hover:text-emerald-800 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* FIXED PRICE BLOCK & FIX PRICE BUTTON */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/50 border border-emerald-200 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                            Your Fixed Price
                          </span>
                          <div className="text-2xl font-black text-emerald-950">
                            {formatPrice(item.price)}
                            <span className="text-xs font-semibold text-emerald-700 ml-1">
                              /{item.unit}
                            </span>
                          </div>
                        </div>

                        <button
                          id={`fix-price-btn-${item.id}`}
                          onClick={() => setItemToFixPrice(item)}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white uppercase text-xs font-bold tracking-wider rounded-xl shadow-md shadow-amber-500/25 transition-all"
                          title="Change fixed price"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Fix Price</span>
                        </button>
                      </div>

                      {/* Stock Adjuster & Harvest Details */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-xs font-semibold text-slate-500">Inventory:</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleStockAdjust(item.id, -5)}
                              className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white text-slate-800 font-bold flex items-center justify-center text-xs transition-colors"
                              title="Decrease 5"
                            >
                              -
                            </button>
                            <span className="font-mono font-bold text-xs text-slate-900 min-w-[60px] text-center">
                              {item.quantity} {item.unit}
                            </span>
                            <button
                              onClick={() => handleStockAdjust(item.id, 5)}
                              className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white text-slate-800 font-bold flex items-center justify-center text-xs transition-colors"
                              title="Increase 5"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>Harvest: {item.harvestDate}</span>
                          <button
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            className="text-rose-600 hover:text-rose-800 transition-colors flex items-center gap-1 text-xs font-bold"
                            title="Remove listing"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Incoming Orders from Buyers */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {myOrders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  No Customer Orders Yet
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  When registered consumers order produce at your fixed prices, their orders and delivery specifications will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono font-bold text-slate-900">
                            ORDER #{order.id.slice(-6).toUpperCase()}
                          </span>
                          <span className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                            order.status === 'pending'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : order.status === 'confirmed'
                              ? 'bg-blue-100 text-blue-900 border-blue-300'
                              : order.status === 'dispatched'
                              ? 'bg-purple-100 text-purple-900 border-purple-300'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Placed: {new Date(order.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">Action:</span>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'confirmed')}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                          >
                            Accept Order
                          </button>
                        )}
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'dispatched')}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Mark Dispatched</span>
                          </button>
                        )}
                        {order.status === 'dispatched' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'delivered')}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Delivered</span>
                          </button>
                        )}
                        {order.status === 'delivered' && (
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                            <CheckCircle2 className="w-4 h-4" /> Fulfilled
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Customer & Delivery details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-xs uppercase font-bold text-slate-500 block">Customer:</span>
                        <span className="font-bold text-slate-900">{order.buyerName}</span>
                        <span className="text-slate-500 ml-1 font-mono">(@{order.buyerUsername})</span>
                        <div className="text-slate-600 mt-0.5">Phone: {order.buyerPhone}</div>
                      </div>
                      <div>
                        <span className="text-xs uppercase font-bold text-slate-500 block">Destination:</span>
                        <span className="text-slate-800 font-medium">{order.deliveryAddress}</span>
                        {order.notes && (
                          <div className="text-slate-500 italic mt-0.5">"{order.notes}"</div>
                        )}
                      </div>
                    </div>

                    {/* Order items with Farmer Fixed Price */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                        Ordered Produce (At Your Fixed Rates):
                      </span>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-0">
                          <span className="font-semibold text-slate-800">
                            {item.quantity} {item.unit} × {item.itemName}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400 text-xs">
                              @ {formatPrice(item.unitPrice)}/{item.unit}
                            </span>
                            <span className="font-bold text-sm text-slate-900">
                              {formatPrice(item.totalPrice)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex justify-between items-center text-sm font-bold border-t border-slate-200">
                      <span className="text-xs uppercase tracking-wider text-slate-600">Total Net Settlement:</span>
                      <span className="text-2xl font-black text-emerald-900">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Produce Modal */}
      <AddProduceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        farmer={farmer}
        onItemAdded={() => {
          onRefreshData();
          setIsAddModalOpen(false);
        }}
      />

      {/* Fix Price Modal */}
      <FixPriceModal
        item={itemToFixPrice}
        farmerId={farmer.id}
        onClose={() => setItemToFixPrice(null)}
        onPriceUpdated={() => {
          onRefreshData();
          setItemToFixPrice(null);
        }}
      />
    </div>
  );
};
