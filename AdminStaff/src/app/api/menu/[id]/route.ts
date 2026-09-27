import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB, sequelize } from '@/config/database';
import { uploadMenuImage } from '@/lib/cloudinary';
const { MenuItem, Order, OrderItem, Student } = require('@/models');

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectDB();

    const item = await MenuItem.findByPk(id);
    if (!item) return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });

    const numericId = parseInt(id, 10);

    // Sales metrics for this menu item
    let stats = { total_sold: 0, total_revenue: 0, total_orders: 0 };
    try {
      const [statsRows]: any = await sequelize.query(`
        SELECT
          COALESCE(SUM(oi.quantity), 0) AS total_sold,
          COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total_revenue,
          COUNT(DISTINCT oi.order_id) AS total_orders
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE oi.item_id = ${numericId} AND o.status != 'cancelled'
      `);
      if (statsRows && statsRows.length > 0) {
        stats = statsRows[0];
      }
    } catch (e) {
      console.warn('Could not query item stats:', e);
    }

    // Recent orders that purchased this item
    let recentOrdersList: any[] = [];
    try {
      const [orderRows]: any = await sequelize.query(`
        SELECT 
          oi.id,
          oi.order_id,
          oi.quantity,
          oi.unit_price,
          o.status AS order_status,
          o.created_at AS order_date,
          s.name AS student_name,
          s.class AS student_class,
          s.section AS student_section,
          s.roll AS student_roll
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        LEFT JOIN students s ON o.student_id = s.id
        WHERE oi.item_id = ${numericId}
        ORDER BY o.created_at DESC, oi.id DESC
        LIMIT 25
      `);

      if (orderRows && orderRows.length > 0) {
        recentOrdersList = orderRows.map((ro: any) => ({
          id: ro.id,
          orderId: ro.order_id,
          quantity: ro.quantity,
          unitPrice: ro.unit_price,
          orderStatus: ro.order_status || 'delivered',
          studentName: ro.student_name || 'Student',
          studentClass: `${ro.student_class || ''} ${ro.student_section || ''}`.trim() || '—',
          studentRoll: ro.student_roll || '—',
          orderDate: ro.order_date
        }));
      }
    } catch (e) {
      console.error('Could not query recent order items:', e);
    }

    return NextResponse.json({
      item,
      stats: {
        totalSold: Number(stats.total_sold || 0),
        totalRevenue: Number(stats.total_revenue || 0),
        totalOrders: Number(stats.total_orders || 0)
      },
      recentOrders: recentOrdersList
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  } catch (error) {
    console.error('[/api/menu/[id] GET] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role === 'staff') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    
    const contentType = req.headers.get('content-type') || '';
    let data: any = {};
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      if (formData.has('name')) data.name = formData.get('name');
      if (formData.has('description')) data.description = formData.get('description');
      if (formData.has('price')) data.price = formData.get('price');
      if (formData.has('category')) data.category = formData.get('category');
      if (formData.has('is_available')) data.is_available = formData.get('is_available') === 'true';

      const file = formData.get('image') as File | null;
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        data.image_url = await uploadMenuImage(buffer, file.name);
      }
    } else {
      data = await req.json();
    }

    await connectDB();
    const item = await MenuItem.findByPk(id);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await item.update(data);
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('[/api/menu/[id] PATCH] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role === 'staff') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectDB();
    const item = await MenuItem.findByPk(id);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    item.deleted_at = new Date();
    await item.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[/api/menu/[id] DELETE] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
