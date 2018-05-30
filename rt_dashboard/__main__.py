from types import SimpleNamespace

import click
import redis_tasks

from rt_dashboard import VERSION
from .web import get_app


@click.command()
@click.option('-b', '--bind', default='0.0.0.0',
              help='IP or hostname on which to bind HTTP server')
@click.option('-p', '--port', default=9181, type=int,
              help='Port on which to bind HTTP server')
@click.option('--basic-auth', default=None,
              help='HTTP Basic Auth username:password (not used if not set)')
@click.option('-u', '--redis-url', default=None,
              help='Redis URL connection')
@click.option('--redis-prefix', default=None,
              help='Redis prefix')
@click.option('--debug', is_flag=True,
              help='Enter DEBUG mode')
def cli(bind, port, basic_auth, redis_url, redis_prefix, debug):
    """Run the RT Dashboard Flask server."""
    click.echo('RT Dashboard version {0}'.format(VERSION))
    app = get_app()

    rt_config = SimpleNamespace()
    if redis_url:
        rt_config.REDIS_URL = redis_url
    if redis_prefix:
        rt_config.REDIS_PREFIX = redis_prefix
    redis_tasks.conf.settings.configure(rt_config)

    app.config['BASIC_AUTH'] = basic_auth
    if debug:
        app.config['DEBUG'] = True
    app.run(host=bind, port=port)


if __name__ == '__main__':
    cli()
