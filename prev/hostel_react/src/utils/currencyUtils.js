// Currency formatting utilities for hostel pricing

/**
 * Currency symbols mapping
 */
export const currencySymbols = {
  'GHS': '₵',
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'NGN': '₦',
  'KES': 'KSh',
  'ZAR': 'R',
  'CAD': 'C$',
  'AUD': 'A$',
  'JPY': '¥',
  'CNY': '¥',
  'INR': '₹',
  'BRL': 'R$',
  'MXN': '$',
  'RUB': '₽',
  'KRW': '₩',
  'SGD': 'S$',
  'HKD': 'HK$',
  'NZD': 'NZ$',
  'CHF': 'CHF',
  'SEK': 'kr',
  'NOK': 'kr',
  'DKK': 'kr',
  'PLN': 'zł',
  'CZK': 'Kč',
  'HUF': 'Ft',
  'RON': 'lei',
  'BGN': 'лв',
  'HRK': 'kn',
  'RSD': 'дин',
  'UAH': '₴',
  'BYN': 'Br',
  'KZT': '₸',
  'UZS': 'сўм',
  'KGS': 'сом',
  'TJS': 'SM',
  'TMT': 'T',
  'AZN': '₼',
  'AMD': '֏',
  'GEL': '₾',
  'MDL': 'L',
  'TRY': '₺',
  'ILS': '₪',
  'JOD': 'د.ا',
  'LBP': 'ل.ل',
  'SAR': 'ر.س',
  'AED': 'د.إ',
  'QAR': 'ر.ق',
  'KWD': 'د.ك',
  'BHD': 'د.ب',
  'OMR': 'ر.ع.',
  'YER': 'ر.ي',
  'IQD': 'د.ع',
  'IRR': '﷼',
  'AFN': '؋',
  'PKR': '₨',
  'BDT': '৳',
  'LKR': '₨',
  'MVR': '.ރ',
  'NPR': '₨',
  'BTN': 'Nu.',
  'MMK': 'K',
  'THB': '฿',
  'LAK': '₭',
  'KHR': '៛',
  'VND': '₫',
  'IDR': 'Rp',
  'MYR': 'RM',
  'PHP': '₱',
  'BND': 'B$',
  'TWD': 'NT$',
  'MOP': 'MOP$',
  'MNT': '₮',
  'KPW': '₩',
  'ETB': 'Br',
  'EGP': '£',
  'LYD': 'ل.د',
  'TND': 'د.ت',
  'DZD': 'د.ج',
  'MAD': 'د.م.',
  'MUR': '₨',
  'SCR': '₨',
  'SLL': 'Le',
  'GMD': 'D',
  'GNF': 'FG',
  'LRD': 'L$',
  'CDF': 'FC',
  'AOA': 'Kz',
  'ZMW': 'ZK',
  'BWP': 'P',
  'SZL': 'L',
  'LSL': 'L',
  'NAD': 'N$',
  'MZN': 'MT',
  'MWK': 'MK',
  'ZWL': 'Z$',
  'UGX': 'USh',
  'TZS': 'TSh',
  'RWF': 'RF',
  'BIF': 'FBu',
  'DJF': 'Fdj',
  'ERN': 'Nfk',
  'SOS': 'S',
  'KMF': 'CF',
  'MGA': 'Ar',
  'MVR': '.ރ',
  'SRD': '$',
  'GYD': 'G$',
  'TTD': 'TT$',
  'BBD': 'Bds$',
  'JMD': 'J$',
  'BZD': 'BZ$',
  'GTQ': 'Q',
  'HNL': 'L',
  'NIO': 'C$',
  'CRC': '₡',
  'PAB': 'B/.',
  'DOP': 'RD$',
  'HTG': 'G',
  'CUP': '$',
  'XOF': 'CFA',
  'XAF': 'FCFA',
  'XPF': '₣',
  'CLP': '$',
  'COP': '$',
  'PEN': 'S/',
  'BOB': 'Bs',
  'VES': 'Bs.S',
  'ARS': '$',
  'UYU': '$U',
  'PYG': '₲',
  'BRL': 'R$',
  'FKP': '£',
  'GYD': 'G$',
  'SRD': '$',
  'TTD': 'TT$',
  'BBD': 'Bds$',
  'JMD': 'J$',
  'BZD': 'BZ$',
  'GTQ': 'Q',
  'HNL': 'L',
  'NIO': 'C$',
  'CRC': '₡',
  'PAB': 'B/.',
  'DOP': 'RD$',
  'HTG': 'G',
  'CUP': '$',
  'XOF': 'CFA',
  'XAF': 'FCFA',
  'XPF': '₣',
  'CLP': '$',
  'COP': '$',
  'PEN': 'S/',
  'BOB': 'Bs',
  'VES': 'Bs.S',
  'ARS': '$',
  'UYU': '$U',
  'PYG': '₲',
  'BRL': 'R$',
  'FKP': '£'
};

