import { NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { connectDB } from '@/config/database';
import { uploadMenuImage } from '@/lib/cloudinary';
const { MenuItem } = require('@/models');

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session, 'menu')) return NextResponse.json({ error: 'Unauthorized: insufficient permissions' }, { status: 403 });

    await connectDB();
    const menu = await MenuItem.findAll({ where: { deleted_at: null }, order: [['name', 'ASC']] });
    return NextResponse.json(menu);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session, 'menu')) return NextResponse.json({ error: 'Unauthorized: insufficient permissions' }, { status: 403 });

    const formData = await req.formData();
    const rawName = (formData.get('name') as string)?.trim() || '';
    const formattedName = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : '';
    const mrpRaw = formData.get('mrp');
    const data: any = {
      name: formattedName,
      description: formData.get('description'),
      price: formData.get('price'),
      mrp: mrpRaw ? parseFloat(mrpRaw as string) : null,
      category: formData.get('category'),
      food_type: formData.get('food_type') || 'veg',
      is_available: formData.get('is_available') === 'true',
    };


    const file = formData.get('image') as File | null;
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      data.image_url = await uploadMenuImage(buffer, file.name);
    }

    await connectDB();
    const item = await MenuItem.create(data);
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
