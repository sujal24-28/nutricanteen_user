import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/config/database';
const { School } = require('@/models');

export async function GET(req: Request) {
  try {
    await connectDB();
    const schools = await School.findAll({ order: [['name', 'ASC']] });
    return NextResponse.json(schools);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role === 'staff') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    await connectDB();
    const school = await School.create(data);
    return NextResponse.json({ success: true, school });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
