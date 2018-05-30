from functools import wraps
from math import ceil
from operator import itemgetter

import arrow
from flask import (Blueprint, Flask, Response, current_app, render_template,
                   request, url_for)
from redis import Redis, from_url
from redis.sentinel import Sentinel
from redis_tasks import Queue
from redis_tasks.registries import (failed_task_registry,
                                    finished_task_registry, worker_registry)
from redis_tasks.task import Task
from redis_tasks.worker import Worker
from six import string_types

blueprint = Blueprint(
    'rt_dashboard',
    __name__,
    template_folder='templates',
    static_folder='static',
)


@blueprint.before_request
def basic_http_auth(*args, **kwargs):
    if not current_app.config.get('BASIC_AUTH'):
        return
    username, password = current_app.config.get('BASIC_AUTH').split(':', 1)
    realm = 'RT Dashboard'
    auth = request.authorization
    if (auth is None or
            auth.password != password or auth.username != username):
        return Response(
            'Please login', 401,
            {'WWW-Authenticate': 'Basic realm="{0}"'.format(realm)})


def jsonify(f):
    @wraps(f)
    def _wrapped(*args, **kwargs):
        from flask import jsonify as flask_jsonify
        try:
            result_dict = f(*args, **kwargs)
        except Exception as e:
            if current_app.config['TESTING']:
                raise
            result_dict = dict(status='error')
            if current_app.config['DEBUG']:
                result_dict['reason'] = str(e)
                from traceback import format_exc
                result_dict['exc_info'] = format_exc()
        return flask_jsonify(**result_dict)
    return _wrapped


def serialize_date(dt):
    if dt is None:
        return None
    return arrow.get(dt).to('UTC').datetime.isoformat()


def serialize_job(job):
    return dict(
        id=job.id,
        status=job.status,
        enqueued_at=serialize_date(job.enqueued_at),
        started_at=serialize_date(job.started_at),
        ended_at=serialize_date(job.ended_at),
        origin=job.origin,
        error_message=job.error_message,
        description=job.description)


def remove_none_values(input_dict):
    return dict(((k, v) for k, v in input_dict.items() if v is not None))


def pagination_window(total_items, cur_page, per_page=5, window_size=10):
    all_pages = range(1, int(ceil(total_items / float(per_page))) + 1)
    result = all_pages
    if window_size >= 1:
        temp = min(
            len(all_pages) - window_size,
            (cur_page - 1) - int(ceil(window_size / 2.0))
        )
        pages_window_start = max(0, temp)
        pages_window_end = pages_window_start + window_size
        result = all_pages[pages_window_start:pages_window_end]
    return result


@blueprint.route('/', defaults={'queue_name': '[failed]', 'page': '1'})
@blueprint.route('/<queue_name>', defaults={'page': '1'})
@blueprint.route('/<queue_name>/<page>')
def overview(queue_name, page):
    queue = Queue(queue_name)

    return render_template(
        'rt_dashboard/dashboard.html',
        workers=Worker.all(),
        queue=queue,
        page=page,
        queues=Queue.all(),
        rt_url_prefix=url_for('.overview'),
        poll_interval=2500,
    )


@blueprint.route('/job/<job_id>/cancel', methods=['POST'])
@jsonify
def cancel_job_view(job_id):
    Task.fetch(job_id).cancel()
    return dict(status='OK')


@blueprint.route('/job/<job_id>/requeue', methods=['POST'])
@jsonify
def requeue_job_view(job_id):
    requeue_job(job_id)
    return dict(status='OK')


@blueprint.route('/queue/<queue_name>/empty', methods=['POST'])
@jsonify
def empty_queue(queue_name):
    if queue_name == '[failed]':
        queue = failed_task_registry
    elif queue_name == '[finished]':
        queue = finished_task_registry
    else:
        queue = Queue(queue_name)
    queue.empty()
    return dict(status='OK')


@blueprint.route('/queue/<queue_name>/delete', methods=['POST'])
@jsonify
def delete_queue(queue_name):
    queue = Queue(queue_name)
    queue.delete()
    return dict(status='OK')


@blueprint.route('/queues.json')
@jsonify
def list_queues():
    return {'queues': [
        {'name': '[failed]',
         'count': failed_task_registry.count(),
         'url': url_for('.overview', queue_name='[failed]')},
        {'name': '[finished]',
         'count': finished_task_registry.count(),
         'url': url_for('.overview', queue_name='[finished]')},
        {'name': '[running]',
         'count': len(worker_registry.get_running_tasks()),
         'url': url_for('.overview', queue_name='[running]')},
    ] + [
        {'name': q.name,
         'count': q.count(),
         'url': url_for('.overview', queue_name=q.name)}
        for q in Queue.all()
    ]}


@blueprint.route('/jobs/<queue_name>/<page>.json')
@jsonify
def list_jobs(queue_name, page):
    if queue_name != '[running]':
        if queue_name == '[failed]':
            queue = failed_task_registry
        elif queue_name == '[finished]':
            queue = finished_task_registry
        else:
            queue = Queue(queue_name)

        current_page = int(page)
        per_page = 20
        total_items = queue.count()
        pages_numbers_in_window = pagination_window(
            total_items, current_page, per_page)
        pages_in_window = [
            dict(number=p, url=url_for('.overview', queue_name=queue_name, page=p))
            for p in pages_numbers_in_window
        ]
        last_page = int(ceil(total_items / float(per_page)))

        prev_page = None
        if current_page > 1:
            prev_page = dict(url=url_for(
                '.overview', queue_name=queue_name, page=(current_page - 1)))

        next_page = None
        if current_page < last_page:
            next_page = dict(url=url_for(
                '.overview', queue_name=queue_name, page=(current_page + 1)))

        pagination = remove_none_values(
            dict(
                pages_in_window=pages_in_window,
                next_page=next_page,
                prev_page=prev_page
            )
        )

        offset = (current_page - 1) * per_page
        jobs = [serialize_job(job) for job in queue.get_tasks(offset, per_page)]
    else:
        jobs = sorted((
            {**serialize_job(Task.fetch(tid)),
             'worker': Worker.fetch(wid).description}
            for wid, tid in worker_registry.get_running_tasks().items()),
            key=itemgetter('worker'),
        )
        pagination = {}
    return dict(name=queue_name, jobs=jobs, pagination=pagination)


@blueprint.route('/workers.json')
@jsonify
def list_workers():
    return {'workers': [
        {
            'name': worker.description,
            'queues': [q.name for q in worker.queues],
            'state': str(worker.state),
        }
        for worker in Worker.all()
    ]}


def get_app():
    app = Flask(__name__)
    app.register_blueprint(blueprint)
    return app
