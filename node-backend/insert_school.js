require('dotenv').config();
const { sequelize } = require('./src/config/database');
async function insert() {
  await sequelize.query("INSERT INTO schools (name, address) VALUES ('St. Xavier High School', '123 Main St, Mumbai')");
  console.log('School inserted!');
  process.exit(0);
}
insert();
