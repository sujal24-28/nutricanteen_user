const request = require('supertest');
const app = require('../../src/app');
const { MenuItem } = require('../../src/models');
const { generateAccessToken } = require('../../src/utils/jwt.util');

describe('Menu Integration Tests', () => {
  let adminToken;

  beforeAll(() => {
    // Mock admin token
    adminToken = generateAccessToken({ id: 1, role: 'superadmin' });
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
