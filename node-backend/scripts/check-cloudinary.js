'use strict';

require('dotenv').config();
const cloudinary = require('cloudinary').v2;

console.log('\n========================================');
console.log('   CLOUDINARY CONFIGURATION TEST');
console.log('========================================\n');

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const cloudinaryUrl = process.env.CLOUDINARY_URL;

console.log('1. Checking Environment Variables:');
console.log(`   CLOUDINARY_CLOUD_NAME:  ${cloudName ? `"${cloudName}"` : '(not set)'}`);
console.log(`   CLOUDINARY_API_KEY:     ${apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 3)}` : '(not set)'}`);
console.log(`   CLOUDINARY_API_SECRET:  ${apiSecret ? '****** (configured)' : '(not set)'}`);
if (cloudinaryUrl) {
  console.log(`   CLOUDINARY_URL:         ${cloudinaryUrl.substring(0, 20)}...`);
}

if ((!cloudName || !apiKey || !apiSecret) && !cloudinaryUrl) {
  console.log('\n❌ ERROR: Cloudinary environment variables are missing.');
  console.log('   Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.');
  process.exit(1);
}

if (cloudinaryUrl) {
  cloudinary.config();
} else {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

console.log('\n2. Testing Cloudinary API Authentication Ping:');

cloudinary.api.ping((err, res) => {
  if (err) {
    console.log(`\n❌ PING FAILED: [${err.http_code || 'Error'}] ${err.message}`);

    if (err.message && err.message.includes('cloud_name mismatch')) {
      console.log('\n-----------------------------------------------------------');
      console.log('⚠️  ACTION REQUIRED: "cloud_name mismatch" detected!');
      console.log('-----------------------------------------------------------');
      console.log(`Your API Key (${apiKey}) does NOT belong to cloud name "${cloudName}".`);
      console.log('\nHow to fix this:');
      console.log('1. Go to your Cloudinary Console: https://cloudinary.com/console');
      console.log('2. Look at "Cloud name" in Account Details (top of the dashboard).');
      console.log('3. Copy that exact Cloud name and update CLOUDINARY_CLOUD_NAME in:');
      console.log('   - food delivery app/AdminStaff/.env');
      console.log('   - food delivery app/node-backend/.env');
      console.log('4. Run this script again: node scripts/check-cloudinary.js\n');
    }
    process.exit(1);
  }

  console.log('   ✅ Cloudinary API ping SUCCESSFUL! Status:', res.status);
  console.log('\n3. Testing Sample Upload to Cloudinary (nutricanteen/test)...');

  // Small 1x1 transparent PNG data URI
  const sampleDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

  cloudinary.uploader.upload(sampleDataUri, { folder: 'nutricanteen/test' }, (uploadErr, uploadRes) => {
    if (uploadErr) {
      console.log('\n❌ SAMPLE UPLOAD FAILED:', uploadErr.message);
      process.exit(1);
    }

    console.log('   ✅ Test image uploaded successfully!');
    console.log('   Permanent Cloudinary URL:', uploadRes.secure_url);
    console.log('\n🎉 ALL CHECKS PASSED: Cloudinary is completely configured and working!\n');

    // Clean up test image
    if (uploadRes.public_id) {
      cloudinary.uploader.destroy(uploadRes.public_id, () => {
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
});
