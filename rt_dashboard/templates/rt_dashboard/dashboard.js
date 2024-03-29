var url_for = function(name, param) {
    var url = {{ rt_url_prefix|tojson|safe }};
    if (name == 'queues') { url += 'queues.json'; }
    else if (name == 'workers') { url += 'workers.json'; }
    else if (name == 'cancel_job') { url += 'job/' + encodeURIComponent(param) + '/cancel'; }
    return url;
};

var url_for_jobs = function(param, page) {
    var url = {{ rt_url_prefix|tojson|safe }} + 'jobs/' + encodeURIComponent(param) + '/' + page + '.json';
    return url;
};

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

var api = {
    getQueues: function(cb) {
        $.getJSON(url_for('queues'), function(data) {
            var queues = data.queues;
            cb(queues);
        });
    },

    getJobs: function(queue_name, page, cb) {
        $.getJSON(url_for_jobs(queue_name, page), function(data) {
            var jobs = data.jobs;
            var pagination = data.pagination;
            cb(jobs, pagination);
        });
    },

    getWorkers: function(cb) {
        $.getJSON(url_for('workers'), function(data) {
            var workers = data.workers;
            cb(workers);
        });
    }
};


//
// QUEUES
//
(function($) {
    var $raw_tpl = $('script[name=queue-row]').html();
    var noQueuesHtml = $('script[name=no-queues-row]').html();
    var template = _.template($raw_tpl);
    var $tbody = $('table#queues tbody');
    var $placeholderEl = $('tr[data-role=loading-placeholder]', $tbody);

    var reload_table = function(done) {
        $placeholderEl.show();

        // Fetch the available queues
        api.getQueues(function(queues) {
            var html = '';

            $tbody.empty();

            if (queues.length > 0) {
                $.each(queues, function(i, queue) {
                    var el = template({d: queue}, {variable: 'd'});
                    html += el;
                });
                $tbody.append(html);
            } else {
                $tbody.append(noQueuesHtml);
            }

            if (done !== undefined) {
                done();
            }
        });
    };

    var refresh_table = function() {
        $('span.loading').fadeIn('fast');
        reload_table(function() {
            $('span.loading').fadeOut('fast');
        });
    };

    $(document).ready(function() {

        reload_table();
        $('#refresh-button').click(refresh_table);
        setInterval(refresh_table, POLL_INTERVAL);
        $('[data-toggle=tooltip]').tooltip();

    });
})($);


//
// WORKERS
//
(function($) {
    var $raw_tpl = $('script[name=worker-row]').html();
    var noWorkersHtml = $('script[name=no-workers-row]').html();
    var template = _.template($raw_tpl);
    var $tbody = $('table#workers tbody');
    var $placeholderEl = $('tr[data-role=loading-placeholder]', $tbody);

    var reload_table = function(done) {
        $placeholderEl.show();

        // Fetch the available workers
        api.getWorkers(function(workers) {
            var html = '';

            $tbody.empty();

            if (workers.length > 0) {
                $('#workers-count').html(workers.length + ' workers registered')

                $.each(workers, function(i, worker) {
                    if (worker.state === 'busy') {
                        worker.state = 'play';
                    } else {
                        worker.state = 'pause';
                    }
                    html += template({d: worker}, {variable: 'd'});
                });
                $tbody.append(html);
            } else {
                $('#workers-count').html('No workers registered!')
                $tbody.append(noWorkersHtml);
            }

            if (done !== undefined) {
                done();
            }
        });
    };

    var refresh_table = function() {
        $('span.loading').fadeIn('fast');
        reload_table(function() {
            $('span.loading').fadeOut('fast');
        });
    };

    $(document).ready(function() {

        reload_table();
        $('#refresh-button').click(refresh_table);
        setInterval(refresh_table, POLL_INTERVAL);

    });
})($);


