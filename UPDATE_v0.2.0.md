# Version 0.2.0 Update - Email/Password Authentication Support

## 🎉 Successfully Published!

**Package**: `grafana-observer-mcp@0.2.0`  
**npm URL**: https://www.npmjs.com/package/grafana-observer-mcp  
**Published**: December 9, 2024

## ✨ What's New

### Dual Authentication Support

Users can now choose between **TWO authentication methods**:

#### Option 1: API Token (Recommended)
```bash
export GRAFANA_URL="https://your-grafana-instance.com"
export GRAFANA_TOKEN="your-api-token"
```

#### Option 2: Email/Password
```bash
export GRAFANA_URL="https://your-grafana-instance.com"
export GRAFANA_EMAIL="your-email@example.com"
export GRAFANA_PASSWORD="your-password"
```

### Configuration Examples

**MCP Config with API Token:**
```json
{
  "mcpServers": {
    "grafana-observer": {
      "command": "grafana-observer",
      "env": {
        "GRAFANA_URL": "https://grafana.preprod.tendplatform.com",
        "GRAFANA_TOKEN": "your-api-token"
      }
    }
  }
}
```

**MCP Config with Email/Password:**
```json
{
  "mcpServers": {
    "grafana-observer": {
      "command": "grafana-observer",
      "env": {
        "GRAFANA_URL": "https://grafana.preprod.tendplatform.com",
        "GRAFANA_EMAIL": "your-email@example.com",
        "GRAFANA_PASSWORD": "your-password"
      }
    }
  }
}
```

## 🔧 Technical Changes

### Updated Files:
1. **src/types.ts** - Added email/password to GrafanaConfig interface
2. **src/client.ts** - Implemented dual authentication support
3. **src/server.ts** - Updated to v0.2.0, added auth method logging
4. **package.json** - Bumped version to 0.2.0
5. **.env.example** - Added email/password examples
6. **README.md** - Updated authentication documentation
7. **CHANGELOG.md** - Added v0.2.0 release notes
8. **examples/mcp-config.json** - Added both auth examples

### Authentication Logic:
- Client checks for both authentication methods on initialization
- If both are provided, API Token takes precedence (with warning)
- If neither is provided, throws clear error message
- Uses HTTP Basic Auth for email/password
- Uses Bearer token for API token authentication

### Server Improvements:
- Logs authentication method on startup
- Better error messages for missing credentials
- Version bumped to 0.2.0

## 📦 Installation

### Update Existing Installation:
```bash
npm update -g grafana-observer-mcp
```

### Fresh Installation:
```bash
npm install -g grafana-observer-mcp
```

### Verify Version:
```bash
npm list -g grafana-observer-mcp
```

## 🚀 Usage

Both authentication methods work identically - just set the appropriate environment variables!

### Example with API Token:
```bash
export GRAFANA_URL="https://grafana.example.com"
export GRAFANA_TOKEN="glsa_xxxxx"
grafana-observer
```

### Example with Email/Password:
```bash
export GRAFANA_URL="https://grafana.example.com"
export GRAFANA_EMAIL="user@example.com"
export GRAFANA_PASSWORD="your-password"
grafana-observer
```

## 📝 Notes

- **API Token is recommended** for better security and performance
- Email/Password uses HTTP Basic Authentication
- If both methods are provided, API Token will be used
- All existing functionality remains unchanged
- Backward compatible with v0.1.0 configurations

## 🔗 Links

- **npm Package**: https://www.npmjs.com/package/grafana-observer-mcp
- **GitHub Repository**: https://github.com/ankitpro/grafana-observer
- **Issues**: https://github.com/ankitpro/grafana-observer/issues

## 🎯 Next Steps

1. Update your MCP configuration with your preferred authentication method
2. Test the connection
3. Start inspecting your Grafana dashboards!

---

**Thank you for using Grafana Observer MCP!** 🙏

