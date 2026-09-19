const { generateOtp, hashOtp, compareOtp } = require('../../src/utils/otp.util');

describe('OTP Utility', () => {
  it('should generate a 6-digit OTP by default', () => {
    const otp = generateOtp();
    expect(otp).toHaveLength(6);
    expect(parseInt(otp, 10)).toBeGreaterThanOrEqual(100000);
    expect(parseInt(otp, 10)).toBeLessThanOrEqual(999999);
  });

  it('should correctly hash and compare OTP', async () => {
    const otp = '123456';
    const hash = await hashOtp(otp);
    expect(hash).not.toBe(otp);

    const isValid = await compareOtp(otp, hash);
    expect(isValid).toBe(true);
  });

  it('should return false for invalid OTP comparison', async () => {
    const otp = '123456';
    const hash = await hashOtp(otp);

    const isValid = await compareOtp('654321', hash);
    expect(isValid).toBe(false);
  });
});
