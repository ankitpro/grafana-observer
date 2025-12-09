"""Tests for Pydantic models."""

import pytest
from pydantic import ValidationError

from grafana_observer.models import (
    Dashboard,
    Folder,
    Panel,
    SearchResult,
    TemplateVariable,
)


def test_panel_model():
    """Test Panel model."""
    panel = Panel(
        id=1,
        title="Test Panel",
        type="graph",
        targets=[{"refId": "A", "expr": "up"}],
    )
    
    assert panel.id == 1
    assert panel.title == "Test Panel"
    assert panel.type == "graph"
    assert len(panel.targets) == 1


def test_panel_model_defaults():
    """Test Panel model with defaults."""
    panel = Panel(id=1, type="graph")
    
    assert panel.title is None
    assert panel.targets == []
    assert panel.transparent is False


def test_template_variable_model():
    """Test TemplateVariable model."""
    var = TemplateVariable(
        name="namespace",
        type="query",
        label="Namespace",
        query="label_values(namespace)",
        multi=True,
    )
    
    assert var.name == "namespace"
    assert var.type == "query"
    assert var.multi is True


def test_search_result_model():
    """Test SearchResult model."""
    result = SearchResult(
        uid="dash123",
        title="Test Dashboard",
        url="/d/dash123/test-dashboard",
        type="dash-db",
        tags=["monitoring", "kubernetes"],
        isStarred=True,
    )
    
    assert result.uid == "dash123"
    assert result.title == "Test Dashboard"
    assert result.isStarred is True
    assert len(result.tags) == 2


def test_folder_model():
    """Test Folder model."""
    folder = Folder(
        uid="folder123",
        title="Production",
        hasAcl=True,
    )
    
    assert folder.uid == "folder123"
    assert folder.title == "Production"
    assert folder.hasAcl is True


def test_model_validation():
    """Test model validation."""
    # Missing required fields should raise ValidationError
    with pytest.raises(ValidationError):
        Panel()  # Missing required 'id' and 'type'
    
    with pytest.raises(ValidationError):
        TemplateVariable()  # Missing required 'name' and 'type'

