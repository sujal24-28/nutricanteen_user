require('dotenv').config({ path: '.env.example' });
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../../src/utils/jwt.util');

describe('JWT Utility', () => {
  it('should generate and verify an access token', () => {
    const payload = { id: 1, role: 'student' };
    const token = generateAccessToken(payload);
    
    expect(typeof token).toBe('string');
    
    const decoded = verifyToken(token, 'access');
    expect(decoded.id).toBe(1);
    expect(decoded.role).toBe('student');
    expect(decoded.exp).toBeDefined();
  });

  it('should generate and verify a refresh token', () => {
    const payload = { id: 2, role: 'admin' };
    const token = generateRefreshToken(payload);
    
    expect(typeof token).toBe('string');
    
    const decoded = verifyToken(token, 'refresh');
    expect(decoded.id).toBe(2);
    expect(decoded.role).toBe('admin');
  });

  it('should throw an error for invalid token verification', () => {
    const token = 'invalid.token.string';
    
    expect(() => verifyToken(token, 'access')).toThrow();
  });
});
