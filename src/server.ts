/**
 * Grafana Observer MCP Server - Read-only Grafana dashboard inspection
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { GrafanaClient } from './client.js';

dotenv.config();

const server = new Server(
  {
    name: 'grafana-observer',
    version: '0.2.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

let grafanaClient: GrafanaClient | null = null;

function getClient(): GrafanaClient {
  if (!grafanaClient) {
    grafanaClient = new GrafanaClient();
  }
  return grafanaClient;
}

function formatPanelInfo(panel: any): Record<string, any> {
  return {
    id: panel.id,
    title: panel.title || 'Untitled',
    type: panel.type,
    description: panel.description,
    datasource: panel.datasource,
    targets: panel.targets || [],
    gridPos: panel.gridPos,
    fieldConfig: panel.fieldConfig,
    options: panel.options,
    transparent: panel.transparent || false,
    links: panel.links,
    repeat: panel.repeat,
    interval: panel.interval,
    maxDataPoints: panel.maxDataPoints,
  };
}

function extractPanels(dashboardJson: any): Array<Record<string, any>> {
  const panels: Array<Record<string, any>> = [];

  for (const panel of dashboardJson.panels || []) {
    if (panel.type === 'row') {
      // Row panel
      panels.push({
        id: panel.id,
        title: panel.title || 'Row',
        type: 'row',
        collapsed: panel.collapsed || false,
      });
      // Add panels inside collapsed rows
      if (panel.panels) {
        for (const nestedPanel of panel.panels) {
          panels.push(formatPanelInfo(nestedPanel));
        }
      }
    } else {
      panels.push(formatPanelInfo(panel));
    }
  }

  return panels;
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_dashboard',
        description:
          'Get complete dashboard information including metadata, panels, and configuration. Use this to inspect a specific dashboard by its UID.',
        inputSchema: {
          type: 'object',
          properties: {
            dashboard_uid: {
              type: 'string',
              description:
                'The UID of the dashboard (found in the dashboard URL)',
            },
            include_panels: {
              type: 'boolean',
              description:
                'Include detailed panel information (default: true)',
              default: true,
            },
          },
          required: ['dashboard_uid'],
        },
      },
      {
        name: 'get_panel',
        description:
          'Get detailed information about a specific panel including queries, visualization settings, and field configurations.',
        inputSchema: {
          type: 'object',
          properties: {
            dashboard_uid: {
              type: 'string',
              description: 'The UID of the dashboard',
            },
            panel_id: {
              type: 'number',
              description:
                'The ID of the panel (visible in panel edit mode)',
            },
          },
          required: ['dashboard_uid', 'panel_id'],
        },
      },
      {
        name: 'list_dashboards',
        description:
          'List all accessible dashboards with optional filtering by query, tag, or folder. Use this to discover available dashboards.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query to filter dashboards by title',
            },
            tag: {
              type: 'string',
              description: 'Filter dashboards by tag',
            },
            folder_ids: {
              type: 'string',
              description: 'Comma-separated folder IDs to filter by',
            },
            starred: {
              type: 'boolean',
              description: 'Show only starred dashboards',
              default: false,
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results (default: 100)',
              default: 100,
            },
          },
        },
      },
      {
        name: 'get_dashboard_variables',
        description:
          'Get all template variables configured for a dashboard. Variables are used for dynamic filtering and parameterization.',
        inputSchema: {
          type: 'object',
          properties: {
            dashboard_uid: {
              type: 'string',
              description: 'The UID of the dashboard',
            },
          },
          required: ['dashboard_uid'],
        },
      },
      {
        name: 'list_folders',
        description:
          'List all dashboard folders to understand dashboard organization.',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description:
                'Maximum number of folders to return (default: 100)',
              default: 100,
            },
          },
        },
      },
      {
        name: 'search_by_tag',
        description: 'Search for dashboards by one or more tags.',
        inputSchema: {
          type: 'object',
          properties: {
            tags: {
              type: 'string',
              description: 'Comma-separated list of tags to search for',
            },
          },
          required: ['tags'],
        },
      },
      {
        name: 'get_dashboard_tags',
        description: 'Get all available dashboard tags with usage counts.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_datasources',
        description: 'List all configured data sources in Grafana.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_datasource',
        description:
          'Get detailed information about a specific data source by UID.',
        inputSchema: {
          type: 'object',
          properties: {
            uid: {
              type: 'string',
              description: 'The UID of the data source',
            },
          },
          required: ['uid'],
        },
      },
    ] as Tool[],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const client = getClient();
    const { name, arguments: args } = request.params;

    if (!args) {
      throw new Error('Missing arguments');
    }

    switch (name) {
      case 'get_dashboard': {
        const dashboardUid = args.dashboard_uid as string;
        const includePanels = (args.include_panels as boolean) ?? true;

        const result = await client.getDashboard(dashboardUid);
        const dashboard = result.dashboard;
        const meta = result.meta;

        const response: Record<string, any> = {
          uid: dashboard.uid,
          title: dashboard.title,
          tags: dashboard.tags || [],
          timezone: dashboard.timezone,
          refresh: dashboard.refresh,
          version: dashboard.version,
          editable: dashboard.editable,
          meta: {
            canSave: meta.canSave,
            canEdit: meta.canEdit,
            canAdmin: meta.canAdmin,
            created: meta.created,
            updated: meta.updated,
            url: meta.url,
            folderId: meta.folderId,
            folderTitle: meta.folderTitle,
          },
        };

        if (includePanels) {
          response.panels = extractPanels(dashboard);
          response.panel_count = response.panels.length;
        }

        // Add template variables summary
        const templating = dashboard.templating || {};
        const variables = templating.list || [];
        if (variables.length > 0) {
          response.variables_count = variables.length;
        }

        // Add time settings
        const timeSettings = dashboard.time || {};
        if (Object.keys(timeSettings).length > 0) {
          response.time_settings = timeSettings;
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      }

      case 'get_panel': {
        const dashboardUid = args.dashboard_uid as string;
        const panelId = args.panel_id as number;

        const result = await client.getDashboard(dashboardUid);
        const dashboard = result.dashboard;

        // Find the panel
        let panel: any = null;
        for (const p of dashboard.panels || []) {
          if (p.id === panelId) {
            panel = p;
            break;
          }
          // Check nested panels in rows
          if (p.type === 'row' && p.panels) {
            for (const nestedP of p.panels) {
              if (nestedP.id === panelId) {
                panel = nestedP;
                break;
              }
            }
          }
          if (panel) break;
        }

        if (!panel) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    error: `Panel ${panelId} not found in dashboard ${dashboardUid}`,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        const panelInfo = formatPanelInfo(panel);
        panelInfo.dashboard_title = dashboard.title;
        panelInfo.dashboard_uid = dashboardUid;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(panelInfo, null, 2),
            },
          ],
        };
      }

      case 'list_dashboards': {
        const query = args.query as string | undefined;
        const tag = args.tag as string | undefined;
        const folderIdsStr = args.folder_ids as string | undefined;
        const starred = (args.starred as boolean) || false;
        const limit = (args.limit as number) || 100;

        let folderIds: number[] | undefined;
        if (folderIdsStr) {
          folderIds = folderIdsStr.split(',').map((id) => parseInt(id.trim()));
        }

        const dashboards = await client.searchDashboards({
          query,
          tag,
          folderIds,
          starred,
          limit,
        });

        const results = dashboards.map((dash) => ({
          uid: dash.uid,
          title: dash.title,
          url: dash.url,
          tags: dash.tags || [],
          folderTitle: dash.folderTitle,
          isStarred: dash.isStarred || false,
        }));

        const response = {
          total: results.length,
          dashboards: results,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      }

      case 'get_dashboard_variables': {
        const dashboardUid = args.dashboard_uid as string;

        const result = await client.getDashboard(dashboardUid);
        const dashboard = result.dashboard;

        const templating = dashboard.templating || {};
        const variables = templating.list || [];

        const formattedVars = variables.map((v: any) => ({
          name: v.name,
          type: v.type,
          label: v.label,
          description: v.description,
          query: v.query,
          datasource: v.datasource,
          current: v.current,
          multi: v.multi || false,
          includeAll: v.includeAll || false,
          options: (v.options || []).slice(0, 10),
          hide: v.hide || 0,
        }));

        const response = {
          dashboard_uid: dashboardUid,
          dashboard_title: dashboard.title,
          variables_count: formattedVars.length,
          variables: formattedVars,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      }

      case 'list_folders': {
        const limit = (args.limit as number) || 100;
        const folders = await client.listFolders(limit);

        const response = {
          total: folders.length,
          folders,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      }

      case 'search_by_tag': {
        const tagsStr = args.tags as string;
        const tags = tagsStr.split(',').map((t) => t.trim());

        const allResults: any[] = [];
        for (const tag of tags) {
          const results = await client.searchDashboards({ tag, limit: 100 });
          allResults.push(...results);
        }

        // Remove duplicates
        const uniqueDashboards: Record<string, any> = {};
        for (const dash of allResults) {
          const uid = dash.uid;
          if (uid && !uniqueDashboards[uid]) {
            uniqueDashboards[uid] = {
              uid,
              title: dash.title,
              url: dash.url,
              tags: dash.tags || [],
              folderTitle: dash.folderTitle,
            };
          }
        }

        const response = {
          search_tags: tags,
          total: Object.keys(uniqueDashboards).length,
          dashboards: Object.values(uniqueDashboards),
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      }

      case 'get_dashboard_tags': {
        const tags = await client.getDashboardTags();

        const response = {
          total: tags.length,
          tags,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      }

      case 'get_datasources': {
        const datasources = await client.getDataSources();

        const formatted = datasources.map((ds) => ({
          uid: ds.uid,
          name: ds.name,
          type: ds.type,
          url: ds.url,
          isDefault: ds.isDefault || false,
          readOnly: ds.readOnly || false,
        }));

        const response = {
          total: formatted.length,
          datasources: formatted,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      }

      case 'get_datasource': {
        const uid = args.uid as string;
        const datasource = await client.getDataSource(uid);

        const safeDatasource = {
          uid: datasource.uid,
          name: datasource.name,
          type: datasource.type,
          url: datasource.url,
          access: datasource.access,
          isDefault: datasource.isDefault || false,
          jsonData: datasource.jsonData || {},
          readOnly: datasource.readOnly || false,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(safeDatasource, null, 2),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: `Unknown tool: ${name}` }, null, 2),
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: errorMessage,
              tool: request.params.name,
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  console.error('Starting Grafana Observer MCP Server v0.2.0');

  try {
    const client = getClient();
    console.error(`Connected to Grafana at ${client.getBaseUrl()}`);
    console.error(`Authentication method: ${client.getAuthMethod()}`);
  } catch (error) {
    console.error(`Failed to initialize Grafana client: ${error}`);
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});

