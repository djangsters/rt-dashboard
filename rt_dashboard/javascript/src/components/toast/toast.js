import html from './toast.html'
import { loadTemplate } from '../../utils/dom'

const TOAST_TIMEOUT = 10 * 1000

export default class Toast extends HTMLElement {
  constructor () {
    super()

    loadTemplate(this.attachShadow({ mode: 'open' }), html)

    this.onToast = this.onToast.bind(this)
    this.showToast = this.showToast.bind(this)
    this.hideToast = this.hideToast.bind(this)
    this.onClose = this.onClose.bind(this)
  }

  connectedCallback () {
    this.toastTitle = this.shadowRoot.querySelector('#title')
    this.toastMessage = this.shadowRoot.querySelector('#message')
    this.toastTimestamp = this.shadowRoot.querySelector('#time')

    document.addEventListener('toast', this.onToast)
    this.toast = this.shadowRoot.querySelector('.toast')
    this.closeBtn = this.shadowRoot.querySelector('button.close')
    this.closeBtn.addEventListener('click', this.onClose)
  }

  disconnectedCallback () {
    document.removeEventListener('toast', this.onToast)
    this.closeBtn.removeEventListener('click', this.onClose)
  }

  onClose () {
    this.hideToast()
  }

  hideToast () {
    this.toast.classList.add('hide')
    this.toast.classList.remove('show')
  }

  showToast () {
    this.toast.classList.add('show')
    this.toast.classList.remove('hide')
  }

  onToast (event) {
    const { detail: { title, message } } = event
    const timestamp = new Date().getTime()
    this.hideToast()

    this.toastTitle.innerHTML = title
    this.toastMessage.innerHTML = message
    this.toastTimestamp.innerHTML = timestamp

    this.showToast()

    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      this.hideToast()
    }, TOAST_TIMEOUT)
  }
}
