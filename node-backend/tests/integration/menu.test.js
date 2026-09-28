const request = require('supertest');
const app = require('../../src/app');
const { MenuItem, Admin } = require('../../src/models');
const { generateAccessToken } = require('../../src/utils/jwt.util');

describe('Menu Integration Tests', () => {
  let adminToken;

  beforeAll(async () => {
    // Create test admin in DB for DB-backed protectAdmin middleware
    const [admin] = await Admin.findOrCreate({
      where: { id: 1 },
      defaults: {
        name: 'Test Superadmin',
        email: 'testadmin@nutricanteen.com',
        password_hash: 'testhash',
        role: 'superadmin',
        is_active: true,
      },
    });
    adminToken = generateAccessToken({ id: admin.id, role: admin.role });
  });

  beforeEach(async () => {
    // Clear MenuItems table before each test
    await MenuItem.destroy({ where: {}, force: true });
  });

  it('should list available menu items', async () => {
    await MenuItem.create({
      name: 'Burger',
      price: 5.99,
      category: 'Snacks',
      is_available: true,
    });

    const res = await request(app).get('/api/v1/menu');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].name).toBe('Burger');
  });

  it('should not allow unauthenticated users to create menu item', async () => {
    const res = await request(app).post('/api/v1/menu').send({
      name: 'Pizza',
      price: 10.99,
      category: 'Lunch',
    });
    expect(res.statusCode).toEqual(401);
  });

  it('should allow admin to create menu item', async () => {
    const res = await request(app)
      .post('/api/v1/menu')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', 'Pizza')
      .field('price', 10.99)
      .field('category', 'Lunch');

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Pizza');
    expect(res.body.data.price).toBe(10.99); // Returned as number because of parseFloat in service
  });

  it('should allow admin to upload a photo for menu item', async () => {
    // Valid 8-byte PNG header + dummy chunk so magic-byte validation passes
    const validPngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00]);

    const res = await request(app)
      .post('/api/v1/menu')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', 'Pasta with Image')
      .field('price', 12.99)
      .field('category', 'Lunch')
      .attach('image', validPngBuffer, 'valid.png');

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.image_url).toBeDefined();
    expect(res.body.data.image_url).toMatch(/^\/uploads\//);
  });

  it('should allow admin to delete menu item', async () => {
    const item = await MenuItem.create({
      name: 'Soda',
      price: 1.99,
      category: 'Beverages',
      is_available: true,
    });

    const res = await request(app)
      .delete(`/api/v1/menu/${item.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    
    // Check if it's soft deleted
    const foundItem = await MenuItem.findByPk(item.id);
    expect(foundItem).toBeNull();
  });
});
