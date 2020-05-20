import templateHtml from './queues.html'
import styles from '../../../styles/main.scss'
import { appendElement, loadTemplate, mapDataToElements, appendNoDataRow } from '../../utils/dom'
import { getQueues } from '../../api'

export default class Queues extends HTMLElement {
  constructor () {
    super()

    loadTemplate(this.attachShadow({ mode: 'open' }), templateHtml, styles)

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
      let [first] = data
      first = data.find(q => q.name.startsWith('[running')) ?? first
      this.sendChangedEvent(first.name, first.count)
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

    const link = appendElement('a', td, 'ml-1', name)
    link.setAttribute('name', name)
    link.setAttribute('data-count', count)
    link.setAttribute('href', url)

    appendElement('td', row, 'narrow', count)
  }

  onQueueClicked (e) {
    const { target: selectedQueue } = e
    this.sendChangedEvent(
      selectedQueue.name,
      selectedQueue.getAttribute('data-count'),
    )
    e.preventDefault()
    return false
  }

  sendChangedEvent (queueName, count) {
    this.dispatchEvent(
      new CustomEvent('selectedQueueChange', {
        detail: { queueName, count },
        bubbles: true,
      }),
    )
  }
}
