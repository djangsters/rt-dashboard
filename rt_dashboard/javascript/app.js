import './styles/main.scss'
import 'bootstrap/dist/js/bootstrap.min.js'
import $ from 'jquery'
import './src/components/rt-dashboard/rt-dashboard'
import './src/components/dashboard/dashboard'
import './src/components/history'
import './src/components/queues/queues'
import './src/components/workers/workers'

const DOCUMENT_SCRIPT_NAME = 'app.js'
const API_URL_PARAM_NAME = 'apiUrl'

function getParams (scriptName) {
  var scripts = document.getElementsByTagName('script')

  for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].src.indexOf('/' + scriptName) > -1) {
      var pa = scripts[i].src.split('?').pop().split('&')
      var p = {}
      for (var j = 0; j < pa.length; j++) {
        var kv = pa[j].split('=')
        p[kv[0]] = kv[1]
      }
      return p
    }
  }

  return {}
}

const getApiUrl = () => {
  return getParams(DOCUMENT_SCRIPT_NAME)[API_URL_PARAM_NAME]
}

var urlFor = function (name, param) {
  var url = getApiUrl()
  if (name === 'queues') {
    url += 'queues.json'
  } else if (name === 'workers') {
    url += 'workers.json'
  } else if (name === 'cancel_job') {
    url += 'job/' + encodeURIComponent(param) + '/cancel'
  }
  return url
}

var urlForJobs = function (param, page) {
  var url = getApiUrl() + 'jobs/' + encodeURIComponent(param) + '/' + page + '.json'
  return url
}

var api = {
  getQueues: function (cb) {
    $.getJSON(urlFor('queues'), function (data) {
      var queues = data.queues
      cb(queues)
    })
  },

  getJobs: function (queueName, page, cb) {
    $.getJSON(urlForJobs(queueName, page), function (data) {
      var jobs = data.jobs
      var pagination = data.pagination
      cb(jobs, pagination)
    })
  },

  getWorkers: function (cb) {
    $.getJSON(urlFor('workers'), function (data) {
      var workers = data.workers
      cb(workers)
    })
  }
}

api.getQueues((data) => {
  console.log(data)
})
