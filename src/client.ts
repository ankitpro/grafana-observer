/**
 * Grafana API client for read-only operations
 * Supports both API Token and Email/Password authentication
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  Dashboard,
  SearchResult,
  Folder,
  DataSource,
  GrafanaConfig,
  PrometheusQueryResult,
  PrometheusLabelsResult,
  PrometheusSeriesResult,
  HealthCheckResult,
  OrgInfo,
  ServiceStatus,
  PanelQuery,
} from './types.js';

export class GrafanaClient {
  private baseUrl: string;
  private token?: string;
  private email?: string;
  private password?: string;
  private orgId: string;
  private defaultDatasourceUid?: string;
  private client: AxiosInstance;

  constructor(config?: Partial<GrafanaConfig>) {
    this.baseUrl = (
      config?.url ||
      process.env.GRAFANA_URL ||
      ''
    ).replace(/\/$/, '');
    
    // Support both authentication methods
    this.token = config?.token || process.env.GRAFANA_TOKEN;
    this.email = config?.email || process.env.GRAFANA_EMAIL;
    this.password = config?.password || process.env.GRAFANA_PASSWORD;
    
    this.orgId = config?.orgId || process.env.GRAFANA_ORG_ID || '1';
    this.defaultDatasourceUid = 
      config?.defaultDatasourceUid || 
      process.env.GRAFANA_DEFAULT_DATASOURCE_UID;

    const verifySSL =
      config?.verifySSL ??
      (process.env.GRAFANA_VERIFY_SSL || 'true').toLowerCase() !== 'false';

    if (!this.baseUrl) {
      throw new Error('GRAFANA_URL must be set');
    }

    // Validate authentication credentials
    const hasTokenAuth = !!this.token;
    const hasBasicAuth = !!(this.email && this.password);

    if (!hasTokenAuth && !hasBasicAuth) {
      throw new Error(
        'Authentication required: Either GRAFANA_TOKEN or both GRAFANA_EMAIL and GRAFANA_PASSWORD must be set'
      );
    }

    if (hasTokenAuth && hasBasicAuth) {
      console.warn(
        'Both token and email/password provided. Using token authentication (preferred).'
      );
    }

    // Set up authentication headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers,
      timeout: 30000,
      httpsAgent: verifySSL
        ? undefined
        : new (require('https').Agent)({ rejectUnauthorized: false }),
      // Basic auth if using email/password
      ...(this.email && this.password && !this.token
        ? {
            auth: {
              username: this.email,
              password: this.password,
            },
          }
        : {}),
    });
  }

  private async request<T>(
    method: string,
    endpoint: string,
    params?: Record<string, any>,
    data?: Record<string, any>
  ): Promise<T> {
    try {
      const response = await this.client.request<T>({
        method,
        url: endpoint,
        params,
        data,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        let errorMsg = `Grafana API request failed: ${axiosError.message}`;
        if (axiosError.response?.data) {
          errorMsg += ` - ${JSON.stringify(axiosError.response.data)}`;
        }
        throw new Error(errorMsg);
      }
      throw error;
    }
  }

  async getDashboard(uid: string): Promise<Dashboard> {
    return this.request<Dashboard>('GET', `/api/dashboards/uid/${uid}`);
  }

  async searchDashboards(options?: {
    query?: string;
    tag?: string;
    folderIds?: number[];
    dashboardIds?: number[];
    starred?: boolean;
    limit?: number;
  }): Promise<SearchResult[]> {
    const params: Record<string, any> = {
      type: 'dash-db',
      limit: options?.limit || 100,
    };

    if (options?.query) params.query = options.query;
    if (options?.tag) params.tag = options.tag;
    if (options?.folderIds)
      params.folderIds = options.folderIds.join(',');
    if (options?.dashboardIds)
      params.dashboardIds = options.dashboardIds.join(',');
    if (options?.starred) params.starred = 'true';

    return this.request<SearchResult[]>('GET', '/api/search', params);
  }

  async listFolders(limit = 100): Promise<Folder[]> {
    const params = {
      type: 'dash-folder',
      limit,
    };
    return this.request<Folder[]>('GET', '/api/search', params);
  }

  async getFolder(uid: string): Promise<Folder> {
    return this.request<Folder>('GET', `/api/folders/${uid}`);
  }

  async getDashboardTags(): Promise<Array<{ term: string; count: number }>> {
    return this.request<Array<{ term: string; count: number }>>(
      'GET',
      '/api/dashboards/tags'
    );
  }

  async getDataSources(): Promise<DataSource[]> {
    return this.request<DataSource[]>('GET', '/api/datasources');
  }

  async getDataSource(uid: string): Promise<DataSource> {
    return this.request<DataSource>('GET', `/api/datasources/uid/${uid}`);
  }

  async getHomeDashboard(): Promise<Dashboard> {
    return this.request<Dashboard>('GET', '/api/dashboards/home');
  }

  async searchWithPagination(options: {
    query?: string;
    tag?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    dashboards: SearchResult[];
    page: number;
    limit: number;
    total: number;
  }> {
    const page = options.page || 1;
    const limit = options.limit || 100;

    const params: Record<string, any> = {
      type: 'dash-db',
      page,
      limit,
    };

    if (options.query) params.query = options.query;
    if (options.tag) params.tag = options.tag;

    const results = await this.request<SearchResult[]>(
      'GET',
      '/api/search',
      params
    );

    return {
      dashboards: results,
      page,
      limit,
      total: results.length,
    };
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getOrgId(): string {
    return this.orgId;
  }

  getAuthMethod(): 'token' | 'basic' {
    return this.token ? 'token' : 'basic';
  }

  getDefaultDatasourceUid(): string | undefined {
    return this.defaultDatasourceUid;
  }

  // ============ HEALTH & SYSTEM ENDPOINTS ============

  async healthCheck(): Promise<HealthCheckResult> {
    return this.request<HealthCheckResult>('GET', '/api/health');
  }

  async getOrgInfo(): Promise<OrgInfo> {
    return this.request<OrgInfo>('GET', '/api/org');
  }

  // ============ PROMETHEUS QUERY ENDPOINTS ============

  /**
   * Execute Prometheus instant query (current value)
   * @param query PromQL expression
   * @param datasourceUid Datasource UID (optional, uses default if not provided)
   * @param time Evaluation timestamp (optional, Unix timestamp)
   */
  async prometheusQuery(
    query: string,
    datasourceUid?: string,
    time?: number
  ): Promise<PrometheusQueryResult> {
    const uid = datasourceUid || this.defaultDatasourceUid;
    if (!uid) {
      throw new Error(
        'Datasource UID required. Set GRAFANA_DEFAULT_DATASOURCE_UID or provide datasourceUid parameter'
      );
    }

    const params: Record<string, any> = { query };
    if (time) {
      params.time = time;
    }

    return this.request<PrometheusQueryResult>(
      'GET',
      `/api/datasources/proxy/uid/${uid}/api/v1/query`,
      params
    );
  }

  /**
   * Execute Prometheus range query (time series data)
   * @param query PromQL expression
   * @param start Start timestamp (Unix seconds)
   * @param end End timestamp (Unix seconds)
   * @param step Query resolution step in seconds
   * @param datasourceUid Datasource UID (optional)
   */
  async prometheusQueryRange(
    query: string,
    start: number,
    end: number,
    step: number,
    datasourceUid?: string
  ): Promise<PrometheusQueryResult> {
    const uid = datasourceUid || this.defaultDatasourceUid;
    if (!uid) {
      throw new Error(
        'Datasource UID required. Set GRAFANA_DEFAULT_DATASOURCE_UID or provide datasourceUid parameter'
      );
    }

    const params = {
      query,
      start,
      end,
      step,
    };

    return this.request<PrometheusQueryResult>(
      'GET',
      `/api/datasources/proxy/uid/${uid}/api/v1/query_range`,
      params
    );
  }

  /**
   * Get all available metric names from Prometheus
   * @param datasourceUid Datasource UID (optional)
   */
  async getMetricNames(datasourceUid?: string): Promise<string[]> {
    const uid = datasourceUid || this.defaultDatasourceUid;
    if (!uid) {
      throw new Error(
        'Datasource UID required. Set GRAFANA_DEFAULT_DATASOURCE_UID or provide datasourceUid parameter'
      );
    }

    const result = await this.request<PrometheusLabelsResult>(
      'GET',
      `/api/datasources/proxy/uid/${uid}/api/v1/label/__name__/values`
    );

    return result.data;
  }

  /**
   * Get values for a specific label
   * @param labelName Label name (e.g., "job", "instance")
   * @param datasourceUid Datasource UID (optional)
   */
  async getLabelValues(
    labelName: string,
    datasourceUid?: string
  ): Promise<string[]> {
    const uid = datasourceUid || this.defaultDatasourceUid;
    if (!uid) {
      throw new Error(
        'Datasource UID required. Set GRAFANA_DEFAULT_DATASOURCE_UID or provide datasourceUid parameter'
      );
    }

    const result = await this.request<PrometheusLabelsResult>(
      'GET',
      `/api/datasources/proxy/uid/${uid}/api/v1/label/${labelName}/values`
    );

    return result.data;
  }

  /**
   * Get series metadata
   * @param match Series selector (e.g., 'up{instance="10.2.52.116:8123"}')
   * @param start Start timestamp (optional)
   * @param end End timestamp (optional)
   * @param datasourceUid Datasource UID (optional)
   */
  async getSeries(
    match: string,
    start?: number,
    end?: number,
    datasourceUid?: string
  ): Promise<PrometheusSeriesResult> {
    const uid = datasourceUid || this.defaultDatasourceUid;
    if (!uid) {
      throw new Error(
        'Datasource UID required. Set GRAFANA_DEFAULT_DATASOURCE_UID or provide datasourceUid parameter'
      );
    }

    const params: Record<string, any> = {
      'match[]': match,
    };

    if (start) params.start = start;
    if (end) params.end = end;

    return this.request<PrometheusSeriesResult>(
      'GET',
      `/api/datasources/proxy/uid/${uid}/api/v1/series`,
      params
    );
  }

  /**
   * Check service status using 'up' metric
   * @param job Job name filter (optional)
   * @param instance Instance filter (optional)
   * @param datasourceUid Datasource UID (optional)
   */
  async getServiceStatus(
    job?: string,
    instance?: string,
    datasourceUid?: string
  ): Promise<ServiceStatus[]> {
    let query = 'up';
    const filters: string[] = [];

    if (job) filters.push(`job="${job}"`);
    if (instance) filters.push(`instance="${instance}"`);

    if (filters.length > 0) {
      query += `{${filters.join(', ')}}`;
    }

    const result = await this.prometheusQuery(query, datasourceUid);

    if (result.data.resultType !== 'vector') {
      return [];
    }

    return (result.data.result as any[]).map((item) => ({
      instance: item.metric.instance || 'unknown',
      status: item.value[1] === '1' ? 'UP' : 'DOWN',
      value: item.value[1],
      job: item.metric.job,
    }));
  }

  /**
   * Extract queries from dashboard panels
   * @param dashboardUid Dashboard UID
   */
  async getPanelQueries(dashboardUid: string): Promise<PanelQuery[]> {
    const result = await this.getDashboard(dashboardUid);
    const dashboard = result.dashboard;
    const panels: PanelQuery[] = [];

    for (const panel of dashboard.panels || []) {
      // Skip row panels
      if (panel.type === 'row') {
        // Process nested panels in rows
        if (panel.panels) {
          for (const nestedPanel of panel.panels) {
            panels.push(this.extractPanelQuery(nestedPanel));
          }
        }
        continue;
      }

      panels.push(this.extractPanelQuery(panel));
    }

    return panels;
  }

  private extractPanelQuery(panel: any): PanelQuery {
    const queries = (panel.targets || [])
      .filter((t: any) => t.expr || t.query || t.rawSql)
      .map((t: any) => ({
        refId: t.refId,
        expr: t.expr,
        query: t.query,
        rawSql: t.rawSql,
        datasource: t.datasource,
      }));

    return {
      panel_id: panel.id,
      panel_title: panel.title || 'Untitled',
      panel_type: panel.type,
      queries,
    };
  }
}

