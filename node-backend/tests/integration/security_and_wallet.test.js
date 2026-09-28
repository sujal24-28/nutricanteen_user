'use strict';

const request = require('supertest');
const app = require('../../src/app');
const { Student, Admin, OtpRecord, WalletTransaction, MenuItem } = require('../../src/models');
const { generateAccessToken } = require('../../src/utils/jwt.util');
const { hashOtp } = require('../../src/utils/otp.util');

describe('Security & Wallet Integration Tests', () => {
  let studentToken;
  let testStudent;

  beforeAll(async () => {
    // Create test student
    testStudent = await Student.create({
      name: 'Security Test Student',
      class: '10',
      roll: '99',
      section: 'A',
      phone: '9876543210',
      wallet_balance: 100.00,
      is_active: true,
    });
    studentToken = generateAccessToken({ id: testStudent.id, role: 'student' });
  });

  afterAll(async () => {
    await Student.destroy({ where: { phone: '9876543210' }, force: true });
  });

  describe('Health Endpoint', () => {
    it('should return health metrics with status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.database).toBe('ok');
      expect(res.body.uptime_seconds).toBeDefined();
    });
  });

  describe('OTP Security & Resend Cooldown', () => {
    it('should reject OTP request with invalid phone format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/student/send-otp')
        .send({ phone: '12345' });
      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should send OTP and reject rapid second request with 429 cooldown', async () => {
      // First request
      const res1 = await request(app)
        .post('/api/v1/auth/student/send-otp')
        .send({ phone: '9876543210' });
      expect(res1.statusCode).toBe(200);
      expect(res1.body.success).toBe(true);

      // Immediate second request (within 30 seconds) -> 429
      const res2 = await request(app)
        .post('/api/v1/auth/student/send-otp')
        .send({ phone: '9876543210' });
      expect(res2.statusCode).toBe(429);
      expect(res2.body.message).toMatch(/second.*before requesting another OTP/i);
    });
  });

  describe('Order Input Validation & Free Food Attack Prevention', () => {
    it('should reject order placement with quantity 0 or negative', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          items: [{ item_id: 1, quantity: 0 }],
        });
      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should reject order placement with invalid item_id', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          items: [{ item_id: -5, quantity: 2 }],
        });
      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Wallet Topup Validation', () => {
    it('should reject wallet topup verify with missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/wallet/topup/verify')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          razorpay_order_id: '',
          razorpay_payment_id: '',
          razorpay_signature: '',
          amount: 0,
        });
      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });
});
