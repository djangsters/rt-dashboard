import templateHtml from './HistoryPage.html'
import styles from '../../../styles/main.scss'
import { loadTemplate, whenUpgraded } from '../../utils/dom'
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

  async fetchData () {
    if (process.env.NODE_ENV === 'production') {
      return getHistory({ signal: this._controller.signal })
    }
    return import('./history').then((data) => data.default || data)
  }

  async connectedCallback () {
    const data = await this.fetchData()
    if (data) {
      await whenUpgraded(this._chart)
      this._chart.setHistoryData(data)
    }
  }

  disconnectedCallback () {
    // cancel the pending request if any
    this._controller.abort()
  }
}
