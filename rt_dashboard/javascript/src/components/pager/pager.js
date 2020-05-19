import templateHtml from './pager.html'
import { loadTemplate, mapDataToElements, appendElement } from '../../utils/dom'

export default class Pager extends HTMLElement {
  get pagination () {
    return this.paging
  }

  /**
   * Sets current paggination settings
   * @param {object} value New paggination settings
   * @param {number[]} value.pages_in_window Array of page numbers
   * @param {string} value.next_page Url to the next page data
   * @param {string} value.prev_page Url to the previous page data
   * @param {number} value.currentPage Current page number
   */
  set pagination (value) {
    this.paging = value
    this.update(value)
  }

  constructor () {
    super()

    loadTemplate(this.attachShadow({ mode: 'open' }), templateHtml)

    this.mapToPageLinks = this.mapToPageLinks.bind(this)
    this.onPageClicked = this.onPageClicked.bind(this)

    this.current = 1
  }

  disconnectedCallback () {
    this.removeEventListeners()
  }

  onPageClicked (e) {
    const { target: pageLink } = e
    const number = pageLink.page
    this.current = number

    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { number },
        bubbles: true,
      }),
    )

    e.preventDefault()
    return false
  }

  update ({
    pages_in_window: pagesArray,
    next_page: nextPage,
    prev_page: prevPage,
    currentPage,
  }) {
    let nextPageNum = null
    let prevPageNum = null
    if (prevPage) {
      prevPageNum = prevPage.url.split('/').pop()
    }
    if (nextPage) {
      nextPageNum = nextPage.url.split('/').pop()
    }
    if (currentPage) {
      this.current = currentPage
    }

    const pages = [
      { text: '&laquo;', number: prevPageNum },
      ...pagesArray.map(({ number }) => ({ text: number, number })),
      { text: '&raquo;', number: nextPageNum },
    ]
    this.pageLinks = []
    this.removeEventListeners()

    const pagesList = this.shadowRoot.querySelector('ul.pagination')
    mapDataToElements(pagesList, pages, this.mapToPageLinks)
  }

  removeEventListeners () {
    this.pageLinks.forEach(l => {
      l.removeEventListener('click', this.onPageClicked)
    })
    this.pageLinks = []
  }

  mapToPageLinks (parent, page) {
    const disabledClass = page.number ? '' : 'disabled'
    const activeClass = `${this.current}` === `${page.number}` ? 'active' : ''
    const li = appendElement('li', parent, `page-item ${disabledClass} ${activeClass}`)

    const link = appendElement('a', li, 'page-link', page.text)
    if (page.number) {
      link.setAttribute('href', `#${page.number}`)
      link.page = page.number
      link.addEventListener('click', this.onPageClicked)
      this.pageLinks.push(link)
    }
  }
}
