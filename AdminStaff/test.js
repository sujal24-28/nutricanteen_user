require('dotenv').config();
const { connectDB, sequelize } = require('./src/config/database');
(async () => {
  await connectDB();
  const [results] = await sequelize.query("SHOW COLUMNS FROM admins WHERE Field = 'role'");
  console.log(results);
  process.exit(0);
})();
