import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB, sequelize } from '@/config/database';
const { School } = require('@/models');

export async function GET(req: Request) {
  try {
    await connectDB();
    const [schools]: any = await sequelize.query(`
      SELECT 
        s.*,
        COUNT(st.id) AS student_count
      FROM schools s
      LEFT JOIN students st ON s.id = st.school_id AND st.deleted_at IS NULL
      GROUP BY s.id
      ORDER BY s.name ASC
    `);

    const formatted = (schools || []).map((s: any) => ({
      ...s,
      is_active: Boolean(s.is_active),
      student_count: Number(s.student_count || 0)
    }));

    return NextResponse.json(formatted, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  } catch (error) {
    console.error('[/api/schools GET] Error:', error);
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
