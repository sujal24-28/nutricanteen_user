require('dotenv').config();
const { connectDB, sequelize } = require('./src/config/database');
(async () => {
  await connectDB();
  const [results] = await sequelize.query("SHOW COLUMNS FROM orders WHERE Field = 'status'");
  console.log(results);
  process.exit(0);
})();
