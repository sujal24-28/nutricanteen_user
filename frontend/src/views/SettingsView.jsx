import React, { useState } from 'react';
import { useCanteen } from '../context/useCanteen';
import {
  User,
  Bell,
  Moon,
  Sun,
  Shield,
  Phone,
  MessageCircle,
  Info,
  FileText,
  ChevronRight,
  LogOut,
  Wallet,
  Mail,
  ExternalLink,
  QrCode,
  Edit3
} from 'lucide-react';

export const SettingsView = () => {
  const {
    student,
    walletBalance,
    logout,
    setActiveTab,
    setIsEditProfileOpen,
    setIsRechargeOpen,
  } = useCanteen();

  const [darkMode, setDarkMode] = useState(
    () => document.documentElement.classList.contains('dark')
  );
  const [notifications, setNotifications] = useState(true);

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    setDarkMode((p) => !p);
  };

  return (
    <div className="pb-32 pt-[max(1rem,calc(env(safe-area-inset-top,0px)+0.5rem))] px-4 space-y-4">
      {/* ── Top Header ── */}
      <div className="flex items-center justify-between pb-2 border-b border-leaf-100/80 dark:border-leaf-900/60">
        <div>
          <h1 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
            Settings & Profile
          </h1>
          <p className="text-[11px] text-gray-500 dark:text-leaf-300/70 font-medium">
            Manage your student profile, wallet & app preferences
          </p>
        </div>
        <span className="text-[10px] font-bold bg-leaf-100 dark:bg-leaf-900/80 text-leaf-800 dark:text-leaf-300 px-2.5 py-1 rounded-full border border-leaf-200 dark:border-leaf-700">
          Student App
        </span>
      </div>

      {/* ── 1. Profile Overview Card ── */}
      <div className="bg-white dark:bg-leaf-950/60 rounded-3xl p-4 border border-leaf-100 dark:border-leaf-800/80 shadow-xs space-y-3">
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            <img
              src={student?.avatar || 'https://ui-avatars.com/api/?name=User&background=15803d&color=ffffff&size=200'}
              alt="avatar"
              className="w-14 h-14 rounded-2xl object-cover border-2 border-leaf-300 dark:border-leaf-600 shadow-xs"
            />
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="absolute -bottom-1 -right-1 bg-leaf-600 dark:bg-leaf-500 text-white p-1 rounded-full shadow-xs hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title="Change Photo"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                {student?.name || 'Student User'}
              </h2>
              <span className="text-[9px] font-black uppercase bg-gold-200 text-gold-950 px-1.5 py-0.5 rounded-md shrink-0">
                {student?.className?.replace('Class ', '') || '10'}-{student?.section || 'A'}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-leaf-300/70 mt-0.5">
              Roll #{student?.rollNo || '0'} • +91 {student?.phone || 'XXXXXXXXXX'}
            </p>
            <p className="text-[10px] text-leaf-700 dark:text-leaf-300 font-bold mt-0.5 truncate">
              {student?.schoolName || 'School Canteen'}
            </p>
          </div>
        </div>

        {/* Action Buttons: Edit Profile & View ID Card */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-leaf-100 dark:border-leaf-800/60">
          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-leaf-50 dark:bg-leaf-900/40 text-leaf-800 dark:text-leaf-200 text-xs font-bold border border-leaf-200 dark:border-leaf-700/80 hover:bg-leaf-100 dark:hover:bg-leaf-900/60 transition active:scale-98 cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('studentId')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-leaf-50 dark:bg-leaf-900/40 text-leaf-800 dark:text-leaf-200 text-xs font-bold border border-leaf-200 dark:border-leaf-700/80 hover:bg-leaf-100 dark:hover:bg-leaf-900/60 transition active:scale-98 cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Digital ID Pass</span>
          </button>
        </div>
      </div>

      {/* ── 2. Canteen Wallet Quick Box ── */}
      <div className="bg-gradient-to-r from-gold-100 via-amber-50 to-gold-50 dark:from-gold-950/70 dark:via-gold-900/50 dark:to-leaf-950 p-4 rounded-3xl border border-gold-200 dark:border-gold-800/80 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gold-800 dark:bg-gold-400 text-gold-50 dark:text-gold-950 flex items-center justify-center font-bold shadow-xs shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gold-900 dark:text-gold-300 block">
              Wallet Balance
            </span>
            <span className="text-xl font-black text-gold-950 dark:text-white tracking-tight">
              ₹{walletBalance}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsRechargeOpen(true)}
            className="bg-gold-900 hover:bg-gold-800 dark:bg-gold-400 dark:hover:bg-gold-300 text-gold-50 dark:text-gold-950 font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
          >
            + Recharge
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className="p-1.5 rounded-xl bg-gold-200/80 dark:bg-gold-800/50 text-gold-950 dark:text-gold-100 hover:bg-gold-300 transition cursor-pointer"
            title="View Wallet Ledger"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 3. App Settings ── */}
      <Section title="App Settings">
        <ToggleRow
          icon={darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          iconBg="bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300"
          label="Dark Theme"
          sublabel="Toggle between dark and light appearance"
          checked={darkMode}
          onChange={toggleDark}
        />
        <ToggleRow
          icon={<Bell className="w-4 h-4" />}
          iconBg="bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300"
          label="Order Notifications"
          sublabel="Live alerts for order status & wallet updates"
          checked={notifications}
          onChange={() => setNotifications((p) => !p)}
        />
      </Section>

      {/* ── 4. Help & Support ── */}
      <Section title="Help & Support">
        <SettingsRow
          icon={<MessageCircle className="w-4 h-4" />}
          iconBg="bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300"
          label="WhatsApp Support"
          sublabel="Instant chat with canteen administrator"
          onClick={() => window.open('https://wa.me/911800000000', '_blank')}
          external
        />
        <SettingsRow
          icon={<Phone className="w-4 h-4" />}
          iconBg="bg-leaf-100 dark:bg-leaf-950/60 text-leaf-700 dark:text-leaf-300"
          label="Canteen Helpline"
          sublabel="Available school hours: 8:00 AM – 3:30 PM"
          value="1800-XXX-XXXX"
          onClick={() => window.open('tel:1800XXXXXXX')}
        />
        <SettingsRow
          icon={<Mail className="w-4 h-4" />}
          iconBg="bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-300"
          label="Email Feedback"
          sublabel="support@mapstreak.in"
          onClick={() => window.open('mailto:support@mapstreak.in')}
          external
        />
      </Section>

      {/* ── 5. Legal & About ── */}
      <Section title="About & Legal">
        <SettingsRow
          icon={<Shield className="w-4 h-4" />}
          iconBg="bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300"
          label="Privacy Policy"
          sublabel="Student data protection & hygiene protocols"
          onClick={() => window.open('#', '_blank')}
          external
        />
        <SettingsRow
          icon={<FileText className="w-4 h-4" />}
          iconBg="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
          label="Canteen Pre-Order Terms"
          sublabel="Refund rules & recess schedule guidelines"
          onClick={() => window.open('#', '_blank')}
          external
        />
        <SettingsRow
          icon={<Info className="w-4 h-4" />}
          iconBg="bg-leaf-100 dark:bg-leaf-950/60 text-leaf-700 dark:text-leaf-300"
          label="Mapstreak App Version"
          value="v1.0.0 (Native)"
        />
      </Section>

      {/* ── 6. Sign Out Button ── */}
      <div className="pt-2">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all active:scale-98 cursor-pointer shadow-xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out (+91 {student?.phone})</span>
        </button>
      </div>
      <div className="h-8" aria-hidden="true" />
    </div>
  );
};

