import { NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { connectDB } from '@/config/database';
const { Student, School } = require('@/models');

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session, 'students')) return NextResponse.json({ error: 'Unauthorized: insufficient permissions' }, { status: 403 });

    await connectDB();
    const students = await Student.findAll({
      include: [{ model: School, as: 'school', attributes: ['id', 'name'] }],
      order: [['name', 'ASC']]
    });
    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
