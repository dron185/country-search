export interface RawCountry {
  name: string;
  flags?: { svg?: string };
  capital?: string;
  region?: string;
  population?: number;
  languages?: Array<{ name: string }>;
  currencies?: Array<{ name: string }>;
  area?: number;
  borders?: string[];
  description?: string;
}

export interface CountryUI {
  name: string;
  flagUrl: string;
  capital: string;
  region: string;
  population: string;
  languages: string[];
  currencies: string[];
  area: number;
  borders: string[];
  description: string;
}
