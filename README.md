# Grafana Observer MCP

A comprehensive Model Context Protocol (MCP) server for reading and observing Grafana dashboards, panels, configurations, and querying Prometheus metrics. This tool is designed for troubleshooting, analysis, and understanding your Grafana setup without making any modifications.

## Features

### Dashboard & Panel Inspection
- 📊 **Get Dashboard Information**: Retrieve complete dashboard metadata and configuration
- 🔍 **Inspect Panels**: Examine individual panel configurations, queries, and visualizations
- 📋 **List Dashboards**: Browse all accessible dashboards with filtering options
- 🔧 **Dashboard Variables**: Fetch dashboard template variables and their configurations
- 🏷️ **Dashboard Tags**: List and search by dashboard tags
- 📂 **Folder Navigation**: Browse dashboard folders and their contents
- 🔗 **Panel Queries**: Extract data source queries from panels for analysis

### Prometheus Metrics & Monitoring
- 📈 **Instant Queries**: Get current metric values using PromQL
- 📉 **Range Queries**: Query time-series data over time periods
- 🔎 **Metric Discovery**: List all available Prometheus metrics
- 🏷️ **Label Values**: Discover available label values (jobs, instances, etc.)
- ✅ **Service Status**: Check service health using the 'up' metric
- 🩺 **Health Checks**: Verify Grafana instance health and version

## Installation

### Via npm (Recommended)

```bash
npm install -g grafana-observer-mcp
```

### From Source

