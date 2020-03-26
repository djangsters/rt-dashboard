import templateHtml from './dashboard.html'
import { loadTemplate } from '../../utils/dom'

class Dashboard extends HTMLElement {
  constructor () {
    super()

    loadTemplate(this.attachShadow({ mode: 'open' }), templateHtml)

    this.selectedQueueChange = this.selectedQueueChange.bind(this)
  }

  connectedCallback () {
    const queuesComponent = this.shadowRoot.querySelector('queues-component')
    queuesComponent.addEventListener('selectedQueueChange', this.selectedQueueChange)
  }

  disconnectedCallback () {
    this.removeEventListener('selectedQueueChange', this.selectedQueueChange)
  }

  selectedQueueChange (event) {
    const { detail: { queueName } } = event
    console.log(queueName)
  }
}
