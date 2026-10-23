import { apiClient } from './client';
import { API_ROUTES } from '@/constants';
import type {
  AnalyticsAveragesResponse,
  AnalyticsBreakdown,
  AnalyticsCompaniesMeta,
  AnalyticsCompanyParams,
  AnalyticsCompanyRow,
  AnalyticsFailures,
  AnalyticsFilterOptions,
  AnalyticsGrowth,
  AnalyticsOverview,
  AnalyticsQueryParams,
  AnalyticsRevenue,
  AnalyticsRevenueParams,
  AnalyticsTimeseries,
  ApiResponseSuccess,
} from '@/types';

/**
 * Super-admin analytics.
 *
 * Multi-value filters go out as comma-separated values rather than repeated
 * keys: the backend accepts both, and one short `?statuses=sent,failed` keeps
 * the URL readable and shareable — which matters, because a filtered analytics
 * view is something an admin pastes to a colleague.
 *
 * Empty arrays and blank strings are dropped entirely, so "no filter" never
 * travels as `?company_ids=` and gets read as an empty IN list.
 *
 * The timezone is NOT sent here: the shared axios interceptor already attaches
 * `X-Timezone` to every request, and the server resolves the window against it.
 * An explicit `timezone` parameter is only for deliberately overriding that.
 */
const serialize = (params: AnalyticsRevenueParams & AnalyticsCompanyParams) => {
  const entries = Object.entries(params as Record<string, unknown>);
  const query: Record<string, string | number | boolean> = {};
  for (const [key, value] of entries) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      query[key] = value.join(',');
    } else {
      query[key] = value as string | number | boolean;
    }
  }
  return query;
};

const get = async <T>(url: string, params: AnalyticsRevenueParams = {}) => {
  const { data } = await apiClient.get<ApiResponseSuccess<T>>(url, { params: serialize(params) });
  return data;
};

export const analyticsApi = {
  filters() {
    return get<AnalyticsFilterOptions>(API_ROUTES.SUPER_ADMIN.ANALYTICS_FILTERS);
  },
  overview(params: AnalyticsQueryParams = {}) {
    return get<AnalyticsOverview>(API_ROUTES.SUPER_ADMIN.ANALYTICS_OVERVIEW, params);
  },
  timeseries(params: AnalyticsQueryParams = {}) {
    return get<AnalyticsTimeseries>(API_ROUTES.SUPER_ADMIN.ANALYTICS_TIMESERIES, params);
  },
  averages(params: AnalyticsQueryParams = {}) {
    return get<AnalyticsAveragesResponse>(API_ROUTES.SUPER_ADMIN.ANALYTICS_AVERAGES, params);
  },
  async companies(params: AnalyticsCompanyParams = {}) {
    const { data } = await apiClient.get<
      ApiResponseSuccess<AnalyticsCompanyRow[]> & { meta?: AnalyticsCompaniesMeta }
    >(API_ROUTES.SUPER_ADMIN.ANALYTICS_COMPANIES, { params: serialize(params) });
    return data;
  },
  breakdown(params: AnalyticsQueryParams = {}) {
    return get<AnalyticsBreakdown>(API_ROUTES.SUPER_ADMIN.ANALYTICS_BREAKDOWN, params);
  },
  growth(params: AnalyticsQueryParams = {}) {
    return get<AnalyticsGrowth>(API_ROUTES.SUPER_ADMIN.ANALYTICS_GROWTH, params);
  },
  failures(params: AnalyticsQueryParams = {}) {
    return get<AnalyticsFailures>(API_ROUTES.SUPER_ADMIN.ANALYTICS_FAILURES, params);
  },
  revenue(params: AnalyticsRevenueParams = {}) {
    return get<AnalyticsRevenue>(API_ROUTES.SUPER_ADMIN.ANALYTICS_REVENUE, params);
  },
};
