import React, { useState } from 'react';
import { UserRole, Account } from '../types';
import { 
  getAccounts, 
  loginWithGmail, 
  getRoleSession 
} from '../services/storage';
import { 
  X, 
  Tractor, 
  ShoppingBag, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck, 
  Plus, 
  RotateCcw
} from 'lucide-react';

interface RoleSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole: UserRole;
  currentRole: UserRole;
  currentUser: Account | null;
  onSwitchSuccess: (account: Account, targetRole: UserRole) => void;
}

export const RoleSwitchModal: React.FC<RoleSwitchModalProps> = ({
  isOpen,
  onClose,
  targetRole,
  currentRole,
  currentUser,
  onSwitchSuccess,
}) => {
  const [gmailInput, setGmailInput] = useState('');
  const [fullNameInput, setFullNameInput] = useState('');
  const [farmNameInput, setFarmNameInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const allAccounts = getAccounts();
  const savedTargetAccounts = allAccounts.filter(a => a.role === targetRole);
  const rememberedRoleSession = getRoleSession(targetRole);

  const targetRoleName = targetRole === 'farmer' ? 'Farmer / Producer' : 'Buyer / Consumer';
  const currentRoleName = currentRole === 'farmer' ? 'Farmer' : 'Buyer';

  const handleGmailSubmit = (emailToUse: string, optionalName?: string, optionalFarm?: string) => {
    setError(null);
    let finalEmail = emailToUse.trim().toLowerCase();

    if (!finalEmail) {
      setError('Please provide a Google / Gmail address to continue.');
      return;
    }

    if (!finalEmail.includes('@')) {
      finalEmail = `${finalEmail}@gmail.com`;
    }

    // Check if trying to use the EXACT same email as current opposite session
    if (currentUser && currentUser.email.toLowerCase() === finalEmail && currentUser.role !== targetRole) {
      setError(
        `"${finalEmail}" is already signed in as your ${currentRoleName} account. Please sign in with another Gmail account for your ${targetRoleName} profile.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const result = loginWithGmail(finalEmail, targetRole, {
        fullName: optionalName || fullNameInput,
        farmName: optionalFarm || farmNameInput,
      });

      if (!result.success || !result.account) {
        setError(result.error || 'Failed to authenticate Gmail account.');
        setIsSubmitting(false);
        return;
      }

      onSwitchSuccess(result.account, targetRole);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during Gmail authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAccountSelect = (account: Account) => {
    onSwitchSuccess(account, targetRole);
    onClose();
  };

  // Quick Demo / Suggested Google Accounts for fast 1-click test
  const demoAccounts = targetRole === 'farmer' ? [
    { email: 'farmer.greenvalley@gmail.com', name: 'Thomas Miller', farm: 'Miller Valley Organic Farms' },
    { email: 'highland.orchards@gmail.com', name: 'Marcus Lindqvist', farm: 'Highland Crest Orchards' },
  ] : [
    { email: 'karthik.ag752a.a@gmail.com', name: 'Karthik Buyer', farm: undefined },
    { email: 'sarah.freshfoods@gmail.com', name: 'Sarah Jenkins', farm: undefined },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className={`p-6 text-white shadow-md transition-colors ${
          targetRole === 'farmer'
            ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700'
            : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-xs">
                {targetRole === 'farmer' ? (
                  <Tractor className="w-6 h-6" />
                ) : (
                  <ShoppingBag className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="uppercase text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-white/25 text-white">
                    Google Identity Switch
                  </span>
                </div>
                <h2 className="text-xl font-black text-white leading-tight mt-1">
                  Switch to {targetRoleName}
                </h2>
                <p className="text-xs text-white/90 font-medium">
                  Separate Gmail authentication required for each portal
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors shrink-0"
              title="Cancel and remain on current portal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Informative Current Context Banner */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="text-slate-500 font-medium shrink-0">Current Portal:</span>
            {currentUser ? (
              <span className="font-bold text-slate-800 flex items-center gap-1.5 truncate">
                <span className={`w-2 h-2 rounded-full shrink-0 ${currentUser.role === 'farmer' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="truncate">{currentUser.fullName}</span>
                <span className="text-slate-500 font-mono text-[11px] truncate">({currentUser.email})</span>
              </span>
            ) : (
              <span className="text-slate-600 font-medium">Guest Visitor (Not Authenticated)</span>
            )}
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Role Separation
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Error Prompt */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {/* Quick 1-Click Saved Session if exists */}
          {rememberedRoleSession && (
            <div className="p-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Existing {targetRoleName} Gmail on this Device</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                  Ready to Switch
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="truncate">
                  <div className="text-sm font-bold text-slate-900 truncate">
                    {rememberedRoleSession.fullName}
                  </div>
                  <div className="text-xs text-emerald-700 font-mono truncate">
                    {rememberedRoleSession.email}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickAccountSelect(rememberedRoleSession)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* 1-Click Fast Google Sign-in Buttons */}
          <div className="space-y-2.5">
            <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Sign In with Google / Gmail for {targetRoleName}
            </span>

            {/* Google Authentication Tile */}
            <div className="grid grid-cols-1 gap-2">
              {demoAccounts.map((demoAcc) => (
                <button
                  key={demoAcc.email}
                  type="button"
                  onClick={() => handleGmailSubmit(demoAcc.email, demoAcc.name, demoAcc.farm)}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all text-left group shadow-xs"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 group-hover:scale-105 transition-transform shrink-0">
                      <Mail className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                        {demoAcc.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">
                        {demoAcc.email}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 group-hover:text-emerald-600 flex items-center gap-1 shrink-0">
                    <span>Use Gmail</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Or Enter Another Gmail
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Manual Gmail Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGmailSubmit(gmailInput);
            }}
            className="space-y-3.5"
          >
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                Google / Gmail Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  id="switch-modal-gmail-input"
                  type="email"
                  required
                  value={gmailInput}
                  onChange={(e) => setGmailInput(e.target.value)}
                  placeholder={targetRole === 'farmer' ? 'myfarm.harvest@gmail.com' : 'buyer.family@gmail.com'}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Enter your dedicated Gmail address for {targetRoleName} access.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                  Full Name (Optional)
                </label>
                <input
                  id="switch-modal-name-input"
                  type="text"
                  value={fullNameInput}
                  onChange={(e) => setFullNameInput(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {targetRole === 'farmer' && (
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                    Farm Name (Optional)
                  </label>
                  <input
                    id="switch-modal-farm-input"
                    type="text"
                    value={farmNameInput}
                    onChange={(e) => setFarmNameInput(e.target.value)}
                    placeholder="e.g. Valley Orchard"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                id="submit-gmail-switch-btn"
                type="submit"
                disabled={isSubmitting}
                className={`w-full sm:flex-1 py-3 px-4 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 ${
                  targetRole === 'farmer'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/30'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/30'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Log In with Gmail & Switch Portal</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Cancel & Stay on {currentRoleName}
              </button>
            </div>
          </form>

          {/* List of other registered accounts for this target role */}
          {savedTargetAccounts.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">
                Or pick an existing registered {targetRoleName} profile:
              </span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {savedTargetAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleQuickAccountSelect(acc)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-left transition-colors text-xs"
                  >
                    <div className="truncate">
                      <span className="font-bold text-slate-800 mr-2">{acc.fullName}</span>
                      <span className="text-slate-500 font-mono text-[11px]">{acc.email}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                      Switch
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
