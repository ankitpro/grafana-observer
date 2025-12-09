#!/usr/bin/env python3
"""Grafana Observer MCP Server - Read-only Grafana dashboard inspection."""

import asyncio
import json
import logging
import sys
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent

from grafana_observer.client import GrafanaClient

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, stream=sys.stderr)
logger = logging.getLogger("grafana-observer")

# Initialize MCP server
app = Server("grafana-observer")

# Global Grafana client
grafana_client: Optional[GrafanaClient] = None


def get_client() -> GrafanaClient:
    """Get or create Grafana client."""
    global grafana_client
    if grafana_client is None:
        grafana_client = GrafanaClient()
    return grafana_client


def format_panel_info(panel: Dict[str, Any]) -> Dict[str, Any]:
    """Format panel information for easier reading."""
    return {
        "id": panel.get("id"),
        "title": panel.get("title", "Untitled"),
        "type": panel.get("type"),
        "description": panel.get("description"),
        "datasource": panel.get("datasource"),
        "targets": panel.get("targets", []),
        "gridPos": panel.get("gridPos"),
        "fieldConfig": panel.get("fieldConfig"),
        "options": panel.get("options"),
        "transparent": panel.get("transparent", False),
        "links": panel.get("links"),
        "repeat": panel.get("repeat"),
        "interval": panel.get("interval"),
        "maxDataPoints": panel.get("maxDataPoints"),
    }


