import gantt from './gantt'
import {timeDay, timeHour} from "d3-time";
import data from './sample_data'

export default class HistoryChart extends HTMLElement {
  constructor() {
    super()

    const shadow = this.attachShadow({mode: 'open'})

    var eventTypes = {}
    var eventList = [
      ...data
        .filter(item => (item.type !== 'point') && (+item.start !== +item.end))
        .map((item) => {
          const key = `${item.group}-${item.subgroup}`
          if (!(key in eventTypes)) {
            eventTypes[key] = true
          }
          return {
            startDate: item.start,
            endDate: item.end,
            taskName: key,
            toolTipHTML: item.title
          }
        })
    ];
    eventTypes = Object.keys(eventTypes)

    const eventStyleClassList = [
      "blue-bar",
      "purple-bar",
      "red-bar",
      "green-bar",
      "orange-bar"
    ]

    const ganttConfig = {
      eventSettings: {
        eventList,
        eventTypes,
        eventStyleClassList,
        enableToolTips: true
      },
      sizing: {
        location: 'GanttChart',
        margin: {
          top: 60,
          right: 40,
          bottom: 20,
          left: 120
        },
        height: "400",
        width: window.innerWidth
      },
      timeDomainSettings: {
        zoomLevels: ["5:sec", "15:sec", "1:min", "5:min", "15:min", "1:hr", "3:hr", "6:hr", "1:day"],
        timeDomainStart: timeDay.offset(new Date(), -3),
        timeDomainEnd: timeHour.offset(new Date(), +3),
        startingTimeFormat: "%H:%M",
        startingTimeDomainString: "1day",
        startingZoomLevel: 8,
        timeDomainMode: "fixed"
      }
    }

    this._gantt = gantt(ganttConfig);
  }
}
