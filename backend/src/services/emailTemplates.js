/**
 * Email template builder service
 * Generates HTML email content for various notification types
 */

const BRAND_COLOR = '#4F46E5';
const BRAND_NAME = 'Smart Merchant';

/**
 * Base email template wrapper
 * @param {string} content - Email body content
 * @returns {string} Complete HTML email
 */
function baseTemplate(content) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${BRAND_NAME}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: ${BRAND_COLOR}; padding: 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .content { padding: 32px 24px; }
    .footer { background-color: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 12px; }
    .btn { display: inline-block; padding: 12px 24px; background-color: ${BRAND_COLOR}; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; }
    .order-item { padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
    .order-item:last-child { border-bottom: none; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
    .status-shipped { background-color: #ddd6fe; color: #7c3aed; }
    .status-delivered { background-color: #d1fae5; color: #059669; }
    .alert { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 16px 0; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px 0; }
    .text-right { text-align: right; }
    .text-muted { color: #6b7280; }
    .text-bold { font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${BRAND_NAME}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.</p>
      <p>This email was sent to you because you interacted with our platform.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Format currency
 * @param {number} cents - Amount in cents
 * @returns {string} Formatted currency string
 */
function formatCurrency(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Format date
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Build order confirmation email
 * @param {Object} order - Order object
 * @returns {{subject: string, html: string}}
 */
export function buildOrderConfirmationEmail(order) {
  const itemsHtml = order.items
    .map(
      (item) => `
    <div class="order-item">
      <table>
        <tr>
          <td>
            <strong>${item.productName}</strong>
            ${item.variantName ? `<br><span class="text-muted">${item.variantName}</span>` : ''}
            <br><span class="text-muted">Qty: ${item.quantity}</span>
          </td>
          <td class="text-right text-bold">${formatCurrency(item.unitPrice * item.quantity)}</td>
        </tr>
      </table>
    </div>
  `
    )
    .join('');

  const shippingAddress = order.shippingAddress;
  const customerName = order.customerName || 'there';
  const addressHtml = shippingAddress
    ? `
    <p>
      ${customerName}<br>
      ${shippingAddress.line1}<br>
      ${shippingAddress.line2 ? `${shippingAddress.line2}<br>` : ''}
      ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}<br>
      ${shippingAddress.country}
    </p>
  `
    : '';

  const content = `
    <h2>Thank you for your order!</h2>
    <p>Hi ${customerName.split(' ')[0]},</p>
    <p>We've received your order and are getting it ready. We'll notify you when it ships.</p>

    <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0;"><strong>Order Number:</strong> #${order.orderNumber}</p>
      <p style="margin: 0;"><strong>Order Date:</strong> ${formatDate(order.createdAt)}</p>
    </div>

    <h3>Order Summary</h3>
    ${itemsHtml}

    <table style="margin-top: 16px; border-top: 2px solid #e5e7eb; padding-top: 16px;">
      <tr>
        <td>Subtotal</td>
        <td class="text-right">${formatCurrency(order.subtotal)}</td>
      </tr>
      <tr>
        <td>Shipping</td>
        <td class="text-right">${order.shippingCost > 0 ? formatCurrency(order.shippingCost) : 'Free'}</td>
      </tr>
      <tr>
        <td>Tax</td>
        <td class="text-right">${formatCurrency(order.taxAmount)}</td>
      </tr>
      <tr style="font-size: 18px;">
        <td class="text-bold">Total</td>
        <td class="text-right text-bold">${formatCurrency(order.total)}</td>
      </tr>
    </table>

    <h3 style="margin-top: 32px;">Shipping Address</h3>
    ${addressHtml}

    <p style="margin-top: 32px;">If you have any questions about your order, please don't hesitate to contact us.</p>
  `;

  return {
    subject: `Order Confirmation - #${order.orderNumber}`,
    html: baseTemplate(content),
  };
}

/**
 * Build order processing notification email
 * @param {Object} order - Order object
 * @returns {{subject: string, html: string}}
 */
export function buildProcessingNotificationEmail(order) {
  const content = `
    <h2>Your order is being prepared!</h2>
    <p>Hi ${(order.customerName || 'there').split(' ')[0]},</p>
    <p>Good news! Your order #${order.orderNumber} is now being processed and prepared for shipment.</p>

    <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0;"><strong>Order Number:</strong> #${order.orderNumber}</p>
      <p style="margin: 0 0 8px 0;"><strong>Status:</strong> <span style="color: ${BRAND_COLOR}; font-weight: 600;">Processing</span></p>
      <p style="margin: 0;"><strong>Total:</strong> ${formatCurrency(order.total)}</p>
    </div>

    <p>We'll send you another email with tracking information once your order ships.</p>

    <p style="margin-top: 32px;">If you have any questions, please don't hesitate to contact us.</p>
  `;

  return {
    subject: `Your Order #${order.orderNumber} Is Being Processed`,
    html: baseTemplate(content),
  };
}

/**
 * Build shipping notification email
 * @param {Object} order - Order object
 * @returns {{subject: string, html: string}}
 */
export function buildShippingNotificationEmail(order) {
  const trackingHtml = order.trackingNumber
    ? `
    <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0;"><strong>Carrier:</strong> ${order.trackingCarrier?.toUpperCase() || 'Standard'}</p>
      <p style="margin: 0;"><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
    </div>
  `
    : '';

  const content = `
    <h2>Your order is on its way! 📦</h2>
    <p>Great news! Your order #${order.orderNumber} has shipped.</p>

    ${trackingHtml}

    <p>
      <span class="status-badge status-shipped">Shipped</span>
    </p>

    <h3>Shipping To</h3>
    <p>
      ${order.customerName}<br>
      ${order.shippingAddress.line1}<br>
      ${order.shippingAddress.line2 ? `${order.shippingAddress.line2}<br>` : ''}
      ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}
    </p>

    <p style="margin-top: 32px;">We'll send you another email when your order is delivered.</p>
  `;

  return {
    subject: `Your Order #${order.orderNumber} Has Shipped!`,
    html: baseTemplate(content),
  };
}

/**
 * Build delivery confirmation email
 * @param {Object} order - Order object
 * @returns {{subject: string, html: string}}
 */
export function buildDeliveryConfirmationEmail(order) {
  const content = `
    <h2>Your order has been delivered! 🎉</h2>
    <p>Hi ${(order.customerName || 'there').split(' ')[0]},</p>
    <p>Your order #${order.orderNumber} has been delivered.</p>

    <p>
      <span class="status-badge status-delivered">Delivered</span>
    </p>

    <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0;"><strong>Delivered On:</strong> ${formatDate(order.deliveredAt || new Date())}</p>
    </div>

    <p>We hope you love your purchase! If you have any issues, please don't hesitate to reach out.</p>

    <p style="margin-top: 32px;">Thank you for shopping with us!</p>
  `;

  return {
    subject: `Your Order #${order.orderNumber} Has Been Delivered`,
    html: baseTemplate(content),
  };
}

/**
 * Build order cancellation email
 * @param {Object} order - Order object
 * @param {string} [reason] - Cancellation reason
 * @returns {{subject: string, html: string}}
 */
export function buildOrderCancellationEmail(order, reason) {
  const content = `
    <h2>Order Cancelled</h2>
    <p>Hi ${(order.customerName || 'there').split(' ')[0]},</p>
    <p>Your order #${order.orderNumber} has been cancelled.</p>

    ${reason ? `<div class="alert"><strong>Reason:</strong> ${reason}</div>` : ''}

    <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0;"><strong>Order Number:</strong> #${order.orderNumber}</p>
      <p style="margin: 0;"><strong>Original Total:</strong> ${formatCurrency(order.total)}</p>
    </div>

    <p>If you were charged, a refund will be processed within 5-10 business days.</p>

    <p style="margin-top: 32px;">If you have any questions, please contact us.</p>
  `;

  return {
    subject: `Order #${order.orderNumber} Has Been Cancelled`,
    html: baseTemplate(content),
  };
}

/**
 * Build low stock alert email for merchants
 * @param {Object} merchant - Merchant object
 * @param {Array} lowStockItems - Array of low stock products/variants
 * @returns {{subject: string, html: string}}
 */
export function buildLowStockAlertEmail(merchant, lowStockItems) {
  const itemsHtml = lowStockItems
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong>${item.productName}</strong>
        ${item.variantName ? `<br><span class="text-muted">${item.variantName}</span>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        <span style="color: ${item.quantity <= 0 ? '#dc2626' : '#f59e0b'}; font-weight: 600;">
          ${item.quantity}
        </span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${item.lowStockThreshold}
      </td>
    </tr>
  `
    )
    .join('');

  const content = `
    <h2>⚠️ Low Stock Alert</h2>
    <p>Hi ${merchant.businessName},</p>
    <p>The following items in your inventory are running low:</p>

    <table style="width: 100%; margin: 24px 0; border: 1px solid #e5e7eb; border-radius: 8px;">
      <thead>
        <tr style="background-color: #f9fafb;">
          <th style="padding: 12px; text-align: left;">Product</th>
          <th style="padding: 12px; text-align: center;">Current Stock</th>
          <th style="padding: 12px; text-align: center;">Threshold</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <p>Consider restocking these items to avoid missing sales opportunities.</p>
  `;

  return {
    subject: `Low Stock Alert - ${lowStockItems.length} item(s) need attention`,
    html: baseTemplate(content),
  };
}

/**
 * Build daily summary email for merchants
 * @param {Object} merchant - Merchant object
 * @param {Object} summary - Daily summary data
 * @returns {{subject: string, html: string}}
 */
export function buildDailySummaryEmail(merchant, summary) {
  const topProductsHtml = summary.topProducts?.length
    ? summary.topProducts
        .map(
          (p, i) => `
      <tr>
        <td style="padding: 8px 0;">${i + 1}. ${p.name}</td>
        <td style="padding: 8px 0; text-align: right;">${p.quantitySold} sold</td>
        <td style="padding: 8px 0; text-align: right;">${formatCurrency(p.revenue)}</td>
      </tr>
    `
        )
        .join('')
    : '<tr><td colspan="3" style="padding: 8px 0; color: #6b7280;">No sales today</td></tr>';

  const content = `
    <h2>📊 Daily Summary - ${formatDate(summary.date || new Date())}</h2>
    <p>Hi ${merchant.businessName},</p>
    <p>Here's your business summary for today:</p>

    <div style="display: flex; gap: 16px; margin: 24px 0;">
      <div style="flex: 1; background-color: #f9fafb; padding: 16px; border-radius: 8px; text-align: center;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;">Orders</p>
        <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: 700;">${summary.orderCount || 0}</p>
      </div>
      <div style="flex: 1; background-color: #f9fafb; padding: 16px; border-radius: 8px; text-align: center;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;">Revenue</p>
        <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: 700;">${formatCurrency(summary.revenue || 0)}</p>
      </div>
      <div style="flex: 1; background-color: #f9fafb; padding: 16px; border-radius: 8px; text-align: center;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;">Items Sold</p>
        <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: 700;">${summary.itemsSold || 0}</p>
      </div>
    </div>

    <h3>Top Products</h3>
    <table style="width: 100%;">
      <tbody>
        ${topProductsHtml}
      </tbody>
    </table>

    ${
      summary.lowStockCount > 0
        ? `
    <div class="alert" style="margin-top: 24px;">
      <strong>⚠️ ${summary.lowStockCount} item(s) are low on stock.</strong>
      <br>Check your inventory to avoid stockouts.
    </div>
    `
        : ''
    }

    <p style="margin-top: 32px;">
      <a href="#" class="btn">View Full Analytics</a>
    </p>
  `;

  return {
    subject: `Daily Summary - ${summary.orderCount || 0} orders, ${formatCurrency(summary.revenue || 0)} revenue`,
    html: baseTemplate(content),
  };
}
