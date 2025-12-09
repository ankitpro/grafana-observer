# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
