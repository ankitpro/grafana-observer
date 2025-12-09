#!/usr/bin/env node
/**
 * Grafana Observer MCP - Main entry point
 */

export * from './types.js';
export * from './client.js';

// Start server if run directly
if (require.main === module) {
  require('./server.js');
}

