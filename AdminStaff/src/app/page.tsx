'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      if (res.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-offwhite">
      <div className="w-full max-w-md p-8 bg-brand-white rounded-xl shadow-lg border border-brand-brown-light/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-brown-dark">NutriCanteen</h1>
          <p className="text-brand-brown-light mt-2">Staff & Admin Portal</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-brand-brown-dark mb-1">Email or Phone</label>
            <input 
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-brand-brown-light/30 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-brown-dark mb-1">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-brand-brown-light/30 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-brand-gold hover:bg-brand-gold-dark text-brand-brown-dark font-bold py-2 px-4 rounded-md transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

