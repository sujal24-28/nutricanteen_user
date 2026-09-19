'use strict';

const msg91Config = {
  authKey:          process.env.MSG91_AUTH_KEY,
  senderId:         process.env.MSG91_SENDER_ID   || 'NTRCNT',
  route:            process.env.MSG91_ROUTE        || '4',
  loginTemplateId:  process.env.MSG91_LOGIN_TEMPLATE_ID,
  topupTemplateId:  process.env.MSG91_TOPUP_TEMPLATE_ID,
  baseUrl:          'https://api.msg91.com/api/v5',
};

module.exports = msg91Config;
