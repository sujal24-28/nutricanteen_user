'use strict';

const axios    = require('axios');
const msg91Cfg = require('../config/msg91');
const logger   = require('./logger.util');

/**
 * Send an OTP SMS via MSG91 REST API.
 *
 * MSG91 expects the phone with country code (91XXXXXXXXXX for India).
 *
 * @param {string} phone       - 10-digit Indian mobile number
 * @param {string} otp         - plain OTP string
 * @param {'login'|'topup'} purpose
 * @returns {Promise<void>}
 */
const sendOtpViaMSG91 = async (phone, otp, purpose = 'login') => {
  if (!msg91Cfg.authKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('OTP service is not configured');
    }
    logger.warn(`MSG91 is not configured; using development OTP flow for ${phone}`);
    return { sms_dispatched: false, debug_otp: otp };
  }

  const mobile     = `91${phone}`;                  // prefix country code
  const templateId = purpose === 'topup'
    ? msg91Cfg.topupTemplateId
    : msg91Cfg.loginTemplateId;

  const payload = {
    template_id: templateId,
    mobile,
    authkey:     msg91Cfg.authKey,
    otp,
  };

  try {
    const response = await axios.post(
      `${msg91Cfg.baseUrl}/otp`,
      payload,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      }
    );

    if (response.data?.type !== 'success') {
      logger.warn(`MSG91 non-success response for ${mobile}: ${JSON.stringify(response.data)}`);
      throw new Error('OTP delivery failed. Please try again.');
    }

    logger.info(`OTP sent to ${mobile} via MSG91 [purpose: ${purpose}]`);
    return { sms_dispatched: true };
  } catch (err) {
    if (err.response) {
      logger.error(`MSG91 API error: ${JSON.stringify(err.response.data)}`);
    }
    if (process.env.NODE_ENV === 'production') {
      throw new Error('OTP delivery failed. Please try again.');
    }
    logger.warn(`MSG91 failed; returning development OTP for ${phone}`);
    return { sms_dispatched: false, debug_otp: otp };
  }
};

module.exports = { sendOtpViaMSG91 };
