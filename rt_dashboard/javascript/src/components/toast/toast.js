import html from './toast.html'
import { loadTemplate } from '../../utils/dom'

const TOAST_TIMEOUT = 10 * 1000

export default class Toast extends HTMLElement {
  constructor () {
    super()

    loadTemplate(this.attachShadow({ mode: 'open' }), html)

    this.showToast = this.showToast.bind(this)
    this.onClose = this.onClose.bind(this)
  }

  connectedCallback () {
    document.addEventListener('toast', this.showToast)
    this.toast = this.shadowRoot.querySelector('.toast')
    const closeBtn = this.shadowRoot.querySelector('button.close')
    closeBtn.addEventListener('click', this.onClose)
  }

  disconnectedCallback () {
    document.removeEventListener('toast', this.showToast)
  }

  onClose (event) {
    this.toast.classList.add('hide')
    this.toast.classList.remove('show')
  }

  showToast (event) {
    const { detail: { title, message } } = event
    const timestamp = new Date().getTime()
    this.toast.classList.add('hide')
    this.toast.classList.remove('show')
    const toastTitle = this.shadowRoot.querySelector('#title')
    const toastMessage = this.shadowRoot.querySelector('#message')
    const toastTimestamp = this.shadowRoot.querySelector('#time')
    toastTitle.innerHTML = title
    toastMessage.innerHTML = message
    toastTimestamp.innerHTML = timestamp
    this.toast.classList.add('show')
    this.toast.classList.remove('hide')

    cancelTimeout(this.timeout)
    this.timeout = setTimeout(() => {
        this.toast.classList.add('hide')
        this.toast.classList.remove('show')
      }
    }, TOAST_TIMEOUT)
  }
}
