require('dotenv').config();
const { sequelize } = require('./src/config/database');

async function migrate() {
  try {
    await sequelize.authenticate();
    
    // Create schools table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS schools (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        address TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Schools table created or already exists.');

    // Add school_id to students table if not exists
    const [columns] = await sequelize.query("SHOW COLUMNS FROM students LIKE 'school_id'");
    if (columns.length === 0) {
      await sequelize.query(`
        ALTER TABLE students
        ADD COLUMN school_id INT UNSIGNED NULL AFTER id,
        ADD CONSTRAINT fk_student_school
        FOREIGN KEY (school_id) REFERENCES schools(id)
        ON DELETE SET NULL ON UPDATE CASCADE
      `);
      console.log('school_id column added to students table.');
    } else {
      console.log('school_id column already exists.');
    }

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

migrate();
