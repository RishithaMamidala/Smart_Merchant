/**
 * Date range utilities for analytics
 */

/**
 * Get start and end dates for a named period
 * @param {string} period - Period name (today, week, month, quarter, year, custom)
 * @param {Date} [customStart] - Custom start date
 * @param {Date} [customEnd] - Custom end date
 * @returns {{start: Date, end: Date}}
 */
export function getDateRange(period, customStart, customEnd) {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  let start = new Date(now);
  start.setHours(0, 0, 0, 0);

  switch (period) {
    case 'today':
      // Already set
      break;

    case 'yesterday':
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
      break;

    case 'week':
      start.setDate(start.getDate() - 7);
      break;

    case 'month':
      start.setMonth(start.getMonth() - 1);
      break;

    case 'quarter':
      start.setMonth(start.getMonth() - 3);
      break;

    case 'year':
      start.setFullYear(start.getFullYear() - 1);
      break;

    case 'custom':
      if (customStart) {
        start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
      }
      if (customEnd) {
        end.setTime(new Date(customEnd).getTime());
        end.setHours(23, 59, 59, 999);
      }
      break;

    default:
      // Default to last 30 days
      start.setDate(start.getDate() - 30);
  }

  return { start, end };
}

/**
 * Get date range for comparison (previous period)
 * @param {Date} start - Current period start
 * @param {Date} end - Current period end
 * @returns {{start: Date, end: Date}}
 */
export function getPreviousPeriod(start, end) {
  const duration = end.getTime() - start.getTime();
  const previousEnd = new Date(start.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - duration);

  return { start: previousStart, end: previousEnd };
}

/**
 * Format date for aggregation grouping
 * @param {string} granularity - Grouping level (day, week, month)
 * @returns {Object} - MongoDB date expression
 */
export function getDateGroupExpression(granularity) {
  switch (granularity) {
    case 'hour':
      return {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' },
        hour: { $hour: '$createdAt' },
      };

    case 'day':
      return {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' },
      };

    case 'week':
      return {
        year: { $isoWeekYear: '$createdAt' },
        week: { $isoWeek: '$createdAt' },
      };

    case 'month':
    default:
      return {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
      };
  }
}

/**
 * Determine appropriate granularity based on date range
 * @param {Date} start
 * @param {Date} end
 * @returns {string}
 */
export function getAutoGranularity(start, end) {
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  if (days <= 1) {
    return 'hour';
  } else if (days <= 31) {
    return 'day';
  } else if (days <= 90) {
    return 'week';
  } else {
    return 'month';
  }
}

/**
 * Format a date group key to a readable label
 * @param {Object} group - Date group object
 * @param {string} granularity
 * @returns {string}
 */
export function formatDateGroupLabel(group, granularity) {
  switch (granularity) {
    case 'hour':
      return `${group.year}-${String(group.month).padStart(2, '0')}-${String(group.day).padStart(2, '0')} ${String(group.hour).padStart(2, '0')}:00`;

    case 'day':
      return `${group.year}-${String(group.month).padStart(2, '0')}-${String(group.day).padStart(2, '0')}`;

    case 'week':
      return `${group.year}-W${String(group.week).padStart(2, '0')}`;

    case 'month':
    default:
      return `${group.year}-${String(group.month).padStart(2, '0')}`;
  }
}
