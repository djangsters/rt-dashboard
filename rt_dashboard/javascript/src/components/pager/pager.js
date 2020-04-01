import templateHtml from './pager.html'
import { loadTemplate, mapDataToElements, appendElement } from '../../utils/dom'

export default class Pager extends HTMLElement {
  get pagination () {
    return this.paging
  }

  set pagination (value) {
    this.paging = value
    this.updatePager(this.mapPaging(value))
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
    const number = pageLink.getAttribute('data-page')
    this.current = number

    this.dispatchEvent(
      new CustomEvent('selectedPageChanged', {
        detail: { number },
        bubbles: true,
      }),
    )

    e.preventDefault()
    return false
  }

  mapPaging ({
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

    return [
      { text: '&laquo;', number: prevPageNum },
      ...pagesArray.map(({ number }) => ({ text: number, number })),
      { text: '&raquo;', number: nextPageNum },
    ]
  }

  updatePager (pages) {
    this.pageLinks = []
    this.removeEventListeners()

    const pagesList = this.shadowRoot.querySelector('ul.pagination')
    mapDataToElements(pagesList, pages, this.mapToPageLinks)

    Array.from(this.shadowRoot.querySelectorAll('li a')).forEach(link => {
      this.pageLinks.push(link)
      link.addEventListener('click', this.onPageClicked)
    })
  }

  removeEventListeners () {
    this.pageLinks.forEach(l => {
      l.removeEventListener('click', this.onPageClicked)
    })
    this.pageLinks = []
  }

  mapToPageLinks (parent, page) {
    const disabledClass = page.number ? '' : 'disabled'
    // Attributes are string. Disabling error for == comparison
    // eslint-disable-next-line eqeqeq
    const activeClass = this.current == page.number ? 'active' : ''
    const li = appendElement('li', parent, `page-item ${disabledClass} ${activeClass}`)

    const link = appendElement('a', li, 'page-link', page.text)
    if (page.number) {
      link.setAttribute('href', `#${page.number}`)
      link.setAttribute('data-page', page.number)
    }
  }
}
