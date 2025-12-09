# Setting Up Grafana Observer MCP in Cursor

## Quick Setup Guide

### Step 1: Build the Project

The project has already been built. The compiled files are in the `dist/` directory.

### Step 2: Configure Cursor

1. Open Cursor Settings
2. Go to **Features** → **Model Context Protocol**
3. Click **Edit Config** to open your MCP configuration file

### Step 3: Add Configuration

Add this configuration to your MCP settings file:

```json
{
  "mcpServers": {
    "grafana-observer": {
      "command": "node",
      "args": ["/Users/user/Documents/Projects/your-path/grafana-observer/dist/index.js"],
      "env": {
        "GRAFANA_URL": "https://your-grafana-instance.com",
        "GRAFANA_EMAIL": "your-email@example.com",
        "GRAFANA_PASSWORD": "your-password",
        "GRAFANA_DEFAULT_DATASOURCE_UID": "your-datasource-uid",
        "GRAFANA_ORG_ID": "1"
      }
    }
  }
}
```

**Important:** Replace the following values:
- `GRAFANA_EMAIL`: Your Grafana email
- `GRAFANA_PASSWORD`: Your Grafana password
- `GRAFANA_DEFAULT_DATASOURCE_UID`: Your Prometheus datasource UID (if different)

### Step 4: Find Your Prometheus Datasource UID

1. Go to your Grafana instance: https://your-grafana-instance.com
2. Navigate to **Configuration** → **Data Sources**
3. Click on your Prometheus datasource
4. Look at the URL - the UID is at the end (e.g., `/datasources/edit/your-datasource-uid`)
5. Update `GRAFANA_DEFAULT_DATASOURCE_UID` in the config

### Step 5: Restart Cursor

After adding the configuration:
1. Save the MCP config file
2. Restart Cursor completely (Cmd+Q and reopen)
3. The MCP server will start automatically

### Step 6: Test the Connection

In Cursor's chat, try these commands:

#### Test Dashboard Access
```
List all dashboards in Grafana
```

#### Test Prometheus Queries
```
Check the health of all my-app instances
```

```
Show me the current client connections
```

```
What metrics are available for my-app?
```

## Available Tools

Once configured, you'll have access to 16 tools:

### Dashboard Tools (9)
1. `get_dashboard` - Get dashboard details
2. `get_panel` - Get panel information
3. `list_dashboards` - List all dashboards
4. `get_dashboard_variables` - Get template variables
5. `list_folders` - List folders
6. `search_by_tag` - Search by tags
7. `get_dashboard_tags` - Get all tags
8. `get_datasources` - List data sources
9. `get_datasource` - Get datasource details

### Prometheus Tools (7)
10. `grafana_health_check` - Check Grafana health
11. `grafana_query_metric` - Instant Prometheus query
12. `grafana_query_range` - Time-series Prometheus query
13. `grafana_list_metrics` - List available metrics
14. `grafana_get_label_values` - Get label values
15. `grafana_get_service_status` - Check service status
16. `grafana_get_panel_queries` - Extract panel queries

## Example Queries

### Dashboard Inspection
```
Show me the PRE-PROD-LOAD-TESTING-ALL-COMPONENTS dashboard
What panels are in dashboard abc123xyz?
Extract all queries from dashboard abc123xyz
```

### Service Monitoring
```
Are all my-app instances up?
How many instances are running?
What's the status of instance 10.0.0.X:8123?
```

### Metric Queries
```
Get the current value of up{job="my-app"}
Show me all metrics containing "hub"
What are all the job names in Prometheus?
Get client connections for the last hour
```

### Advanced Queries
```
Calculate the login rate over the last 5 minutes
Show me memory usage trends
Get all instances for the my-app job
```

## Troubleshooting

### MCP Not Appearing in Cursor

1. Check that the config file is valid JSON
2. Restart Cursor completely
3. Check Cursor logs: **Help** → **Show Logs**

### Authentication Errors

```json
// Try with API token instead
{
  "mcpServers": {
    "grafana-observer": {
      "command": "node",
      "args": ["/Users/user/Documents/Projects/your-path/grafana-observer/dist/index.js"],
      "env": {
        "GRAFANA_URL": "https://your-grafana-instance.com",
        "GRAFANA_TOKEN": "your-api-token-here",
        "GRAFANA_DEFAULT_DATASOURCE_UID": "your-datasource-uid"
      }
    }
  }
}
```

### Datasource UID Errors

If you get "Datasource UID required" errors:
1. The `GRAFANA_DEFAULT_DATASOURCE_UID` is not set or incorrect
2. Find the correct UID in Grafana Data Sources settings
3. Update the config and restart Cursor

### Connection Refused

- Verify the `GRAFANA_URL` is correct
- Check if you can access Grafana in your browser
- Verify your credentials are correct

## Testing Without Cursor

You can test the MCP server directly:

```bash
cd /Users/user/Documents/Projects/your-path/grafana-observer

# Set environment variables
export GRAFANA_URL="https://your-grafana-instance.com"
export GRAFANA_EMAIL="your-email@example.com"
export GRAFANA_PASSWORD="your-password"
export GRAFANA_DEFAULT_DATASOURCE_UID="your-datasource-uid"

# Run the server
node dist/index.js
```

You should see:
```
Starting Grafana Observer MCP Server v0.3.0
Connected to Grafana at https://your-grafana-instance.com
Authentication method: basic
Default datasource UID: your-datasource-uid
```

Press Ctrl+C to stop.

## Next Steps

Once configured and working:
1. Try the example queries above
2. Explore your dashboards and metrics
3. Use it for troubleshooting and monitoring
4. Combine multiple queries for comprehensive analysis

## Support

If you encounter issues:
- Check the logs in Cursor
- Verify your Grafana credentials
- Ensure the datasource UID is correct
- Test the connection manually using curl

