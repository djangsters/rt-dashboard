import templateHtml from './dashboard.html'
import { loadTemplate } from '../../utils/dom'

const REFRESH_INTERVAL = 3000

export default class Dashboard extends HTMLElement {
  constructor () {
    super()

    loadTemplate(this.attachShadow({ mode: 'open' }), templateHtml)

    this.selectedQueueChange = this.selectedQueueChange.bind(this)

    setInterval(this.refreshInterval.bind(this), REFRESH_INTERVAL)
  }

  connectedCallback () {
    const queuesComponent = this.shadowRoot.querySelector('queues-component')
    queuesComponent.addEventListener('selectedQueueChange', this.selectedQueueChange)
  }

  disconnectedCallback () {
    this.removeEventListener('selectedQueueChange', this.selectedQueueChange)
  }

  selectedQueueChange (event) {
    const { detail: { queueName, count } } = event
    const tasksComponent = this.shadowRoot.querySelector('tasks-component')
    tasksComponent.queueInfo = { queue: queueName, count }
  }

  refreshInterval () {
    document.dispatchEvent(
      new CustomEvent('refreshIntervalElapsed'),
    )
  }
}
