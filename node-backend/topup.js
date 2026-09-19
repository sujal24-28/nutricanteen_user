require('dotenv').config();
const { Student, WalletTransaction } = require('./src/models');
const { sequelize } = require('./src/config/database');
const { Op } = require('sequelize');

async function topUp() {
  try {
    await sequelize.authenticate();
    const student = await Student.findOne({ 
      where: { 
        name: { [Op.like]: '%sujal%' }, 
        class: { [Op.like]: '%12%' }, 
        section: { [Op.like]: '%A%' }, 
        roll: 100 
      } 
    });

    if (!student) {
      console.log('Student not found');
      // Let's print all students to debug
      const all = await Student.findAll();
      console.log('Available students:', all.map(s => `${s.name} (Class ${s.class}-${s.section} #${s.roll})`));
      return;
    }

    const t = await sequelize.transaction();
    try {
      student.wallet_balance = parseFloat(student.wallet_balance) + 2000;
      await student.save({ transaction: t });

      await WalletTransaction.create({
        student_id: student.id,
        type: 'credit',
        amount: 2000,
        balance_after: student.wallet_balance,
        description: 'Demo topup from Admin',
      }, { transaction: t });

      await t.commit();
      console.log('Successfully added 2000 to wallet. New balance:', student.wallet_balance);
    } catch (err) {
      await t.rollback();
      console.error('Transaction failed:', err);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}
topUp();
