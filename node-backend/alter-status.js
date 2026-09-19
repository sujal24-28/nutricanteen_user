require('dotenv').config();
const { sequelize } = require('./src/config/database');
async function test() {
  try {
    await sequelize.query("ALTER TABLE orders MODIFY status ENUM('pending', 'accepted', 'confirmed', 'ready', 'delivered', 'cancelled') DEFAULT 'pending';");
    console.log('Done');
  } catch(e) { console.error(e); } finally { process.exit(); }
}
test();
