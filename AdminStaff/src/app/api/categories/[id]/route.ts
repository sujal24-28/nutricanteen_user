import { NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { connectDB } from '@/config/database';
const { Category, MenuItem } = require('@/models');
const { Op } = require('sequelize');

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session, 'menu')) {
      return NextResponse.json({ error: 'Unauthorized: insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();

    const category = await Category.findByPk(id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Reassign any menu items with this category to 'General'
    try {
      await MenuItem.update(
        { category: 'General' },
        {
          where: {
            [Op.or]: [
              { category: category.slug },
              { category: category.name }
            ]
          }
        }
      );
    } catch (_) {}

    await category.destroy();

    return NextResponse.json({ success: true, message: `Category "${category.name}" deleted` });
  } catch (error: any) {
    console.error('[/api/categories/[id] DELETE] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
