'use strict';

const { Sequelize } = require('sequelize');

const isTest = process.env.NODE_ENV === 'test';

let sequelize = global.sequelize;

if (!sequelize) {
  sequelize = isTest 
    ? new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false,
        define: {
          underscored: true,
          freezeTableName: false,
          timestamps: true,
        }
      })
    : new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
          host:    process.env.DB_HOST || 'localhost',
          port:    parseInt(process.env.DB_PORT, 10) || 3306,
          dialect: 'mysql',
          logging: false, // disable logging for cleaner terminal
          pool: {
            max:     10,
            min:     0,
            acquire: 30000,
            idle:    10000,
          },
          define: {
            underscored:   true,
            freezeTableName: false,
            timestamps:    true,
          },
          timezone: '+05:30',
        }
      );
      
      if (process.env.NODE_ENV !== 'production') {
        global.sequelize = sequelize;
      }
}

/**
 * Connect to MySQL and sync all models.
 * Call once at startup (server.js).
 */
async function connectDB() {
  await sequelize.authenticate();
  console.log('✅ MySQL connection established.');

  // Import models so they register themselves with sequelize
  require('../models');

  console.log('✅ Database connected and models registered (sync disabled).');
}

module.exports = { sequelize, connectDB };
