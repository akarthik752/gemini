import React, { useState } from 'react';
import { ProduceItem, Account } from '../../types';
import { CATEGORIES } from '../../utils/producePresets';
import { usePreferences } from '../../context/PreferencesContext';
import { 
  Search, 
  ShoppingBag, 
  MapPin, 
  Calendar, 
  Tractor, 
  Check, 
  Sparkles, 
  ArrowRight,
  Layers,
  ArrowUpDown,
  Tag,
  ShieldCheck,
  Info,
  Globe
} from 'lucide-react';

interface BuyerMarketplaceProps {
  produceItems: ProduceItem[];
  currentUser: Account | null;
  onAddToCart: (item: ProduceItem, quantity: number) => void;
  onDirectOrder: (item: ProduceItem, quantity: number) => void;
  onOpenCart: () => void;
  onSwitchToFarmer: () => void;
  onOpenAuth: () => void;
}

export const getCategoryTheme = (category: string) => {
  switch (category) {
    case 'Vegetables':
      return {
        badge: 'bg-emerald-600 text-white',
        pillActive: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30',
        pillInactive: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
        border: 'border-emerald-200 hover:border-emerald-400',
        lightBg: 'bg-emerald-50/60',
        accentText: 'text-emerald-700',
      };
    case 'Fruits':
      return {
        badge: 'bg-rose-500 text-white',
        pillActive: 'bg-rose-500 text-white shadow-md shadow-rose-500/30',
        pillInactive: 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100',
        border: 'border-rose-200 hover:border-rose-400',
        lightBg: 'bg-rose-50/60',
        accentText: 'text-rose-700',
      };
    case 'Grains':
      return {
        badge: 'bg-amber-600 text-white',
        pillActive: 'bg-amber-600 text-white shadow-md shadow-amber-600/30',
        pillInactive: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
        border: 'border-amber-200 hover:border-amber-400',
        lightBg: 'bg-amber-50/60',
        accentText: 'text-amber-700',
      };
    case 'Dairy & Eggs':
      return {
        badge: 'bg-sky-600 text-white',
        pillActive: 'bg-sky-600 text-white shadow-md shadow-sky-600/30',
        pillInactive: 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100',
        border: 'border-sky-200 hover:border-sky-400',
        lightBg: 'bg-sky-50/60',
        accentText: 'text-sky-700',
      };
    case 'Herbs & Spices':
      return {
        badge: 'bg-orange-600 text-white',
        pillActive: 'bg-orange-600 text-white shadow-md shadow-orange-600/30',
        pillInactive: 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100',
        border: 'border-orange-200 hover:border-orange-400',
        lightBg: 'bg-orange-50/60',
        accentText: 'text-orange-700',
      };
    case 'Honey & Others':
      return {
        badge: 'bg-yellow-600 text-white',
        pillActive: 'bg-yellow-600 text-white shadow-md shadow-yellow-600/30',
        pillInactive: 'bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
        border: 'border-yellow-200 hover:border-yellow-400',
        lightBg: 'bg-yellow-50/60',
        accentText: 'text-yellow-700',
      };
    default:
      return {
        badge: 'bg-slate-800 text-white',
        pillActive: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30',
        pillInactive: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',
        border: 'border-slate-200 hover:border-slate-400',
        lightBg: 'bg-slate-50',
        accentText: 'text-emerald-700',
      };
  }
};

