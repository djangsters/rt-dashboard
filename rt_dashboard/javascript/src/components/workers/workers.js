import html from './workers.html'
import { loadTemplate } from '../../utils/dom'

class Workers extends HTMLElement {
  constructor () {
    super()
    loadTemplate(this, html)

    this.onWorkersBtnClick = this.onWorkersBtnClick.bind(this)
  }

  connectedCallback () {
    const btn = this.shadowRoot.querySelector('button#workers-btn')
    btn.addEventListener('click', this.onWorkersBtnClick)
  }

  disconnectedCallback () {
    this.removeEventListener('click', this.onWorkersBtnClick)
  }

  onWorkersBtnClick (event) {
    const workersTable = this.shadowRoot.querySelector('#workers')
    const isHidden = workersTable.getAttribute('hidden')
    if (isHidden) {
      workersTable.removeAttribute('hidden')
    } else {
      workersTable.setAttribute('hidden', true)
    }
  }
}
window.customElements.define('workers-component', Workers)
