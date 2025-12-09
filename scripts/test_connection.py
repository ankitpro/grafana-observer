#!/usr/bin/env python3
"""Test script to verify Grafana connection."""

import sys
from dotenv import load_dotenv

# Add parent directory to path
sys.path.insert(0, '../src')

from grafana_observer.client import GrafanaClient

def main():
    """Test Grafana connection."""
    load_dotenv()
    
    print("Testing Grafana connection...")
    print("-" * 50)
    
    try:
        client = GrafanaClient()
        print(f"✓ Connected to: {client.base_url}")
        print(f"✓ Organization ID: {client.org_id}")
        
        # Try to get dashboards
        print("\nTesting API access...")
        dashboards = client.search_dashboards(limit=5)
        print(f"✓ Found {len(dashboards)} dashboards (showing max 5)")
        
        if dashboards:
            print("\nSample dashboards:")
            for dash in dashboards[:3]:
                print(f"  - {dash.get('title')} (UID: {dash.get('uid')})")
        
        # Try to get folders
        folders = client.list_folders(limit=5)
        print(f"\n✓ Found {len(folders)} folders")
        
        # Try to get data sources
        datasources = client.get_datasources()
        print(f"✓ Found {len(datasources)} data sources")
        
        print("\n" + "=" * 50)
        print("✓ Connection test successful!")
        print("=" * 50)
        
    except ValueError as e:
        print(f"\n✗ Configuration error: {e}")
        print("\nMake sure to set the following environment variables:")
        print("  - GRAFANA_URL")
        print("  - GRAFANA_TOKEN")
        print("\nOr create a .env file with these values.")
        sys.exit(1)
        
    except Exception as e:
        print(f"\n✗ Connection failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

