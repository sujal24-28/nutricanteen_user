import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/config/database';
import { writeFile } from 'fs/promises';
import path from 'path';
const { MenuItem } = require('@/models');

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
    if (!session || session.role === 'staff') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const data: any = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: formData.get('price'),
      category: formData.get('category'),
      is_available: formData.get('is_available') === 'true',
    };

    const file = formData.get('image') as File | null;
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const filepath = path.join(process.cwd(), '..', 'node-backend', 'uploads', filename);
      await writeFile(filepath, buffer);
      data.image_url = `/uploads/${filename}`;
    }

    await connectDB();
    const item = await MenuItem.create(data);
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
