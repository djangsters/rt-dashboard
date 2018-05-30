from redis_tasks.conf import settings as rt_settings
#from rt_dashboard.web import get_app
import pytest


def pytest_configure(config):
    rt_settings.configure_from_dict(dict(
        REDIS_PREFIX="rt_dashboard_test"))


@pytest.fixture
def client():
    app = get_app()
    app.config['TESTING'] = True
    yield app.test_client()


@pytest.fixture(scope="session")
def app():
    from rt_dashboard.web import app
    return app