/**
 * Format price with currency symbol and proper formatting
 * @param {number} price - The price amount
 * @param {string} currency - The currency code (e.g., 'GHS', 'USD')
 * @param {string} period - The time period (e.g., 'month', 'year') - as set by manager
 * @param {string} durationText - The duration text (e.g., '6 months', '1 year')
 * @returns {string} - Formatted price string
 */
export const formatPrice = (price, currency = 'GHS', period = 'month', durationText = null) => {
  if (!price || price === 0) {
    return `Free for ${durationText || period}`;
  }

  // Get currency symbol
  const symbol = currencySymbols[currency] || currency;
  
  // Format number with proper locale
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  const formattedPrice = formatter.format(price);
  
  // Use duration text if provided, otherwise fall back to period
  const timeText = durationText || period;
  
  // Return formatted string with duration
  return `${symbol}${formattedPrice} for ${timeText}`;
};

/**
 * Calculate pricing period and duration based on checkout date
 * @param {string|Date} checkoutDate - The checkout date
 * @returns {Object} - { period: 'month'|'year', duration: number, durationText: string }
 */
export const calculatePricingPeriod = (checkoutDate) => {
  if (!checkoutDate) return { period: 'month', duration: 1, durationText: '1 month' };
  
  try {
    const checkout = new Date(checkoutDate);
    const now = new Date();
    
    // Calculate difference in months
    const diffInMonths = (checkout.getFullYear() - now.getFullYear()) * 12 + 
                        (checkout.getMonth() - now.getMonth());
    
    if (diffInMonths >= 12) {
      const years = Math.floor(diffInMonths / 12);
      return { 
        period: 'year', 
        duration: years, 
        durationText: years === 1 ? '1 year' : `${years} years` 
      };
    } else {
      return { 
        period: 'month', 
        duration: diffInMonths, 
        durationText: diffInMonths === 1 ? '1 month' : `${diffInMonths} months` 
      };
    }
  } catch (error) {
    console.error('Error calculating pricing period:', error);
    return { period: 'month', duration: 1, durationText: '1 month' };
  }
};

/**
 * Format price for display in hostel cards
 * @param {Object} hostel - Hostel object
 * @returns {string} - Formatted price string
 */
export const formatHostelPrice = (hostel) => {
  if (!hostel) return 'Price not available';
  
  // Get currency from manager or default to GHS
  const currency = hostel.manager?.payment_currency || 'GHS';
  
  // Calculate pricing period and duration based on checkout date
  const { period, durationText } = calculatePricingPeriod(hostel.checkout_date || hostel.checkout);
  
  // Use the price exactly as manager set it
  const basePrice = hostel.price || 0;
  
  return formatPrice(basePrice, currency, period, durationText);
};

/**
 * Format price for display in room details
 * @param {Object} room - Room object
 * @param {string} currency - Currency code
 * @param {string|Date} checkoutDate - Checkout date for period calculation
 * @returns {string} - Formatted price string
 */
export const formatRoomPrice = (room, currency = 'GHS', checkoutDate = null) => {
  if (!room || !room.price) return 'Price not available';
  
  // Calculate pricing period and duration based on checkout date
  const { period, durationText } = calculatePricingPeriod(checkoutDate);
  
  return formatPrice(room.price, currency, period, durationText);
};

/**
 * Get currency symbol for a given currency code
 * @param {string} currency - Currency code
 * @returns {string} - Currency symbol
 */
export const getCurrencySymbol = (currency) => {
  return currencySymbols[currency] || currency;
};

/**
 * Check if a currency is supported
 * @param {string} currency - Currency code
 * @returns {boolean} - Whether currency is supported
 */
export const isCurrencySupported = (currency) => {
  return currencySymbols.hasOwnProperty(currency);
};

/**
 * Get all supported currencies
 * @returns {Array} - Array of supported currency codes
 */
export const getSupportedCurrencies = () => {
  return Object.keys(currencySymbols);
};
