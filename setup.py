import os
from setuptools import setup, find_packages


def get_version():
    basedir = os.path.dirname(__file__)
    with open(os.path.join(basedir, 'rt_dashboard/__init__.py')) as f:
        version_line = next(l for l in f if l.startswith('VERSION'))
        return eval(version_line.split('=')[1])
    raise RuntimeError('No version info found.')


setup(
    name='rt-dashboard',
    version=get_version(),
    description='rt-dashboard is a lightweight web interface'
                ' to monitor your redis_tasks queues, jobs, and workers in realtime.',
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    platforms='any',
    install_requires=['redis_tasks', 'werkzeug', 'jinja2'],
    entry_points={
        'console_scripts': [
            'rt-dashboard = rt_dashboard.__main__:cli'
        ]
    },
    classifiers=[
        # 'Development Status :: 1 - Planning',
        # 'Development Status :: 2 - Pre-Alpha',
        'Development Status :: 3 - Alpha',
        # 'Development Status :: 4 - Beta',
        # 'Development Status :: 5 - Production/Stable',
        # 'Development Status :: 6 - Mature',
        # 'Development Status :: 7 - Inactive',
        'Operating System :: POSIX',
        'Programming Language :: Python :: 3',
    ]
)
