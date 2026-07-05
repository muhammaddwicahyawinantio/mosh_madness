/** Bentuk data yang dikirim API ke client — JANGAN expose field internal. */

export interface ProductDTO {
  id: string;
  title: string;
  subtitle: string | null;
  /** Rupiah, integer */
  price: number;
  imageUrl: string;
  showOnHome: boolean;
  sortOrder: number;
}

export interface AnalyticsPoint {
  /** YYYY-MM-DD */
  date: string;
  views: number;
  visitors: number;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalVisitors: number;
  viewsToday: number;
  series: AnalyticsPoint[];
}

export interface ApiError {
  error: string;
}
