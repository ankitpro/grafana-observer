# 🚀 Quick Start: Configure Grafana Observer MCP in Cursor

## ✅ Prerequisites Complete

- ✅ Project built successfully
- ✅ All dependencies installed
- ✅ TypeScript compiled to JavaScript
- ✅ Configuration file ready

## 📝 Step-by-Step Configuration

### Step 1: Install grafana-observer-mcp

**Option A: Global Install (Recommended)**
```bash
npm install -g grafana-observer-mcp
```

**Option B: Use npx (No install needed)**
Skip installation, configure with `npx` command below.

### Step 2: Open Cursor MCP Settings

1. Open **Cursor**
2. Press `Cmd + ,` (or go to Cursor → Settings)
3. In the left sidebar, click **Features**
4. Click **Model Context Protocol**
5. Click **Edit Config** button

This will open your MCP configuration file (usually at `~/.cursor/mcp.json`)

### Step 3: Add Grafana Observer Configuration

Choose ONE of these options:

```json
{
  "mcpServers": {
    "grafana-observer": {
      "command": "node",
      "args": [
        "/Users/aagarwal/Documents/Projects/Chamberlain/Github/grafana-observer/dist/index.js"
      ],
      "env": {
        "GRAFANA_URL": "https://grafana.preprod.tendplatform.com",
        "GRAFANA_EMAIL": "your-email@example.com",
        "GRAFANA_PASSWORD": "your-password-here",
        "GRAFANA_DEFAULT_DATASOURCE_UID": "000000007",
        "GRAFANA_ORG_ID": "1"
      }
    }
  }
}
```

**⚠️ IMPORTANT:** Replace these values:
- `GRAFANA_EMAIL`: Your actual Grafana email
- `GRAFANA_PASSWORD`: Your actual Grafana password

### Step 3: Save and Restart

1. **Save** the configuration file
2. **Completely quit** Cursor (`Cmd + Q`)
3. **Reopen** Cursor

### Step 4: Verify It's Working

After Cursor restarts, open a new chat and try:

```
List all dashboards in Grafana
```

or

```
Check the health of Grafana
```

You should see the MCP server respond with dashboard information or health status!

## 🎯 What You Can Do Now

### Dashboard Queries
```
Show me all dashboards
Get dashboard ScOkgQ9Nz details
What panels are in the load testing dashboard?
Extract all queries from dashboard ScOkgQ9Nz
```

### Prometheus Monitoring
```
Are all hub-app instances up?
How many instances are running?
Get current client connections
Show me all metrics for hub-app
What's the login rate?
```

### Advanced Queries
```
Show me CPU usage for the last hour
Get memory trends for all instances
List all available Prometheus metrics
What jobs are configured in Prometheus?
```

## 🔍 Finding Your Datasource UID

If you need to find your Prometheus datasource UID:

1. Go to https://grafana.preprod.tendplatform.com
2. Click **Configuration** (gear icon) → **Data Sources**
3. Click on your **Prometheus** datasource
4. Look at the URL: `https://grafana.../datasources/edit/YOUR_UID_HERE`
5. Copy the UID and update `GRAFANA_DEFAULT_DATASOURCE_UID` in the config

## 🐛 Troubleshooting

### MCP Not Showing Up

**Check Cursor Logs:**
1. In Cursor, go to **Help** → **Show Logs**
2. Look for "grafana-observer" errors
3. Common issues:
   - Invalid JSON in config file
   - Wrong file path
   - Missing credentials

### Authentication Errors

If you see authentication errors:

**Option A: Use API Token Instead**
```json
{
  "mcpServers": {
    "grafana-observer": {
      "command": "node",
      "args": ["/Users/aagarwal/Documents/Projects/Chamberlain/Github/grafana-observer/dist/index.js"],
      "env": {
        "GRAFANA_URL": "https://grafana.preprod.tendplatform.com",
        "GRAFANA_TOKEN": "your-api-token",
        "GRAFANA_DEFAULT_DATASOURCE_UID": "000000007"
      }
    }
  }
}
```

To get an API token:
1. Go to Grafana → Configuration → API Keys
2. Create new key with **Viewer** role
3. Copy the token

**Option B: Verify Credentials**
- Make sure email and password are correct
- Try logging into Grafana web UI with same credentials

### "Datasource UID required" Error

This means `GRAFANA_DEFAULT_DATASOURCE_UID` is not set or incorrect:
1. Find the correct UID (see "Finding Your Datasource UID" above)
2. Update the config
3. Restart Cursor

### Connection Refused

- Verify you can access https://grafana.preprod.tendplatform.com in your browser
- Check if you're on VPN (if required)
- Verify the URL is correct

## 🧪 Test Without Cursor

You can test the MCP server directly in terminal:

```bash
cd /Users/aagarwal/Documents/Projects/Chamberlain/Github/grafana-observer

export GRAFANA_URL="https://grafana.preprod.tendplatform.com"
export GRAFANA_EMAIL="your-email@example.com"
export GRAFANA_PASSWORD="your-password"
export GRAFANA_DEFAULT_DATASOURCE_UID="000000007"

node dist/index.js
```

Expected output:
```
Starting Grafana Observer MCP Server v0.3.0
Connected to Grafana at https://grafana.preprod.tendplatform.com
Authentication method: basic
Default datasource UID: 000000007
```

Press `Ctrl+C` to stop.

## 📚 Available Tools (16 Total)

### Dashboard Tools (9)
1. ✅ `get_dashboard` - Get complete dashboard info
2. ✅ `get_panel` - Get specific panel details
3. ✅ `list_dashboards` - List all dashboards
4. ✅ `get_dashboard_variables` - Get template variables
5. ✅ `list_folders` - List dashboard folders
6. ✅ `search_by_tag` - Search by tags
7. ✅ `get_dashboard_tags` - Get all tags
8. ✅ `get_datasources` - List data sources
9. ✅ `get_datasource` - Get datasource details

### Prometheus Tools (7)
10. ✅ `grafana_health_check` - Check Grafana health
11. ✅ `grafana_query_metric` - Instant Prometheus query
12. ✅ `grafana_query_range` - Time-series query
13. ✅ `grafana_list_metrics` - List available metrics
14. ✅ `grafana_get_label_values` - Get label values
15. ✅ `grafana_get_service_status` - Check service status
16. ✅ `grafana_get_panel_queries` - Extract panel queries

## 🎉 You're All Set!

Once configured, you can:
- 📊 Inspect any Grafana dashboard
- 🔍 Query Prometheus metrics
- 📈 Monitor service health
- 🐛 Troubleshoot issues
- 📉 Analyze trends

**Happy monitoring!** 🚀

---

**Need Help?**
- Check `CURSOR_SETUP.md` for detailed troubleshooting
- Review `README.md` for complete documentation
- See `examples/` for more configuration examples

