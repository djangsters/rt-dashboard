import templateHtml from './HistoryPage.html'
import styles from '../../../styles/main.scss'
import { loadTemplate } from '../../utils/dom'
import { getHistory } from '../../api'

export default class HistoryPage extends HTMLElement {
  constructor () {
    super()

    this.attachShadow({ mode: 'open' })

    loadTemplate(this.shadowRoot, templateHtml, styles)

    this._chart = this.shadowRoot.getElementById('chart')

    this._controller = new AbortController()

    this.shadowRoot.getElementById('zoom-in').addEventListener('click', () => this._chart.zoomIn())
    this.shadowRoot.getElementById('zoom-out').addEventListener('click', () => this._chart.zoomOut())
    this.shadowRoot.getElementById('pan-left').addEventListener('click', () => this._chart.panLeft())
    this.shadowRoot.getElementById('pan-right').addEventListener('click', () => this._chart.panRight())
  }

  async connectedCallback () {
    this._chart.data = 'alabala'
    await customElements.whenDefined('rt-history-chart')
    await customElements.whenDefined(this._chart)
    if (process.env.NODE_ENV === 'production') {
      const data = await getHistory({ signal: this._controller.signal })
      if (data) {
        this._chart.setHistoryData(data)
      }
    } else {
      const data = await require('./history')
      if (this._chart.setHistoryData) {
        return this._chart.setHistoryData(data.default || data)
      } else {
        console.log('chart not upgraded yet, falling back to upgrade event')
        this._chart.addEventListener('upgrade', () => this._chart.setHistoryData(data.default || data))
      }
    }
  }

  disconnectedCallback () {
    // cancel the pending request if any
    this._controller.abort()
  }
}
