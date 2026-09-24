require('dotenv').config();
const { sequelize } = require('./src/config/database');
async function check() {
  const [admins] = await sequelize.query('SELECT * FROM admins');
  console.log('Admins:', admins);
  process.exit(0);
}
check();
