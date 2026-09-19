require('dotenv').config();
const { sequelize } = require('./src/config/database');

async function updatePhones() {
  await sequelize.query("UPDATE admins SET phone='9999999999' WHERE email='super@school.edu'");
  await sequelize.query("UPDATE admins SET phone='8888888888' WHERE email='staff@school.edu'");
  console.log('Phone numbers updated for test admins.');
  process.exit(0);
}
updatePhones();
