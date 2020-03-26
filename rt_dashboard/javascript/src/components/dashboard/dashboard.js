import html from './dashboard.html'

class Dashboard extends HTMLElement {
  constructor () {
    super()
    const template = document.createElement('template')
    template.innerHTML = html

    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(template.content.cloneNode(true))

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
window.customElements.define('dashboard-component', Dashboard)
