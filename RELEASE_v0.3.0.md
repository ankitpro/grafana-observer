# 🚀 Grafana Observer MCP v0.3.0 Release

## 🎉 Major Update: Prometheus Query Support

Version 0.3.0 adds comprehensive Prometheus querying capabilities to the Grafana Observer MCP, transforming it from a dashboard inspection tool into a complete Grafana + Prometheus monitoring solution.

## ✨ What's New

### Prometheus Query Tools (7 New Tools)

#### 1. **Instant Queries** (`grafana_query_metric`)
Execute PromQL queries to get current metric values:
```promql
up{job="my-app"}
sum(metric_name{label="value"})
rate(counter_metric[5m])
```

#### 2. **Range Queries** (`grafana_query_range`)
Query time-series data with automatic statistics:
- Returns avg, max, min, first, last values
- Supports any time range and step interval
- Perfect for trend analysis

#### 3. **Metric Discovery** (`grafana_list_metrics`)
List all available Prometheus metrics with optional filtering:
- Discover what metrics exist
- Filter by keyword (e.g., "hub", "login", "memory")
- Returns up to 100 metrics per query

#### 4. **Label Value Queries** (`grafana_get_label_values`)
Get all values for specific labels:
- Find all job names
- List all instances
- Discover environment labels
- Any Prometheus label

#### 5. **Service Status Monitoring** (`grafana_get_service_status`)
Check service health using the 'up' metric:
- Shows UP/DOWN status for each instance
- Counts total up and down services
- Filter by job or instance

#### 6. **Health Checks** (`grafana_health_check`)
Verify Grafana instance health:
- Version information
- Database status
- Commit hash

#### 7. **Panel Query Extraction** (`grafana_get_panel_queries`)
Extract all queries from dashboard panels:
- Get PromQL queries
- SQL queries
- Any query type
- Organized by panel

## 📊 Complete Feature Set

### Dashboard Tools (9 tools)
- ✅ Get dashboard information
- ✅ Inspect panels
- ✅ List dashboards
- ✅ Dashboard variables
- ✅ Folder navigation
- ✅ Tag-based search
- ✅ Get all tags
- ✅ List datasources
- ✅ Get datasource details

### Prometheus Tools (7 tools)
- ✅ Instant queries
- ✅ Range queries with statistics
- ✅ Metric discovery
- ✅ Label value queries
- ✅ Service status monitoring
- ✅ Health checks
- ✅ Panel query extraction

**Total: 16 Tools**

## 🔧 Configuration

### New Environment Variable

```bash
GRAFANA_DEFAULT_DATASOURCE_UID="your-datasource-uid"
```

Set this to your Prometheus datasource UID for seamless querying. Find it in:
- Grafana → Configuration → Data Sources → Prometheus → Settings
- Look at the URL for the UID

### Updated MCP Config

```json
{
  "mcpServers": {
    "grafana-observer": {
      "command": "grafana-observer",
      "env": {
        "GRAFANA_URL": "https://grafana.example.com",
        "GRAFANA_TOKEN": "your-api-token",
        "GRAFANA_DEFAULT_DATASOURCE_UID": "your-datasource-uid"
      }
    }
  }
}
```

## 📝 Example Use Cases

### 1. Service Health Monitoring
```
"Are all my-app instances healthy?"
"How many instances are down?"
"What's the status of instance 10.0.0.X?"
```

### 2. Metric Analysis
```
"Show me CPU usage for the last hour"
"Get memory trends for all instances"
"What's the current login rate?"
```

### 3. Troubleshooting
```
"Extract all queries from the load testing dashboard"
"What metrics are available for my-app?"
"Show me all instances running the broker service"
```

### 4. Capacity Planning
```
"Get client connection trends for the last 3 hours"
"Show me peak memory usage today"
"What's the average response time?"
```

## 🎯 Real-World Examples

### Check Service Status
**Query:** "Check if all my-app instances are healthy"

**Result:**
```json
{
  "total": 12,
  "up": 8,
  "down": 4,
  "services": [
    {"instance": "10.0.0.X:8123", "status": "UP", "job": "my-app"},
    {"instance": "10.0.0.X:8123", "status": "DOWN", "job": "my-app"},
    ...
  ]
}
```

### Get Current Metrics
**Query:** "How many clients are connected?"

**Uses:** `grafana_query_metric`
```promql
sum(tend_hub_app_endpoint_clients{channel="IM", type="Total"})
```

**Result:** 1858 total clients

### Analyze Trends
**Query:** "Show me client connections for the last 3 hours"

**Uses:** `grafana_query_range`
**Returns:** Time-series data with statistics:
- Average: 1850 clients
- Max: 1900 clients
- Min: 1800 clients
- 36 data points (5-minute intervals)

## 🔄 Migration from v0.2.0

