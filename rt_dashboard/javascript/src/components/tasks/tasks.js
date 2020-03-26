import { Date, Number } from 'sugar'
import html from './tasks.html'
import {
  loadTemplate,
  appendElement,
  appendNoDataRow,
  mapDataToElements
} from '../../utils/dom'
import { getJobs, cancelJob } from '../../api'

export default class Tasks extends HTMLElement {
  static get observedAttributes () {
    return ['queue', 'count']
  }

  constructor () {
    super()
    loadTemplate(this.attachShadow({ mode: 'open' }), html)

    this.mapToRow = this.mapToRow.bind(this)
  }

  connectedCallback () {

  }

  disconnectedCallback () {

  }

  attributeChangedCallback () {
    const queue = this.getAttribute('queue')
    const count = this.getAttribute('count')
    const queueName = this.shadowRoot.querySelector('h1 strong')
    queueName.innerHTML = queue
    const queueNameSubTitle = this.shadowRoot.querySelector('p.intro strong')
    queueNameSubTitle.innerHTML = queue
    this.toggleEmptyBtns(queue, count)
    this.loadQueueTasks(queue)
  }

  toggleEmptyBtns (queue, count) {
    const emptyBtn = this.shadowRoot.querySelector('p.intro #empty-btn')
    const deleteBtn = this.shadowRoot.querySelector('p.intro #delete-btn')
    emptyBtn.hidden = true
    deleteBtn.hidden = true
    if (count > 0) {
      emptyBtn.hidden = false
    } else if (!queue.startsWith('[')) {
      deleteBtn.hidden = false
    }
  }

  loadQueueTasks (queue) {
    this.cancelLinks = this.cancelLinks || []
    this.cancelLinks.forEach(link => {
      link.removeEventListener('click', this.onQueueClicked)
    })

    getJobs(queue, 1, (jobs, pagination) => {
      const tbody = this.shadowRoot.querySelector('tbody')

      if (!jobs || jobs.length <= 0) {
        appendNoDataRow(tbody, 'No jobs.', 3)
        return
      }

      mapDataToElements(tbody, jobs, this.mapToRow)

      Array.from(this.shadowRoot.querySelectorAll('td a')).forEach(link => {
        this.cancelLinks.push(link)
        link.addEventListener('click', this.onCancelClicked)
      })
    })
  }

  onCancelClicked (e) {
    const { target: cancelTaskBtn } = e
    cancelJob(cancelTaskBtn.getAttribute('data-jobid'))
    e.preventDefault()
  }

  mapToRow (parent, {
    id,
    description,
    origin,
    worker,
    status,
    error_message: error,
    enqueued_at: enqueued,
    started_at: started,
    ended_at: ended
  }) {
    const row = appendElement('tr', parent)
    row.setAttribute('data-role', 'job')
    row.setAttribute('data-job-id', id)

    const td = appendElement('td', row)
    appendElement('i', td, 'fas fa-file')
    appendElement('span', td, 'description ml-1', description)

    if (this.getAttribute('queue').startsWith('[')) {
      let originInfo = ` from <strong>${origin}</strong>`
      if (worker) {
        originInfo += ` running on <strong>${worker}</strong>`
      }
      appendElement('span', td, 'origin', originInfo)
    }

    appendElement('div', td, 'job_id d-block', id)

    if (status === 'running') {
      appendElement('span', td, 'end_date', `Enqueued ${Date(enqueued).relative()}`)
    } else if (status === 'failed') {
      appendElement('span', td, 'end_date',
        `Enqueued ${Date(enqueued).relative()}, failed ${Date(ended).relative()}, ran for ${Number(ended - started).duration()}`)
      appendElement('pre', td, 'exc_info', `<div>${error}</div>`)
    } else if (status === 'finished') {
      appendElement('span', td, 'end_date',
        `Enqueued ${Date(enqueued).relative()}, finished ${Date(ended).relative()}, ran for ${Number(ended - started).duration()}`)
    }

    const col2 = appendElement('td', row)
    if (status === 'running') {
      appendElement('span', col2, 'creation_date', `${Number(new Date().getTime() - started).duration()}`)
    } else {
      appendElement('span', col2, 'creation_date', `${Date(ended ?? enqueued).relative()}`)
    }

    const col3 = appendElement('td', row, 'actions narrow')
    const actionLink = appendElement('a', col3, 'btn btn-outline-secondary btn-sm mx-auto', '<i class="fas fa-ban"></i> Cancel')
    actionLink.setAttribute('data-role', 'cancel-job-btn')
    actionLink.setAttribute('data-jobid', id)
  }
}
