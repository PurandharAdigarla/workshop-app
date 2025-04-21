/**
 * Utility functions for date manipulation and validation
 */

/**
 * Normalizes a date by setting hours, minutes, seconds, and milliseconds to 0
 * @param {Date|string} date - The date to normalize
 * @returns {Date} - Normalized date
 */
export const normalizeDate = (date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

/**
 * Checks if a date is valid
 * @param {Date|string} date - The date to check
 * @returns {boolean} - Whether the date is valid
 */
export const isValidDate = (date) => {
  return date && !isNaN(new Date(date).getTime());
};

/**
 * Formats a date for API requests (YYYY-MM-DD)
 * @param {Date|string} date - The date to format
 * @returns {string|null} - Formatted date string or null if invalid
 */
export const formatDateForAPI = (date) => {
  if (!isValidDate(date)) return null;
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Determines if a date is today or in the future
 * @param {Date|string} date - The date to check
 * @returns {boolean} - Whether the date is today or later
 */
export const isTodayOrLater = (date) => {
  const today = normalizeDate(new Date());
  const checkDate = normalizeDate(date);
  return checkDate >= today;
};

/**
 * Determines if a date is after another date
 * @param {Date|string} date - The date to check
 * @param {Date|string} compareDate - The date to compare against
 * @returns {boolean} - Whether the date is after the compare date
 */
export const isAfter = (date, compareDate) => {
  const d1 = normalizeDate(date);
  const d2 = normalizeDate(compareDate);
  return d1 > d2;
};

/**
 * Determines workshop state based on start and end dates
 * @param {Date|string} startDate - Workshop start date
 * @param {Date|string} endDate - Workshop end date
 * @returns {Object} - Workshop state (isUpcoming, isOngoing, isCompleted)
 */
export const getWorkshopState = (startDate, endDate) => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return { isUpcoming: false, isOngoing: false, isCompleted: false };
  }
  
  const today = normalizeDate(new Date());
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);
  
  const isUpcoming = start > today;
  const isOngoing = (start <= today) && (end >= today);
  const isCompleted = end < today;
  
  return { isUpcoming, isOngoing, isCompleted };
}; 