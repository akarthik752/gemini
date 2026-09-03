export interface CountryInfo {
  code: string; // ISO 2-letter
  name: string;
  nativeName?: string;
  flag: string;
  defaultCurrencyCode: string;
  region: string;
}

export const SUPPORTED_COUNTRIES: CountryInfo[] = [
  { code: 'IN', name: 'India', nativeName: 'भारत', flag: '🇮🇳', defaultCurrencyCode: 'INR', region: 'Asia' },
  { code: 'US', name: 'United States', nativeName: 'United States', flag: '🇺🇸', defaultCurrencyCode: 'USD', region: 'North America' },
  { code: 'ES', name: 'Spain', nativeName: 'España', flag: '🇪🇸', defaultCurrencyCode: 'EUR', region: 'Europe' },
  { code: 'FR', name: 'France', nativeName: 'France', flag: '🇫🇷', defaultCurrencyCode: 'EUR', region: 'Europe' },
  { code: 'IT', name: 'Italy', nativeName: 'Italia', flag: '🇮🇹', defaultCurrencyCode: 'EUR', region: 'Europe' },
  { code: 'DE', name: 'Germany', nativeName: 'Deutschland', flag: '🇩🇪', defaultCurrencyCode: 'EUR', region: 'Europe' },
  { code: 'GB', name: 'United Kingdom', nativeName: 'United Kingdom', flag: '🇬🇧', defaultCurrencyCode: 'GBP', region: 'Europe' },
  { code: 'JP', name: 'Japan', nativeName: '日本', flag: '🇯🇵', defaultCurrencyCode: 'JPY', region: 'Asia' },
  { code: 'AU', name: 'Australia', nativeName: 'Australia', flag: '🇦🇺', defaultCurrencyCode: 'AUD', region: 'Oceania' },
  { code: 'CA', name: 'Canada', nativeName: 'Canada', flag: '🇨🇦', defaultCurrencyCode: 'CAD', region: 'North America' },
  { code: 'BR', name: 'Brazil', nativeName: 'Brasil', flag: '🇧🇷', defaultCurrencyCode: 'BRL', region: 'South America' },
  { code: 'MX', name: 'Mexico', nativeName: 'México', flag: '🇲🇽', defaultCurrencyCode: 'MXN', region: 'North America' },
  { code: 'AE', name: 'United Arab Emirates', nativeName: 'الإمارات', flag: '🇦🇪', defaultCurrencyCode: 'AED', region: 'Middle East' },
  { code: 'SA', name: 'Saudi Arabia', nativeName: 'السعودية', flag: '🇸🇦', defaultCurrencyCode: 'SAR', region: 'Middle East' },
  { code: 'KE', name: 'Kenya', nativeName: 'Kenya', flag: '🇰🇪', defaultCurrencyCode: 'KES', region: 'Africa' },
];

export const getCountryByCode = (code: string): CountryInfo | undefined => {
  return SUPPORTED_COUNTRIES.find(c => c.code.toUpperCase() === code.toUpperCase());
};

export const getCountryByName = (name: string): CountryInfo | undefined => {
  return SUPPORTED_COUNTRIES.find(
    c => c.name.toLowerCase() === name.toLowerCase() || 
         c.code.toLowerCase() === name.toLowerCase()
  );
};
