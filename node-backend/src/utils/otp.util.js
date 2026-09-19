'use strict';

const crypto   = require('crypto');
const bcrypt   = require('bcryptjs');

const OTP_LENGTH = parseInt(process.env.OTP_LENGTH, 10) || 6;

/**
 * Generate a numeric OTP of configurable length.
 * @returns {string}
 */
const generateOtp = () => {
  const min = Math.pow(10, OTP_LENGTH - 1);
  const max = Math.pow(10, OTP_LENGTH) - 1;
  return String(crypto.randomInt(min, max + 1));
};

/**
 * Hash an OTP using bcrypt for safe storage.
 * @param {string} otp
 * @returns {Promise<string>}
 */
const hashOtp = async (otp) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
};

/**
 * Compare a plain OTP against its bcrypt hash.
 * @param {string} otp
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
const compareOtp = async (otp, hash) => bcrypt.compare(otp, hash);

module.exports = { generateOtp, hashOtp, compareOtp };
