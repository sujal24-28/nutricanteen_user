import { NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { connectDB } from '@/config/database';
const { Student, Order, OrderItem, MenuItem, WalletTransaction, School } = require('@/models');

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session, 'students')) return NextResponse.json({ error: 'Unauthorized: insufficient permissions' }, { status: 403 });

    const { id } = await params;
    await connectDB();

    const [student, orders, transactions] = await Promise.all([
      Student.findByPk(id, {
        include: [{ model: School, as: 'school', attributes: ['id', 'name'] }]
      }),
      Order.findAll({
        where: { student_id: id },
        include: [
          {
            model: OrderItem,
            as: 'items',
            include: [{ model: MenuItem, as: 'menuItem', attributes: ['name', 'price', 'image_url'] }]
          }
        ],
        order: [['created_at', 'DESC']]
      }),
      WalletTransaction.findAll({
        where: { student_id: id },
        order: [['created_at', 'DESC']]
      })
    ]);

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Calculate helpful stats
    const totalSpent = orders
      .filter((o: any) => o.status !== 'cancelled')
      .reduce((sum: number, o: any) => sum + parseFloat(o.total_amount || 0), 0);

    const totalRecharged = transactions
      .filter((t: any) => t.type === 'credit')
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0);

    return NextResponse.json({
      student,
      orders,
      transactions,
      stats: {
        totalOrders: orders.length,
        totalSpent,
        totalRecharged,
        currentBalance: parseFloat(student.wallet_balance || 0),
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  } catch (error) {
    console.error('[/api/students/[id]] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session, 'students')) return NextResponse.json({ error: 'Unauthorized: insufficient permissions' }, { status: 403 });

    const { id } = await params;
    const body = await req.json();

    await connectDB();

    const student = await Student.findByPk(id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.phone !== undefined) updateData.phone = body.phone.trim();
    if (body.class !== undefined) updateData.class = body.class.trim();
    if (body.section !== undefined) updateData.section = body.section.trim();
    if (body.roll !== undefined) updateData.roll = body.roll.trim();
    if (body.school_id !== undefined) updateData.school_id = body.school_id ? parseInt(body.school_id, 10) : null;
    if (body.is_active !== undefined) updateData.is_active = Boolean(body.is_active);

    // If phone is being changed, check if it's already in use
    if (updateData.phone && updateData.phone !== student.phone) {
      const existing = await Student.findOne({ where: { phone: updateData.phone } });
      if (existing && existing.id !== student.id) {
        return NextResponse.json({ error: 'Phone number already in use by another student' }, { status: 400 });
      }
    }

    await student.update(updateData);

    // Fetch updated student with school association
    const updatedStudent = await Student.findByPk(id, {
      include: [{ model: School, as: 'school', attributes: ['id', 'name'] }]
    });

    return NextResponse.json({
      success: true,
      student: updatedStudent
    });
  } catch (error: any) {
    console.error('[/api/students/[id] PATCH] Error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return NextResponse.json({ error: 'A student with this phone or identity (name, class, roll, section) already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session, 'students')) {
      return NextResponse.json({ error: 'Unauthorized: insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();

    const student = await Student.findByPk(id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const studentName = student.name;
    // Perform safe soft delete
    await student.destroy();

    return NextResponse.json({
      success: true,
      message: `Student "${studentName}" deleted successfully.`
    });
  } catch (error: any) {
    console.error('[/api/students/[id] DELETE] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}