```bash
git clone https://github.com/ankitpro/grafana-observer.git
cd grafana-observer
npm install
npm run build
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

# For Prometheus queries (optional but recommended)
export GRAFANA_DEFAULT_DATASOURCE_UID="000000007"  # Your Prometheus datasource UID
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

Add to your MCP settings configuration (e.g., Claude Desktop, Cursor):

**Option 1: Using npm global install (Recommended)**

First install globally:
```bash
npm install -g grafana-observer-mcp
```

Then configure:
```json
{
  "mcpServers": {
    "grafana-observer": {
      "command": "grafana-observer",
      "env": {
        "GRAFANA_URL": "https://your-grafana-instance.com",
        "GRAFANA_TOKEN": "your-api-token",
        "GRAFANA_DEFAULT_DATASOURCE_UID": "000000007"
      }
    }
  }
}
```

**Option 2: Using npx (No install needed)**

```json
{
  "mcpServers": {
    "grafana-observer": {
      "command": "npx",
      "args": ["-y", "grafana-observer-mcp"],
      "env": {
        "GRAFANA_URL": "https://your-grafana-instance.com",
        "GRAFANA_TOKEN": "your-api-token",
        "GRAFANA_DEFAULT_DATASOURCE_UID": "000000007"
      }
    }
  }
}
```

**Option 3: Using local development build**

```json
{
  "mcpServers": {
    "grafana-observer": {
      "command": "node",
      "args": ["/absolute/path/to/grafana-observer/dist/index.js"],
      "env": {
        "GRAFANA_URL": "https://your-grafana-instance.com",
        "GRAFANA_EMAIL": "your-email@example.com",
        "GRAFANA_PASSWORD": "your-password",
        "GRAFANA_DEFAULT_DATASOURCE_UID": "000000007"
      }
    }
  }
}
```

## Available Tools

### Dashboard & Panel Tools

#### 1. `get_dashboard`
Get complete dashboard information including all panels.

**Parameters:**
- `dashboard_uid` (required): The UID of the dashboard
- `include_panels` (optional): Include detailed panel information (default: true)

#### 2. `get_panel`
Get detailed information about a specific panel.

**Parameters:**
- `dashboard_uid` (required): The UID of the dashboard
- `panel_id` (required): The ID of the panel

#### 3. `list_dashboards`
List all accessible dashboards with optional filtering.

**Parameters:**
- `query` (optional): Search query string
- `tag` (optional): Filter by tag
- `folder_ids` (optional): Comma-separated folder IDs
- `starred` (optional): Show only starred dashboards
- `limit` (optional): Maximum results (default: 100)

#### 4. `get_dashboard_variables`
Get all template variables for a dashboard.

**Parameters:**
- `dashboard_uid` (required): The UID of the dashboard

#### 5. `list_folders`
List all dashboard folders.

**Parameters:**
- `limit` (optional): Maximum results (default: 100)

#### 6. `search_by_tag`
Search dashboards by tags.

**Parameters:**
- `tags` (required): Comma-separated list of tags

#### 7. `get_dashboard_tags`
Get all available dashboard tags with usage counts.

#### 8. `get_datasources`
List all configured data sources in Grafana.

#### 9. `get_datasource`
Get detailed information about a specific data source by UID.

**Parameters:**
- `uid` (required): The UID of the data source

### Prometheus Query Tools

#### 10. `grafana_health_check`
Check Grafana instance health and version information.

#### 11. `grafana_query_metric`
Execute a Prometheus instant query to get current metric values.

**Parameters:**
- `query` (required): PromQL expression (e.g., `up{job="hub-app"}`)
- `datasource_uid` (optional): Datasource UID (uses default if not provided)
- `time` (optional): Evaluation timestamp in Unix seconds

**Example queries:**
- `up{job="hub-app"}` - Check service status
- `sum(metric_name)` - Aggregate metric values
- `rate(counter_metric[5m])` - Calculate rate over 5 minutes

#### 12. `grafana_query_range`
Execute a Prometheus range query to get time-series data.

**Parameters:**
- `query` (required): PromQL expression
- `start` (required): Start timestamp in Unix seconds
- `end` (required): End timestamp in Unix seconds
- `step` (required): Query resolution step in seconds (e.g., 300 for 5 minutes)
- `datasource_uid` (optional): Datasource UID

**Returns:** Time-series data with statistics (avg, max, min, first, last)

#### 13. `grafana_list_metrics`
Get all available metric names from Prometheus.

**Parameters:**
- `datasource_uid` (optional): Datasource UID
- `filter` (optional): Filter pattern to match metric names

#### 14. `grafana_get_label_values`
Get all values for a specific Prometheus label.

**Parameters:**
- `label_name` (required): Label name (e.g., "job", "instance", "environment")
- `datasource_uid` (optional): Datasource UID

#### 15. `grafana_get_service_status`
Check service availability using the "up" metric.

**Parameters:**
- `job` (optional): Filter by job name
- `instance` (optional): Filter by instance
- `datasource_uid` (optional): Datasource UID

**Returns:** UP/DOWN status for each instance with counts

#### 16. `grafana_get_panel_queries`
Extract all queries from dashboard panels.

**Parameters:**
- `dashboard_uid` (required): Dashboard UID

**Returns:** Panel IDs, titles, types, and their associated queries

## Example Queries

### Dashboard Inspection
```
"Show me all panels in dashboard xyz123"
"What queries are used in panel 5 of dashboard abc456?"
"List all dashboards tagged with 'production'"
"Get the configuration of the main dashboard"
"What variables are available in dashboard def789?"
```

### Prometheus Monitoring
```
"Check if all hub-app instances are healthy"
"How many clients are connected right now?"
"Show me the CPU usage trend for the last 3 hours"
"What metrics are available for the hub-app service?"
"List all running instances"
"Get the login rate over the last hour"
```

## Prometheus Query Examples

### Check Service Health
```promql
up{job="hub-app"}
```

### Count Active Instances
```promql
count(up{job="hub-app"} == 1)
```

### Get Client Connections
```promql
sum(tend_hub_app_endpoint_clients{channel="IM", type="Total"})
```

### Calculate Login Rate
```promql
sum(rate(hub_loginAttempts_total[5m])) * 60
```

### Memory Usage
```promql
jvm_memory_used_bytes{area="heap"} / 1073741824
```

## Permissions

This MCP server requires **read-only** access to Grafana. It uses the following API endpoints:

### Dashboard APIs
- `GET /api/dashboards/uid/:uid`
- `GET /api/search`
- `GET /api/folders`
- `GET /api/datasources`

### Prometheus APIs (via Grafana Proxy)
- `GET /api/datasources/proxy/uid/:uid/api/v1/query`
- `GET /api/datasources/proxy/uid/:uid/api/v1/query_range`
- `GET /api/datasources/proxy/uid/:uid/api/v1/label/__name__/values`
- `GET /api/datasources/proxy/uid/:uid/api/v1/label/:label/values`
- `GET /api/datasources/proxy/uid/:uid/api/v1/series`

### Health Check
- `GET /api/health`
- `GET /api/org`

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

Ensure your API token has at least **Viewer** role access to the dashboards and datasources you want to inspect.

### Prometheus Query Errors

If you get "Datasource UID required" errors:
1. Find your Prometheus datasource UID in Grafana (Settings → Data Sources)
2. Set `GRAFANA_DEFAULT_DATASOURCE_UID` environment variable
3. Or provide `datasource_uid` parameter in each Prometheus query

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Run tests
npm test

# Lint
npm run lint

# Format
npm run format
```

## Version History

### v0.3.0 (Current)
- ✨ Added Prometheus instant query support
- ✨ Added Prometheus range query support with statistics
- ✨ Added metric discovery and listing
- ✨ Added label value queries
- ✨ Added service status checking
- ✨ Added health check endpoint
- ✨ Added panel query extraction
- 📚 Comprehensive Prometheus query documentation

### v0.2.0
- ✨ Added email/password authentication support
- 🔧 Improved authentication flexibility

### v0.1.0
- 🎉 Initial release
- 📊 Dashboard and panel inspection
- 🔍 Search and filtering capabilities

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

Apache License 2.0 - See [LICENSE](LICENSE) file for details.

## Related Projects

- [MCP Grafana](https://github.com/grafana/mcp-grafana) - For creating and managing Grafana resources
- [Grafana HTTP API](https://grafana.com/docs/grafana/latest/developers/http_api/)
- [Prometheus Query API](https://prometheus.io/docs/prometheus/latest/querying/api/)

## Support

For issues and questions:
- Open an issue on [GitHub](https://github.com/ankitpro/grafana-observer/issues)
- Check [Grafana API documentation](https://grafana.com/docs/grafana/latest/developers/http_api/)
- Review [MCP protocol documentation](https://modelcontextprotocol.io/)
