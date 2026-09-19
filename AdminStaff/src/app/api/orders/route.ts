import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/config/database';
const { Order, OrderItem, MenuItem, Student } = require('@/models');

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    
    // Fetch orders for today or just recent active orders
    const orders = await Order.findAll({
      where: {
        status: ['pending', 'confirmed', 'ready']
      },
      include: [
        { model: Student, as: 'student', attributes: ['id', 'name', 'class', 'section', 'roll', 'phone'] },
        { 
          model: OrderItem, 
          as: 'items',
          include: [{ model: MenuItem, as: 'menuItem', attributes: ['name'] }]
        }
      ],
      order: [['created_at', 'ASC']]
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

