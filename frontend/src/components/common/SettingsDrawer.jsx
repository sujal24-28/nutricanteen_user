import React, { useState, useEffect } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import {
  X,
  User,
  Bell,
  Moon,
  Sun,
  Shield,
  HelpCircle,
  Phone,
  MessageCircle,
  Info,
  FileText,
  Star,
  ChevronRight,
  LogOut,
  Wallet,
  Mail,
  ExternalLink,
} from 'lucide-react';

export const SettingsDrawer = ({ isOpen, onClose }) => {
  const { student, walletBalance, logout, setActiveTab, setIsEditProfileOpen } = useCanteen();
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );
  const [notifications, setNotifications] = useState(true);

  // Lock body scroll while drawer is open, restore when closed
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    setDarkMode((p) => !p);
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  const handleNav = (tab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      {/* Drawer */}
      <div className="bg-white dark:bg-[#101812] w-full max-w-lg rounded-t-[28px] sm:rounded-3xl border border-leaf-100 dark:border-leaf-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">

        {/* Drag handle (mobile) */}
        <div className="w-12 h-1 bg-gray-200 dark:bg-leaf-800 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-leaf-100 dark:border-leaf-800/80 shrink-0">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 dark:bg-leaf-900 text-gray-500 dark:text-leaf-300 flex items-center justify-center hover:bg-gray-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto overscroll-contain flex-1 px-4 py-3 space-y-4">

          {/* ── Profile Card ── */}
          <div
            className="flex items-center gap-3 p-3.5 bg-leaf-50 dark:bg-leaf-950/60 rounded-2xl border border-leaf-200 dark:border-leaf-800 cursor-pointer hover:bg-leaf-100 dark:hover:bg-leaf-900/60 transition"
            onClick={() => handleNav('studentId')}
          >
            <img
              src={student?.avatar || 'https://ui-avatars.com/api/?name=User&background=f3f4f6&color=9ca3af&size=200'}
              alt="avatar"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-leaf-300 dark:border-leaf-700"
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{student?.name || 'Guest'}</p>
              <p className="text-[11px] text-gray-500 dark:text-leaf-300/70">
                {student?.className}-{student?.section} • Roll #{student?.rollNo}
              </p>
              <p className="text-[11px] text-leaf-700 dark:text-leaf-300 font-semibold">{student?.uniqueId}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          </div>

          {/* ── Wallet Quick Access ── */}
          <SettingsRow
            icon={<Wallet className="w-4 h-4" />}
            iconBg="bg-gold-100 dark:bg-gold-950/60 text-gold-700 dark:text-gold-300"
            label="Canteen Wallet"
            value={`₹${walletBalance}`}
            onClick={() => handleNav('wallet')}
          />

          {/* ── App Settings ── */}
          <Section title="App Settings">
            <SettingsRow
              icon={<User className="w-4 h-4" />}
              iconBg="bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300"
              label="Edit Profile"
              sublabel="Change your name or profile photo"
              onClick={() => {
                onClose();
                setIsEditProfileOpen(true);
              }}
            />
            <ToggleRow
              icon={<Bell className="w-4 h-4" />}
              iconBg="bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300"
              label="Order Notifications"
              sublabel="Get alerts for order status & recharge"
              checked={notifications}
              onChange={() => setNotifications((p) => !p)}
            />
            <ToggleRow
              icon={darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              iconBg="bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300"
              label="Dark Mode"
              sublabel="Switch between light and dark theme"
              checked={darkMode}
              onChange={toggleDark}
            />
          </Section>

          {/* ── Help & Support ── */}
          <Section title="Help & Support">
            <SettingsRow
              icon={<Phone className="w-4 h-4" />}
              iconBg="bg-leaf-100 dark:bg-leaf-950/60 text-leaf-700 dark:text-leaf-300"
              label="Call Customer Care"
              sublabel="Mon–Sat, 9 AM – 6 PM"
              value="1800-XXX-XXXX"
              onClick={() => window.open('tel:1800XXXXXXX')}
            />
            <SettingsRow
              icon={<MessageCircle className="w-4 h-4" />}
              iconBg="bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300"
              label="Chat with Support"
              sublabel="Avg. response in 5 minutes"
              onClick={() => window.open('https://wa.me/911800000000', '_blank')}
              external
            />
            <SettingsRow
              icon={<Mail className="w-4 h-4" />}
              iconBg="bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-300"
              label="Email Support"
              sublabel="support@nutricanteen.in"
              onClick={() => window.open('mailto:support@nutricanteen.in')}
              external
            />
            <SettingsRow
              icon={<HelpCircle className="w-4 h-4" />}
              iconBg="bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300"
              label="FAQs & Help Center"
              sublabel="Pre-orders, wallet, refunds & more"
              onClick={() => window.open('#', '_blank')}
              external
            />
          </Section>

          {/* ── Security ── */}
          <Section title="Privacy & Security">
            <SettingsRow
              icon={<Shield className="w-4 h-4" />}
              iconBg="bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300"
              label="Privacy Policy"
              onClick={() => window.open('#', '_blank')}
              external
            />
            <SettingsRow
              icon={<FileText className="w-4 h-4" />}
              iconBg="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              label="Terms & Conditions"
              onClick={() => window.open('#', '_blank')}
              external
            />
          </Section>

          {/* ── About ── */}
          <Section title="About">
            <SettingsRow
              icon={<Star className="w-4 h-4" />}
              iconBg="bg-gold-100 dark:bg-gold-950/60 text-gold-700 dark:text-gold-300"
              label="Rate the App"
              sublabel="Love NutriCanteen? Give us 5 stars!"
              onClick={() => window.open('#', '_blank')}
              external
            />
            <SettingsRow
              icon={<Info className="w-4 h-4" />}
              iconBg="bg-leaf-100 dark:bg-leaf-950/60 text-leaf-700 dark:text-leaf-300"
              label="About NutriCanteen"
              value="v1.0.0"
            />
          </Section>

          {/* ── Sign Out ── */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/80 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 transition active:scale-98 cursor-pointer mb-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out (+91 {student?.phone})</span>
          </button>

        </div>
      </div>
    </div>
  );
};

/* ─── Helper sub-components ─── */

const Section = ({ title, children }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-leaf-300/50 px-1 mb-1.5">
      {title}
    </p>
    <div className="bg-white dark:bg-leaf-950/50 rounded-2xl border border-leaf-100 dark:border-leaf-800/80 overflow-hidden divide-y divide-leaf-100 dark:divide-leaf-800/60">
      {children}
    </div>
  </div>
);

const SettingsRow = ({ icon, iconBg, label, sublabel, value, onClick, external }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3.5 py-3 text-left transition hover:bg-leaf-50 dark:hover:bg-leaf-900/40 ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
  >
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-gray-900 dark:text-white">{label}</p>
      {sublabel && <p className="text-[10px] text-gray-400 dark:text-leaf-300/60 mt-0.5">{sublabel}</p>}
    </div>
    {value && <span className="text-[11px] font-bold text-gray-500 dark:text-leaf-300/70 shrink-0">{value}</span>}
    {onClick && (external
      ? <ExternalLink className="w-3.5 h-3.5 text-gray-300 dark:text-leaf-700 shrink-0" />
      : <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-leaf-700 shrink-0" />
    )}
  </button>
);

const ToggleRow = ({ icon, iconBg, label, sublabel, checked, onChange }) => (
  <div className="flex items-center gap-3 px-3.5 py-3">
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0 overflow-hidden">
      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{label}</p>
      {sublabel && <p className="text-[10px] text-gray-400 dark:text-leaf-300/60 mt-0.5 truncate">{sublabel}</p>}
    </div>
    {/* Toggle pill */}
    <div
      onClick={onChange}
      className="shrink-0 cursor-pointer"
      style={{
        width: 40,
        height: 22,
        borderRadius: 999,
        backgroundColor: checked ? '#3d7a48' : '#d1d5db',
        position: 'relative',
        transition: 'background-color 0.2s',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: checked ? 21 : 3,
          width: 16,
          height: 16,
          borderRadius: '50%',
          backgroundColor: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transition: 'left 0.2s',
          display: 'block',
        }}
      />
    </div>
  </div>
);
