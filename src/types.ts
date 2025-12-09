/**
 * Type definitions for Grafana objects
 */

export interface PanelTarget {
  refId: string;
  datasource?: {
    type: string;
    uid: string;
  } | null;
  expr?: string; // For Prometheus queries
  query?: string; // For other query types
  rawSql?: string; // For SQL queries
  format?: string;
  legendFormat?: string;
  hide?: boolean;
}

export interface PanelFieldConfig {
  defaults: Record<string, any>;
  overrides: Array<Record<string, any>>;
}

export interface Panel {
  id: number;
  title?: string;
  type: string;
  gridPos?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  targets?: PanelTarget[];
  datasource?: {
    type: string;
    uid: string;
  } | null;
  fieldConfig?: PanelFieldConfig;
  options?: Record<string, any>;
  pluginVersion?: string;
  transparent?: boolean;
  description?: string;
  links?: Array<Record<string, any>>;
  repeat?: string;
  repeatDirection?: string;
  maxDataPoints?: number;
  interval?: string;
  timeFrom?: string;
  timeShift?: string;
  hideTimeOverride?: boolean;
  libraryPanel?: Record<string, any>;
  panels?: Panel[]; // For row panels
  collapsed?: boolean;
}

export interface TemplateVariable {
  name: string;
  type: string;
  label?: string;
  description?: string;
  query?: any;
  datasource?: {
    type: string;
    uid: string;
  } | null;
  current?: Record<string, any>;
  options?: Array<Record<string, any>>;
  multi?: boolean;
  includeAll?: boolean;
  allValue?: string;
  refresh?: number;
  regex?: string;
  sort?: number;
  hide?: number;
}

export interface DashboardMetadata {
  uid: string;
  title: string;
  tags: string[];
  timezone?: string;
  schemaVersion?: number;
  version?: number;
  refresh?: string;
  editable?: boolean;
  fiscalYearStartMonth?: number;
  graphTooltip?: number;
  liveNow?: boolean;
  style?: string;
}

export interface Dashboard {
  meta: Record<string, any>;
  dashboard: Record<string, any>;
}

export interface SearchResult {
  uid: string;
  title: string;
  url: string;
  type: string;
  tags: string[];
  isStarred: boolean;
  folderId?: number;
  folderUid?: string;
  folderTitle?: string;
  folderUrl?: string;
  uri?: string;
}

export interface Folder {
  uid: string;
  title: string;
  url?: string;
  hasAcl?: boolean;
  canSave?: boolean;
  canEdit?: boolean;
  canAdmin?: boolean;
  created?: string;
  updated?: string;
  version?: number;
}

export interface DataSource {
  uid: string;
  name: string;
  type: string;
  url?: string;
  access?: string;
  isDefault?: boolean;
  jsonData?: Record<string, any>;
  readOnly?: boolean;
}

export interface GrafanaConfig {
  url: string;
  token?: string;
  email?: string;
  password?: string;
  orgId?: string;
  verifySSL?: boolean;
}

