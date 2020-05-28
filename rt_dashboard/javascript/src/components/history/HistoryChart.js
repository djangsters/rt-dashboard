import gantt from './gantt'
import { timeDay, timeHour } from 'd3-time'
import { loadTemplate } from '../../utils/dom'
import templateHtml from './HistoryChart.html'

export default class HistoryChart extends HTMLElement {
  constructor () {
    super()

    this.attachShadow({ mode: 'open' })

    loadTemplate(this.shadowRoot, templateHtml)

    this._root = this.shadowRoot.getElementById('chart-container')
  }

  connectedCallback () {
    this.dispatchEvent(new CustomEvent('upgrade', { bubbles: false }))
  }

  zoomIn () {
    this._gantt.zoomInOut('in')
  }

  zoomOut () {
    this._gantt.zoomInOut('out')
  }

  panLeft () {
    this._gantt.panView('left', 0.30)
  }

  panRight () {
    this._gantt.panView('right', 0.30)
  }

  setHistoryData ({ rows }) {
    const eventTypes = {}
    const eventList = rows
      .map((item) => {
        const key = `${item.group}-${item.subgroup}`
        if (!(key in eventTypes)) {
          eventTypes[key] = true
        }
        switch (item.type) {
          case 'range':
            return {
              startDate: +item.start,
              endDate: +item.end,
              taskName: key,
              toolTipHTML: item.title,
            }
          case 'point':
            return {
              startDate: +item.start,
              endDate: (+item.start) + 1,
              taskName: key,
              toolTipHTML: item.title,
            }
          default:
            throw new Error(`Unsupported item type ${item.type}`)
        }
      })

    const eventStyleClassList = [
      'blue-bar',
      'purple-bar',
      'red-bar',
      'green-bar',
      'orange-bar',
    ]

    const ganttConfig = {
      root: this._root,
      eventSettings: {
        eventList,
        eventTypes: Object.keys(eventTypes),
        eventStyleClassList,
        enableToolTips: true,
      },
      sizing: {
        location: 'GanttChart',
        margin: {
          top: 60,
          right: 40,
          bottom: 20,
          left: 120,
        },
        height: '400',
        width: window.innerWidth,
      },
      timeDomainSettings: {
        zoomLevels: ['5:sec', '15:sec', '1:min', '5:min', '15:min', '1:hr', '3:hr', '6:hr', '1:day'],
        timeDomainStart: timeDay.offset(new Date(), -3),
        timeDomainEnd: timeHour.offset(new Date(), +3),
        startingTimeFormat: '%H:%M',
        startingTimeDomainString: '1day',
        startingZoomLevel: 8,
        timeDomainMode: 'fixed',
      },
    }

    if (this._gantt) {
      this._gantt.redraw()
    } else {
      this._gantt = gantt(ganttConfig)
    }
  }
}
