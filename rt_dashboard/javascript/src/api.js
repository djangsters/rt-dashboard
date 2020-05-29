const DOCUMENT_SCRIPT_NAME = 'app.js'
const API_URL_PARAM_NAME = 'apiUrl'
const POLL_PARAM_NAME = 'poll'

const requestErrorHandler = error => {
  console.error(error)
  alert('Error with network request')
}

/**
 *
 * @param {Promise<Response>?} requestPromise
 * @returns {Promise<any>|null}
 */
const executeRequest = async (requestPromise) => {
  try {
    const response = await requestPromise
    if (response.ok) {
      return response.json()
    }
    requestErrorHandler(response.statusText)
  } catch (error) {
    requestErrorHandler(error)
  }
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

export const getPollInterval = () => {
  const pollInterval = getParams(DOCUMENT_SCRIPT_NAME)[POLL_PARAM_NAME]
  if (!pollInterval) {
    return null
  }
  return parseInt(pollInterval)
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
  } else if (name === 'history') {
    url += 'history.json'
  }
  return url
}

export const urlForJobs = (param, page) => {
  var url = getApiUrl() + 'jobs/' + encodeURIComponent(param) + '/' + page + '.json'
  return url
}

export const getQueues = () => executeRequest(fetch(urlFor('queues')))

export const getJobs = (queueName, page) => executeRequest(fetch(urlForJobs(queueName, page)))

export const getWorkers = async () => executeRequest(fetch(urlFor('workers')))

/**
 *
 * @param {RequestInit?} init
 * @returns {Promise<Response>}
 */
export const getHistory = (init) => executeRequest(fetch(urlFor('history'), init))

export const cancelJob = (jobId) => executeRequest(fetch(getApiUrl() + `job/${jobId}/cancel`, { method: 'POST' }))

export const deleteQueue = (queue) => executeRequest(fetch(getApiUrl() + `queue/${queue}/delete`, { method: 'POST' }))

export const emptyQueue = (queue) => executeRequest(fetch(getApiUrl() + `queue/${queue}/empty`, { method: 'POST' }))
