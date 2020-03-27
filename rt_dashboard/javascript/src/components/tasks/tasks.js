import { Date, Number } from 'sugar'
import html from './tasks.html'
import {
  loadTemplate,
  appendElement,
  appendNoDataRow,
  mapDataToElements,
  removeChildNode
} from '../../utils/dom'
import { getJobs, cancelJob, deleteQueue, emptyQueue } from '../../api'

export default class Tasks extends HTMLElement {
  static get observedAttributes () {
    return ['queue-info']
  }

  constructor () {
    super()
    loadTemplate(this.attachShadow({ mode: 'open' }), html)

    this.mapToRow = this.mapToRow.bind(this)
    this.onEmptyClicked = this.onEmptyClicked.bind(this)
    this.onDeleteClicked = this.onDeleteClicked.bind(this)
  }

  connectedCallback () {
    this.emptyBtn = this.shadowRoot.querySelector('p.intro #empty-btn')
    this.deleteBtn = this.shadowRoot.querySelector('p.intro #delete-btn')
    this.emptyBtn.addEventListener('click', this.onEmptyClicked)
    this.deleteBtn.addEventListener('click', this.onDeleteClicked)
  }

  disconnectedCallback () {
    this.removeEventListener.addEventListener('click', this.onEmptyClicked)
    this.removeEventListener.addEventListener('click', this.onDeleteClicked)

    this.removeTableClickListeners()
  }

  attributeChangedCallback () {
    const queueInfo = JSON.parse(this.getAttribute('queue-info'))
    const { queue, count } = queueInfo

    this.queue = queue
    this.count = count
    this.updateTitles(queue, count)
    this.toggleEmptyBtns(queue, count)

    this.loadQueueTasks(queue)
  }

  onEmptyClicked () {
    emptyQueue(this.queue)
  }

  onDeleteClicked (e) {
    deleteQueue(this.queue)
  }

  updateTitles (queue, count) {
    const queueName = this.shadowRoot.querySelector('h1 strong')
    queueName.innerHTML = queue
    if (queue === '[failed]') {
      queueName.classList.add('failed')
    }

    const queueNameSubTitle = this.shadowRoot.querySelector('p.intro strong')
    queueNameSubTitle.innerHTML = queue

    const orderDescInfo = this.shadowRoot.querySelector('p.intro #oldest-on-top')
    const orderAscInfo = this.shadowRoot.querySelector('p.intro #newes-on-top')
    orderDescInfo.hidden = queue.startsWith('[')
    orderAscInfo.hidden = !queue.startsWith('[')
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
    this.removeTableClickListeners()

    const tbody = this.shadowRoot.querySelector('tbody')
    removeChildNode(tbody)
    appendNoDataRow(tbody, 'Loading...', 3)

    getJobs(queue, 1, (jobs, pagination) => {
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

  removeTableClickListeners () {
    this.cancelLinks = this.cancelLinks || []
    this.cancelLinks.forEach(link => {
      link.removeEventListener('click', this.onQueueClicked)
    })

    this.cancelLinks = []
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

    this.mapFirstColumn(row, {
      id,
      description,
      origin,
      worker,
      status,
      error,
      enqueued,
      started,
      ended
    })

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

  mapFirstColumn (row, {
    id,
    description,
    origin,
    worker,
    status,
    error,
    enqueued,
    started,
    ended
  }) {
    const td = appendElement('td', row)
    appendElement('i', td, 'fas fa-file')
    appendElement('span', td, 'description ml-1', description)

    if (this.queue.startsWith('[')) {
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
  }
}
