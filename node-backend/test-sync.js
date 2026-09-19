require('dotenv').config();
const { sequelize } = require('./src/config/database');

async function test() {
  try {
    const [results] = await sequelize.query('SHOW INDEXES FROM students');
    const keys = results.map(r => r.Key_name);
    
    // Drop all indexes except PRIMARY, phone
    const keysToDrop = keys.filter(k => k !== 'PRIMARY' && k !== 'phone');
    const uniqueKeysToDrop = [...new Set(keysToDrop)];
    
    console.log('Dropping keys:', uniqueKeysToDrop);
    for (const key of uniqueKeysToDrop) {
      await sequelize.query(`ALTER TABLE students DROP INDEX ${key}`);
    }
    console.log('Done cleaning up students table.');
  } catch(e) {
    console.error(e.original || e);
  } finally {
    process.exit();
  }
}
test();
