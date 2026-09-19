import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useCanteen } from '../../../context/CanteenContext';
import { LayoutDashboard, Utensils, LogOut, ShieldCheck } from 'lucide-react';

export default function Layout() {
  const { adminUser, logout } = useCanteen();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Orders' },
    { to: '/menu', icon: Utensils, label: 'Menu Management' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 bg-leaf-600 rounded-xl flex items-center justify-center text-white shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight">NutriCanteen</h1>
            <span className="text-xs text-leaf-600 font-semibold uppercase tracking-wider">Admin</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive 
                    ? 'bg-leaf-50 text-leaf-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
            <div className="truncate">
              <p className="text-sm font-bold text-gray-900 truncate">{adminUser?.name}</p>
              <p className="text-xs text-gray-500 truncate">{adminUser?.email}</p>
            </div>
            <button 
              onClick={logout}
              className="text-gray-400 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50/50">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
