import templateHtml from './dashboard.html'
import { loadTemplate } from '../../utils/dom'
import { getPollInterval } from '../../api'

const REFRESH_INTERVAL = getPollInterval() || 3000

export default class Dashboard extends HTMLElement {
  constructor () {
    super()

    loadTemplate(this.attachShadow({ mode: 'open' }), templateHtml)

    this.selectedQueueChange = this.selectedQueueChange.bind(this)
  }

  connectedCallback () {
    const queuesComponent = this.shadowRoot.querySelector('queues-component')
    queuesComponent.addEventListener('selectedQueueChange', this.selectedQueueChange)

    this.intervalId = setInterval(this.refreshInterval.bind(this), REFRESH_INTERVAL)
  }

  disconnectedCallback () {
    this.removeEventListener('selectedQueueChange', this.selectedQueueChange)

    clearInterval(this.intervalId)
  }

  selectedQueueChange (event) {
    const { detail: { queueName, count } } = event
    const tasksComponent = this.shadowRoot.querySelector('tasks-component')
    tasksComponent.queueInfo = { queue: queueName, count }
  }

  refreshInterval () {
    document.dispatchEvent(
      new CustomEvent('refresh'),
    )
  }
}
