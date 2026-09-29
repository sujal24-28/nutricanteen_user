'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  Utensils,
  Users,
  UserCog,
  Building2,
  Image as ImageIcon,
  Lock,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'staff';
  permissions: string[];
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted) {
          if (data?.user) {
            setCurrentUser(data.user);
          }
          setLoadingUser(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingUser(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const allNavLinks = useMemo(
    () => [
      { id: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
      { id: 'orders', name: 'Orders', href: '/dashboard/orders', icon: <ShoppingBag className="w-5 h-5 mr-3" /> },
      { id: 'orders_sheet', name: 'Order Sheet', href: '/dashboard/orders/sheet', icon: <ClipboardList className="w-5 h-5 mr-3" /> },
      { id: 'menu', name: 'Menu', href: '/dashboard/menu', icon: <Utensils className="w-5 h-5 mr-3" /> },
      { id: 'students', name: 'Students & Wallets', href: '/dashboard/students', icon: <Users className="w-5 h-5 mr-3" /> },
      { id: 'schools', name: 'Schools', href: '/dashboard/schools', icon: <Building2 className="w-5 h-5 mr-3" /> },
      { id: 'banner', name: 'App Banner', href: '/dashboard/banner', icon: <ImageIcon className="w-5 h-5 mr-3" /> },
      { id: 'staff', name: 'Staff & Roles', href: '/dashboard/staff', icon: <UserCog className="w-5 h-5 mr-3" />, superAdminOnly: true },
    ],
    []
  );

  // Filter links according to role & allowed permissions
  const visibleNavLinks = useMemo(() => {
    if (!currentUser) return allNavLinks;
    if (currentUser.role === 'superadmin' || currentUser.role === 'admin') {
      return allNavLinks;
    }
    const perms = Array.isArray(currentUser.permissions) && currentUser.permissions.length > 0
      ? currentUser.permissions
      : ['orders', 'orders_sheet'];

    return allNavLinks.filter((link) => !link.superAdminOnly && perms.includes(link.id));
  }, [currentUser, allNavLinks]);

  // Identify current section from URL path
  const currentSectionId = useMemo(() => {
    if (pathname === '/dashboard/orders/sheet') return 'orders_sheet';
    if (pathname.startsWith('/dashboard/orders')) return 'orders';
    if (pathname.startsWith('/dashboard/menu')) return 'menu';
    if (pathname.startsWith('/dashboard/students')) return 'students';
    if (pathname.startsWith('/dashboard/schools')) return 'schools';
    if (pathname.startsWith('/dashboard/banner')) return 'banner';
    if (pathname.startsWith('/dashboard/staff')) return 'staff';
    if (pathname === '/dashboard') return 'dashboard';
    return null;
  }, [pathname]);

  // Check if current user is allowed to access current section
  const isCurrentSectionAllowed = useMemo(() => {
    if (!currentUser || loadingUser) return true;
    if (currentUser.role === 'superadmin' || currentUser.role === 'admin') return true;
    if (!currentSectionId) return true;
    if (currentSectionId === 'staff') return false; // Staff never access staff management

    const perms = Array.isArray(currentUser.permissions) && currentUser.permissions.length > 0
      ? currentUser.permissions
      : ['orders', 'orders_sheet'];

    return perms.includes(currentSectionId);
  }, [currentUser, loadingUser, currentSectionId]);

  const firstAllowedLink = visibleNavLinks[0]?.href || '/dashboard/orders';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-offwhite">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-brand-brown-dark text-brand-white z-40 sticky top-0 shadow-md">
        <div>
          <h2 className="text-xl font-bold text-brand-gold">Mapstreak</h2>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-brand-brown rounded hover:bg-brand-brown-light transition-colors"
        >
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
      <aside
        className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
        fixed md:sticky top-0 left-0 h-screen w-64 bg-brand-brown-dark text-brand-white flex flex-col z-50
        transition-transform duration-300 ease-in-out
      `}
      >
        <div className="p-6 hidden md:block">
          <h2 className="text-2xl font-bold text-brand-gold">Mapstreak</h2>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs text-brand-brown-light uppercase tracking-wider font-semibold">
              {currentUser?.role === 'staff' ? 'Staff Portal' : 'Admin Portal'}
            </span>
            {currentUser?.role === 'staff' && (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-semibold">
                Staff
              </span>
            )}
          </div>
        </div>

        <div className="p-6 md:hidden flex justify-between items-center border-b border-brand-brown">
          <div>
            <h2 className="text-xl font-bold text-brand-gold">Mapstreak</h2>
            <p className="text-xs text-brand-brown-light capitalize">
              {currentUser?.role || 'Portal'}
            </p>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded hover:bg-brand-brown">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User identification badge in sidebar */}
        {currentUser && (
          <div className="mx-4 mb-2 p-2.5 rounded-lg bg-brand-brown/50 border border-brand-brown-light/20 flex items-center justify-between text-xs">
            <div className="min-w-0 pr-2">
              <p className="font-bold text-brand-gold truncate">{currentUser.name}</p>
              <p className="text-[11px] text-gray-300 capitalize">
                {currentUser.role === 'superadmin' ? 'Super Administrator' : 'Canteen Staff'}
              </p>
            </div>
            <div className="shrink-0">
              {currentUser.role === 'superadmin' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              )}
            </div>
          </div>
        )}

        <nav className="flex-1 px-4 py-3 space-y-1.5 overflow-y-auto">
          {visibleNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-4 py-2.5 rounded-lg transition-colors font-medium text-sm ${
                  isActive
                    ? 'bg-brand-brown text-brand-gold font-bold shadow-xs'
                    : 'text-gray-200 hover:bg-brand-brown/70 hover:text-white'
                }`}
              >
                {link.icon ? link.icon : <span className="w-5 mr-3 inline-block" />}
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-brand-brown">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold text-sm cursor-pointer shadow-xs"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 w-full min-w-0 md:h-screen md:overflow-y-auto overflow-x-hidden">
        {!isCurrentSectionAllowed ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 mx-auto flex items-center justify-center mb-4">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
              <p className="text-sm text-gray-600 mb-6">
                Your staff account has not been granted access to this section by the administrator. Please contact your canteen manager if you require access.
              </p>
              <Link
                href={firstAllowedLink}
                className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-brown-dark hover:bg-brand-brown text-white font-semibold rounded-lg text-sm transition-colors shadow-xs"
              >
                Go to Allowed Section
              </Link>
            </div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
