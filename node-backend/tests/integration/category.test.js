const request = require('supertest');
const app = require('../../src/app');
const { Category, Admin } = require('../../src/models');
const { generateAccessToken } = require('../../src/utils/jwt.util');

describe('Category Integration Tests', () => {
  let adminToken;

  beforeAll(async () => {
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

  it('should list categories (public)', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should reject creating category without admin token', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .send({ name: 'Juices & Shakes' });
    expect(res.statusCode).toEqual(401);
  });

  it('should allow admin to create a new category', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Healthy Smoothies', description: 'Fresh fruit smoothies' });
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Healthy Smoothies');
    expect(res.body.data.slug).toBe('healthy-smoothies');
  });

  it('should reject creating duplicate category', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Healthy Smoothies' });
    expect(res.statusCode).toEqual(409);
  });

  it('should allow admin to delete a category', async () => {
    const created = await Category.findOne({ where: { slug: 'healthy-smoothies' } });
    expect(created).not.toBeNull();

    const res = await request(app)
      .delete(`/api/v1/categories/${created.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);

    const check = await Category.findByPk(created.id);
    expect(check).toBeNull();
  });
});
