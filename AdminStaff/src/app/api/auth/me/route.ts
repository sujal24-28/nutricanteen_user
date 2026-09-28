import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/config/database';
const { Admin } = require('@/models');

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    await connectDB();
    const admin = await Admin.findByPk(session.id, {
      attributes: ['id', 'name', 'email', 'phone', 'role', 'permissions', 'is_active']
    });

    if (!admin || !admin.is_active) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const permissions = admin.role === 'superadmin' || admin.role === 'admin'
      ? ['dashboard', 'orders', 'orders_sheet', 'menu', 'students', 'schools', 'banner', 'reports', 'staff']
      : (Array.isArray(admin.permissions) && admin.permissions.length > 0 ? admin.permissions : ['orders', 'orders_sheet']);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        permissions
      }
    });
  } catch (error) {
    console.error('Error fetching current session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
