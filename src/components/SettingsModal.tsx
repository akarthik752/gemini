import React, { useState } from 'react';
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
  ShieldCheck
} from 'lucide-react';
import { updateAccount, changeAccountPassword } from '../services/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Account | null;
  initialTab?: 'profile' | 'password';
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
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>(initialTab);

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
  }, [currentUser, initialTab, isOpen]);

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

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    setIsSubmitting(true);
    const result = changeAccountPassword(currentUser.id, newPassword);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMsg(result.error || 'Failed to update password');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSuccessMsg('Password updated successfully! Your account security has been verified.');
    setTimeout(() => {
      setSuccessMsg(null);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
              {activeTab === 'profile' ? <User className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200">
                Account Settings
              </span>
              <h2 className="text-xl font-black text-white leading-tight">
                {activeTab === 'profile' ? 'Profile Management' : 'Change Password'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            type="button"
            id="tab-btn-profile"
            onClick={() => {
              setActiveTab('profile');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`pb-3 px-4 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Details</span>
          </button>
          <button
            type="button"
            id="tab-btn-password"
            onClick={() => {
              setActiveTab('password');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`pb-3 px-4 text-xs font-extrabold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'password'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Password Change</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4">
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

          {!currentUser ? (
            /* Not logged in message */
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Sign In Required</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  You must be signed in with a Gmail or custom account to edit profile details or configure password security.
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
          ) : activeTab === 'profile' ? (
            /* Profile Form */
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {/* Account Meta Badge */}
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
                    placeholder="Your legal or contact name"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                  Google / Gmail Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    id="settings-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {currentUser.role === 'farmer' && (
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                    Farm / Producer Name
                  </label>
                  <div className="relative">
                    <Tractor className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      id="settings-farmname-input"
                      type="text"
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      placeholder="e.g. Sunny Valley Organic Orchards"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1.5">
                    Contact Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      id="settings-phone-input"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
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
                      placeholder="e.g. Sonoma County, CA"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>
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
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Password Change Form */
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
          )}
        </div>
      </div>
    </div>
  );
};
