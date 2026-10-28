/**
 * Format a number as Indian Rupee (INR) currency
 * Automatically handles Lakhs and Crores for compact views
 * @param {number} amount
 * @param {boolean} compact - whether to show ₹1.25 Cr / ₹85 L style
 * @returns {string}
 */
export function formatCurrency(amount, compact = false) {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0';

  if (compact) {
    if (amount >= 10000000) {
      const cr = (amount / 10000000).toFixed(2).replace(/\.00$/, '');
      return `₹${cr} Cr`;
    }
    if (amount >= 100000) {
      const lakh = (amount / 100000).toFixed(2).replace(/\.00$/, '');
      return `₹${lakh} L`;
    }
    return `₹${new Intl.NumberFormat('en-IN').format(amount)}`;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format square footage / super built-up area
 * @param {number} sqft
 * @returns {string}
 */
export function formatSqFt(sqft) {
  if (!sqft) return '0 sq ft';
  return `${new Intl.NumberFormat('en-IN').format(sqft)} sq ft`;
}

/**
 * Format date to readable string
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  // Guard against invalid dates like 'Completed', 'N/A', etc.
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Capitalize first letter of string
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
