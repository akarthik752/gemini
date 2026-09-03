import React, { useState, useMemo } from 'react';
import { Account, UserRole } from '../types';
import { 
  X, 
  User, 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  Tractor, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Globe,
  Coins,
  Search,
  Check,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { updateAccount, changeAccountPassword } from '../services/storage';
import { usePreferences } from '../context/PreferencesContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Account | null;
  initialTab?: 'profile' | 'password' | 'language' | 'currency' | 'country';
  onUserUpdated: (account: Account) => void;
  onOpenAuth: (role?: UserRole) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialTab = 'profile',
  onUserUpdated,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'language' | 'currency' | 'country'>(initialTab);
  const {
    currency,
    language,
    selectedCountry,
    setSelectedCountryByCode,
    countries,
    setCurrencyByCode,
    setLanguageByCode,
    formatPrice,
    currencies,
    languages,
    t
  } = usePreferences();

  // Search queries for Language, Currency, and Country
  const [langSearch, setLangSearch] = useState('');
  const [currSearch, setCurrSearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');

  // Profile Form States
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [farmName, setFarmName] = useState(currentUser?.farmName || '');
  
  // Password Change States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status Feedback
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if currentUser changes or modal opens
  React.useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName);
      setEmail(currentUser.email);
      setPhone(currentUser.phone);
      setLocation(currentUser.location);
      setFarmName(currentUser.farmName || '');
    }
    setActiveTab(initialTab);
    setSuccessMsg(null);
    setErrorMsg(null);
    setLangSearch('');
    setCurrSearch('');
  }, [currentUser, initialTab, isOpen]);

  // Filtered languages
  const filteredLanguages = useMemo(() => {
    const q = langSearch.trim().toLowerCase();
    if (!q) return languages;
    return languages.filter(
      l => l.name.toLowerCase().includes(q) ||
           l.nativeName.toLowerCase().includes(q) ||
           l.code.toLowerCase().includes(q)
    );
  }, [languages, langSearch]);

  // Filtered currencies
  const filteredCurrencies = useMemo(() => {
    const q = currSearch.trim().toLowerCase();
    if (!q) return currencies;
    return currencies.filter(
      c => c.name.toLowerCase().includes(q) ||
           c.code.toLowerCase().includes(q) ||
           c.symbol.toLowerCase().includes(q)
    );
  }, [currencies, currSearch]);

  // Filtered countries
  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      c => c.name.toLowerCase().includes(q) ||
           (c.nativeName && c.nativeName.toLowerCase().includes(q)) ||
           c.code.toLowerCase().includes(q) ||
           c.region.toLowerCase().includes(q) ||
           c.defaultCurrencyCode.toLowerCase().includes(q)
    );
  }, [countries, countrySearch]);

  if (!isOpen) return null;

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid Gmail / Email address.');
      return;
    }

    setIsSubmitting(true);
    const result = updateAccount(currentUser.id, {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || 'N/A',
      location: location.trim() || 'Direct Metro Hub',
      farmName: currentUser.role === 'farmer' ? farmName.trim() : undefined,
    });

    setIsSubmitting(false);

    if (!result.success || !result.account) {
      setErrorMsg(result.error || 'Failed to update profile');
      return;
    }

    onUserUpdated(result.account);
    setSuccessMsg('Profile information successfully saved and synchronized!');
    setTimeout(() => {
      setSuccessMsg(null);
    }, 4000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    setIsSubmitting(true);
    const result = changeAccountPassword(currentUser.id, newPassword, currentPassword);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMsg(result.error || 'Failed to update password');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSuccessMsg('Password updated successfully! Your account credentials are secured.');
    setTimeout(() => {
      setSuccessMsg(null);
    }, 4000);
  };

  const handleSelectLanguage = (code: string) => {
    setLanguageByCode(code);
    const selected = languages.find(l => l.code === code);
    setSuccessMsg(`Language updated to ${selected?.flag} ${selected?.nativeName} (${selected?.name})!`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSelectCurrency = (code: string) => {
    setCurrencyByCode(code);
    const selected = currencies.find(c => c.code === code);
    setSuccessMsg(`Pricing currency updated to ${selected?.flag} ${selected?.name} (${selected?.symbol} ${selected?.code})! All product prices and orders are recalculated.`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleSelectCountry = (code: string) => {
    setSelectedCountryByCode(code);
    const selected = countries.find(c => c.code === code);
    setSuccessMsg(`Country updated to ${selected?.flag} ${selected?.name}! Local harvest and regional produce availability is synchronized.`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
              {activeTab === 'profile' && <User className="w-6 h-6" />}
              {activeTab === 'password' && <Lock className="w-6 h-6" />}
              {activeTab === 'language' && <Globe className="w-6 h-6" />}
              {activeTab === 'currency' && <Coins className="w-6 h-6" />}
              {activeTab === 'country' && <MapPin className="w-6 h-6" />}
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200">
                AgriDirect Global Settings
              </span>
              <h2 className="text-xl font-black text-white leading-tight">
                {activeTab === 'profile' && 'Profile Management'}
                {activeTab === 'password' && 'Change Password'}
                {activeTab === 'language' && 'Language Selection'}
                {activeTab === 'currency' && 'Currency & Price Change'}
                {activeTab === 'country' && 'Country & Regional Availability'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
            title="Close Settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher - 5 Tabs: Profile, Password, Language, Currency, Country */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 pt-3 gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            id="tab-btn-profile"
            onClick={() => {
              setActiveTab('profile');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`pb-3 px-3 sm:px-4 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === 'profile'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>

          <button
            type="button"
            id="tab-btn-password"
            onClick={() => {
              setActiveTab('password');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`pb-3 px-3 sm:px-4 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === 'password'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Password</span>
          </button>

          <button
            type="button"
            id="tab-btn-language"
            onClick={() => {
              setActiveTab('language');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`pb-3 px-3 sm:px-4 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === 'language'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>Language</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {language.flag} {language.name}
            </span>
          </button>

          <button
            type="button"
            id="tab-btn-currency"
            onClick={() => {
              setActiveTab('currency');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`pb-3 px-3 sm:px-4 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === 'currency'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-amber-600" />
            <span>Currency</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {currency.symbol} {currency.code}
            </span>
          </button>

          <button
            type="button"
            id="tab-btn-country"
            onClick={() => {
              setActiveTab('country');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`pb-3 px-3 sm:px-4 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === 'country'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-rose-600" />
            <span>Country</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
              {selectedCountry?.flag} {selectedCountry?.code}
            </span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Notifications */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="font-medium">{errorMsg}</div>
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="font-medium">{successMsg}</div>
            </div>
          )}

          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            !currentUser ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Sign In Required</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                    You must be signed in with a Gmail or custom account to edit profile details.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  Sign In Now
                </button>
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Account Handle</span>
                    <div className="text-xs font-mono font-bold text-slate-800">@{currentUser.username}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Role Portal</span>
                    <div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        currentUser.role === 'farmer' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {currentUser.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      id="settings-fullname-input"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Maria Gonzalez"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                    Verified Gmail / Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      id="settings-email-input"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. maria@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        id="settings-phone-input"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +1 (555) 345-6789"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                      Location / Region
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        id="settings-location-input"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Green Valley, Salinas"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {currentUser.role === 'farmer' && (
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-emerald-800 mb-1.5">
                      Farm / Producer Business Name
                    </label>
                    <div className="relative">
                      <Tractor className="w-4 h-4 absolute left-3.5 top-3 text-emerald-600" />
                      <input
                        id="settings-farmname-input"
                        type="text"
                        value={farmName}
                        onChange={(e) => setFarmName(e.target.value)}
                        placeholder="e.g. Green Valley Organic Fields"
                        className="w-full pl-10 pr-4 py-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSubmitting ? 'Saving...' : 'Save Profile'}</span>
                  </button>
                </div>
              </form>
            )
          )}

          {/* TAB 2: PASSWORD CHANGE */}
          {activeTab === 'password' && (
            !currentUser ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                  <KeyRound className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Sign In Required</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                    Sign in with your account to update your password credentials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  Sign In Now
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Account Security Standard</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Enter a new strong password (minimum 6 characters) to protect your farmer crop listings or direct purchase history.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                    Current Password (Optional if initial login)
                  </label>
                  <input
                    id="settings-current-pwd-input"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="settings-new-pwd-input"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="settings-confirm-pwd-input"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{isSubmitting ? 'Updating...' : 'Update Password'}</span>
                  </button>
                </div>
              </form>
            )
          )}

          {/* TAB 3: LANGUAGE CHANGE (ALL LANGUAGES) */}
          {activeTab === 'language' && (
            <div className="space-y-4">
              {/* Active language card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{language.flag}</span>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800">
                      Currently Active Language
                    </span>
                    <div className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>{language.nativeName}</span>
                      <span className="text-xs font-medium text-slate-500 font-sans">({language.name})</span>
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-xs font-bold uppercase tracking-wider">
                  Active
                </span>
              </div>

              {/* Language Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  id="settings-language-search-input"
                  type="text"
                  value={langSearch}
                  onChange={(e) => setLangSearch(e.target.value)}
                  placeholder="Search 30+ languages (e.g. Hindi, Spanish, Français, বাংলা, Deutsch)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
                {langSearch && (
                  <button
                    onClick={() => setLangSearch('')}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Language grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {filteredLanguages.map((l) => {
                  const isSelected = l.code === language.code;
                  return (
                    <button
                      key={l.code}
                      id={`lang-option-${l.code}`}
                      type="button"
                      onClick={() => handleSelectLanguage(l.code)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/90 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-xl shrink-0">{l.flag}</span>
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {l.nativeName}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {l.name}
                          </div>
                        </div>
                      </div>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                          {l.code}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {filteredLanguages.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No languages matching "{langSearch}". Try searching by English or native script name.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CURRENCY & PRICE CHANGE (RUPEES, EURO, ALL CURRENCIES) */}
          {activeTab === 'currency' && (
            <div className="space-y-4">
              {/* Active currency banner & Live conversion preview */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{currency.flag}</span>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
                        Active Price & Currency Format
                      </span>
                      <div className="text-base font-black text-slate-900 flex items-center gap-2">
                        <span>{currency.name}</span>
                        <span className="text-xs font-mono font-black px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-950">
                          {currency.symbol} ({currency.code})
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-600 text-white text-xs font-bold uppercase tracking-wider">
                    Applied
                  </span>
                </div>

                {/* Sample price calculation preview */}
                <div className="p-3 bg-white/90 backdrop-blur-xs rounded-xl border border-amber-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-slate-600 font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Live Exchange Rate: <strong>1 USD = {currency.rate} {currency.code}</strong></span>
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400 line-through">$10.00 USD</span>
                    <ArrowRight className="w-3 h-3 text-amber-600" />
                    <span className="font-bold text-emerald-800 text-sm">{formatPrice(10)}</span>
                  </div>
                </div>
              </div>

              {/* Quick Popular Currencies Chips */}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Popular Agricultural Currencies:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { code: 'INR', label: 'Rupees (₹ INR)', flag: '🇮🇳' },
                    { code: 'EUR', label: 'Euro (€ EUR)', flag: '🇪🇺' },
                    { code: 'USD', label: 'US Dollar ($ USD)', flag: '🇺🇸' },
                    { code: 'GBP', label: 'British Pound (£ GBP)', flag: '🇬🇧' },
                    { code: 'AED', label: 'UAE Dirham (AED)', flag: '🇦🇪' },
                    { code: 'JPY', label: 'Yen (¥ JPY)', flag: '🇯🇵' },
                    { code: 'SAR', label: 'Saudi Riyal (SAR)', flag: '🇸🇦' },
                    { code: 'CAD', label: 'Canadian (C$ CAD)', flag: '🇨🇦' },
                    { code: 'AUD', label: 'Australian (A$ AUD)', flag: '🇦🇺' },
                  ].map((p) => {
                    const isSelected = currency.code === p.code;
                    return (
                      <button
                        key={p.code}
                        type="button"
                        onClick={() => handleSelectCurrency(p.code)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span>{p.flag}</span>
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Currency Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  id="settings-currency-search-input"
                  type="text"
                  value={currSearch}
                  onChange={(e) => setCurrSearch(e.target.value)}
                  placeholder="Search 33+ currencies by name or symbol (e.g. Rupees, Euro, Dollar, INR, EUR, £, ¥)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
                {currSearch && (
                  <button
                    onClick={() => setCurrSearch('')}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* All Currencies Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {filteredCurrencies.map((c) => {
                  const isSelected = c.code === currency.code;
                  return (
                    <button
                      key={c.code}
                      id={`curr-option-${c.code}`}
                      type="button"
                      onClick={() => handleSelectCurrency(c.code)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50/90 text-amber-950 ring-2 ring-amber-500/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-xl shrink-0">{c.flag}</span>
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1 truncate">
                            <span>{c.code}</span>
                            <span className="text-amber-700 font-mono font-black">({c.symbol})</span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {c.name}
                          </div>
                        </div>
                      </div>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">
                          x{c.rate}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {filteredCurrencies.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No currency found matching "{currSearch}". Try searching "Rupees", "Euro", "USD", or currency symbols.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: COUNTRY & REGIONAL AVAILABILITY */}
          {activeTab === 'country' && (
            <div className="space-y-4">
              {/* Active Country Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 border border-rose-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedCountry?.flag || '🌐'}</span>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800">
                        Active Sourcing Country & Region
                      </span>
                      <div className="text-base font-black text-slate-900 flex items-center gap-2">
                        <span>{selectedCountry?.name || 'Global'}</span>
                        <span className="text-xs font-mono font-black px-2 py-0.5 rounded-md bg-rose-200/80 text-rose-950">
                          {selectedCountry?.code} • {selectedCountry?.region}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-xs font-bold uppercase tracking-wider">
                    Active Region
                  </span>
                </div>

                <div className="p-3 bg-white/90 backdrop-blur-xs rounded-xl border border-rose-200/80 text-xs text-slate-600 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>
                    Setting your country customizes local harvest availability and regional produce shipping estimates across the Direct Farm-to-Consumer protocol.
                  </span>
                </div>
              </div>

              {/* Country Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  id="settings-country-search-input"
                  type="text"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder="Search countries by name, code, or continent (e.g. India, United States, Spain, France, Japan)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
                {countrySearch && (
                  <button
                    onClick={() => setCountrySearch('')}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* All Countries Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {filteredCountries.map((c) => {
                  const isSelected = c.code === selectedCountry?.code;
                  return (
                    <button
                      key={c.code}
                      id={`country-option-${c.code.toLowerCase()}`}
                      type="button"
                      onClick={() => handleSelectCountry(c.code)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-rose-600 bg-rose-50/90 text-rose-950 ring-2 ring-rose-500/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-2xl shrink-0">{c.flag}</span>
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1 truncate">
                            <span>{c.name}</span>
                            <span className="text-slate-400 font-mono text-[10px]">({c.code})</span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {c.region} • Currency: {c.defaultCurrencyCode}
                          </div>
                        </div>
                      </div>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">
                          {c.code}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {filteredCountries.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No countries found matching "{countrySearch}".
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
