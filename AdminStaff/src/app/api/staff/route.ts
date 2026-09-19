import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/config/database';
import bcrypt from 'bcryptjs';
const { Admin } = require('@/models');

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role === 'staff') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const staff = await Admin.findAll({ 
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']]
    });
    return NextResponse.json(staff);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role === 'staff') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    if (!data.password) return NextResponse.json({ error: 'Password required' }, { status: 400 });

    await connectDB();
    data.password_hash = await bcrypt.hash(data.password, 10);
    const staff = await Admin.create(data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
