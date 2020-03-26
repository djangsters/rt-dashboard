import $ from 'jquery'

const DOCUMENT_SCRIPT_NAME = 'app.js'
const API_URL_PARAM_NAME = 'apiUrl'

const requestErrorHandler = error => {
  console.error(error)
  alert('Error with network request')
}

export const getParams = (scriptName) => {
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

export const getApiUrl = () => {
  return getParams(DOCUMENT_SCRIPT_NAME)[API_URL_PARAM_NAME]
}

export const urlFor = (name, param) => {
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

export const urlForJobs = (param, page) => {
  var url = getApiUrl() + 'jobs/' + encodeURIComponent(param) + '/' + page + '.json'
  return url
}

export const getQueues = (cb) => {
  $.getJSON(urlFor('queues'), (data) => {
    var queues = data.queues
    cb(queues)
  }).fail(requestErrorHandler)
}

export const getJobs = (queueName, page, cb) => {
  $.getJSON(urlForJobs(queueName, page), (data) => {
    var jobs = data.jobs
    var pagination = data.pagination
    cb(jobs, pagination)
  }).fail(requestErrorHandler)
}

export const getWorkers = (cb) => {
  $.getJSON(urlFor('workers'), (data) => {
    var workers = data.workers
    cb(workers)
  }).fail(requestErrorHandler)
}
