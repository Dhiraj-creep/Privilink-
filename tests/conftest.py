"""
Pytest configuration for PriviLink test suite.
Configures test environment to run with in-process adapters for isolated unit tests.
"""
import os
import pytest

# Ensure tests run in test environment with test adapter enabled
os.environ.setdefault("PRIVILINK_ENV", "test")
os.environ.setdefault("PRIVILINK_MODE", "test_inprocess")
os.environ.setdefault("PRIVILINK_ALLOW_DEMO_SHORTCUTS", "true")

# Backward-compatibility environment variables
os.environ.setdefault("TRUSTMESH_ENV", "test")
os.environ.setdefault("TRUSTMESH_MODE", "test_inprocess")
os.environ.setdefault("TRUSTMESH_ALLOW_DEMO_SHORTCUTS", "true")
