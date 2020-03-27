import templateHtml from './HistoryPage.html'
import {loadTemplate} from "../../utils/dom";

export default class HistoryPage extends HTMLElement {
  constructor() {
    super()

    this.attachShadow({mode: 'open'})

    loadTemplate(this.shadowRoot, templateHtml)

    const chart = this.shadowRoot.getElementById('chart')
    this.shadowRoot.getElementById('zoom-in').addEventListener('click', () => chart.zoomIn())
    this.shadowRoot.getElementById('zoom-out').addEventListener('click', () => chart.zoomOut())
    this.shadowRoot.getElementById('pan-left').addEventListener('click', () => chart.panLeft())
    this.shadowRoot.getElementById('pan-right').addEventListener('click', () => chart.panRight())
  }
}
