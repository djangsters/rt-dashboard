import html from './queues.html'
import { appendElement, loadTemplate } from '../../utils/dom'

const rowTemplate = `
<tr data-role="queue">
  <td>
    <i class="fas fa-inbox"></i>
    <a href="/admin/rt_dashboard/inner/%5Bfailed%5D">[failed]</a>
  </td>
  <td class="narrow">0</td>
</tr>
`

class Queues extends HTMLElement {
  constructor () {
    super()

    loadTemplate(this, html)

    this.onQueueClicked = this.onQueueClicked.bind(this)
  }

  connectedCallback () {
    this.queuesLinks = []
    Array.from(this.shadowRoot.querySelectorAll('td a')).forEach(link => {
      this.queuesLinks.push(link)
      link.addEventListener('click', this.onQueueClicked)
    })

    setTimeout(() => {
      const tbody = this.shadowRoot.querySelector('tbody')
      Array.from(tbody.childNodes).forEach((el) => {
        tbody.removeChild(el)
      })

      const row = appendElement('tr', tbody)
      row.setAttribute('data-role', 'queue')

      const td = appendElement('td', row)
      appendElement('i', td, 'fas fa-inbox')

      const name = 'test'
      const count = 0
      const link = appendElement('a', td, null, `[${name}]`)
      link.setAttribute('name', name)
      link.setAttribute('href', `/admin/rt_dashboard/inner/%5B${name}%5D`)

      appendElement('td', row, 'narrow', count)

      Array.from(this.shadowRoot.querySelectorAll('td a')).forEach(link => {
        this.queuesLinks.push(link)
        link.addEventListener('click', this.onQueueClicked)
      })
    }, 1000)
  }

  disconnectedCallback () {
    this.queuesLinks.forEach(link => {
      link.removeEventListener('click', this.onQueueClicked)
    })
  }

  onQueueClicked (e) {
    const { target: selectedQueue } = e
    this.dispatchEvent(
      new CustomEvent('selectedQueueChange', {
        detail: { queueName: selectedQueue.name },
        bubbles: true
      })
    )
    e.preventDefault()
    return false
  }
}
window.customElements.define('queues-component', Queues)
