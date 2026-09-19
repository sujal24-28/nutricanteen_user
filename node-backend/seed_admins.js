const { sequelize } = require('./src/config/database');
const { Admin } = require('./src/models');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    await sequelize.authenticate();
    
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash('password123', salt);

    await Admin.findOrCreate({
      where: { email: 'super@school.edu' },
      defaults: { name: 'Super Admin', email: 'super@school.edu', password_hash: hash, role: 'superadmin' }
    });

    await Admin.findOrCreate({
      where: { email: 'admin@school.edu' },
      defaults: { name: 'Admin', email: 'admin@school.edu', password_hash: hash, role: 'admin' }
    });

    await Admin.findOrCreate({
      where: { email: 'staff@school.edu' },
      defaults: { name: 'Canteen Staff', email: 'staff@school.edu', password_hash: hash, role: 'staff' }
    });

    console.log('Seeded admins: super@school.edu, admin@school.edu, staff@school.edu (password: password123)');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
seed();
