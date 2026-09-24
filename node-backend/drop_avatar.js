require('dotenv').config();
const { sequelize } = require('./src/config/database');
async function drop() {
  try {
    await sequelize.query('ALTER TABLE students DROP COLUMN avatar');
    console.log('Avatar column dropped.');
  } catch (e) {
    console.log('Column might not exist or error:', e.message);
  }
  process.exit(0);
}
drop();
