#!/bin/bash
# Script to run the Grafana Observer MCP server

set -e

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

# Load environment variables if .env exists
if [ -f "$PROJECT_DIR/.env" ]; then
    echo "Loading environment from .env file..."
    set -a
    source "$PROJECT_DIR/.env"
    set +a
fi

# Check required environment variables
if [ -z "$GRAFANA_URL" ]; then
    echo "Error: GRAFANA_URL is not set"
    echo "Please set it in .env file or environment"
    exit 1
fi

if [ -z "$GRAFANA_TOKEN" ]; then
    echo "Error: GRAFANA_TOKEN is not set"
    echo "Please set it in .env file or environment"
    exit 1
fi

echo "Starting Grafana Observer MCP Server..."
echo "Grafana URL: $GRAFANA_URL"
echo "Organization ID: ${GRAFANA_ORG_ID:-1}"
echo "---"

# Run the server
cd "$PROJECT_DIR"
python src/grafana_observer/server.py

