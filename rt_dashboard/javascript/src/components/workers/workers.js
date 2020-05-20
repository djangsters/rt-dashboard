import templateHtml from './workers.html'
import styles from '../../../styles/main.scss'
import {
  loadTemplate,
  mapDataToElements,
  appendElement,
  appendNoDataRow,
} from '../../utils/dom'
import { getWorkers } from '../../api'

export default class Workers extends HTMLElement {
  constructor () {
    super()
    loadTemplate(this.attachShadow({ mode: 'open' }), templateHtml, styles)

    this.onWorkersBtnClick = this.onWorkersBtnClick.bind(this)
    this.onRefresh = this.onRefresh.bind(this)
    this.refreshWorkers = this.refreshWorkers.bind(this)
  }

  connectedCallback () {
    const btn = this.shadowRoot.querySelector('button#workers-btn')
    btn.addEventListener('click', this.onWorkersBtnClick)

    document.addEventListener('refreshIntervalElapsed', this.onRefresh)

    this.refreshWorkers()
  }

  disconnectedCallback () {
    this.removeEventListener('click', this.onWorkersBtnClick)
    document.removeEventListener('refreshIntervalElapsed', this.onRefresh)
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

  refreshWorkers () {
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

  onRefresh () {
    this.refreshWorkers()
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
