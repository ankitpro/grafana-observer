"""Data models for Grafana objects."""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class PanelTarget(BaseModel):
    """Represents a data source query target in a panel."""

    refId: str
    datasource: Optional[Dict[str, Any]] = None
    expr: Optional[str] = None  # For Prometheus queries
    query: Optional[str] = None  # For other query types
    rawSql: Optional[str] = None  # For SQL queries
    format: Optional[str] = None
    legendFormat: Optional[str] = None
    hide: Optional[bool] = False


class PanelFieldConfig(BaseModel):
    """Panel field configuration."""

    defaults: Dict[str, Any] = Field(default_factory=dict)
    overrides: List[Dict[str, Any]] = Field(default_factory=list)


class Panel(BaseModel):
    """Represents a Grafana dashboard panel."""

    id: int
    title: Optional[str] = None
    type: str
    gridPos: Optional[Dict[str, Any]] = None
    targets: List[Dict[str, Any]] = Field(default_factory=list)
    datasource: Optional[Dict[str, Any]] = None
    fieldConfig: Optional[Dict[str, Any]] = None
    options: Optional[Dict[str, Any]] = None
    pluginVersion: Optional[str] = None
    transparent: Optional[bool] = False
    description: Optional[str] = None
    links: Optional[List[Dict[str, Any]]] = None
    repeat: Optional[str] = None
    repeatDirection: Optional[str] = None
    maxDataPoints: Optional[int] = None
    interval: Optional[str] = None
    timeFrom: Optional[str] = None
    timeShift: Optional[str] = None
    hideTimeOverride: Optional[bool] = None
    libraryPanel: Optional[Dict[str, Any]] = None


class TemplateVariable(BaseModel):
    """Represents a dashboard template variable."""

    name: str
    type: str
    label: Optional[str] = None
    description: Optional[str] = None
    query: Optional[Any] = None
    datasource: Optional[Dict[str, Any]] = None
    current: Optional[Dict[str, Any]] = None
    options: Optional[List[Dict[str, Any]]] = None
    multi: Optional[bool] = False
    includeAll: Optional[bool] = False
    allValue: Optional[str] = None
    refresh: Optional[int] = None
    regex: Optional[str] = None
    sort: Optional[int] = None
    hide: Optional[int] = 0


class DashboardMetadata(BaseModel):
    """Dashboard metadata."""

    uid: str
    title: str
    tags: List[str] = Field(default_factory=list)
    timezone: Optional[str] = "browser"
    schemaVersion: Optional[int] = None
    version: Optional[int] = None
    refresh: Optional[str] = None
    editable: Optional[bool] = True
    fiscalYearStartMonth: Optional[int] = 0
    graphTooltip: Optional[int] = 0
    liveNow: Optional[bool] = False
    style: Optional[str] = "dark"


class Dashboard(BaseModel):
    """Complete dashboard representation."""

    meta: Dict[str, Any]
    dashboard: Dict[str, Any]


class SearchResult(BaseModel):
    """Dashboard search result."""

    uid: str
    title: str
    url: str
    type: str
    tags: List[str] = Field(default_factory=list)
    isStarred: bool = False
    folderId: Optional[int] = None
    folderUid: Optional[str] = None
    folderTitle: Optional[str] = None
    folderUrl: Optional[str] = None
    uri: Optional[str] = None


class Folder(BaseModel):
    """Dashboard folder."""

    uid: str
    title: str
    url: Optional[str] = None
    hasAcl: Optional[bool] = False
    canSave: Optional[bool] = False
    canEdit: Optional[bool] = False
    canAdmin: Optional[bool] = False
    created: Optional[str] = None
    updated: Optional[str] = None
    version: Optional[int] = None


class DataSource(BaseModel):
    """Data source configuration."""

    uid: str
    name: str
    type: str
    url: Optional[str] = None
    access: Optional[str] = None
    isDefault: Optional[bool] = False
    jsonData: Optional[Dict[str, Any]] = None
    readOnly: Optional[bool] = False

