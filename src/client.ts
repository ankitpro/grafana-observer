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
} from './types.js';

export class GrafanaClient {
  private baseUrl: string;
  private token?: string;
  private email?: string;
  private password?: string;
  private orgId: string;
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
}

