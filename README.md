# Grafana Observer MCP

A Model Context Protocol (MCP) server for reading and observing Grafana dashboards, panels, and configurations. This tool is designed for troubleshooting, analysis, and understanding your Grafana setup without making any modifications.

## Features

- 📊 **Get Dashboard Information**: Retrieve complete dashboard metadata and configuration
- 🔍 **Inspect Panels**: Examine individual panel configurations, queries, and visualizations
- 📋 **List Dashboards**: Browse all accessible dashboards with filtering options
- 🔧 **Dashboard Variables**: Fetch dashboard template variables and their configurations
- 🏷️ **Dashboard Tags**: List and search by dashboard tags
- 📂 **Folder Navigation**: Browse dashboard folders and their contents
- 🔗 **Panel Queries**: Extract data source queries from panels for analysis

## Installation

```bash
# Clone the repository
git clone https://github.com/your-org/grafana-observer.git
cd grafana-observer

# Install dependencies
pip install -r requirements.txt
```

## Configuration

Set the following environment variables:

```bash
# Required
export GRAFANA_URL="https://your-grafana-instance.com"

# Authentication: Choose ONE of the following methods:

# Option 1: API Token (Recommended)
export GRAFANA_TOKEN="your-api-token"

# Option 2: Email/Password
export GRAFANA_EMAIL="your-email@example.com"
export GRAFANA_PASSWORD="your-password"

# Optional
export GRAFANA_ORG_ID="1"  # Default organization ID
export GRAFANA_VERIFY_SSL="true"  # Set to false for self-signed certificates
```

### Authentication Methods

#### Option 1: API Token (Recommended)

1. In Grafana, go to Configuration → API Keys (or Service Accounts for newer versions)
2. Create a new API key with **Viewer** permissions
3. Copy the token and set it as `GRAFANA_TOKEN`

#### Option 2: Email/Password

Use your Grafana login credentials:
- Set `GRAFANA_EMAIL` to your email address
- Set `GRAFANA_PASSWORD` to your password
- This uses HTTP Basic Authentication

**Note:** If both methods are provided, API Token will be used (preferred)

## Usage with MCP

Add to your MCP settings configuration:

```json
{
  "mcpServers": {
    "grafana-observer": {
      "command": "python",
      "args": ["/path/to/grafana-observer/src/grafana_observer/server.py"],
      "env": {
        "GRAFANA_URL": "https://your-grafana-instance.com",
        "GRAFANA_TOKEN": "your-api-token"
      }
    }
  }
}
```

## Available Tools

### 1. `get_dashboard`
Get complete dashboard information including all panels.

**Parameters:**
- `dashboard_uid` (required): The UID of the dashboard
- `include_panels` (optional): Include detailed panel information (default: true)

### 2. `get_panel`
Get detailed information about a specific panel.

**Parameters:**
- `dashboard_uid` (required): The UID of the dashboard
- `panel_id` (required): The ID of the panel

### 3. `list_dashboards`
List all accessible dashboards with optional filtering.

**Parameters:**
- `query` (optional): Search query string
- `tag` (optional): Filter by tag
- `folder_ids` (optional): Comma-separated folder IDs
- `limit` (optional): Maximum results (default: 100)

### 4. `get_dashboard_variables`
Get all template variables for a dashboard.

**Parameters:**
- `dashboard_uid` (required): The UID of the dashboard

### 5. `list_folders`
List all dashboard folders.

**Parameters:**
- `limit` (optional): Maximum results (default: 100)

### 6. `search_by_tag`
Search dashboards by tags.

**Parameters:**
- `tags` (required): Comma-separated list of tags

## Example Queries

```
"Show me all panels in dashboard xyz123"
"What queries are used in panel 5 of dashboard abc456?"
"List all dashboards tagged with 'production'"
"Get the configuration of the main dashboard"
"What variables are available in dashboard def789?"
```

## Permissions

This MCP server requires **read-only** access to Grafana. It uses the following API endpoints:

- `GET /api/dashboards/uid/:uid`
- `GET /api/search`
- `GET /api/folders`

No write operations are performed.

## Troubleshooting

### Connection Issues

```bash
# Test your Grafana connection
curl -H "Authorization: Bearer $GRAFANA_TOKEN" "$GRAFANA_URL/api/health"
```

### SSL Certificate Errors

If using self-signed certificates:

```bash
export GRAFANA_VERIFY_SSL="false"
```

### Permission Errors

Ensure your API token has at least **Viewer** role access to the dashboards you want to inspect.

## Development

```bash
# Install development dependencies
pip install -r requirements-dev.txt

# Run tests
pytest

# Format code
black src/
isort src/
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

Apache License 2.0 - See [LICENSE](LICENSE) file for details.

## Related Projects

- [MCP Grafana](https://github.com/grafana/mcp-grafana) - For creating and managing Grafana resources
- [Grafana HTTP API](https://grafana.com/docs/grafana/latest/developers/http_api/)

## Support

For issues and questions:
- Open an issue on GitHub
- Check Grafana API documentation
- Review MCP protocol documentation

