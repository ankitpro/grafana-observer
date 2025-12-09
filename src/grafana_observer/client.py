"""Grafana API client for read-only operations."""

import os
from typing import Any, Dict, List, Optional
from urllib.parse import urljoin

import requests
from requests.exceptions import RequestException


class GrafanaClient:
    """Client for interacting with Grafana API in read-only mode."""

    def __init__(
        self,
        url: Optional[str] = None,
        token: Optional[str] = None,
        org_id: Optional[str] = None,
        verify_ssl: bool = True,
    ):
        """Initialize Grafana client.

        Args:
            url: Grafana instance URL (default: from GRAFANA_URL env var)
            token: API token (default: from GRAFANA_TOKEN env var)
            org_id: Organization ID (default: from GRAFANA_ORG_ID env var or "1")
            verify_ssl: Whether to verify SSL certificates
        """
        self.base_url = (url or os.getenv("GRAFANA_URL", "")).rstrip("/")
        self.token = token or os.getenv("GRAFANA_TOKEN", "")
        self.org_id = org_id or os.getenv("GRAFANA_ORG_ID", "1")
        
        verify_ssl_env = os.getenv("GRAFANA_VERIFY_SSL", "true").lower()
        self.verify_ssl = verify_ssl and verify_ssl_env != "false"

        if not self.base_url:
            raise ValueError("GRAFANA_URL must be set")
        if not self.token:
            raise ValueError("GRAFANA_TOKEN must be set")

        self.session = requests.Session()
        self.session.headers.update(
            {
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            }
        )

    def _request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        json_data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Make HTTP request to Grafana API.

        Args:
            method: HTTP method
            endpoint: API endpoint path
            params: Query parameters
            json_data: JSON payload for POST/PUT requests

        Returns:
            Response JSON data

        Raises:
            RequestException: If request fails
        """
        url = urljoin(self.base_url, endpoint)
        
        try:
            response = self.session.request(
                method=method,
                url=url,
                params=params,
                json=json_data,
                verify=self.verify_ssl,
                timeout=30,
            )
            response.raise_for_status()
            
            # Some endpoints return empty responses
            if response.status_code == 204 or not response.content:
                return {}
            
            return response.json()
        except RequestException as e:
            error_msg = f"Grafana API request failed: {str(e)}"
            if hasattr(e, "response") and e.response is not None:
                try:
                    error_detail = e.response.json()
                    error_msg += f" - {error_detail}"
                except:
                    error_msg += f" - {e.response.text}"
            raise RequestException(error_msg) from e

    def get_dashboard(self, uid: str) -> Dict[str, Any]:
        """Get dashboard by UID.

        Args:
            uid: Dashboard UID

        Returns:
            Dashboard data including metadata and panels
        """
        return self._request("GET", f"/api/dashboards/uid/{uid}")

    def search_dashboards(
        self,
        query: Optional[str] = None,
        tag: Optional[str] = None,
        folder_ids: Optional[List[int]] = None,
        dashboard_ids: Optional[List[int]] = None,
        starred: bool = False,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        """Search for dashboards.

        Args:
            query: Search query
            tag: Filter by tag
            folder_ids: Filter by folder IDs
            dashboard_ids: Filter by dashboard IDs
            starred: Show only starred dashboards
            limit: Maximum number of results

        Returns:
            List of dashboard metadata
        """
        params: Dict[str, Any] = {
            "type": "dash-db",
            "limit": limit,
        }
        
        if query:
            params["query"] = query
        if tag:
            params["tag"] = tag
        if folder_ids:
            params["folderIds"] = ",".join(map(str, folder_ids))
        if dashboard_ids:
            params["dashboardIds"] = ",".join(map(str, dashboard_ids))
        if starred:
            params["starred"] = "true"

        return self._request("GET", "/api/search", params=params)

    def list_folders(self, limit: int = 100) -> List[Dict[str, Any]]:
        """List all dashboard folders.

        Args:
            limit: Maximum number of results

        Returns:
            List of folder metadata
        """
        params = {
            "type": "dash-folder",
            "limit": limit,
        }
        return self._request("GET", "/api/search", params=params)

    def get_folder(self, uid: str) -> Dict[str, Any]:
        """Get folder by UID.

        Args:
            uid: Folder UID

        Returns:
            Folder metadata
        """
        return self._request("GET", f"/api/folders/{uid}")

    def get_dashboard_tags(self) -> List[Dict[str, Any]]:
        """Get all dashboard tags.

        Returns:
            List of tags with counts
        """
        return self._request("GET", "/api/dashboards/tags")

    def get_datasources(self) -> List[Dict[str, Any]]:
        """Get all data sources.

        Returns:
            List of data source configurations
        """
        return self._request("GET", "/api/datasources")

    def get_datasource(self, uid: str) -> Dict[str, Any]:
        """Get data source by UID.

        Args:
            uid: Data source UID

        Returns:
            Data source configuration
        """
        return self._request("GET", f"/api/datasources/uid/{uid}")

    def get_home_dashboard(self) -> Dict[str, Any]:
        """Get home dashboard.

        Returns:
            Home dashboard configuration
        """
        return self._request("GET", "/api/dashboards/home")

    def search_with_pagination(
        self,
        query: Optional[str] = None,
        tag: Optional[str] = None,
        page: int = 1,
        limit: int = 100,
    ) -> Dict[str, Any]:
        """Search with pagination support.

        Args:
            query: Search query
            tag: Filter by tag
            page: Page number (1-indexed)
            limit: Results per page

        Returns:
            Dict with 'dashboards' list and pagination info
        """
        params: Dict[str, Any] = {
            "type": "dash-db",
            "page": page,
            "limit": limit,
        }
        
        if query:
            params["query"] = query
        if tag:
            params["tag"] = tag

        results = self._request("GET", "/api/search", params=params)
        
        return {
            "dashboards": results,
            "page": page,
            "limit": limit,
            "total": len(results),
        }

