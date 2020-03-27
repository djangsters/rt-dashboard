import templateHtml from './rt-dashboard.html'
import { loadTemplate } from '../../utils/dom'

const DASHBOARD = 'dashboard-component'
const HISTORY = 'rt-history'

export default class RtDashboard extends HTMLElement {
  constructor () {
    super()
    loadTemplate(this.attachShadow({ mode: 'open' }), templateHtml)

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

  disconnectedCallback () {
    this.navLinks.forEach(link => {
      link.removeEventListener('click', this.tabClicked)
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
