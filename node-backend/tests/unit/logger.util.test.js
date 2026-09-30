'use strict';

const fs = require('fs');
const path = require('path');
const logger = require('../../src/utils/logger.util');

describe('Logger Utility & Error with User Details', () => {
  const logsDir = path.join(__dirname, '..', '..', 'logs');
  const errorLogPath = path.join(logsDir, 'error.log');

  it('should redact sensitive keys from objects', () => {
    const sensitive = {
      phone: '9876543210',
      password: 'secretPassword123',
      otp: '123456',
      token: 'jwt.token.here',
      nested: {
        access_token: 'secret_token',
        amount: 250,
      }
    };

    const redacted = logger.redactSensitive(sensitive);
    expect(redacted.phone).toBe('9876543210');
    expect(redacted.password).toBe('[REDACTED]');
    expect(redacted.otp).toBe('[REDACTED]');
    expect(redacted.token).toBe('[REDACTED]');
    expect(redacted.nested.access_token).toBe('[REDACTED]');
    expect(redacted.nested.amount).toBe(250);
  });

  it('should extract user details from authenticated student request', () => {
    const mockReq = {
      method: 'POST',
      originalUrl: '/api/v1/orders',
      ip: '192.168.1.50',
      headers: { 'user-agent': 'Mapstreak-App/1.0' },
      user: {
        id: 10,
        role: 'student',
        name: 'Rahul Sharma',
        phone: '9876543210',
        class: '10',
        section: 'B',
        roll: '25',
        school_id: 1,
      },
      body: { items: [{ item_id: 1, quantity: 2 }] },
    };

    const userDetails = logger.extractUserDetails(mockReq);
    expect(userDetails.userId).toBe(10);
    expect(userDetails.role).toBe('student');
    expect(userDetails.name).toBe('Rahul Sharma');
    expect(userDetails.phone).toBe('9876543210');
    expect(userDetails.class).toBe('10');
    expect(userDetails.section).toBe('B');
    expect(userDetails.roll).toBe('25');
    expect(userDetails.schoolId).toBe(1);
    expect(userDetails.ip).toBe('192.168.1.50');
    expect(userDetails.userAgent).toBe('Mapstreak-App/1.0');
  });

  it('should extract user phone and IP from unauthenticated OTP request', () => {
    const mockReq = {
      method: 'POST',
      originalUrl: '/api/v1/auth/student/send-otp',
      ip: '10.0.0.5',
      headers: { 'user-agent': 'Chrome/120.0' },
      body: { phone: '9988776655' },
    };

    const userDetails = logger.extractUserDetails(mockReq);
    expect(userDetails.phone).toBe('9988776655');
    expect(userDetails.ip).toBe('10.0.0.5');
    expect(userDetails.userAgent).toBe('Chrome/120.0');
  });

  it('should log structured error with user details into error.log file', async () => {
    const mockReq = {
      method: 'POST',
      originalUrl: '/api/v1/orders',
      ip: '192.168.1.99',
      headers: { 'user-agent': 'Mobile-Android' },
      user: {
        id: 42,
        role: 'student',
        name: 'Sujal Singh',
        phone: '9123456789',
        class: '12',
        section: 'A',
        roll: '100',
        school_id: 2,
      },
      params: { canteenId: 'c-1' },
      query: { dryRun: 'false' },
      body: { items: [], password: 'hiddenPassword' },
    };

    const testError = new Error('Test Insufficient Wallet Balance');
    testError.statusCode = 400;

    logger.logError(testError, mockReq);

    // Allow winston asynchronous write to flush
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(fs.existsSync(errorLogPath)).toBe(true);
    const logContent = fs.readFileSync(errorLogPath, 'utf8');

    expect(logContent).toContain('Test Insufficient Wallet Balance');
    expect(logContent).toContain('Sujal Singh');
    expect(logContent).toContain('9123456789');
    expect(logContent).toContain('Class 12 - Sec A (Roll #100)');
    expect(logContent).toContain('POST /api/v1/orders');
    expect(logContent).toContain('192.168.1.99');
    expect(logContent).toContain('[REDACTED]');
  });
});