export const BuyerMarketplace: React.FC<BuyerMarketplaceProps> = ({
  produceItems,
  currentUser,
  onAddToCart,
  onDirectOrder,
  onOpenCart,
  onSwitchToFarmer,
  onOpenAuth,
}) => {
  const { 
    formatPrice, 
    t, 
    currency, 
    selectedCountry, 
    setSelectedCountryByCode, 
    countries 
  } = usePreferences();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [countryFilter, setCountryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'newest'>('newest');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<ProduceItem | null>(null);

  // Compute counts per country
  const countryCounts = React.useMemo(() => {
    const map: Record<string, number> = {};
    produceItems.forEach(item => {
      const code = item.countryCode || 'US';
      map[code] = (map[code] || 0) + 1;
    });
    return map;
  }, [produceItems]);

  // List of countries that actually have items, plus the user's selected country
  const availableCountries = React.useMemo(() => {
    return countries.filter(c => (countryCounts[c.code] || 0) > 0 || c.code === selectedCountry?.code);
  }, [countries, countryCounts, selectedCountry]);

  // Filter and sort items
  const filteredItems = produceItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.farmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.farmerLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.country && item.country.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    const matchesCountry = 
      countryFilter === 'ALL' ||
      item.countryCode === countryFilter ||
      (item.country && item.country.toLowerCase() === countryFilter.toLowerCase());

    return matchesSearch && matchesCategory && matchesCountry;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getQuantity = (itemId: string) => quantities[itemId] || 1;

  const setItemQuantity = (itemId: string, qty: number, max: number) => {
    const clamped = Math.max(1, Math.min(qty, max));
    setQuantities(prev => ({ ...prev, [itemId]: clamped }));
  };

  const handleAdd = (item: ProduceItem) => {
    const qty = getQuantity(item.id);
    onAddToCart(item, qty);
    setAddedAnimationId(item.id);
    setTimeout(() => {
      setAddedAnimationId(null);
    }, 1200);
  };

  const handleSelectCountryFilter = (code: string) => {
    setCountryFilter(code);
    if (code !== 'ALL') {
      setSelectedCountryByCode(code);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Consumer Hero Banner - Vibrant & Colorful */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 text-white p-5 sm:p-8 md:p-12 shadow-xl shadow-teal-900/10 space-y-5 sm:space-y-6">
        {/* Ambient background glow orbs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wide text-emerald-100 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Direct Harvest • 100% Farmer Fixed Rates</span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Fresh Local Harvest <span className="text-amber-300">Marketplace</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-emerald-50/90 leading-relaxed font-medium">
              Every item is posted directly by registered farmers with non-negotiable producer prices. Zero middlemen markups, zero hidden auction fees—100% of your payment is settled directly with growers.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 text-left md:text-right shrink-0 shadow-lg">
            <div className="text-xs uppercase font-bold tracking-wider text-emerald-200">Active Live Listings</div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mt-0.5">{produceItems.length} Products</div>
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-bold mt-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              Real-Time Syncing
            </div>
          </div>
        </div>

        {/* Market Status Bar with colorful accents */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-900 flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <p className="text-xs font-bold text-amber-200 uppercase tracking-wider">Fixed Pricing Guarantee</p>
              <p className="text-sm font-medium text-emerald-50">All prices set directly by the producing farmers. No bidding or surge fees.</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-emerald-900/40 px-3.5 py-1.5 rounded-full border border-emerald-400/30 text-xs font-semibold text-emerald-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Direct Farm-to-Consumer Protocol
          </div>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between pb-2">
          {/* Search bar */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              id="marketplace-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder', 'Search produce name, farm origin, or region...')}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs shadow-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-bold text-slate-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="newest">Fresh Harvest (Newest)</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Country-Based Availability Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 shadow-xs space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/60">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                  Country Availability & Sourcing
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {countryFilter === 'ALL' 
                    ? `Showing all ${filteredItems.length} international listings across all regions` 
                    : `Showing ${filteredItems.length} listings harvested in ${countries.find(c => c.code === countryFilter)?.flag} ${countries.find(c => c.code === countryFilter)?.name}`}
                </span>
              </div>
            </div>

            {countryFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => handleSelectCountryFilter('ALL')}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors self-start sm:self-auto flex items-center gap-1"
              >
                <span>Clear Filter (View All Countries)</span>
              </button>
            )}
          </div>

          {/* Quick Country Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
            <button
              type="button"
              id="filter-country-all"
              onClick={() => handleSelectCountryFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
                countryFilter === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <span>🌐 All Countries</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                countryFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {produceItems.length}
              </span>
            </button>

            {availableCountries.map((c) => {
              const count = countryCounts[c.code] || 0;
              const isSelected = countryFilter === c.code;
              return (
                <button
                  key={c.code}
                  id={`filter-country-${c.code.toLowerCase()}`}
                  type="button"
                  onClick={() => handleSelectCountryFilter(c.code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-700 shadow-md shadow-emerald-600/20'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="text-sm leading-none">{c.flag}</span>
                  <span>{c.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Colorful Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const theme = getCategoryTheme(cat);
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shrink-0 border ${
                  isSelected
                    ? theme.pillActive
                    : `${theme.pillInactive} bg-white`
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Produce Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-5 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/30">
            <Tractor className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold tracking-wider text-emerald-700 uppercase bg-emerald-50 px-3 py-1 rounded-full">
              Live Feed Status
            </span>
            <h3 className="text-2xl font-bold text-slate-800">
              {produceItems.length === 0 ? 'No Farmer Produce Listed Yet' : 'No Matching Produce Found'}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              {produceItems.length === 0
                ? 'Only produce published directly by registered farmers will appear here. No pre-loaded items exist. Once a farmer lists crops with their fixed prices, they will instantly appear live here for all users.'
                : `None of the ${produceItems.length} active farmer produce listings match your active filters.`}
            </p>
          </div>

          {produceItems.length === 0 ? (
            <button
              id="switch-to-farmer-cta"
              onClick={onSwitchToFarmer}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Tractor className="w-4 h-4" />
              <span>Switch to Farmer Portal to Publish Produce</span>
            </button>
          ) : (
            <button
              id="reset-filters-cta"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setCountryFilter('ALL');
              }}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Show All {produceItems.length} Farmer Listings</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const currentQty = getQuantity(item.id);
            const isOutOfStock = item.quantity <= 0;
            const isAdded = addedAnimationId === item.id;
            const categoryTheme = getCategoryTheme(item.category);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 shadow-sm"
              >
                <div>
                  {/* Image Container */}
                  <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-serif text-3xl text-slate-300 italic">
                        HARVEST
                      </div>
                    )}

                    {/* Vivid Category & Tag badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg shadow-sm ${categoryTheme.badge}`}>
                        {item.category}
                      </span>
                      {item.produceTag && (
                        <span className="px-2.5 py-1 bg-white/90 backdrop-blur-xs text-emerald-800 text-[11px] font-bold rounded-lg shadow-sm border border-emerald-100">
                          {item.produceTag}
                        </span>
                      )}
                    </div>

                    {/* Stock status badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg shadow-sm ${
                        isOutOfStock
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : item.quantity < 10
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {isOutOfStock ? 'Sold Out' : `${item.quantity} ${item.unit} available`}
                      </span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs uppercase font-extrabold tracking-wide text-emerald-700 flex items-center gap-1 truncate">
                          <Tractor className="w-3 h-3 shrink-0" />
                          <span className="truncate">{item.farmName}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md text-[11px] font-bold text-slate-700 shrink-0 border border-slate-200">
                          <span>{item.countryFlag || '🌐'}</span>
                          <span>{item.country || 'Global'}</span>
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 mt-1 leading-snug group-hover:text-emerald-800 transition-colors">
                        {item.name}
                      </h4>
                      <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{item.farmerLocation}</span>
                      </span>
                    </div>

                    {/* PROMINENT FIXED PRICE DISPLAY - Vibrant Emerald & Teal Style */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/40 border border-emerald-200/80 shadow-xs">
                      <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 mb-1">
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          {t('farmerFixedPrice', 'Farmer Fixed Price')}
                        </span>
                        <span className="text-[10px] bg-emerald-200/60 text-emerald-900 px-2 py-0.2 rounded-full uppercase tracking-wider font-extrabold">
                          Direct
                        </span>
                      </div>
                      <div className="text-2xl font-black text-emerald-950">
                        {formatPrice(item.price)}{' '}
                        <span className="text-xs uppercase font-bold text-emerald-700">
                          / {item.unit}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between text-xs font-medium text-slate-400 pt-1">
                      <span>Harvest: {item.harvestDate}</span>
                      <button
                        onClick={() => setSelectedItemForDetail(item)}
                        className="text-emerald-700 font-bold hover:text-emerald-900 cursor-pointer underline text-xs"
                      >
                        Specification
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Quantity + Order Actions */}
                <div className="p-5 pt-0 space-y-2">
                  <div className="flex items-center gap-2">
                    {/* Stepper */}
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden shadow-xs">
                      <button
                        onClick={() => setItemQuantity(item.id, currentQty - 1, item.quantity)}
                        disabled={isOutOfStock || currentQty <= 1}
                        className="w-8 h-9 text-slate-700 font-bold flex items-center justify-center text-sm hover:bg-white hover:text-emerald-700 transition-colors disabled:opacity-30"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-xs px-2 text-slate-900 min-w-[28px] text-center">
                        {currentQty}
                      </span>
                      <button
                        onClick={() => setItemQuantity(item.id, currentQty + 1, item.quantity)}
                        disabled={isOutOfStock || currentQty >= item.quantity}
                        className="w-8 h-9 text-slate-700 font-bold flex items-center justify-center text-sm hover:bg-white hover:text-emerald-700 transition-colors disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>

                    {/* Direct Order Now button (opens dedicated Product Order Page/Modal) */}
                    <button
                      id={`order-product-${item.id}`}
                      onClick={() => onDirectOrder(item, currentQty)}
                      disabled={isOutOfStock}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md ${
                        isOutOfStock
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                          : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-800 text-white shadow-emerald-600/25 hover:shadow-lg'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Order Product</span>
                    </button>

                    {/* Add to Basket button */}
                    <button
                      id={`add-to-cart-${item.id}`}
                      onClick={() => handleAdd(item)}
                      disabled={isOutOfStock}
                      title="Add to Basket"
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center shadow-xs ${
                        isOutOfStock
                          ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                          : isAdded
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300'
                      }`}
                    >
                      {isAdded ? <Check className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Produce Detail Modal */}
      {selectedItemForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="relative h-48 sm:h-56 bg-slate-100 overflow-hidden shrink-0">
              {selectedItemForDetail.imageUrl ? (
                <img
                  src={selectedItemForDetail.imageUrl}
                  alt={selectedItemForDetail.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-serif text-5xl text-slate-200 italic">
                  SPECIFICATION
                </div>
              )}
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setSelectedItemForDetail(null)}
                  className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-7 space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${getCategoryTheme(selectedItemForDetail.category).badge}`}>
                    {selectedItemForDetail.category}
                  </span>
                  {selectedItemForDetail.produceTag && (
                    <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg">
                      {selectedItemForDetail.produceTag}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mt-2">
                  {selectedItemForDetail.name}
                </h3>
              </div>

              {/* Price Callout */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider block">
                    {t('farmerFixedPrice', 'Producer Fixed Price')}
                  </span>
                  <div className="text-3xl font-black text-emerald-950">
                    {formatPrice(selectedItemForDetail.price)}{' '}
                    <span className="text-xs uppercase font-bold text-emerald-700">
                      / {selectedItemForDetail.unit}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase font-semibold text-slate-500 block">Available Units:</span>
                  <span className="text-lg font-bold text-slate-800">
                    {selectedItemForDetail.quantity} {selectedItemForDetail.unit}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-700 border-t border-slate-100 pt-4">
                <p className="font-bold text-slate-900 uppercase tracking-wider">Harvest Notes & Specification:</p>
                <p className="leading-relaxed">{selectedItemForDetail.description}</p>
              </div>

              {/* Farmer & Origin Info */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <Tractor className="w-4 h-4 text-emerald-700" />
                    <span>Farm Origin: {selectedItemForDetail.farmName}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 border border-slate-200 shadow-xs">
                    <span>{selectedItemForDetail.countryFlag || '🌐'}</span>
                    <span>{selectedItemForDetail.country || 'Global'}</span>
                  </span>
                </div>
                <div className="text-slate-600">
                  Grower: {selectedItemForDetail.farmerName} (@{selectedItemForDetail.farmerUsername})
                </div>
                <div className="text-slate-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Regional Location: {selectedItemForDetail.farmerLocation}, {selectedItemForDetail.country || 'Worldwide'}</span>
                </div>
                <div className="text-slate-600">
                  Harvest Date: {selectedItemForDetail.harvestDate}
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  id="detail-direct-order-btn"
                  onClick={() => {
                    onDirectOrder(selectedItemForDetail, getQuantity(selectedItemForDetail.id));
                    setSelectedItemForDetail(null);
                  }}
                  disabled={selectedItemForDetail.quantity <= 0}
                  className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-800 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Order Now ({formatPrice(selectedItemForDetail.price * getQuantity(selectedItemForDetail.id))})</span>
                </button>
                <button
                  onClick={() => {
                    handleAdd(selectedItemForDetail);
                    setSelectedItemForDetail(null);
                    onOpenCart();
                  }}
                  disabled={selectedItemForDetail.quantity <= 0}
                  className="py-3.5 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                >
                  <Layers className="w-4 h-4" />
                  <span>Add to Basket</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
