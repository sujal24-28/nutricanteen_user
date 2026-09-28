'use strict';

require('dotenv').config();
const { sequelize } = require('../src/config/database');
const logger = require('../src/utils/logger.util');

const migrations = [
  {
    name: '001_security_and_performance_indexes',
    up: async (queryInterface) => {
      // 1. wallet_transactions.unique_wallet_ref_id
      try {
        await queryInterface.addIndex('wallet_transactions', ['ref_id'], {
          name: 'unique_wallet_ref_id',
          unique: true,
        });
        logger.info('[Migration] Added unique_wallet_ref_id to wallet_transactions');
      } catch (err) {
        logger.info(`[Migration] unique_wallet_ref_id note: ${err.message}`);
      }

      // 2. otp_records.idx_otp_expires_at
      try {
        await queryInterface.addIndex('otp_records', ['expires_at'], {
          name: 'idx_otp_expires_at',
        });
        logger.info('[Migration] Added idx_otp_expires_at to otp_records');
      } catch (err) {
        logger.info(`[Migration] idx_otp_expires_at note: ${err.message}`);
      }

      // 3. orders.idx_orders_created_at
      try {
        await queryInterface.addIndex('orders', ['created_at'], {
          name: 'idx_orders_created_at',
        });
        logger.info('[Migration] Added idx_orders_created_at to orders');
      } catch (err) {
        logger.info(`[Migration] idx_orders_created_at note: ${err.message}`);
      }

      // 4. refresh_tokens composite index
      try {
        await queryInterface.addIndex('refresh_tokens', ['owner_id', 'owner_type', 'is_revoked'], {
          name: 'idx_refresh_owner_active',
        });
        logger.info('[Migration] Added idx_refresh_owner_active to refresh_tokens');
      } catch (err) {
        logger.info(`[Migration] idx_refresh_owner_active note: ${err.message}`);
      }

      // 5. order_items indexes
      try {
        await queryInterface.addIndex('order_items', ['order_id'], {
          name: 'idx_order_items_order_id',
        });
        await queryInterface.addIndex('order_items', ['item_id'], {
          name: 'idx_order_items_item_id',
        });
        logger.info('[Migration] Added order_items indexes');
      } catch (err) {
        logger.info(`[Migration] order_items indexes note: ${err.message}`);
      }

      // 6. students school_id index
      try {
        await queryInterface.addIndex('students', ['school_id'], {
          name: 'idx_students_school_id',
        });
        logger.info('[Migration] Added idx_students_school_id to students');
      } catch (err) {
        logger.info(`[Migration] idx_students_school_id note: ${err.message}`);
      }
    },
  },
];

async function runMigrations() {
  logger.info('🚀 Running database migrations...');
  const queryInterface = sequelize.getQueryInterface();

  for (const m of migrations) {
    logger.info(`▶ Executing migration: ${m.name}`);
    try {
      await m.up(queryInterface);
      logger.info(`✔ Migration ${m.name} completed.`);
    } catch (err) {
      logger.error(`✖ Migration ${m.name} failed: ${err.message}`);
    }
  }

  logger.info('🎉 All migrations finished.');
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { runMigrations };
