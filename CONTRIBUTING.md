# Contributing to Grafana Observer MCP

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/grafana-observer.git
   cd grafana-observer
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements-dev.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Grafana credentials
   ```

## Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=grafana_observer --cov-report=html

# Run specific test file
pytest tests/test_client.py

# Run specific test
pytest tests/test_client.py::test_get_dashboard
```

## Code Style

We use the following tools to maintain code quality:

```bash
# Format code
black src/ tests/

# Sort imports
isort src/ tests/

# Type checking
mypy src/
```

## Adding New Features

### Adding a New Tool

1. **Add the tool definition in `server.py`**
   ```python
   @app.list_tools()
   async def list_tools() -> List[Tool]:
       return [
           # ... existing tools
           Tool(
               name="your_new_tool",
               description="What your tool does",
               inputSchema={
                   "type": "object",
                   "properties": {
                       "param1": {
                           "type": "string",
                           "description": "Description of param1",
                       },
                   },
                   "required": ["param1"],
               },
           ),
       ]
   ```

2. **Implement the tool handler**
   ```python
   @app.call_tool()
   async def call_tool(name: str, arguments: Any) -> List[TextContent]:
       # ... existing handlers
       elif name == "your_new_tool":
           param1 = arguments["param1"]
           # Your implementation here
           return [TextContent(type="text", text=json.dumps(result, indent=2))]
   ```

3. **Add client method if needed** (in `client.py`)
   ```python
   def your_new_api_call(self, param: str) -> Dict[str, Any]:
       """Description of the API call."""
       return self._request("GET", f"/api/your/endpoint/{param}")
   ```

4. **Add tests** (in `tests/`)
   ```python
   def test_your_new_tool(client):
       result = client.your_new_api_call("test")
       assert result is not None
   ```

5. **Update documentation**
   - Add tool description to README.md
   - Add example queries to examples/queries.md

### Adding Grafana API Support

When adding support for new Grafana API endpoints:

1. Check [Grafana HTTP API documentation](https://grafana.com/docs/grafana/latest/developers/http_api/)
2. Add method to `GrafanaClient` class
3. Add corresponding model to `models.py` if needed
4. Add tests
5. Document the new capability

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clear, concise commit messages
   - Add tests for new functionality
   - Update documentation

3. **Run tests and linters**
   ```bash
   pytest
   black src/ tests/
   isort src/ tests/
   mypy src/
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   - Fill out the PR template
   - Link related issues
   - Request review

## Coding Standards

### Python Style
- Follow PEP 8
- Use type hints for all functions
- Maximum line length: 100 characters
- Use descriptive variable names

### Documentation
- Add docstrings to all public functions
- Use Google-style docstrings
- Include examples in docstrings when helpful

### Example
```python
def get_dashboard(self, uid: str) -> Dict[str, Any]:
    """Get dashboard by UID.

    Args:
        uid: Dashboard UID from the URL

    Returns:
        Dashboard data including metadata and panels

    Example:
        >>> client = GrafanaClient()
        >>> dashboard = client.get_dashboard("abc123")
        >>> print(dashboard['dashboard']['title'])
        'My Dashboard'
    """
    return self._request("GET", f"/api/dashboards/uid/{uid}")
```

## Testing Guidelines

### Unit Tests
- Test individual functions in isolation
- Use mocks for external dependencies
- Cover edge cases and error conditions

### Integration Tests
- Test with real Grafana instance when possible
- Use test fixtures for sample data
- Clean up test data after runs

## Questions or Issues?

- Open an issue on GitHub
- Tag with appropriate labels
- Provide detailed reproduction steps for bugs

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.

