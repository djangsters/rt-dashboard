import html from './toast.html'
import styles from '../../../styles/main.scss'
import { loadTemplate } from '../../utils/dom'

import $ from 'jquery'

const TOAST_TIMEOUT = 5 * 1000

export default class Toast extends HTMLElement {
  constructor () {
    super()

    loadTemplate(this.attachShadow({ mode: 'open' }), html, styles)

    this.showToast = this.showToast.bind(this)
  }

  connectedCallback () {
    document.addEventListener('toast', this.showToast)
    const toast = this.shadowRoot.querySelector('.toast')
    this.toast = $(toast).toast({
      delay: TOAST_TIMEOUT,
    })
  }

  disconnectedCallback () {
    document.removeEventListener('toast', this.showToast)
  }

  showToast (event) {
    const { detail: { title, message } } = event
    this.toast.toast('hide')
    const toastTitle = this.shadowRoot.querySelector('#title')
    const toastMessage = this.shadowRoot.querySelector('#message')
    toastTitle.innerHTML = title
    toastMessage.innerHTML = message
    this.toast.toast('show')
  }
}
