export interface Page {
  id: string;
  name: string;
  url: string;
  weight: number;
  visits: number;
  conversions: number;
  active: boolean;
  createdAt: string;
}

export interface Stats {
  totalPages: number;
  totalVisits: number;
  totalConversions: number;
  avgConversionRate: number;
  pages: Page[];
}

export interface TrackEvent {
  pageId: string;
  type: 'visit' | 'conversion';
  timestamp: string;
}

export interface Config {
  mode: 'round-robin' | 'weighted';
  roundRobinIndex: number;
}
