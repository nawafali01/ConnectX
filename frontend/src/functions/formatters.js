/**
 * Formats an ISO date string into a clean time like "7:45 PM".
 * @param {string|Date} dateInput
 * @returns {string}
 */
export const formatTime = (dateInput) => {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Formats a date string into friendly readable format like "Today", "Yesterday", or "Sep 5".
 * @param {string|Date} dateInput
 * @returns {string}
 */
export const formatRelativeDate = (dateInput) => {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return 'Today';

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

/**
 * Cleans and formats phone numbers nicely.
 * @param {string} phone
 * @returns {string}
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/[^\d+]/g, '');
  return cleaned;
};
