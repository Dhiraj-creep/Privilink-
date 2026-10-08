"""
Pytest configuration for TRUSTMESH test suite.
Configures test environment to run with in-process adapters for isolated unit tests.
"""
import os
import pytest

# Ensure tests run in test environment with test adapter enabled
os.environ.setdefault("TRUSTMESH_ENV", "test")
os.environ.setdefault("TRUSTMESH_MODE", "test_inprocess")
os.environ.setdefault("TRUSTMESH_ALLOW_DEMO_SHORTCUTS", "true")
