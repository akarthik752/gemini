import React, { useState } from 'react';
import { Account, ProduceItem } from '../../types';
import { addProduceItem } from '../../services/storage';
import { PRODUCE_TEMPLATES, UNITS, CATEGORIES, ProduceTemplate } from '../../utils/producePresets';
import { usePreferences } from '../../context/PreferencesContext';
import { SUPPORTED_COUNTRIES } from '../../utils/countries';
import { 
  X, 
  PlusCircle, 
  Sparkles, 
  AlertCircle, 
  DollarSign, 
  Package, 
  Calendar,
  Layers,
  Coins,
  Globe,
  Image as ImageIcon
} from 'lucide-react';

interface AddProduceModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmer: Account;
  onItemAdded: (item: ProduceItem) => void;
}

export const AddProduceModal: React.FC<AddProduceModalProps> = ({
  isOpen,
  onClose,
  farmer,
  onItemAdded,
}) => {
  if (!isOpen) return null;

  const { currency, formatPrice, convertPrice, t, selectedCountry } = usePreferences();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProduceItem['category']>('Vegetables');
  const [unit, setUnit] = useState<string>('kg');
  const initialCountryCode = farmer.countryCode || selectedCountry?.code || 'IN';
  const [originCountryCode, setOriginCountryCode] = useState<string>(initialCountryCode);
  const defaultInitialPrice = currency.decimals === 0
    ? Math.round(3.5 * currency.rate).toString()
    : (3.5 * currency.rate).toFixed(2);
  const [price, setPrice] = useState<string>(defaultInitialPrice);
  const [quantity, setQuantity] = useState<string>('100');
  const [harvestDate, setHarvestDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [produceTag, setProduceTag] = useState('100% Organic');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const applyTemplate = (template: ProduceTemplate) => {
    setName(template.name);
    setCategory(template.category);
    setUnit(template.unit);
    const convertedRate = template.defaultPrice * currency.rate;
    setPrice(currency.decimals === 0 ? Math.round(convertedRate).toString() : convertedRate.toFixed(2));
    setQuantity(template.defaultQuantity.toString());
    setDescription(template.description);
    setProduceTag(template.tag);
    setImageUrl(template.imageUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide the produce / item name.');
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError(`Fixed price must be a valid number greater than ${currency.symbol}0.`);
      return;
    }

    const parsedQty = parseFloat(quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setError('Available quantity must be greater than 0.');
      return;
    }

    // Default image fallback based on category if empty
    let finalImage = imageUrl.trim();
    if (!finalImage) {
      const match = PRODUCE_TEMPLATES.find(t => t.category === category);
      finalImage = match ? match.imageUrl : 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=600&q=80';
    }

    // Convert from active currency to normalized USD base rate
    const normalizedPriceUSD = Number((parsedPrice / currency.rate).toFixed(2));
    const chosenCountry = SUPPORTED_COUNTRIES.find(c => c.code === originCountryCode) || selectedCountry;
    const resolvedCountryName = chosenCountry?.name || farmer.country || 'Local Farm';
    const resolvedCountryCode = chosenCountry?.code || farmer.countryCode || 'US';
    const resolvedCountryFlag = chosenCountry?.flag || '🌾';

    const newItem = addProduceItem({
      farmerId: farmer.id,
      farmerUsername: farmer.username,
      farmerName: farmer.fullName,
      farmName: farmer.farmName || `${farmer.fullName}'s Farm`,
      farmerLocation: farmer.location,
      farmerPhone: farmer.phone,
      country: resolvedCountryName,
      countryCode: resolvedCountryCode,
      countryFlag: resolvedCountryFlag,
      name: name.trim(),
      category,
      unit,
      price: normalizedPriceUSD,
      quantity: Math.floor(parsedQty),
      harvestDate: harvestDate || new Date().toISOString().split('T')[0],
      description: description.trim() || 'Directly grown and harvested from our farm fields.',
      produceTag: produceTag.trim() || 'Farm Fresh',
      imageUrl: finalImage,
    });

    onItemAdded(newItem);
    onClose();
  };

  const parsedCurrentInput = parseFloat(price);
  const equivalentUSD = !isNaN(parsedCurrentInput) && parsedCurrentInput > 0
    ? (parsedCurrentInput / currency.rate).toFixed(2)
    : '0.00';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Colorful Gradient Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs text-white flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-100 block">
                Producer Protocol
              </span>
              <h3 className="text-xl font-black leading-tight text-white">
                Publish Produce Listing
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                Farm: <span className="font-bold text-white">{farmer.farmName || farmer.fullName}</span>
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Quick-fill Templates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Quick-Fill Produce Standards:
              </span>
              <span className="text-xs text-slate-400">Click to auto-populate</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {PRODUCE_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.name}
                  type="button"
                  onClick={() => applyTemplate(tmpl)}
                  className="shrink-0 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 transition-all flex items-center gap-2 shadow-xs"
                >
                  <span>{tmpl.name.split(' ')[0]}</span>
                  <span className="text-[11px] text-emerald-700 font-black font-mono">
                    {formatPrice(tmpl.defaultPrice)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Item Name */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
              Produce / Harvest Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="item-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fresh Roma Tomatoes, Organic Basmati Rice"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                Category
              </label>
              <div className="relative">
                <Layers className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white cursor-pointer"
                >
                  {CATEGORIES.filter(c => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                Settlement Unit
              </label>
              <div className="relative">
                <Package className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Farm Origin Country */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
              Produce Origin Country / Global Listing
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <select
                id="item-country-select"
                value={originCountryCode}
                onChange={(e) => setOriginCountryCode(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white cursor-pointer"
              >
                {SUPPORTED_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.code}) - {c.region}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              Produce listed here will be visible to all buyers and users worldwide.
            </p>
          </div>

          {/* FIXED PRICE & Available Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl border border-emerald-200">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-emerald-900 mb-1.5 flex items-center justify-between">
                <span>Farmer Fixed Price ({currency.symbol} {currency.code}) <span className="text-rose-500">*</span></span>
                <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.2 rounded-full font-black">
                  {currency.flag} Fixed Rate
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-emerald-800 font-mono font-black text-lg">
                  {currency.symbol}
                </span>
                <input
                  id="item-fixed-price-input"
                  type="number"
                  step={currency.decimals === 0 ? "1" : "0.01"}
                  min="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={currency.decimals === 0 ? "250" : "3.50"}
                  className="w-full pl-12 pr-14 py-2.5 bg-white border border-emerald-300 rounded-xl text-xl font-black text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <span className="absolute right-3.5 top-3 text-xs uppercase font-extrabold text-emerald-700">
                  /{unit}
                </span>
              </div>
              {currency.code !== 'USD' && (
                <div className="text-[11px] text-emerald-800 font-medium mt-1">
                  Settlement equivalent: ≈ ${equivalentUSD} USD
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                Available Stock Units <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="item-quantity-input"
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="100"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-3.5 top-3 text-xs uppercase font-bold text-slate-400">
                  {unit}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Total physical harvest ready for delivery.
              </p>
            </div>
          </div>

          {/* Harvest Date & Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                Harvest Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                Produce Badge / Highlight Tag
              </label>
              <input
                type="text"
                value={produceTag}
                onChange={(e) => setProduceTag(e.target.value)}
                placeholder="e.g. 100% Organic, Cold-Pressed, Heirloom"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
              Produce Photo URL (Optional)
            </label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
              Harvest Specifications & Crop Details
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail harvest conditions, taste profile, packaging standards..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-new-produce-btn"
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish Fixed Price Item</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
