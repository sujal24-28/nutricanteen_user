import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, ChevronLeft, Circle, Square } from 'lucide-react';

export const DeviceFrame = ({ children, deviceType = 'ios' }) => {
  const [currentTime, setCurrentTime] = useState('09:41');
  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      const isCapacitor = window.location.protocol === 'capacitor:' || window.location.protocol === 'file:';
      return isCapacitor || window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => {
      const isCapacitor = window.location.protocol === 'capacitor:' || window.location.protocol === 'file:';
      setIsMobileScreen(isCapacitor || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // ON MOBILE SCREENS / CAPACITOR NATIVE APP:
  // Render full screen native layout without fake chassis, bezels or simulated notch
  if (isMobileScreen) {
    return (
      <div className="w-full flex-1 flex flex-col bg-[#F8F9FA] dark:bg-[#0c140e] relative min-h-screen">
        {children}
      </div>
    );
  }

  const isAndroid = deviceType === 'android';

  return (
    <div className="flex items-center justify-center p-1 sm:p-4 transition-all duration-300">
      {/* Phone Outer Chassis */}
      <div
        className={`relative w-[390px] h-[844px] max-h-[92vh] bg-black p-[11px] shadow-[0_25px_70px_rgba(0,0,0,0.35)] border-[4px] border-[#2A2B32] select-none flex flex-col transition-all duration-300 ${
          isAndroid ? 'rounded-[42px]' : 'rounded-[52px]'
        }`}
        style={{
          boxShadow: isAndroid
            ? '0 25px 60px -15px rgba(0, 0, 0, 0.45), 0 0 0 7px #202228, 0 0 0 9px #353842'
            : '0 25px 60px -15px rgba(0, 0, 0, 0.45), 0 0 0 8px #1A1B20, 0 0 0 10px #2E303A'
        }}
      >
        {/* Dynamic Island (iOS) OR Punch Hole Camera (Android) */}
        {isAndroid ? (
          <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-50 pointer-events-none flex items-center justify-center shadow-inner border border-gray-900">
            <div className="w-2 h-2 rounded-full bg-[#111827] border border-[#1f2937]/80"></div>
          </div>
        ) : (
          <div className="absolute top-[16px] left-1/2 -translate-x-1/2 w-[124px] h-[30px] bg-black rounded-full z-50 flex items-center justify-between px-3 pointer-events-none shadow-sm">
            <div className="w-3 h-3 rounded-full bg-[#111115] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1f2937]/70"></div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#0d1b2a] border border-[#1e293b]/50"></div>
          </div>
        )}

        {/* Screen Bezel / Inner Display */}
        <div
          className={`relative w-full h-full bg-[#F8F9FA] dark:bg-[#0c140e] overflow-hidden flex flex-col ${
            isAndroid ? 'rounded-[32px]' : 'rounded-[42px]'
          }`}
        >
          {/* Status Bar */}
          <div className="h-[42px] w-full px-7 flex items-center justify-between z-40 bg-transparent text-gray-900 dark:text-white shrink-0 text-xs font-semibold select-none pt-1">
            <span className="tracking-tight text-[13px] font-black">{currentTime}</span>

            <div className="flex items-center space-x-1.5">
              <Signal className="w-3.5 h-3.5 fill-current" />
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center">
                <BatteryMedium className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Screen Content (Scrollable Container) */}
          <div className="flex-1 w-full overflow-y-auto no-scrollbar relative flex flex-col bg-[#F8F9FA] dark:bg-[#0c140e]">
            {children}
          </div>

          {/* Bottom Navigation Indicator (Android 3-buttons or iOS Home Bar) */}
          {isAndroid ? (
            <div className="h-[22px] w-full flex items-center justify-center shrink-0 z-40 bg-transparent pointer-events-none pb-1">
              <div className="w-20 h-1 bg-gray-400/70 dark:bg-gray-600/70 rounded-full"></div>
            </div>
          ) : (
            <div className="h-[22px] w-full flex items-center justify-center shrink-0 z-40 bg-transparent pointer-events-none pb-1">
              <div className="w-32 h-1 bg-gray-400/60 dark:bg-gray-600/60 rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
