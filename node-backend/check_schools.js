require('dotenv').config();
const { sequelize } = require('./src/config/database');
async function check() {
  const [schools] = await sequelize.query('SELECT * FROM schools');
  console.log('Schools:', schools);
  process.exit(0);
}
check();
