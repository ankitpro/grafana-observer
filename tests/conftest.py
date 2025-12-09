"""Pytest configuration and fixtures."""

import pytest


@pytest.fixture
def sample_dashboard():
    """Sample dashboard data for testing."""
    return {
        "dashboard": {
            "uid": "test123",
            "title": "Test Dashboard",
            "tags": ["test", "monitoring"],
            "timezone": "browser",
            "version": 1,
            "panels": [
                {
                    "id": 1,
                    "title": "Panel 1",
                    "type": "graph",
                    "targets": [
                        {
                            "refId": "A",
                            "expr": "up",
                            "datasource": {"type": "prometheus", "uid": "prom1"},
                        }
                    ],
                    "gridPos": {"x": 0, "y": 0, "w": 12, "h": 8},
                },
                {
                    "id": 2,
                    "title": "Panel 2",
                    "type": "stat",
                    "targets": [
                        {
                            "refId": "A",
                            "expr": "sum(up)",
                            "datasource": {"type": "prometheus", "uid": "prom1"},
                        }
                    ],
                    "gridPos": {"x": 12, "y": 0, "w": 12, "h": 8},
                },
            ],
            "templating": {
                "list": [
                    {
                        "name": "namespace",
                        "type": "query",
                        "query": "label_values(namespace)",
                        "datasource": {"type": "prometheus", "uid": "prom1"},
                        "multi": True,
                        "includeAll": True,
                    }
                ]
            },
        },
        "meta": {
            "canSave": False,
            "canEdit": False,
            "url": "/d/test123/test-dashboard",
            "folderId": 1,
            "folderTitle": "Test Folder",
        },
    }


@pytest.fixture
def sample_panel():
    """Sample panel data for testing."""
    return {
        "id": 1,
        "title": "CPU Usage",
        "type": "graph",
        "datasource": {"type": "prometheus", "uid": "prom1"},
        "targets": [
            {
                "refId": "A",
                "expr": 'rate(container_cpu_usage_seconds_total{namespace="$namespace"}[5m])',
                "legendFormat": "{{pod}}",
            }
        ],
        "fieldConfig": {
            "defaults": {
                "unit": "percent",
                "min": 0,
                "max": 100,
            }
        },
        "options": {
            "legend": {"displayMode": "list", "placement": "bottom"}
        },
        "gridPos": {"x": 0, "y": 0, "w": 12, "h": 8},
    }


@pytest.fixture
def sample_search_results():
    """Sample search results for testing."""
    return [
        {
            "uid": "dash1",
            "title": "Dashboard 1",
            "url": "/d/dash1/dashboard-1",
            "type": "dash-db",
            "tags": ["monitoring"],
            "isStarred": True,
            "folderTitle": "Production",
        },
        {
            "uid": "dash2",
            "title": "Dashboard 2",
            "url": "/d/dash2/dashboard-2",
            "type": "dash-db",
            "tags": ["logging"],
            "isStarred": False,
            "folderTitle": "Development",
        },
    ]

