'use strict';

/**
 * Safe integer-paise arithmetic for monetary calculations.
 *
 * All amounts stored in MySQL as DECIMAL(10,2) INR.
 * Sequelize returns DECIMAL columns as JavaScript strings (e.g. "70.00").
 * parseFloat() on those strings is safe for parsing but floating-point
 * arithmetic (add/subtract) can accumulate drift over many operations
 * (e.g. 0.1 + 0.2 === 0.30000000000000004).
 *
 * This module converts to integer paise (×100) for all arithmetic,
 * then converts back to a 2-decimal INR string / number for storage.
 *
 * Usage:
 *   const { toPaise, toRupees, addRupees, subRupees } = require('../utils/money.util');
 *
 *   const balance = toRupees(addRupees('100.50', '49.50')); // → 150.00
 */

/**
 * Convert an INR value (string or number) to integer paise.
 * e.g. "70.50" → 7050
 */
const toPaise = (rupees) => Math.round(parseFloat(rupees) * 100);

/**
 * Convert integer paise back to a JS number with exactly 2 decimal places.
 * e.g. 7050 → 70.50
 */
const toRupees = (paise) => paise / 100;

/**
 * Add two INR values (strings/numbers) and return a JS number.
 * e.g. addRupees('100.10', '0.20') → 100.30  (not 100.30000000000001)
 */
const addRupees = (a, b) => toRupees(toPaise(a) + toPaise(b));

/**
 * Subtract b from a (INR values) and return a JS number.
 * e.g. subRupees('100.00', '70.00') → 30.00
 */
const subRupees = (a, b) => toRupees(toPaise(a) - toPaise(b));

/**
 * Multiply an INR value by an integer quantity and return a JS number.
 * e.g. mulRupees('70.00', 3) → 210.00
 */
const mulRupees = (price, qty) => toRupees(toPaise(price) * qty);

/**
 * Round-trip safe: parse a DB DECIMAL string to a displayable number.
 * For read-only conversions where no arithmetic is needed.
 */
const parseRupees = (val) => toRupees(toPaise(val || 0));

module.exports = { toPaise, toRupees, addRupees, subRupees, mulRupees, parseRupees };
