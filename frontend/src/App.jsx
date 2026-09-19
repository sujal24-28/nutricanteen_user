import React, { useState } from 'react';
import { CanteenProvider, useCanteen } from './context/CanteenContext';
import { BottomNav } from './components/common/BottomNav';

// Auth Components
import { PhoneOtpStep } from './components/auth/PhoneOtpStep';
import { StudentDetailsStep } from './components/auth/StudentDetailsStep';

// Views
import { CanteenHomeView } from './views/CanteenHomeView';
import { OrdersView } from './views/OrdersView';
import { WalletView } from './views/WalletView';
import { StudentIdView } from './views/StudentIdView';

// Modals
import { PreOrderScheduleModal } from './components/canteen/PreOrderScheduleModal';
import { CartCheckoutModal } from './components/canteen/CartCheckoutModal';
import { WalletRechargeModal } from './components/wallet/WalletRechargeModal';
import { StudentIdCardModal } from './components/canteen/StudentIdCardModal';
import { ServerSettingsModal } from './components/common/ServerSettingsModal';
import { SettingsDrawer } from './components/common/SettingsDrawer';
import { EditProfileModal } from './components/auth/EditProfileModal';

import {
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const CanteenAppContent = () => {
  const {
    authStep,
    userRole,
    activeTab,
    notification,
    isEditProfileOpen,
    setIsEditProfileOpen
  } = useCanteen();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f6f9f7] dark:bg-[#0c140e] text-gray-900 dark:text-gray-100 flex flex-col font-sans antialiased">
      {/* Main Responsive App Container */}
      <div className="w-full max-w-lg md:max-w-xl mx-auto flex-1 flex flex-col relative bg-white dark:bg-[#101812] min-h-screen shadow-sm sm:border-x border-leaf-100 dark:border-leaf-900/50 pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]">

        {authStep === 'phone' || authStep === 'otp' ? (
          <div className="flex-1 flex flex-col w-full">
            <PhoneOtpStep />
          </div>
        ) : authStep === 'profile' ? (
          <div className="flex-1 flex flex-col w-full">
            <StudentDetailsStep />
          </div>
        ) : userRole === 'student' ? (
          <div className="flex-1 flex flex-col relative w-full">
            {/* Active Tab View for Students */}
            <main className="flex-1 w-full">
              {activeTab === 'menu' && <CanteenHomeView />}
              {activeTab === 'orders' && <OrdersView />}
              {activeTab === 'wallet' && <WalletView />}
              {activeTab === 'studentId' && <StudentIdView />}
            </main>

            {/* Bottom Navigation & Floating Pre-Order Cart */}
            <BottomNav onSettingsOpen={() => setIsSettingsOpen(true)} />
          </div>
        ) : null}
      </div>

      {/* Global Modals */}
      <PreOrderScheduleModal />
      <CartCheckoutModal />
      <WalletRechargeModal />
      <StudentIdCardModal />
      <ServerSettingsModal />
      <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />

      {/* Global Toast Notification */}
      {notification && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto z-50 max-w-sm sm:w-full animate-bounce-in pointer-events-none">
          <div
            className={`p-3 rounded-2xl shadow-lg border flex items-start gap-3 backdrop-blur-md pointer-events-auto ${
              notification.type === 'error'
                ? 'bg-rose-900/95 text-rose-50 border-rose-700'
                : 'bg-leaf-800/95 text-white border-gold-400/30'
            }`}
          >
            <div className="p-1 rounded-xl bg-gold-500/20 text-gold-300 shrink-0">
              {notification.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-300" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-leaf-200" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white">{notification.title}</h4>
              <p className="text-[11px] text-gray-200 mt-0.5 leading-snug">{notification.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <CanteenProvider>
      <CanteenAppContent />
    </CanteenProvider>
  );
}
