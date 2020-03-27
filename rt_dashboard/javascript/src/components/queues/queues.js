import templateHtml from './queues.html'
import { appendElement, loadTemplate, mapDataToElements, appendNoDataRow } from '../../utils/dom'
import { getQueues } from '../../api'

export default class Queues extends HTMLElement {
  constructor () {
    super()

    loadTemplate(this.attachShadow({ mode: 'open' }), templateHtml)

    this.onQueueClicked = this.onQueueClicked.bind(this)
  }

  connectedCallback () {
    this.queuesLinks = []

    getQueues((data) => {
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
    })
  }

  disconnectedCallback () {
    this.queuesLinks.forEach(link => {
      link.removeEventListener('click', this.onQueueClicked)
    })
  }

  fillRow (parent, { name, url, count }) {
    const row = appendElement('tr', parent)
    row.setAttribute('data-role', 'queue')

    const td = appendElement('td', row)
    appendElement('i', td, 'fas fa-inbox')

    const link = appendElement('a', td, null, name)
    link.setAttribute('name', name)
    link.setAttribute('href', url)

    appendElement('td', row, 'narrow', count)
  }

  onQueueClicked (e) {
    const { target: selectedQueue } = e
    this.dispatchEvent(
      new CustomEvent('selectedQueueChange', {
        detail: { queueName: selectedQueue.name },
        bubbles: true,
      }),
    )
    e.preventDefault()
    return false
  }
}
