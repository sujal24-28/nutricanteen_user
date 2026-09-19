'use client';
import { useState } from 'react';

export default function SettingsPage() {
  const [msg, setMsg] = useState('');

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('Settings saved successfully (Mocked). No database schema was changed.');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-brown-dark mb-6">System Settings</h1>
      
      {msg && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">{msg}</div>}

      <div className="bg-white p-6 rounded-lg shadow border border-brand-brown-light/20 max-w-2xl">
        <form onSubmit={saveSettings} className="space-y-6">
          
          <div>
            <h2 className="text-lg font-bold text-brand-brown-dark border-b pb-2 mb-4">Payment Gateway (RogerPay)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Key ID</label>
                <input type="text" className="w-full border p-2 rounded" placeholder="rzp_test_..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Key Secret</label>
                <input type="password" className="w-full border p-2 rounded" placeholder="********" />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-brand-brown-dark border-b pb-2 mb-4 mt-8">Canteen Operations</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Order Cut-off Time</label>
                <input type="time" className="w-full border p-2 rounded" defaultValue="10:00" />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" className="px-6 py-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-brown-dark font-bold rounded shadow transition-colors">
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
