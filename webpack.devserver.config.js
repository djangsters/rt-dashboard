module.exports = {
  before: (app, server, compiler) => {
    app.get('/admin/rt_dashboard/inner/queues.json', (req, res) => {
      res.json({
        queues: [
          { name: '[test]', count: 0, url: '/admin/rt_dashboard/inner/test' },
          { name: '[running]', count: 1, url: '/admin/rt_dashboard/inner/running' },
          { name: 'default', count: 0, url: '/admin/rt_dashboard/inner/default' }
        ]
      })
    })
    app.get('/admin/rt_dashboard/inner/workers.json', (req, res) => {
      res.json({
        workers: [{
          state: 'pause',
          name: 'v-yf.2193',
          queues: ['default', 'low_prio_queue']
        }, {
          state: 'busy',
          name: 'v-yf.2192',
          queues: ['empty', 'high_prio_queue']
        }]
      })
    })

    const generateTask = (id, error, status) => ({
      id,
      description: 'feeds.tasks.generate_feed_from_db(1113)',
      origin: 'unnatural',
      worker: status === 'running' ? 'v-yf.21' : null,
      status,
      error_message: error,
      enqueued_at: new Date().getTime(),
      started_at: new Date().getTime(),
      ended_at: new Date().getTime()
    })
    const getJobsHandler = (pagination) => (req, res) => {
      res.json({
        jobs: [
          generateTask('fa02bf65-0527-40d0-acae-9f3c041fAAAA', 'General error', 'failed'),
          generateTask('fa02bf65-0527-40d0-acae-9f3c041f3EEE', null, 'finished'),
          generateTask('fa02bf65-0527-40d0-acae-9f3c041f3FFF', null, 'finished'),
          generateTask('fa02bf65-0527-40d0-BBBB-9f3c041fBBBB', null, 'running')
        ],
        pagination
      })
    }
    app.get('/admin/rt_dashboard/inner/jobs/%5Btest%5D/1.json',
      getJobsHandler({
        pages_in_window: [{ number: 1 }, { number: 2 }],
        next_page: { url: '/admin/rt_dashboard/inner/%5Btest%5D/5' }
      }))
    app.get('/admin/rt_dashboard/inner/jobs/%5Btest%5D/2.json',
      getJobsHandler({
        pages_in_window: [{ number: 1 }, { number: 2 }],
        prev_page: { url: '/admin/rt_dashboard/inner/%5Btest%5D/1' }
      }))
    app.get('/admin/rt_dashboard/inner/jobs/%5Brunning%5D/1.json',
      getJobsHandler({
        pages_in_window: [{ number: 1 }, { number: 2 }],
        next_page: { url: '/admin/rt_dashboard/inner/%5Btest%5D/5' }
      }))
    app.get('/admin/rt_dashboard/inner/jobs/default/1.json', (req, res) => {
      res.json({
        jobs: [
        ],
        pagination: { pages_in_window: 0, next_page: null, prev_page: null }
      })
    })
    app.post('/admin/rt_dashboard/inner/queue/default/delete', (req, res) => {
      res.json({})
    })
    app.post('/admin/rt_dashboard/inner/queue/[running]/empty', (req, res) => {
      res.json({})
    })
    app.post('/admin/rt_dashboard/inner/job/fa02bf65-0527-40d0-BBBB-9f3c041fBBBB/cancel', (req, res) => {
      res.json({})
    })
  }
}