/* ─── Reusable Helper Components ─── */

const Section = ({ title, children }) => (
  <div className="space-y-1.5">
    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-leaf-300/60 px-1">
      {title}
    </p>
    <div className="bg-white dark:bg-leaf-950/60 rounded-3xl border border-leaf-100 dark:border-leaf-800/80 overflow-hidden divide-y divide-leaf-100 dark:divide-leaf-800/60 shadow-xs">
      {children}
    </div>
  </div>
);

const SettingsRow = ({ icon, iconBg, label, sublabel, value, onClick, external }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition hover:bg-leaf-50/80 dark:hover:bg-leaf-900/40 ${
      onClick ? 'cursor-pointer' : 'cursor-default'
    }`}
  >
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{label}</p>
      {sublabel && <p className="text-[10px] text-gray-400 dark:text-leaf-300/60 mt-0.5">{sublabel}</p>}
    </div>
    {value && <span className="text-[11px] font-bold text-gray-500 dark:text-leaf-300/70 shrink-0">{value}</span>}
    {external && <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
    {onClick && !value && !external && <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" />}
  </button>
);

const ToggleRow = ({ icon, iconBg, label, sublabel, checked, onChange }) => (
  <div className="w-full flex items-center justify-between gap-3 px-4 py-3.5">
    <div className="flex items-center gap-3 min-w-0">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{label}</p>
        {sublabel && <p className="text-[10px] text-gray-400 dark:text-leaf-300/60 mt-0.5">{sublabel}</p>}
      </div>
    </div>

    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
        checked ? 'bg-leaf-600 dark:bg-leaf-500' : 'bg-gray-200 dark:bg-gray-700'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);
