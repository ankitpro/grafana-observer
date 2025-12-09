.PHONY: help install install-dev test format lint clean run

help:
	@echo "Available commands:"
	@echo "  make install      - Install package and dependencies"
	@echo "  make install-dev  - Install with development dependencies"
	@echo "  make test         - Run tests"
	@echo "  make format       - Format code with black and isort"
	@echo "  make lint         - Run type checking with mypy"
	@echo "  make clean        - Remove build artifacts"
	@echo "  make run          - Run the MCP server"

install:
	pip install -r requirements.txt

install-dev:
	pip install -r requirements-dev.txt

test:
	pytest

test-coverage:
	pytest --cov=grafana_observer --cov-report=html --cov-report=term

format:
	black src/ tests/
	isort src/ tests/

lint:
	mypy src/

clean:
	rm -rf build/
	rm -rf dist/
	rm -rf *.egg-info
	rm -rf .pytest_cache/
	rm -rf .mypy_cache/
	rm -rf htmlcov/
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name '*.pyc' -delete

run:
	python src/grafana_observer/server.py

