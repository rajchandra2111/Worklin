export const getCurrencyForCountry = (country?: string): { code: string; symbol: string } => {
  if (!country) return { code: 'USD', symbol: '$' };

  const countryNormalized = country.toLowerCase().trim();

  // Common mapping
  if (countryNormalized.includes('india')) return { code: 'INR', symbol: '₹' };
  if (countryNormalized.includes('united kingdom') || countryNormalized.includes('uk')) return { code: 'GBP', symbol: '£' };
  if (
    countryNormalized.includes('germany') ||
    countryNormalized.includes('france') ||
    countryNormalized.includes('italy') ||
    countryNormalized.includes('spain') ||
    countryNormalized.includes('europe')
  ) {
    return { code: 'EUR', symbol: '€' };
  }
  if (countryNormalized.includes('canada')) return { code: 'CAD', symbol: 'C$' };
  if (countryNormalized.includes('australia')) return { code: 'AUD', symbol: 'A$' };

  // Default fallback
  return { code: 'USD', symbol: '$' };
};

export const formatCurrency = (amount: number, country?: string): string => {
  const { code } = getCurrencyForCountry(country);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};
