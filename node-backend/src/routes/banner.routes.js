'use strict';

const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const { upload } = require('../middlewares/upload.middleware');
const { protectAdmin } = require('../middlewares/auth.middleware');
const { Banner } = require('../models');
const logger = require('../utils/logger.util');
const { uploadToCloudinary } = require('../utils/cloudinary.util');

const CONFIG_PATH = path.join(__dirname, '..', '..', 'uploads', 'banner_config.json');

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

function readConfigFallback() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      return data;
    }
  } catch (e) {
    logger.warn('Failed to read banner_config.json fallback', { error: e.message });
  }
  return null;
}

function writeConfigFallback(data) {
  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    logger.warn('Failed to write banner_config.json fallback', { error: e.message });
  }
}

// GET /api/v1/banner
router.get('/', async (req, res) => {
  try {
    // Check DB first
    let dbBanners = [];
    try {
      dbBanners = await Banner.findAll({
        where: { is_active: true },
        order: [['id', 'ASC']]
      });
    } catch (dbErr) {
      logger.warn('Banner.findAll DB failed, using file fallback', { error: dbErr.message });
    }

    if (dbBanners && dbBanners.length > 0 && dbBanners.some(b => b.image_url)) {
      const valid = dbBanners.filter(b => b.image_url).map(b => ({
        id: b.id.toString(),
        imageUrl: b.image_url,
        title: b.title || 'Fresh & Nutritious Meals',
        subtitle: b.subtitle || 'Hygienic and wholesome food prepared fresh daily!',
      }));
      return res.status(200).json({
        success: true,
        data: {
          banners: valid,
          imageUrl: valid[0]?.imageUrl || null,
          title: valid[0]?.title || '',
          subtitle: valid[0]?.subtitle || '',
          isCustom: true,
        },
      });
    }

    // Check file fallback
    const fileFallback = readConfigFallback();
    if (fileFallback?.banners && Array.isArray(fileFallback.banners) && fileFallback.banners.length > 0) {
      return res.status(200).json({
        success: true,
        data: {
          banners: fileFallback.banners,
          imageUrl: fileFallback.banners[0]?.imageUrl || null,
          title: fileFallback.banners[0]?.title || '',
          subtitle: fileFallback.banners[0]?.subtitle || '',
          isCustom: true,
        },
      });
    }

    // Fall back to default multi-slide banners
    return res.status(200).json({
      success: true,
      data: {
        banners: DEFAULT_BANNERS,
        imageUrl: DEFAULT_BANNERS[0].imageUrl,
        title: DEFAULT_BANNERS[0].title,
        subtitle: DEFAULT_BANNERS[0].subtitle,
        isCustom: false,
      },
    });
  } catch (err) {
    logger.error('Error fetching banners', { error: err.message });
    return res.status(200).json({
      success: true,
      data: {
        banners: DEFAULT_BANNERS,
        imageUrl: DEFAULT_BANNERS[0].imageUrl,
        title: DEFAULT_BANNERS[0].title,
        subtitle: DEFAULT_BANNERS[0].subtitle,
        isCustom: false,
      },
    });
  }
});

// POST /api/v1/banner (Admin upload/update/delete) — requires admin auth
router.post('/', protectAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, subtitle, reset, deleteId } = req.body;
    let config = readConfigFallback() || { banners: [], isCustom: false };
    if (!Array.isArray(config.banners)) config.banners = [];

    // Case 1: Reset all to default
    if (reset === 'true' || reset === true) {
      config = { banners: [], isCustom: false };
      writeConfigFallback(config);
      try {
        await Banner.destroy({ where: {} });
      } catch (e) {}

      return res.status(200).json({
        success: true,
        data: {
          banners: DEFAULT_BANNERS,
          isCustom: false,
        },
      });
    }

    // Case 2: Delete a single banner by ID
    if (deleteId) {
      config.banners = config.banners.filter(b => b.id.toString() !== deleteId.toString());
      config.isCustom = config.banners.length > 0;
      writeConfigFallback(config);
      try {
        await Banner.destroy({ where: { id: deleteId } });
      } catch (e) {}

      return res.status(200).json({
        success: true,
        data: {
          banners: config.banners.length > 0 ? config.banners : DEFAULT_BANNERS,
          isCustom: config.banners.length > 0,
        },
      });
    }

    // Case 3: Upload a new banner slide
    if (req.file) {
      const bannerImageUrl = await uploadToCloudinary(req.file, 'nutricanteen/banners');
      const newBanner = {
        id: Date.now().toString(),
        imageUrl: bannerImageUrl,
        title: title || 'Fresh & Nutritious Meals',
        subtitle: subtitle || 'Hygienic and wholesome food prepared fresh daily!',
      };

      config.banners.push(newBanner);
      config.isCustom = true;
      writeConfigFallback(config);

      try {
        await Banner.create({
          image_url: newBanner.imageUrl,
          title: newBanner.title,
          subtitle: newBanner.subtitle,
          is_active: true,
        });
      } catch (e) {}

      return res.status(200).json({
        success: true,
        data: {
          banners: config.banners,
          isCustom: true,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        banners: config.banners.length > 0 ? config.banners : DEFAULT_BANNERS,
        isCustom: config.banners.length > 0,
      },
    });
  } catch (err) {
    logger.error('Failed to update banner', { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: 'Failed to update banner' });
  }
});

module.exports = router;
