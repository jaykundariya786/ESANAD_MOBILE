export const getCountryCode = name => {
  if (!name) return '';
  const country = name.toLowerCase().trim();

  // If it's already a 3-letter code, return it
  if (country.length === 3 && /^[a-z]{3}$/.test(country)) {
    return country.toUpperCase();
  }

  // Handle common overrides and specific insurance-related terms
  const mapping = {
    'united arab emirates': 'UAE',
    'united arb emirate': 'UAE', // Handle user's specific typo
    emirate: 'UAE',
    uae: 'UAE',
    'saudi arabia': 'KSA',
    ksa: 'KSA',
    'united kingdom': 'GBR',
    uk: 'GBR',
    'united states': 'USA',
    usa: 'USA',
    worldwide: 'WW',
    schengen: 'SCH',
    india: 'IND',
    pakistan: 'PAK',
    bangladesh: 'BGD',
    'sri lanka': 'LKA',
    philippines: 'PHL',
    egypt: 'EGY',
    qatar: 'QAT',
    oman: 'OMN',
    bahrain: 'BHR',
    kuwait: 'KWT',
    lebanon: 'LBN',
    jordan: 'JOR',
    canada: 'CAN',
    france: 'FRA',
    germany: 'GER',
    italy: 'ITA',
    spain: 'ESP',
    turkey: 'TUR',
    russia: 'RUS',
    china: 'CHN',
    japan: 'JPN',
  };

  // Check direct mapping
  if (mapping[country]) return mapping[country];

  // Check if mapping key is contained in the name (e.g. "Republic of India")
  const match = Object.keys(mapping).find(key => country.includes(key));
  if (match) return mapping[match];

  // Default fallback: Take first 3 characters and uppercase
  return name.substring(0, 3).toUpperCase();
};