//
// JOBS
//
(function($) {
    var $raw_tpl = $('script[name=job-row]').html();
    var template = _.template($raw_tpl);
    var $raw_tpl_page = $('script[name=page-link]').html();
    var template_page = _.template($raw_tpl_page);
    var $ul = $('div#page-selection ul');
    var noJobsHtml = $('script[name=no-jobs-row]').html();
    var $raw_tpl_prev_page = $('script[name=previous-page-link]').html();
    var template_prev_page = _.template($raw_tpl_prev_page);
    var $raw_tpl_next_page = $('script[name=next-page-link]').html();
    var template_next_page = _.template($raw_tpl_next_page);
    var $tbody = $('table#jobs tbody');
    var $placeholderEl = $('tr[data-role=loading-placeholder]', $tbody);
    var html;
    var $el;
    const csrftoken = getCookie('csrftoken');

    var reload_table = function(done) {
        $placeholderEl.show();

        // Fetch the available jobs on the queue
        api.getJobs('{{ queue.name }}', '{{ page }}', function(jobs, pagination) {
            onJobsLoaded(jobs, pagination, done);
        });
    };

    var onJobsLoaded = function(jobs, pagination, done) {
        var html = '';

        $tbody.empty();

        if (jobs.length > 0) {
            $.each(jobs, function(i, job) {
                job.enqueued_at = Date.create(job.enqueued_at);
                if (job.ended_at) {
                    job.ended_at = Date.create(job.ended_at);
                }
                if (job.started_at) {
                    job.started_at = Date.create(job.started_at);
                }
                html += template({d: job}, {variable: 'd'});
            });
            $tbody[0].innerHTML = html;
        } else {
            $tbody.append(noJobsHtml);
        }

        $ul.empty();

        // prev page
        if (pagination.prev_page !== undefined ) {
            html = template_prev_page(pagination.prev_page);
            $el = $(html);
            $ul.append($el);
        } else {
            html = $('script[name=no-previous-page-link]').html();
            $ul.append(html);
        }

        $.each(pagination.pages_in_window, function(i, page) {
            var html = template_page(page);
            var $el = $(html);

            // Special markup for the active page
            if (page.number === {{ page }} ) {
                $el.addClass('active');
            }

            $ul.append($el);
        });

        // next page
        if (pagination.next_page !== undefined ) {
            html = template_next_page(pagination.next_page);
            $el = $(html);
            $ul.append($el);
        } else {
            html = $('script[name=no-next-page-link]').html();
            $ul.append(html);
        }

        if (done !== undefined) {
            done();
        }
    };

    var refresh_table = function() {
        $('span.loading').fadeIn('fast');
        reload_table(function() {
            $('span.loading').fadeOut('fast');
        });
    };

    $(document).ready(function() {

        reload_table();
        $('#refresh-button').click(refresh_table);
        setInterval(refresh_table, POLL_INTERVAL);

    });

    // Enable the AJAX behaviour of the empty button
    $('#empty-btn').click(function(e) {
        e.preventDefault();
        e.stopPropagation();

        var $this = $(this);
        const request = new Request(
            $this.attr('href'),
            {headers: {'X-CSRFToken': csrftoken}}
        );
        fetch(request, {
            method: 'POST',
            mode: 'same-origin'  // Do not send CSRF token to another domain.
        }).then(function(response) {
            reload_table();
        });

        return false;
    });

    $('#workers-btn').click(function(e) {
        e.preventDefault();
        e.stopPropagation();

        $('#workers').toggle();

        return false;
    });

    // Enable the AJAX behaviour of the empty button
    $tbody.on('click', '[data-role=cancel-job-btn]', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var $this = $(this),
            $row = $this.parents('tr'),
            job_id = $row.data('job-id'),
            url = url_for('cancel_job', job_id);

        const request = new Request(
            url,
            {headers: {'X-CSRFToken': csrftoken}}
        );
        fetch(request, {
            method: 'POST',
            mode: 'same-origin'  // Do not send CSRF token to another domain.
        }).then(function(response) {
            $row.fadeOut('fast', function() { $row.remove(); });
        });

        return false;
    });

})($);