### No Breaking Changes
All existing tools work exactly the same. Simply add the new environment variable:

```bash
export GRAFANA_DEFAULT_DATASOURCE_UID="your-datasource-uid"
```

### Optional Configuration
If you don't set `GRAFANA_DEFAULT_DATASOURCE_UID`, you can still:
- Use all dashboard tools (no change)
- Use Prometheus tools by providing `datasource_uid` parameter

## 📚 Documentation Updates

- ✅ Comprehensive README with all 16 tools
- ✅ CHANGELOG with detailed v0.3.0 notes
- ✅ CURSOR_SETUP.md for Cursor configuration
- ✅ QUICK_START_CURSOR.md for quick setup
- ✅ Updated examples with Prometheus queries
- ✅ Troubleshooting guide

## 🛠️ Technical Details

### New TypeScript Interfaces
- `PrometheusQueryResult`
- `PrometheusLabelsResult`
- `PrometheusSeriesResult`
- `HealthCheckResult`
- `ServiceStatus`
- `PanelQuery`

### Extended GrafanaClient
- `prometheusQuery()` - Instant queries
- `prometheusQueryRange()` - Range queries
- `getMetricNames()` - List metrics
- `getLabelValues()` - Query labels
- `getSeries()` - Get series metadata
- `getServiceStatus()` - Check service health
- `healthCheck()` - Grafana health
- `getOrgInfo()` - Organization info
- `getPanelQueries()` - Extract panel queries

### API Endpoints Used
- `/api/health` - Health check
- `/api/org` - Organization info
- `/api/datasources/proxy/uid/:uid/api/v1/query` - Instant queries
- `/api/datasources/proxy/uid/:uid/api/v1/query_range` - Range queries
- `/api/datasources/proxy/uid/:uid/api/v1/label/__name__/values` - Metrics
- `/api/datasources/proxy/uid/:uid/api/v1/label/:label/values` - Labels
- `/api/datasources/proxy/uid/:uid/api/v1/series` - Series metadata

## 🎓 Learning Resources

### PromQL Examples Included
- Basic selectors
- Aggregation functions (sum, avg, max, min, count)
- Rate calculations
- Mathematical operations
- Comparison and filtering
- Label matching (exact, regex, negative)

### Common Patterns
```promql
# Service status
up{job="my-app"}

# Count instances
count(up{job="my-app"} == 1)

# Aggregate metrics
sum(metric_name{label="value"})

# Calculate rates
rate(counter_metric[5m]) * 60

# Memory in GB
jvm_memory_used_bytes / 1073741824

# Percentage
(metric1 / metric2) * 100
```

## 🚀 Getting Started

### 1. Install/Update
```bash
npm install -g grafana-observer-mcp@0.3.0
```

### 2. Configure
Add `GRAFANA_DEFAULT_DATASOURCE_UID` to your MCP config

### 3. Restart
Restart Cursor or your MCP client

### 4. Test
```
"Check Grafana health"
"List all available metrics"
"Are all services up?"
```

## 📊 Performance

- ✅ Efficient metric filtering (client-side)
- ✅ Automatic statistics calculation for range queries
- ✅ Pagination support for large metric lists
- ✅ Connection pooling via axios
- ✅ Proper error handling and timeouts

## 🔐 Security

- ✅ Read-only operations only
- ✅ No write access to Grafana or Prometheus
- ✅ Supports both API token and email/password auth
- ✅ SSL verification (configurable)
- ✅ No credentials stored or logged

## 🐛 Known Limitations

1. **Metric Listing**: Limited to first 100 metrics (use filter to narrow down)
2. **Range Queries**: Statistics calculated client-side (may be slow for very large datasets)
3. **Datasource UID**: Must be configured or provided per query
4. **Prometheus Only**: Query tools work with Prometheus datasources only

## 🎯 Future Enhancements

Potential features for future versions:
- CloudWatch query support
- Loki log queries
- Alert rule inspection
- Annotation queries
- Variable interpolation
- Query templates
- Metric favorites

## 📦 Package Info

- **Package:** `grafana-observer-mcp`
- **Version:** 0.3.0
- **License:** Apache-2.0
- **Repository:** https://github.com/ankitpro/grafana-observer
- **npm:** https://www.npmjs.com/package/grafana-observer-mcp

## 🙏 Acknowledgments

Built following the comprehensive Grafana MCP Server Development Guide, implementing all recommended features for dashboard inspection and Prometheus querying.

## 📞 Support

- **Issues:** https://github.com/ankitpro/grafana-observer/issues
- **Docs:** https://github.com/ankitpro/grafana-observer#readme
- **MCP Protocol:** https://modelcontextprotocol.io/

---

**Upgrade today and unlock the full power of Grafana + Prometheus monitoring in your AI assistant!** 🚀

