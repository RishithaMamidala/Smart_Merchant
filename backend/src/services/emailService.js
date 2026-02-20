import sgMail, { defaultSender } from '../config/sendgrid.js';
import logger from '../utils/logger.js';

/**
 * @typedef {Object} EmailOptions
 * @property {string} to - Recipient email address
 * @property {string} subject - Email subject
 * @property {string} html - HTML content
 * @property {string} [text] - Plain text content (optional)
 * @property {string} [templateId] - SendGrid dynamic template ID (optional)
 * @property {Object} [dynamicTemplateData] - Template data (optional)
 */

/**
 * Send an email via SendGrid
 * @param {EmailOptions} options
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendEmail(options) {
  const { to, subject, html, text, templateId, dynamicTemplateData } = options;

  const msg = {
    to,
    from: defaultSender,
    subject,
  };

  // Use dynamic template if provided
  if (templateId) {
    msg.templateId = templateId;
    msg.dynamicTemplateData = dynamicTemplateData;
  } else {
    msg.html = html;
    if (text) {
      msg.text = text;
    }
  }

  try {
    const [response] = await sgMail.send(msg);
    logger.info(`Email sent to ${to}`, {
      subject,
      statusCode: response.statusCode,
      messageId: response.headers['x-message-id'],
    });
    return {
      success: true,
      messageId: response.headers['x-message-id'],
    };
  } catch (error) {
    logger.error('Failed to send email', {
      to,
      subject,
      error: error.message,
      response: error.response?.body,
    });
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send order confirmation email to customer
 * @param {Object} order - Order object
 * @param {string} customerEmail - Customer email
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendOrderConfirmation(order, customerEmail) {
  const { buildOrderConfirmationEmail } = await import('./emailTemplates.js');
  const { subject, html } = buildOrderConfirmationEmail(order);

  return sendEmail({
    to: customerEmail,
    subject,
    html,
  });
}

/**
 * Send processing notification email to customer
 * @param {Object} order - Order object
 * @param {string} customerEmail - Customer email
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendProcessingNotification(order, customerEmail) {
  const { buildProcessingNotificationEmail } = await import('./emailTemplates.js');
  const { subject, html } = buildProcessingNotificationEmail(order);

  return sendEmail({
    to: customerEmail,
    subject,
    html,
  });
}

/**
 * Send shipping notification email to customer
 * @param {Object} order - Order object
 * @param {string} customerEmail - Customer email
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendShippingNotification(order, customerEmail) {
  const { buildShippingNotificationEmail } = await import('./emailTemplates.js');
  const { subject, html } = buildShippingNotificationEmail(order);

  return sendEmail({
    to: customerEmail,
    subject,
    html,
  });
}

/**
 * Send delivery confirmation email to customer
 * @param {Object} order - Order object
 * @param {string} customerEmail - Customer email
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendDeliveryConfirmation(order, customerEmail) {
  const { buildDeliveryConfirmationEmail } = await import('./emailTemplates.js');
  const { subject, html } = buildDeliveryConfirmationEmail(order);

  return sendEmail({
    to: customerEmail,
    subject,
    html,
  });
}

/**
 * Send low stock alert to merchant
 * @param {Object} merchant - Merchant object
 * @param {Array} lowStockItems - Array of low stock products/variants
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendLowStockAlert(merchant, lowStockItems) {
  const { buildLowStockAlertEmail } = await import('./emailTemplates.js');
  const { subject, html } = buildLowStockAlertEmail(merchant, lowStockItems);

  return sendEmail({
    to: merchant.email,
    subject,
    html,
  });
}

/**
 * Send daily summary to merchant
 * @param {Object} merchant - Merchant object
 * @param {Object} summary - Daily summary data
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendDailySummary(merchant, summary) {
  const { buildDailySummaryEmail } = await import('./emailTemplates.js');
  const { subject, html } = buildDailySummaryEmail(merchant, summary);

  return sendEmail({
    to: merchant.email,
    subject,
    html,
  });
}

/**
 * Send order cancellation notification to customer
 * @param {Object} order - Order object
 * @param {string} customerEmail - Customer email
 * @param {string} [reason] - Cancellation reason
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendOrderCancellation(order, customerEmail, reason) {
  const { buildOrderCancellationEmail } = await import('./emailTemplates.js');
  const { subject, html } = buildOrderCancellationEmail(order, reason);

  return sendEmail({
    to: customerEmail,
    subject,
    html,
  });
}
