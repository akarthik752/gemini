import React, { useState } from 'react';
import { ProduceItem } from '../../types';
import { fixProducePrice } from '../../services/storage';
import { X, DollarSign, History, Check, AlertCircle } from 'lucide-react';

interface FixPriceModalProps {
  item: ProduceItem | null;
  farmerId: string;
  onClose: () => void;
  onPriceUpdated: (updatedItem: ProduceItem) => void;
}

export const FixPriceModal: React.FC<FixPriceModalProps> = ({
  item,
  farmerId,
  onClose,
  onPriceUpdated,
}) => {
  if (!item) return null;

  const [priceInput, setPriceInput] = useState(item.price.toString());
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFixPrice = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedPrice = parseFloat(priceInput);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Please enter a valid fixed price greater than $0.00');
      return;
    }

    setIsSubmitting(true);
    const result = fixProducePrice(
      item.id,
      Number(parsedPrice.toFixed(2)),
      farmerId,
      note.trim() || undefined
    );

    setIsSubmitting(false);

    if (!result.success || !result.item) {
      setError(result.error || 'Failed to update fixed price');
      return;
    }

    onPriceUpdated(result.item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Colorful Gradient Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs text-white flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-100 block">Pricing Control</span>
              <h3 className="text-xl font-black leading-tight text-white">
                Fix Produce Price
              </h3>
              <p className="text-xs text-amber-100 font-medium">
                {item.name} ({item.unit})
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

        {/* Body */}
        <form onSubmit={handleFixPrice} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Current Fixed Rate:</span>
            <span className="text-xl font-black text-slate-800">
              ${item.price.toFixed(2)} <span className="text-xs font-bold text-slate-500">/ {item.unit}</span>
            </span>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
              New Fixed Price per {item.unit} ($ USD) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-lg">$</span>
              <input
                id="new-fixed-price-input"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                placeholder="e.g. 3.50"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              This fixed rate will immediately update across all consumer live feeds.
            </p>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
              Price Revision Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Seasonal harvest adjustment, prime grade batch"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          {/* Price History Preview */}
          {item.priceHistory && item.priceHistory.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                <History className="w-3.5 h-3.5 text-amber-600" />
                <span>Price Revision Log</span>
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                {item.priceHistory.map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-700">
                    <span className="font-mono font-bold text-slate-900">${entry.price.toFixed(2)}</span>
                    <span className="text-slate-400 italic truncate max-w-[200px]">{entry.note || new Date(entry.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 bg-white text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              id="confirm-fix-price-btn"
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Rate</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
