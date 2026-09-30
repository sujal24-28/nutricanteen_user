import { NextResponse } from 'next/server';
import { getSession, hasPermission } from '@/lib/auth';
import { connectDB } from '@/config/database';
const { Category, MenuItem } = require('@/models');
const { Op } = require('sequelize');

const DEFAULT_CATEGORIES = [
  { name: 'Morning Recess', slug: 'breakfast', description: 'Quick breakfast & recess snacks' },
  { name: 'Hot Lunch Meals', slug: 'lunch', description: 'Fresh, warm, balanced lunches' },
  { name: 'Nutri-Snacks', slug: 'snacks', description: 'Healthy bites, wraps, and savory snacks' },
  { name: 'Fresh Drinks & Shakes', slug: 'drinks', description: 'Juices, shakes, smoothies, and water' },
  { name: 'Bakery & Sweets', slug: 'bakery', description: 'Fresh muffins, cookies, rolls, and cakes' },
  { name: 'General', slug: 'general', description: 'All-day general canteen meals' }
];

export async function GET() {
  try {
    await connectDB();

    let categories = await Category.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']]
    });

    if (categories.length === 0) {
      for (const def of DEFAULT_CATEGORIES) {
        await Category.findOrCreate({
          where: { slug: def.slug },
          defaults: def
        });
      }

      try {
        const distinctItems = await MenuItem.findAll({
          attributes: ['category'],
          group: ['category']
        });
        for (const item of distinctItems) {
          const rawCat = (item.category || '').trim();
          if (!rawCat) continue;
          const slug = rawCat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'general';
          const formattedName = rawCat.charAt(0).toUpperCase() + rawCat.slice(1);
          await Category.findOrCreate({
            where: { slug },
            defaults: {
              name: formattedName,
              slug,
              description: `${formattedName} items`
            }
          });
        }
      } catch (_) {}

      categories = await Category.findAll({
        where: { is_active: true },
        order: [['name', 'ASC']]
      });
    }

    // Compute item counts
    const counts = await MenuItem.findAll({
      attributes: ['category', [Category.sequelize.fn('COUNT', Category.sequelize.col('id')), 'count']],
      group: ['category']
    });
    const countMap: Record<string, number> = {};
    counts.forEach((c: any) => {
      const raw = c.category ? String(c.category).toLowerCase().trim() : '';
      countMap[raw] = parseInt(c.get('count'), 10) || 0;
    });

    const result = categories.map((cat: any) => {
      const cJson = cat.toJSON();
      const slugCount = countMap[cJson.slug.toLowerCase()] || 0;
      const nameCount = countMap[cJson.name.toLowerCase()] || 0;
      return {
        ...cJson,
        item_count: Math.max(slugCount, nameCount)
      };
    });

    return NextResponse.json({ success: true, data: result }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });
  } catch (error: any) {
    console.error('[/api/categories GET] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !hasPermission(session, 'menu')) {
      return NextResponse.json({ error: 'Unauthorized: insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const trimmedName = String(body.name || '').trim();
    if (!trimmedName) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 422 });
    }

    await connectDB();

    const formattedName = trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1);
    const generatedSlug = String(body.slug || trimmedName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'category';

    const existing = await Category.findOne({
      where: {
        [Op.or]: [
          { name: formattedName },
          { slug: generatedSlug }
        ]
      }
    });

    if (existing) {
      if (!existing.is_active) {
        existing.is_active = true;
        if (body.description) existing.description = body.description;
        await existing.save();
        return NextResponse.json({ success: true, data: existing }, { status: 200 });
      }
      return NextResponse.json({ error: `Category "${formattedName}" already exists` }, { status: 409 });
    }

    const category = await Category.create({
      name: formattedName,
      slug: generatedSlug,
      description: body.description ? String(body.description).trim() : null,
      is_active: true
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    console.error('[/api/categories POST] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
