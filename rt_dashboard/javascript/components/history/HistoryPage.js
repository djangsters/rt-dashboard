export default class HistoryPage extends HTMLElement {
    constructor() {
        super()

        const shadow = this.attachShadow({mode: 'open'})

        const chart = document.createElement('rt-history-chart')

        shadow.appendChild(chart)
    }
}
