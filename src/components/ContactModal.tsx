import React from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare, 
  Clock, 
  Send, 
  CheckCircle2,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  userEmail,
}) => {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState(userEmail || '');
  const [subject, setSubject] = React.useState('Customer & Farmer Support');
  const [message, setMessage] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (userEmail) {
      setEmail(userEmail);
    }
  }, [userEmail]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setName('');
      setMessage('');
      setSubmitted(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200">
                Support & Contact
              </span>
              <h2 className="text-xl font-black text-white leading-tight">
                AgriDirect Help Desk
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

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Quick Contact Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 text-center">
              <Mail className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
              <div className="text-[10px] font-extrabold uppercase text-slate-400">Direct Email</div>
              <div className="text-xs font-bold text-slate-800 truncate">support@agridirect.org</div>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 text-center">
              <Phone className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
              <div className="text-[10px] font-extrabold uppercase text-slate-400">Farmer Toll-Free</div>
              <div className="text-xs font-bold text-slate-800 truncate">+1 (800) 555-FARM</div>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 text-center">
              <Clock className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
              <div className="text-[10px] font-extrabold uppercase text-slate-400">Response Window</div>
              <div className="text-xs font-bold text-slate-800 truncate">Within 2 hours</div>
            </div>
          </div>

          {submitted ? (
            <div className="py-8 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">Message Dispatched!</h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Thank you for contacting AgriDirect. Our producer coordinator has received your dispatch and will reply shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1">
                  Your Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="contact-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maria Gonzalez"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  id="contact-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1">
                  Topic / Subject
                </label>
                <select
                  id="contact-subject-select"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                >
                  <option value="Customer & Farmer Support">Customer & Farmer Support</option>
                  <option value="Order Tracking & Logistics">Order Tracking & Logistics</option>
                  <option value="Farmer Fixed-Price Partnership">Farmer Fixed-Price Partnership</option>
                  <option value="Payment & Settlement Inquiries">Payment & Settlement Inquiries</option>
                  <option value="Platform Feedback & Feature Request">Platform Feedback & Feature Request</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-1">
                  Message Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="contact-message-input"
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your inquiry, order question, or harvest listing assistance..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
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
                  id="contact-submit-btn"
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
