import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/config/database';
import { writeFile } from 'fs/promises';
import path from 'path';
const { MenuItem } = require('@/models');

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role === 'staff') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    
    // Check content type to see if it's JSON or FormData (for compatibility if needed, but we'll always send FormData from UI now)
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
        const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const filepath = path.join(process.cwd(), 'public', 'uploads', 'menu', filename);
        await writeFile(filepath, buffer);
        data.image_url = `/uploads/menu/${filename}`;
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
    console.error(error);
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
