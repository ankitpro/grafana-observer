# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2024-12-09

### Added
- **Prometheus Query Support**: Execute instant and range queries via Grafana's Prometheus datasource proxy
  - `grafana_query_metric`: Get current metric values using PromQL
  - `grafana_query_range`: Query time-series data with automatic statistics (avg, max, min)
- **Metric Discovery**: List all available Prometheus metrics with optional filtering
  - `grafana_list_metrics`: Discover metrics by name pattern
- **Label Queries**: Get available label values for filtering
  - `grafana_get_label_values`: Query job names, instances, and other labels
- **Service Monitoring**: Check service health and availability
  - `grafana_get_service_status`: Monitor UP/DOWN status using the 'up' metric
- **Health Checks**: Verify Grafana instance health
  - `grafana_health_check`: Get version, database status, and commit info
- **Panel Query Extraction**: Extract queries from dashboard panels
  - `grafana_get_panel_queries`: Get all queries configured in panels
- **Default Datasource Configuration**: Set `GRAFANA_DEFAULT_DATASOURCE_UID` for Prometheus queries
- Comprehensive Prometheus query documentation and examples
- Support for PromQL expressions with aggregations, rates, and filters

### Changed
- Updated server version to 0.3.0
- Enhanced startup logging to show default datasource configuration
- Improved error messages for missing datasource UID

### Technical
- Added Prometheus-specific TypeScript interfaces
- Extended GrafanaClient with Prometheus proxy methods
- Added statistics calculation for range queries
- Implemented metric name filtering
- Added service status aggregation (up/down counts)

## [0.2.0] - 2024-12-09

### Added
- **Email/Password Authentication**: Added support for email and password authentication as an alternative to API tokens
- Users can now authenticate using either:
  - `GRAFANA_TOKEN` (API token) - Recommended
  - `GRAFANA_EMAIL` and `GRAFANA_PASSWORD` (Basic auth)
- Authentication method logging on server startup
- Improved error messages for missing authentication credentials

### Changed
- Updated client to support multiple authentication methods
- Enhanced documentation with authentication examples
- Updated .env.example with both authentication options

### Fixed
- Better validation of authentication credentials on initialization

## [0.1.0] - 2024-12-09

### Added
- Initial release of Grafana Observer MCP
- Tool: `get_dashboard` - Get complete dashboard information
- Tool: `get_panel` - Get specific panel details
- Tool: `list_dashboards` - List and search dashboards
- Tool: `get_dashboard_variables` - Get template variables
- Tool: `list_folders` - List dashboard folders
- Tool: `search_by_tag` - Search dashboards by tags
- Tool: `get_dashboard_tags` - Get all available tags
- Tool: `get_datasources` - List data sources
- Tool: `get_datasource` - Get specific data source details
- Comprehensive test suite
- Documentation and examples
- TypeScript/Node.js implementation
- Published to npm as `grafana-observer-mcp`
