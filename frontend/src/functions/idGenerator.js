/**
 * Generates a clean pseudo-random unique ID with optional prefix.
 * @param {string} prefix
 * @returns {string}
 */
export const generateId = (prefix = 'id') => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${randomPart}`;
};
