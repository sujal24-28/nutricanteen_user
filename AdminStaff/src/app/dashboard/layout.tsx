'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, LogOut, LayoutDashboard, Utensils, Users, UserCog, FileText, Settings, Building2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const navLinks = [
    { name: 'Orders', href: '/dashboard/orders', icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
    { name: '📋 Order Sheet', href: '/dashboard/orders/sheet', icon: <FileText className="w-5 h-5 mr-3" /> },
    { name: 'Menu', href: '/dashboard/menu', icon: <Utensils className="w-5 h-5 mr-3" /> },
    { name: 'Students & Wallets', href: '/dashboard/students', icon: <Users className="w-5 h-5 mr-3" /> },
    { name: 'Staff', href: '/dashboard/staff', icon: <UserCog className="w-5 h-5 mr-3" /> },
    { name: 'Schools', href: '/dashboard/schools', icon: <Building2 className="w-5 h-5 mr-3" /> },
    { name: 'Reports', href: '/dashboard/reports', icon: <FileText className="w-5 h-5 mr-3" /> },
    { name: 'Settings', href: '/dashboard/settings', icon: <Settings className="w-5 h-5 mr-3" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-offwhite">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-brand-brown-dark text-brand-white z-40 sticky top-0 shadow-md">
        <div>
          <h2 className="text-xl font-bold text-brand-gold">NutriCanteen</h2>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-brand-brown rounded hover:bg-brand-brown-light transition-colors">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
        fixed md:sticky top-0 left-0 h-screen w-64 bg-brand-brown-dark text-brand-white flex flex-col z-50
        transition-transform duration-300 ease-in-out
      `}>
        <div className="p-6 hidden md:block">
          <h2 className="text-2xl font-bold text-brand-gold">NutriCanteen</h2>
          <p className="text-sm text-brand-brown-light">Portal</p>
        </div>
        <div className="p-6 md:hidden flex justify-between items-center border-b border-brand-brown">
          <div>
            <h2 className="text-xl font-bold text-brand-gold">NutriCanteen</h2>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded hover:bg-brand-brown">
             <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center px-4 py-3 rounded hover:bg-brand-brown transition-colors"
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-brand-brown">
          <button onClick={handleLogout} className="flex items-center justify-center w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded transition-colors font-semibold">
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 w-full min-w-0 md:h-screen md:overflow-y-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
