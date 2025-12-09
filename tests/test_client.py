"""Tests for Grafana client."""

import os
from unittest.mock import Mock, patch

import pytest
from requests.exceptions import RequestException

from grafana_observer.client import GrafanaClient


@pytest.fixture
def mock_env():
    """Mock environment variables."""
    with patch.dict(
        os.environ,
        {
            "GRAFANA_URL": "https://test.grafana.com",
            "GRAFANA_TOKEN": "test-token",
            "GRAFANA_ORG_ID": "1",
        },
    ):
        yield


@pytest.fixture
def client(mock_env):
    """Create a test client."""
    return GrafanaClient()


def test_client_initialization(mock_env):
    """Test client initialization."""
    client = GrafanaClient()
    assert client.base_url == "https://test.grafana.com"
    assert client.token == "test-token"
    assert client.org_id == "1"


def test_client_missing_url():
    """Test client initialization without URL."""
    with patch.dict(os.environ, {}, clear=True):
        with pytest.raises(ValueError, match="GRAFANA_URL must be set"):
            GrafanaClient()


def test_client_missing_token(mock_env):
    """Test client initialization without token."""
    with patch.dict(os.environ, {"GRAFANA_TOKEN": ""}, clear=False):
        with pytest.raises(ValueError, match="GRAFANA_TOKEN must be set"):
            GrafanaClient()


@patch("grafana_observer.client.requests.Session.request")
def test_get_dashboard(mock_request, client):
    """Test getting dashboard."""
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "dashboard": {"uid": "test123", "title": "Test Dashboard"},
        "meta": {},
    }
    mock_request.return_value = mock_response

    result = client.get_dashboard("test123")
    
    assert result["dashboard"]["uid"] == "test123"
    assert result["dashboard"]["title"] == "Test Dashboard"
    mock_request.assert_called_once()


@patch("grafana_observer.client.requests.Session.request")
def test_search_dashboards(mock_request, client):
    """Test searching dashboards."""
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = [
        {"uid": "dash1", "title": "Dashboard 1"},
        {"uid": "dash2", "title": "Dashboard 2"},
    ]
    mock_request.return_value = mock_response

    result = client.search_dashboards(query="test")
    
    assert len(result) == 2
    assert result[0]["uid"] == "dash1"


@patch("grafana_observer.client.requests.Session.request")
def test_request_error_handling(mock_request, client):
    """Test error handling in requests."""
    mock_request.side_effect = RequestException("Connection failed")

    with pytest.raises(RequestException):
        client.get_dashboard("test123")


@patch("grafana_observer.client.requests.Session.request")
def test_list_folders(mock_request, client):
    """Test listing folders."""
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = [
        {"uid": "folder1", "title": "Folder 1"},
        {"uid": "folder2", "title": "Folder 2"},
    ]
    mock_request.return_value = mock_response

    result = client.list_folders()
    
    assert len(result) == 2
    assert result[0]["title"] == "Folder 1"

