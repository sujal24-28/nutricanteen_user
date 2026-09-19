import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { setSession } from '@/lib/auth';
import { connectDB } from '@/config/database';
import { Admin } from '@/models';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, phone, password } = await req.json();

    if (!password || (!email && !phone)) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const whereClause = email ? { email } : { phone };
    const admin = await Admin.findOne({ where: whereClause });

    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!admin.is_active) {
      return NextResponse.json({ error: 'Account disabled' }, { status: 403 });
    }

    await setSession({
      id: admin.id,
      role: admin.role,
      name: admin.name,
    });

    return NextResponse.json({ success: true, role: admin.role });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

