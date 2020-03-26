import templateHtml from './workers.html'
import {
  loadTemplate,
  mapDataToElements,
  appendElement,
  appendNoDataRow
} from '../../utils/dom'
import { getWorkers } from '../../api'

class Workers extends HTMLElement {
  constructor () {
    super()
    loadTemplate(this.attachShadow({open: true}), templateHtml)

    this.onWorkersBtnClick = this.onWorkersBtnClick.bind(this)
  }

  connectedCallback () {
    const btn = this.shadowRoot.querySelector('button#workers-btn')
    btn.addEventListener('click', this.onWorkersBtnClick)

    getWorkers((data) => {
      const tbody = this.shadowRoot.querySelector('tbody')
      const workersCount = this.shadowRoot.querySelector('#workers-count span')

      if (!data || data.length <= 0) {
        workersCount.innerHTML = 'No workers registered!'
        appendNoDataRow(tbody, 'No workers.', 3)
        return
      }

      mapDataToElements(tbody, data, this.mapToRow)
      workersCount.innerHTML = data.length + ' workers registered'
    })
  }

  mapToRow (parent, { name, state, queues }) {
    const row = appendElement('tr', parent)
    row.setAttribute('data-role', 'worker')

    const stateIcon = state === 'busy' ? 'play' : 'pause'
    const td = appendElement('td', row)
    appendElement('i', td, `fas fa-${stateIcon}`)

    appendElement('td', row, null, name)

    appendElement('td', row, null, queues.join(','))
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
