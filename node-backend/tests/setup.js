require('dotenv').config({ path: '.env' });
const { sequelize } = require('../src/config/database');
const { connectDB } = require('../src/config/database');

beforeAll(async () => {
  // Sync DB for testing
  await connectDB();
});

afterAll(async () => {
  await sequelize.close();
});
