import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB, sequelize } from '@/config/database';
const { School } = require('@/models');

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectDB();

    const school = await School.findByPk(id);
    if (!school) return NextResponse.json({ error: 'School not found' }, { status: 404 });

    const numericId = parseInt(id, 10);

    // Fetch registered students for this school
    const [students]: any = await sequelize.query(`
      SELECT 
        st.id,
        st.name,
        st.class,
        st.section,
        st.roll,
        st.phone,
        st.wallet_balance,
        st.is_active,
        st.created_at
      FROM students st
      WHERE st.school_id = ${numericId} AND st.deleted_at IS NULL
      ORDER BY st.name ASC, st.class ASC, st.roll ASC
    `);

    const formattedStudents = (students || []).map((st: any) => ({
      ...st,
      is_active: Boolean(st.is_active),
      wallet_balance: Number(st.wallet_balance || 0)
    }));

    // School statistics
    let stats = {
      total_students: formattedStudents.length,
      active_students: formattedStudents.filter((s: any) => s.is_active).length,
      total_wallet_balance: formattedStudents.reduce((sum: number, s: any) => sum + s.wallet_balance, 0),
      total_orders: 0
    };

    try {
      const [orderStats]: any = await sequelize.query(`
        SELECT COUNT(o.id) AS total_orders
        FROM orders o
        JOIN students st ON o.student_id = st.id
        WHERE st.school_id = ${numericId} AND st.deleted_at IS NULL AND o.status != 'cancelled'
      `);
      if (orderStats && orderStats.length > 0) {
        stats.total_orders = Number(orderStats[0].total_orders || 0);
      }
    } catch (e) {
      console.warn('Could not query school orders count:', e);
    }

    return NextResponse.json({
      school: {
        ...school.toJSON(),
        is_active: Boolean(school.is_active)
      },
      stats,
      students: formattedStudents
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  } catch (error) {
    console.error('[/api/schools/[id] GET] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role === 'staff') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const data = await req.json();

    await connectDB();
    const school = await School.findByPk(id);
    if (!school) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await school.update(data);
    return NextResponse.json({ success: true, school });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role === 'staff') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectDB();
    const school = await School.findByPk(id);
    if (!school) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await school.destroy();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
