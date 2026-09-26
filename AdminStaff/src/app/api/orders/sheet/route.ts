import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB, sequelize } from '@/config/database';
const { Order, OrderItem, MenuItem, Student } = require('@/models');

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date'); // e.g. "2026-09-27" or "all"

    await connectDB();

    let whereClause = undefined;
    if (dateParam && dateParam !== 'all') {
      whereClause = sequelize.where(
        sequelize.fn('DATE', sequelize.col('Order.created_at')),
        dateParam
      );
    }

    const orders = await Order.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'class', 'section', 'roll', 'phone'],
        },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: MenuItem, as: 'menuItem', attributes: ['name', 'price'] }],
        },
      ],
      order: [['created_at', 'DESC'], ['id', 'DESC']],
    });

    // Get distinct dates with order counts for quick switching
    let dateRows = [];
    try {
      const [rows]: any = await sequelize.query(
        'SELECT DISTINCT DATE(created_at) as order_date, COUNT(*) as count FROM orders GROUP BY DATE(created_at) ORDER BY order_date DESC'
      );
      dateRows = rows || [];
    } catch (e) {
      console.warn('Could not fetch distinct dates:', e);
    }

    // Format orders for clean table presentation
    const formattedOrders = orders.map((order: any) => {
      const plain = order.toJSON ? order.toJSON() : order;
      const rawDate = plain.created_at || plain.createdAt || new Date();
      const d = new Date(rawDate);
      
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const dateDisplay = `${day}/${month}/${year}`;

      const items = (plain.items && plain.items.length > 0)
        ? plain.items.map((it: any) => ({
            id: it.id,
            product_name: it.menuItem?.name || 'Meal Item',
            quantity: Number(it.quantity) || 1,
            unit_price: Number(it.unit_price || it.menuItem?.price || 0),
          }))
        : [
            {
              id: `default-${plain.id}`,
              product_name: plain.note || 'Canteen Meal',
              quantity: 1,
              unit_price: Number(plain.total_amount) || 0,
            }
          ];

      return {
        id: plain.id,
        status: plain.status || 'pending',
        total_amount: Number(plain.total_amount) || 0,
        createdAt: rawDate,
        dateDisplay,
        student: {
          name: plain.student?.name || 'Student',
          class: plain.student?.class || '—',
          section: plain.student?.section || '',
          roll: plain.student?.roll || '—',
          phone: plain.student?.phone || '',
        },
        items,
      };
    });

    return NextResponse.json({
      orders: formattedOrders,
      availableDates: dateRows,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('[/api/orders/sheet] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
