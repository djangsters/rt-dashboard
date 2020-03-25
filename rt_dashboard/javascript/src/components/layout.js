const html = `
<link href="css/app.css" rel="stylesheet" type="text/css" />
<div class="container">
  <ul class="nav nav-tabs" id="header-tabs">
    <li role="presentation" class="nav-item"><a class="nav-link active" name="dashboard-component" href="#">Overview</a></li>
    <li role="presentation" class="nav-item"><a class="nav-link" href="#" name="history-component">Task History</a></li>
  </ul>
  <dashboard-component></dashboard-component>
  <history-component></history-component>
</div>`
const DASHBOARD = 'dashboard-component'
const HISTORY = 'history-component'

class LayoutWrapper extends HTMLElement {
  constructor () {
    super()
    const template = document.createElement('template')
    template.innerHTML = html

    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(template.content.cloneNode(true))

    this.tabClicked = this.tabClicked.bind(this)
  }

  connectedCallback () {
    this.navLinks = []
    Array.from(this.shadowRoot.querySelectorAll('li a.nav-link')).forEach(link => {
      this.navLinks.push(link)
      link.addEventListener('click', this.tabClicked)
    })

    this.panels = []
    const panels = [DASHBOARD, HISTORY]
    panels.forEach(panel => {
      this.panels.push(this.shadowRoot.querySelector(panel))
    })
  }

  tabClicked (e) {
    const { target: activeLink } = e
    this.navLinks.forEach(l => { l.classList.remove('active') })
    activeLink.classList.add('active')
    this.panels.forEach(p => { p.hidden = true })
    this.panels.find(p => p.tagName.toLowerCase() === activeLink.name).hidden = false
  }
}
customElements.define('layout-wrapper', LayoutWrapper)
