import templateHtml from './HistoryPage.html'
import { loadTemplate } from '../../utils/dom'
import { getHistory } from '../../api'

export default class HistoryPage extends HTMLElement {
  constructor () {
    super()

    this.attachShadow({ mode: 'open' })

    loadTemplate(this.shadowRoot, templateHtml)

    this._chart = this.shadowRoot.getElementById('chart')

    this._controller = new AbortController()

    this.shadowRoot.getElementById('zoom-in').addEventListener('click', () => this._chart.zoomIn())
    this.shadowRoot.getElementById('zoom-out').addEventListener('click', () => this._chart.zoomOut())
    this.shadowRoot.getElementById('pan-left').addEventListener('click', () => this._chart.panLeft())
    this.shadowRoot.getElementById('pan-right').addEventListener('click', () => this._chart.panRight())
  }

  async connectedCallback () {
    if (process.env.NODE_ENV === 'production') {
      const response = await getHistory({ signal: this._controller.signal })
      if (response.ok) {
        this._chart.setHistoryData(await response.json())
      }
    } else {
      const data = await require('./history')
      return this._chart.setHistoryData(data.default || data)
    }
  }

  disconnectedCallback () {
    // cancel the pending request if any
    this._controller.abort()
  }
}