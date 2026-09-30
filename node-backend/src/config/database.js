'use strict';

const { Sequelize } = require('sequelize');
const logger = require('../utils/logger.util');

const isTest = process.env.NODE_ENV === 'test';

const sequelize = isTest 
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
        logging: process.env.DB_LOGGING === 'true' ? (msg) => logger.debug(msg) : false,
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

/**
 * Connect to MySQL and sync all models.
 * Call once at startup (server.js).
 */
async function connectDB() {
  await sequelize.authenticate();
  logger.info('✅ MySQL connection established.');

  // Import models so associations are registered
  require('../models');

  // Only sync schema in development/test — use migrations in production
  if (process.env.NODE_ENV !== 'production') {
    const syncOptions = process.env.NODE_ENV === 'test' ? { force: true } : {};
    await sequelize.sync(syncOptions);
    logger.info('✅ Database models synchronized (development mode).');
  } else {
    logger.info('ℹ️  Production mode: skipping sequelize.sync() — apply schema changes via migrations.');
  }
}

module.exports = { sequelize, connectDB };
