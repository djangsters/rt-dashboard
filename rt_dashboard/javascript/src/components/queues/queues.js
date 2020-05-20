import templateHtml from './queues.html'
import { appendElement, loadTemplate, mapDataToElements, appendNoDataRow } from '../../utils/dom'
import { getQueues } from '../../api'

export default class Queues extends HTMLElement {
  constructor () {
    super()

    loadTemplate(this.attachShadow({ mode: 'open' }), templateHtml)

    this.queuesLinks = []

    this.onQueueClicked = this.onQueueClicked.bind(this)
    this.onRefresh = this.onRefresh.bind(this)
    this.refreshQueues = this.refreshQueues.bind(this)
    this.removeQueueClickHandlers = this.removeQueueClickHandlers.bind(this)
  }

  connectedCallback () {
    document.addEventListener('refresh', this.onRefresh)
    this.refreshQueues()
  }

  disconnectedCallback () {
    document.removeEventListener('refresh', this.onRefresh)
    this.removeQueueClickHandlers()
  }

  refreshQueues () {
    getQueues((data) => {
      this.removeQueueClickHandlers()
      const tbody = this.shadowRoot.querySelector('tbody')

      if (!data || data.length <= 0) {
        appendNoDataRow(tbody, 'No queues.', 2)
        return
      }

      mapDataToElements(tbody, data, this.fillRow)
      Array.from(this.shadowRoot.querySelectorAll('td a')).forEach(link => {
        this.queuesLinks.push(link)
        link.addEventListener('click', this.onQueueClicked)
      })

      let [first] = data
      first = data.find(q => q.name.startsWith('[running')) ?? first
      const newQueueInfo = this.selectedQueue ? data.find(q => q.name === this.selectedQueue.name) : first
      this.sendChangedEvent(newQueueInfo)
    })
  }

  onRefresh () {
    this.refreshQueues()
  }

  removeQueueClickHandlers () {
    this.queuesLinks.forEach(link => {
      link.removeEventListener('click', this.onQueueClicked)
    })
    this.queuesLinks = []
  }

  fillRow (parent, { name, url, count }) {
    const row = appendElement('tr', parent)
    row.setAttribute('data-role', 'queue')

    const td = appendElement('td', row)
    appendElement('i', td, 'fas fa-inbox')

    const link = appendElement('a', td, 'ml-1', name)
    link.setAttribute('name', name)
    link.setAttribute('data-count', count)
    link.setAttribute('href', url)

    appendElement('td', row, 'narrow', count)
  }

  onQueueClicked (e) {
    const { target: selectedQueue } = e

    this.sendChangedEvent(selectedQueue)
    e.preventDefault()
    return false
  }

  sendChangedEvent ({ name: queueName, count }) {
    if (this.selectedQueue && this.selectedQueue.name === queueName && this.selectedQueue.count === count) {
      return
    }

    this.dispatchEvent(
      new CustomEvent('selectedQueueChange', {
        detail: { queueName, count },
        bubbles: true,
      }),
    )
    this.selectedQueue = {
      name: queueName,
      count,
    }
  }
}
