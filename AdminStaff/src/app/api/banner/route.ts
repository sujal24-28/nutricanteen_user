import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/config/database';
import { uploadMenuImage } from '@/lib/cloudinary';
import fs from 'fs';
import path from 'path';

const { Banner } = require('@/models');

const FALLBACK_FILE = path.join(process.cwd(), '..', 'node-backend', 'uploads', 'banner_config.json');

const DEFAULT_BANNERS = [
  {
    id: 'default-1',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200',
    title: 'Fresh & Nutritious Meals',
    subtitle: 'Hygienic and wholesome food prepared fresh daily!',
  },
  {
    id: 'default-2',
    imageUrl: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&q=80&w=1200',
    title: 'Healthy Campus Bites',
    subtitle: 'Balanced nutrition for energy all school day!',
  },
  {
    id: 'default-3',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=1200',
    title: 'Hot & Oven-Fresh Snacks',
    subtitle: 'Pre-order now and skip the long recess queue!',
  },
];

function readFallback() {
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      return JSON.parse(fs.readFileSync(FALLBACK_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading banner fallback:', e);
  }
  return null;
}

function writeFallback(data: any) {
  try {
    const dir = path.dirname(FALLBACK_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing banner fallback:', e);
  }
}

export async function GET() {
  try {
    // 1. Try DB
    try {
      await connectDB();
      const records = await Banner.findAll({ where: { is_active: true }, order: [['id', 'ASC']] });
      if (records && records.length > 0 && records.some((r: any) => r.image_url)) {
        const valid = records.filter((r: any) => r.image_url).map((r: any) => ({
          id: r.id.toString(),
          imageUrl: r.image_url,
          title: r.title || 'Fresh & Nutritious Meals',
          subtitle: r.subtitle || 'Hygienic and wholesome food prepared fresh daily!',
        }));
        return NextResponse.json({
          banners: valid,
          imageUrl: valid[0]?.imageUrl || null,
          title: valid[0]?.title || '',
          subtitle: valid[0]?.subtitle || '',
          isCustom: true,
        });
      }
    } catch (e) {
      console.warn('DB lookup failed, checking file fallback:', e);
    }

    // 2. Try Fallback File
    const fileFallback = readFallback();
    if (fileFallback?.banners && Array.isArray(fileFallback.banners) && fileFallback.banners.length > 0) {
      return NextResponse.json({
        banners: fileFallback.banners,
        imageUrl: fileFallback.banners[0]?.imageUrl || null,
        title: fileFallback.banners[0]?.title || '',
        subtitle: fileFallback.banners[0]?.subtitle || '',
        isCustom: true,
      });
    }

    // 3. Default multi-slide banners
    return NextResponse.json({
      banners: DEFAULT_BANNERS,
      imageUrl: DEFAULT_BANNERS[0].imageUrl,
      title: DEFAULT_BANNERS[0].title,
      subtitle: DEFAULT_BANNERS[0].subtitle,
      isCustom: false,
    });
  } catch (error) {
    return NextResponse.json({
      banners: DEFAULT_BANNERS,
      imageUrl: DEFAULT_BANNERS[0].imageUrl,
      title: DEFAULT_BANNERS[0].title,
      subtitle: DEFAULT_BANNERS[0].subtitle,
      isCustom: false,
    });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role === 'staff') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const reset = formData.get('reset') === 'true';
    const deleteId = formData.get('deleteId') as string | null;
    const title = (formData.get('title') as string) || 'Fresh & Nutritious Meals';
    const subtitle = (formData.get('subtitle') as string) || 'Hygienic and wholesome food prepared fresh daily!';

    let config = readFallback() || { banners: [], isCustom: false };
    if (!Array.isArray(config.banners)) config.banners = [];

    // Case 1: Reset all
    if (reset) {
      config = { banners: [], isCustom: false };
      writeFallback(config);
      try {
        await connectDB();
        await Banner.destroy({ where: {} });
      } catch (e) {}

      return NextResponse.json({
        success: true,
        banners: DEFAULT_BANNERS,
        isCustom: false,
      });
    }

    // Case 2: Delete single slide
    if (deleteId) {
      config.banners = config.banners.filter((b: any) => b.id.toString() !== deleteId.toString());
      config.isCustom = config.banners.length > 0;
      writeFallback(config);
      try {
        await connectDB();
        await Banner.destroy({ where: { id: deleteId } });
      } catch (e) {}

      return NextResponse.json({
        success: true,
        banners: config.banners.length > 0 ? config.banners : DEFAULT_BANNERS,
        isCustom: config.banners.length > 0,
      });
    }

    // Case 3: Add new slide
    const file = formData.get('image') as File | null;
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const imageUrl = await uploadMenuImage(buffer, file.name);

      let createdId = Date.now().toString();

      try {
        await connectDB();
        const record = await Banner.create({
          image_url: imageUrl,
          title,
          subtitle,
          is_active: true,
        });
        if (record?.id) createdId = record.id.toString();
      } catch (e) {
        console.warn('DB create failed, relying on file config:', e);
      }

      const newSlide = {
        id: createdId,
        imageUrl,
        title,
        subtitle,
      };

      config.banners.push(newSlide);
      config.isCustom = true;
      writeFallback(config);

      return NextResponse.json({
        success: true,
        banners: config.banners,
        isCustom: true,
      });
    }

    return NextResponse.json({
      success: true,
      banners: config.banners.length > 0 ? config.banners : DEFAULT_BANNERS,
      isCustom: config.banners.length > 0,
    });
  } catch (error: any) {
    console.error('Failed to update banners:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
