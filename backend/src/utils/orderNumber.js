import { Order } from '../models/index.js';

/**
 * Generate a unique order number
 * Format: ORD-YYYYMMDD-XXX
 * @returns {Promise<string>}
 */
export async function generateOrderNumber() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `ORD-${dateStr}-`;

  // Find the highest order number for today
  const lastOrder = await Order.findOne({
    orderNumber: { $regex: `^${prefix}` },
  })
    .sort({ orderNumber: -1 })
    .select('orderNumber')
    .lean();

  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderNumber.split('-').pop(), 10);
    sequence = lastSequence + 1;
  }

  // Pad sequence to 3 digits
  const sequenceStr = sequence.toString().padStart(3, '0');

  return `${prefix}${sequenceStr}`;
}

/**
 * Parse order number to extract date and sequence
 * @param {string} orderNumber
 * @returns {{date: string, sequence: number} | null}
 */
export function parseOrderNumber(orderNumber) {
  const match = orderNumber.match(/^ORD-(\d{8})-(\d{3})$/);
  if (!match) {
    return null;
  }

  const [, dateStr, sequenceStr] = match;
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);

  return {
    date: `${year}-${month}-${day}`,
    sequence: parseInt(sequenceStr, 10),
  };
}
