import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function DashboardIndex() {
  const session = await getSession();
  
  if (!session) {
    redirect('/');
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-brown-dark mb-4">Welcome, {session.name}</h1>
      <p className="text-brand-brown-light">
        Role: <span className="capitalize font-semibold">{session.role}</span>
      </p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-brand-brown-light/10">
          <h3 className="text-xl font-bold text-brand-gold-dark mb-2">Quick Stats</h3>
          <p className="text-brand-brown">View the latest activities and queue.</p>
        </div>
      </div>
    </div>
  );
}

