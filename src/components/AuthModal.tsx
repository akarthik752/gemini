import React, { useState } from 'react';
import { UserRole, Account } from '../types';
import { 
  saveAccount, 
  authenticateAccount, 
  getAccounts,
  setActiveSession 
} from '../services/storage';
import { 
  X, 
  Tractor, 
  User, 
  MapPin, 
  Phone, 
  Sparkles, 
  AlertCircle,
  KeyRound,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: UserRole;
  onSuccess: (account: Account) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'farmer',
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('register');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [farmName, setFarmName] = useState('');

  if (!isOpen) return null;

  const registeredAccounts = getAccounts();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase() || (username.includes('@') ? username.trim().toLowerCase() : `${username.trim().toLowerCase()}@gmail.com`);

    if (!username.trim()) {
      setError('Please provide a unique ID / username.');
      return;
    }
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (role === 'farmer' && !farmName.trim()) {
      setError('Please provide your Farm or Orchard name.');
      return;
    }
    if (!location.trim()) {
      setError(role === 'farmer' ? 'Please provide your farm location.' : 'Please provide your delivery address/city.');
      return;
    }

    const result = saveAccount({
      role,
      email: cleanEmail,
      username: username.trim(),
      fullName: fullName.trim(),
      phone: phone.trim() || 'N/A',
      location: location.trim(),
      farmName: role === 'farmer' ? farmName.trim() : undefined,
    });

    if (!result.success || !result.account) {
      setError(result.error || 'Registration failed');
      return;
    }

    setActiveSession(result.account);
    onSuccess(result.account);
    onClose();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const identifier = (email || username).trim();
    if (!identifier) {
      setError('Please enter your registered Gmail address or user ID.');
      return;
    }

    const result = authenticateAccount(identifier, role);
    if (!result.success || !result.account) {
      setError(result.error || 'Login failed');
      return;
    }

    onSuccess(result.account);
    onClose();
  };

  const handleQuickSelectAccount = (account: Account) => {
    setActiveSession(account);
    onSuccess(account);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className={`px-6 pt-5 pb-5 text-white flex items-center justify-between shadow-md transition-all ${
          role === 'farmer' 
            ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700' 
            : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs text-white flex items-center justify-center">
              {role === 'farmer' ? <Tractor className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/80 block">Direct Access Portal</span>
              <h2 className="text-xl font-black text-white leading-tight">
                {activeTab === 'register' ? 'Register New Account' : 'Sign In with Identity'}
              </h2>
              <p className="text-xs text-white/80 font-medium">
                Zero pre-set records • Instant personal profile
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

        {/* Content scroll area */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Role selector buttons */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
              Select Operating Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="select-role-farmer"
                onClick={() => setRole('farmer')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                  role === 'farmer'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${role === 'farmer' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Tractor className="w-4 h-4" />
                </div>
                <span className="text-xs font-extrabold tracking-wide">Farmer / Producer</span>
                <span className={`text-[11px] ${role === 'farmer' ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                  Post items & fix rates
                </span>
              </button>

              <button
                type="button"
                id="select-role-buyer"
                onClick={() => setRole('buyer')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                  role === 'buyer'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-950 shadow-md ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${role === 'buyer' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <User className="w-4 h-4" />
                </div>
                <span className="text-xs font-extrabold tracking-wide">Buyer / Consumer</span>
                <span className={`text-[11px] ${role === 'buyer' ? 'text-indigo-700 font-medium' : 'text-slate-500'}`}>
                  Access fixed prices & order
                </span>
              </button>
            </div>
          </div>

          {/* Toggle between Register and Login */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              id="tab-register"
              onClick={() => { setActiveTab('register'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              id="tab-login"
              onClick={() => { setActiveTab('login'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Form */}
          {activeTab === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                  Google / Gmail Account <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="reg-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (!username && e.target.value.includes('@')) {
                        setUsername(e.target.value.split('@')[0].replace(/[^a-z0-9_]/g, '_'));
                      }
                    }}
                    placeholder={role === 'farmer' ? 'myfarm.organic@gmail.com' : 'buyer.shopper@gmail.com'}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Dedicated Gmail account for your {role === 'farmer' ? 'Farmer' : 'Buyer'} profile.
                </p>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                  Unique User ID / Handle <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-mono font-bold">@</span>
                  <input
                    id="reg-username-input"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={role === 'farmer' ? 'green_valley_farm' : 'sarah_consumer'}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                  Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="reg-fullname-input"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={role === 'farmer' ? 'Thomas Miller' : 'Emily Watson'}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {role === 'farmer' && (
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                    Farm / Estate Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="reg-farmname-input"
                    type="text"
                    required
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="e.g. Miller Valley Organic Farms"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                    {role === 'farmer' ? 'Farm Location' : 'Delivery Destination'} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      id="reg-location-input"
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder={role === 'farmer' ? 'Highland County' : 'Westbrook district'}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                    Phone Contact
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      id="reg-phone-input"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 019-2831"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <button
                id="submit-register-btn"
                type="submit"
                className={`w-full py-3.5 rounded-2xl text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 ${
                  role === 'farmer'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/30'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-600/30'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Authorize {role === 'farmer' ? 'Farmer' : 'Buyer'} Account</span>
              </button>
            </form>
          ) : (
            /* Sign In Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                  Enter Registered Gmail or User ID
                </label>
                <div className="relative">
                  <input
                    id="login-username-input"
                    type="text"
                    required
                    value={email || username}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setUsername(e.target.value);
                    }}
                    placeholder={role === 'farmer' ? 'myfarm.organic@gmail.com or @green_valley_farm' : 'buyer@gmail.com or @sarah_consumer'}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <button
                id="submit-login-btn"
                type="submit"
                className={`w-full py-3.5 rounded-2xl text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 ${
                  role === 'farmer'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/30'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-600/30'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>Authenticate as {role === 'farmer' ? 'Farmer' : 'Buyer'}</span>
              </button>
            </form>
          )}

          {/* Quick pick existing registered accounts if any exist on this device */}
          {registeredAccounts.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 block mb-2">
                Stored Credentials on Device ({registeredAccounts.length}):
              </span>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {registeredAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleQuickSelectAccount(acc)}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-left transition-all text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold text-white ${
                        acc.role === 'farmer' ? 'bg-emerald-600' : 'bg-indigo-600'
                      }`}>
                        {acc.role === 'farmer' ? 'F' : 'B'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 leading-tight">
                          {acc.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          @{acc.username} {acc.farmName ? `• ${acc.farmName}` : ''}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700">
                      Select
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