def extract_panels(dashboard_json: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract and flatten all panels from dashboard including rows."""
    panels = []
    
    for panel in dashboard_json.get("panels", []):
        if panel.get("type") == "row":
            # Row panel - extract nested panels
            panels.append({
                "id": panel.get("id"),
                "title": panel.get("title", "Row"),
                "type": "row",
                "collapsed": panel.get("collapsed", False),
            })
            # Add panels inside collapsed rows
            if "panels" in panel:
                for nested_panel in panel["panels"]:
                    panels.append(format_panel_info(nested_panel))
        else:
            panels.append(format_panel_info(panel))
    
    return panels


@app.list_tools()
async def list_tools() -> List[Tool]:
    """List available tools."""
    return [
        Tool(
            name="get_dashboard",
            description=(
                "Get complete dashboard information including metadata, panels, and configuration. "
                "Use this to inspect a specific dashboard by its UID."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "dashboard_uid": {
                        "type": "string",
                        "description": "The UID of the dashboard (found in the dashboard URL)",
                    },
                    "include_panels": {
                        "type": "boolean",
                        "description": "Include detailed panel information (default: true)",
                        "default": True,
                    },
                },
                "required": ["dashboard_uid"],
            },
        ),
        Tool(
            name="get_panel",
            description=(
                "Get detailed information about a specific panel including queries, "
                "visualization settings, and field configurations."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "dashboard_uid": {
                        "type": "string",
                        "description": "The UID of the dashboard",
                    },
                    "panel_id": {
                        "type": "integer",
                        "description": "The ID of the panel (visible in panel edit mode)",
                    },
                },
                "required": ["dashboard_uid", "panel_id"],
            },
        ),
        Tool(
            name="list_dashboards",
            description=(
                "List all accessible dashboards with optional filtering by query, tag, or folder. "
                "Use this to discover available dashboards."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query to filter dashboards by title",
                    },
                    "tag": {
                        "type": "string",
                        "description": "Filter dashboards by tag",
                    },
                    "folder_ids": {
                        "type": "string",
                        "description": "Comma-separated folder IDs to filter by",
                    },
                    "starred": {
                        "type": "boolean",
                        "description": "Show only starred dashboards",
                        "default": False,
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of results (default: 100)",
                        "default": 100,
                    },
                },
            },
        ),
        Tool(
            name="get_dashboard_variables",
            description=(
                "Get all template variables configured for a dashboard. "
                "Variables are used for dynamic filtering and parameterization."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "dashboard_uid": {
                        "type": "string",
                        "description": "The UID of the dashboard",
                    },
                },
                "required": ["dashboard_uid"],
            },
        ),
        Tool(
            name="list_folders",
            description="List all dashboard folders to understand dashboard organization.",
            inputSchema={
                "type": "object",
                "properties": {
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of folders to return (default: 100)",
                        "default": 100,
                    },
                },
            },
        ),
        Tool(
            name="search_by_tag",
            description="Search for dashboards by one or more tags.",
            inputSchema={
                "type": "object",
                "properties": {
                    "tags": {
                        "type": "string",
                        "description": "Comma-separated list of tags to search for",
                    },
                },
                "required": ["tags"],
            },
        ),
        Tool(
            name="get_dashboard_tags",
            description="Get all available dashboard tags with usage counts.",
            inputSchema={
                "type": "object",
                "properties": {},
            },
        ),
        Tool(
            name="get_datasources",
            description="List all configured data sources in Grafana.",
            inputSchema={
                "type": "object",
                "properties": {},
            },
        ),
        Tool(
            name="get_datasource",
            description="Get detailed information about a specific data source by UID.",
            inputSchema={
                "type": "object",
                "properties": {
                    "uid": {
                        "type": "string",
                        "description": "The UID of the data source",
                    },
                },
                "required": ["uid"],
            },
        ),
    ]


@app.call_tool()
async def call_tool(name: str, arguments: Any) -> List[TextContent]:
    """Handle tool calls."""
    try:
        client = get_client()
        
        if name == "get_dashboard":
            dashboard_uid = arguments["dashboard_uid"]
            include_panels = arguments.get("include_panels", True)
            
            result = client.get_dashboard(dashboard_uid)
            dashboard = result.get("dashboard", {})
            meta = result.get("meta", {})
            
            response = {
                "uid": dashboard.get("uid"),
                "title": dashboard.get("title"),
                "tags": dashboard.get("tags", []),
                "timezone": dashboard.get("timezone"),
                "refresh": dashboard.get("refresh"),
                "version": dashboard.get("version"),
                "editable": dashboard.get("editable"),
                "meta": {
                    "canSave": meta.get("canSave"),
                    "canEdit": meta.get("canEdit"),
                    "canAdmin": meta.get("canAdmin"),
                    "created": meta.get("created"),
                    "updated": meta.get("updated"),
                    "url": meta.get("url"),
                    "folderId": meta.get("folderId"),
                    "folderTitle": meta.get("folderTitle"),
                },
            }
            
            if include_panels:
                response["panels"] = extract_panels(dashboard)
                response["panel_count"] = len(response["panels"])
            
            # Add template variables summary
            templating = dashboard.get("templating", {})
            variables = templating.get("list", [])
            if variables:
                response["variables_count"] = len(variables)
            
            # Add time settings
            time_settings = dashboard.get("time", {})
            if time_settings:
                response["time_settings"] = time_settings
            
            return [
                TextContent(
                    type="text",
                    text=json.dumps(response, indent=2),
                )
            ]
        
        elif name == "get_panel":
            dashboard_uid = arguments["dashboard_uid"]
            panel_id = arguments["panel_id"]
            
            result = client.get_dashboard(dashboard_uid)
            dashboard = result.get("dashboard", {})
            
            # Find the panel
            panel = None
            for p in dashboard.get("panels", []):
                if p.get("id") == panel_id:
                    panel = p
                    break
                # Check nested panels in rows
                if p.get("type") == "row" and "panels" in p:
                    for nested_p in p["panels"]:
                        if nested_p.get("id") == panel_id:
                            panel = nested_p
                            break
                if panel:
                    break
            
            if not panel:
                return [
                    TextContent(
                        type="text",
                        text=json.dumps({
                            "error": f"Panel {panel_id} not found in dashboard {dashboard_uid}"
                        }, indent=2),
                    )
                ]
            
            panel_info = format_panel_info(panel)
            panel_info["dashboard_title"] = dashboard.get("title")
            panel_info["dashboard_uid"] = dashboard_uid
            
            return [
                TextContent(
                    type="text",
                    text=json.dumps(panel_info, indent=2),
                )
            ]
        
        elif name == "list_dashboards":
            query = arguments.get("query")
            tag = arguments.get("tag")
            folder_ids_str = arguments.get("folder_ids")
            starred = arguments.get("starred", False)
            limit = arguments.get("limit", 100)
            
            folder_ids = None
            if folder_ids_str:
                folder_ids = [int(fid.strip()) for fid in folder_ids_str.split(",")]
            
            dashboards = client.search_dashboards(
                query=query,
                tag=tag,
                folder_ids=folder_ids,
                starred=starred,
                limit=limit,
            )
            
            # Format results
            results = []
            for dash in dashboards:
                results.append({
                    "uid": dash.get("uid"),
                    "title": dash.get("title"),
                    "url": dash.get("url"),
                    "tags": dash.get("tags", []),
                    "folderTitle": dash.get("folderTitle"),
                    "isStarred": dash.get("isStarred", False),
                })
            
            response = {
                "total": len(results),
                "dashboards": results,
            }
            
            return [
                TextContent(
                    type="text",
                    text=json.dumps(response, indent=2),
                )
            ]
        
        elif name == "get_dashboard_variables":
            dashboard_uid = arguments["dashboard_uid"]
            
            result = client.get_dashboard(dashboard_uid)
            dashboard = result.get("dashboard", {})
            
            templating = dashboard.get("templating", {})
            variables = templating.get("list", [])
            
            # Format variables
            formatted_vars = []
            for var in variables:
                formatted_vars.append({
                    "name": var.get("name"),
                    "type": var.get("type"),
                    "label": var.get("label"),
                    "description": var.get("description"),
                    "query": var.get("query"),
                    "datasource": var.get("datasource"),
                    "current": var.get("current"),
                    "multi": var.get("multi", False),
                    "includeAll": var.get("includeAll", False),
                    "options": var.get("options", [])[:10],  # Limit options for readability
                    "hide": var.get("hide", 0),
                })
            
            response = {
                "dashboard_uid": dashboard_uid,
                "dashboard_title": dashboard.get("title"),
                "variables_count": len(formatted_vars),
                "variables": formatted_vars,
            }
            
            return [
                TextContent(
                    type="text",
                    text=json.dumps(response, indent=2),
                )
            ]
        
        elif name == "list_folders":
            limit = arguments.get("limit", 100)
            folders = client.list_folders(limit=limit)
            
            response = {
                "total": len(folders),
                "folders": folders,
            }
            
            return [
                TextContent(
                    type="text",
                    text=json.dumps(response, indent=2),
                )
            ]
        
        elif name == "search_by_tag":
            tags_str = arguments["tags"]
            tags = [tag.strip() for tag in tags_str.split(",")]
            
            # Search for each tag
            all_results = []
            for tag in tags:
                results = client.search_dashboards(tag=tag, limit=100)
                all_results.extend(results)
            
            # Remove duplicates
            unique_dashboards = {}
            for dash in all_results:
                uid = dash.get("uid")
                if uid and uid not in unique_dashboards:
                    unique_dashboards[uid] = {
                        "uid": uid,
                        "title": dash.get("title"),
                        "url": dash.get("url"),
                        "tags": dash.get("tags", []),
                        "folderTitle": dash.get("folderTitle"),
                    }
            
            response = {
                "search_tags": tags,
                "total": len(unique_dashboards),
                "dashboards": list(unique_dashboards.values()),
            }
            
            return [
                TextContent(
                    type="text",
                    text=json.dumps(response, indent=2),
                )
            ]
        
        elif name == "get_dashboard_tags":
            tags = client.get_dashboard_tags()
            
            response = {
                "total": len(tags),
                "tags": tags,
            }
            
            return [
                TextContent(
                    type="text",
                    text=json.dumps(response, indent=2),
                )
            ]
        
        elif name == "get_datasources":
            datasources = client.get_datasources()
            
            # Format results
            formatted = []
            for ds in datasources:
                formatted.append({
                    "uid": ds.get("uid"),
                    "name": ds.get("name"),
                    "type": ds.get("type"),
                    "url": ds.get("url"),
                    "isDefault": ds.get("isDefault", False),
                    "readOnly": ds.get("readOnly", False),
                })
            
            response = {
                "total": len(formatted),
                "datasources": formatted,
            }
            
            return [
                TextContent(
                    type="text",
                    text=json.dumps(response, indent=2),
                )
            ]
        
        elif name == "get_datasource":
            uid = arguments["uid"]
            datasource = client.get_datasource(uid)
            
            # Remove sensitive fields
            safe_datasource = {
                "uid": datasource.get("uid"),
                "name": datasource.get("name"),
                "type": datasource.get("type"),
                "url": datasource.get("url"),
                "access": datasource.get("access"),
                "isDefault": datasource.get("isDefault", False),
                "jsonData": datasource.get("jsonData", {}),
                "readOnly": datasource.get("readOnly", False),
                "version": datasource.get("version"),
            }
            
            return [
                TextContent(
                    type="text",
                    text=json.dumps(safe_datasource, indent=2),
                )
            ]
        
        else:
            return [
                TextContent(
                    type="text",
                    text=json.dumps({"error": f"Unknown tool: {name}"}, indent=2),
                )
            ]
    
    except Exception as e:
        logger.error(f"Error in {name}: {str(e)}", exc_info=True)
        return [
            TextContent(
                type="text",
                text=json.dumps({
                    "error": str(e),
                    "tool": name,
                }, indent=2),
            )
        ]


async def main():
    """Run the MCP server."""
    logger.info("Starting Grafana Observer MCP Server")
    
    try:
        # Test connection on startup
        client = get_client()
        logger.info(f"Connected to Grafana at {client.base_url}")
    except Exception as e:
        logger.error(f"Failed to initialize Grafana client: {e}")
        sys.exit(1)
    
    async with stdio_server() as (read_stream, write_stream):
        await app.run(
            read_stream,
            write_stream,
            app.create_initialization_options(),
        )


if __name__ == "__main__":
    asyncio.run(main())

