import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/config/database';
const { Order } = require('@/models');

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role === 'staff') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const orders = await Order.findAll({ where: { status: 'delivered' } });
    
    let totalRevenue = 0;
    orders.forEach((o: any) => {
      totalRevenue += parseFloat(o.total_amount);
    });

    return NextResponse.json({
      totalOrders: orders.length,
      totalRevenue,
      recentOrders: orders.slice(-10).reverse() // Mocking top 10 for MVP
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
