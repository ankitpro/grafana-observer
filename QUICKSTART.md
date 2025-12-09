# Quick Start Guide

Get up and running with Grafana Observer MCP in 5 minutes!

## Prerequisites

- Python 3.10 or higher
- A Grafana instance (Cloud or self-hosted)
- Grafana API token with Viewer permissions

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-org/grafana-observer.git
cd grafana-observer

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Step 2: Configure Grafana Connection

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Grafana credentials:

```env
GRAFANA_URL=https://grafana.preprod.tendplatform.com
GRAFANA_TOKEN=your-api-token-here
GRAFANA_ORG_ID=1
GRAFANA_VERIFY_SSL=true
```

### Getting a Grafana API Token

1. Log into your Grafana instance
2. Go to **Configuration** → **API Keys** (or **Service Accounts** for Grafana 9+)
3. Click **Add API Key** (or **Create service account token**)
4. Set role to **Viewer**
5. Copy the token and paste it into your `.env` file

## Step 3: Test Connection

```bash
python scripts/test_connection.py
```

You should see:

```
Testing Grafana connection...
--------------------------------------------------
✓ Connected to: https://grafana.preprod.tendplatform.com
✓ Organization ID: 1

Testing API access...
✓ Found 5 dashboards (showing max 5)

Sample dashboards:
  - Pre-Prod Load Testing All Components (UID: ScOkgQ9Nz)
  - ...

✓ Found 3 folders
✓ Found 2 data sources

==================================================
✓ Connection test successful!
==================================================
```

## Step 4: Configure MCP Client

Add to your MCP client configuration (e.g., Claude Desktop, Cursor):

### For macOS/Linux:

```json
{
  "mcpServers": {
    "grafana-observer": {
      "command": "python",
      "args": ["/absolute/path/to/grafana-observer/src/grafana_observer/server.py"],
      "env": {
        "GRAFANA_URL": "https://grafana.preprod.tendplatform.com",
        "GRAFANA_TOKEN": "your-api-token"
      }
    }
  }
}
```

### For Windows:

```json
{
  "mcpServers": {
    "grafana-observer": {
      "command": "python",
      "args": ["C:\\path\\to\\grafana-observer\\src\\grafana_observer\\server.py"],
      "env": {
        "GRAFANA_URL": "https://grafana.preprod.tendplatform.com",
        "GRAFANA_TOKEN": "your-api-token"
      }
    }
  }
}
```

**Note:** Replace `/absolute/path/to` with the actual absolute path to your installation.

## Step 5: Test with MCP Client

Restart your MCP client (e.g., Claude Desktop) and try these queries:

### Example 1: Get Dashboard Information

```
Show me the configuration for dashboard ScOkgQ9Nz
```

### Example 2: Inspect a Panel

```
What queries are configured in panel 2 of dashboard ScOkgQ9Nz?
```

### Example 3: Search Dashboards

```
List all dashboards in my Grafana instance
```

### Example 4: Get Dashboard Variables

```
Show me all variables in dashboard ScOkgQ9Nz
```

## Common Issues

### Connection Refused

- **Problem:** `Connection refused` or timeout errors
- **Solution:** Check that your Grafana URL is correct and accessible

### Authentication Failed

- **Problem:** `401 Unauthorized` error
- **Solution:** Verify your API token is correct and has not expired

### SSL Certificate Errors

- **Problem:** SSL verification errors with self-signed certificates
- **Solution:** Set `GRAFANA_VERIFY_SSL=false` in your `.env` file

### Dashboard Not Found

- **Problem:** `Dashboard not found` error
- **Solution:** Check the dashboard UID in the URL. It's the alphanumeric string after `/d/` in the dashboard URL:
  ```
  https://grafana.example.com/d/ScOkgQ9Nz/dashboard-name
                                  ^^^^^^^^^
                                  This is the UID
  ```

## Next Steps

- Read the [full README](README.md) for all available tools
- Check out [example queries](examples/queries.md)
- Learn about [contributing](CONTRIBUTING.md)

## Need Help?

- Open an issue on GitHub
- Check the [Grafana HTTP API docs](https://grafana.com/docs/grafana/latest/developers/http_api/)
- Review the [MCP protocol docs](https://modelcontextprotocol.io/)

## Advanced: Using with Virtual Environment

If you want to use a virtual environment in your MCP configuration:

```json
{
  "mcpServers": {
    "grafana-observer": {
      "command": "/absolute/path/to/grafana-observer/venv/bin/python",
      "args": ["/absolute/path/to/grafana-observer/src/grafana_observer/server.py"],
      "env": {
        "GRAFANA_URL": "https://grafana.preprod.tendplatform.com",
        "GRAFANA_TOKEN": "your-api-token"
      }
    }
  }
}
```

This ensures the correct Python interpreter with all dependencies is used.

