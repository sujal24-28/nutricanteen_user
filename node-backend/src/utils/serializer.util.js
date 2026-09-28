'use strict';

const { parseRupees } = require('./money.util');

/**
 * Sanitize student model for public / API responses.
 * Never returns internal soft-delete flags or raw database metadata.
 */
const serializeStudent = (student) => {
  if (!student) return null;
  const s = student.toJSON ? student.toJSON() : student;
  return {
    id:             s.id,
    name:           s.name,
    class:          s.class,
    roll:           s.roll,
    section:        s.section,
    phone:          s.phone,
    avatar:         s.avatar || null,
    wallet_balance: parseRupees(s.wallet_balance),
    is_active:      Boolean(s.is_active),
    school_id:      s.school_id || null,
    created_at:     s.created_at,
  };
};

/**
 * Sanitize admin model for API responses.
 * Strips password_hash and private fields completely.
 */
const serializeAdmin = (admin) => {
  if (!admin) return null;
  const a = admin.toJSON ? admin.toJSON() : admin;
  return {
    id:        a.id,
    name:      a.name,
    email:     a.email,
    role:      a.role,
    is_active: Boolean(a.is_active),
  };
};

/**
 * Sanitize order model with nested items and safe student summary.
 */
const serializeOrder = (order) => {
  if (!order) return null;
  const o = order.toJSON ? order.toJSON() : order;
  return {
    id:            o.id,
    student_id:    o.student_id,
    total_amount:  parseRupees(o.total_amount),
    status:        o.status,
    pickup_time:   o.pickup_time,
    note:          o.note || null,
    cancel_reason: o.cancel_reason || null,
    cancelled_at:  o.cancelled_at || null,
    created_at:    o.created_at,
    items: Array.isArray(o.items)
      ? o.items.map((i) => ({
          id:         i.id,
          item_id:    i.item_id,
          quantity:   i.quantity,
          unit_price: parseRupees(i.unit_price),
          menuItem:   i.menuItem
            ? {
                id:        i.menuItem.id,
                name:      i.menuItem.name,
                image_url: i.menuItem.image_url || null,
              }
            : null,
        }))
      : [],
    student: o.student
      ? {
          id:      o.student.id,
          name:    o.student.name,
          class:   o.student.class,
          roll:    o.student.roll,
          section: o.student.section,
          phone:   o.student.phone,
        }
      : undefined,
  };
};

/**
 * Sanitize wallet transaction ledger entry.
 */
const serializeWalletTxn = (txn) => {
  if (!txn) return null;
  const t = txn.toJSON ? txn.toJSON() : txn;
  return {
    id:            t.id,
    student_id:    t.student_id,
    type:          t.type,
    amount:        parseRupees(t.amount),
    balance_after: parseRupees(t.balance_after),
    ref_id:        t.ref_id || null,
    description:   t.description || null,
    created_at:    t.created_at,
  };
};

module.exports = {
  serializeStudent,
  serializeAdmin,
  serializeOrder,
  serializeWalletTxn,
};
