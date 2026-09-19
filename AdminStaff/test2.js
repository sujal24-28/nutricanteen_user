require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB } = require('./src/config/database');
const { Admin } = require('./src/models');
(async () => {
  await connectDB();
  const hash = await bcrypt.hash('staff123', 10);
  const [staff, createdStaff] = await Admin.findOrCreate({
    where: { email: 'staff@nutricanteen.com' },
    defaults: { name: 'Counter Staff', phone: '1112223334', password_hash: hash, role: 'staff', is_active: true }
  });
  if (!createdStaff) {
    staff.password_hash = hash;
    await staff.save();
  }
  console.log('Staff created');
  process.exit(0);
})();
