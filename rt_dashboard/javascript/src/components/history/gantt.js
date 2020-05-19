import { timeHour, timeSecond } from 'd3-time'
import { scaleBand, scaleTime } from 'd3-scale'
import { axisBottom, axisLeft } from 'd3-axis'
import { timeFormat } from 'd3-time-format'
import { event, select } from 'd3-selection'
import 'd3-transition'

/**
 *
 * @param config
 * @returns {any}
 */
export default function ganttOuter (config) {
  var eventList = []

  var eventTypes
  var eventStyleClasses = ['event']
  var eventStyleCount

  var height
  var width
  var margin

  var minDate = new Date()
  var maxDate = new Date()

  var currentViewBeginTime// = d3.time.day.offset(getEndDate(), -1);
  var currentViewEndTime//= getEndDate();
  gantt.getCurrentViewCenterTime = function () {
    var centerTime = timeSecond.offset(currentViewBeginTime, (((currentViewEndTime - currentViewBeginTime) / 2) / 1000))
    return (centerTime)
  }

  var zoomLevels
  var currentZoomLevel

  var tickFormat

  if (config != null) {
    eventList = config.eventSettings.eventList
    eventTypes = config.eventSettings.eventTypes
    eventStyleClasses = config.eventSettings.eventStyleClassList
    eventStyleCount = eventStyleClasses.length

    setMinMaxDate(eventList)

    margin = config.sizing.margin
    height = config.sizing.height - margin.top - margin.bottom - 5
    width = config.sizing.width - margin.right - margin.left - 5
    if (config.eventSettings.eventTypes.length > 9) {
      height = config.eventSettings.eventTypes.length * 40
    }

    currentViewBeginTime = timeHour.offset(minDate, -1)
    currentViewEndTime = timeHour.offset(maxDate, +1)

    currentZoomLevel = config.timeDomainSettings.startingZoomLevel

    zoomLevels = config.timeDomainSettings.zoomLevels

    tickFormat = config.timeDomainSettings.startingTimeFormat

    var x = scaleTime().domain([currentViewBeginTime, currentViewEndTime]).range([0, width]).clamp(true)

    var y = scaleBand().domain(eventTypes).rangeRound([0, height - margin.top - margin.bottom], 0.1)

    var xAxis = axisBottom(x).tickFormat(timeFormat(tickFormat)) // .tickSubdivide(true)
      .tickSize(8).tickPadding(8)

    var yAxis = axisLeft(y).tickSize(0)
  }

  //= =========================================================================================================================
  // Other
  // --------------------------------------------------------------------------------------------------------------------------
  var keyFunction = function (d) {
    return d.startDate + d.taskName + d.endDate
  }

  var rectTransform = function (d) {
    return 'translate(' + x(d.startDate) + ',' + y(d.taskName) + ')'
  }

  function setMinMaxDate (eventList) {
    eventList.sort(function (a, b) {
      return a.endDate - b.endDate
    })
    maxDate = eventList[eventList.length - 1].endDate
    eventList.sort(function (a, b) {
      return a.startDate - b.startDate
    })
    minDate = eventList[0].startDate
  }

  var tooltipdiv = select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)

  // var drawControls = function () {
  //   select('#' + config.sizing.location).append('div')
  //     .attr('id', config.sizing.location + '-Controls')
  //     .attr('style', 'margin-left:' + width / 2 + 'px; width:400px;')
  //   select('#' + config.sizing.location + '-Controls')
  //     // .append("button")
  //     .append('i')
  //     .attr('class', 'fa fa-arrow-left fa-3x nav')
  //     .attr('style', 'margin-left:20px; border: 2px solid; border-radius: 10px; padding:3px 5px 3px 5px')
  //     .attr('onclick', config.sizing.location + ".panView('left',.30)")
  //   select('#' + config.sizing.location + '-Controls')
  //     .append('i')
  //     .attr('class', 'fa fa-arrow-right fa-3x')
  //     .attr('style', 'margin-left:20px; border: 2px solid; border-radius: 10px; padding:3px 5px 3px 5px')
  //     .attr('onclick', config.sizing.location + ".panView('right',.30)")
  //   select('#' + config.sizing.location + '-Controls')
  //     .append('i')
  //     .attr('class', 'fa fa-search-plus fa-3x')
  //     .attr('style', 'margin-left:20px; border: 2px solid; border-radius: 10px; padding:3px 5px 3px 5px')
  //     .attr('onclick', config.sizing.location + ".zoomInOut('in')")
  //   select('#' + config.sizing.location + '-Controls')
  //     .append('i')
  //     .attr('class', 'fa fa-search-minus fa-3x')
  //     .attr('style', 'margin-left:20px; border: 2px solid; border-radius: 10px; padding:3px 5px 3px 5px')
  //     .attr('onclick', config.sizing.location + ".zoomInOut('out')")
  // }

  //= =========================================================================================================================
  // Define sizing and axis
  // --------------------------------------------------------------------------------------------------------------------------

  var initAxis = function () {
    x = scaleTime().domain([currentViewBeginTime, currentViewEndTime]).range([0, width]).clamp(true)
    y = scaleBand().domain(eventTypes).rangeRound([0, (height) - margin.top - margin.bottom], 0.2)
    xAxis = axisBottom(x).tickFormat(timeFormat(tickFormat)) // .tickSubdivide(true)
      .tickSize(8).tickPadding(8)

    yAxis = axisLeft(y).tickSize(0)
  }

  //= =========================================================================================================================
  // Sizing
  // --------------------------------------------------------------------------------------------------------------------------

  gantt.width = function (value) {
    if (!arguments.length) { return width }
    width = +value
    return gantt
  }

  gantt.height = function (value) {
    if (!arguments.length) { return height }
    height = +value
    return gantt
  }

  gantt.margin = function (value) {
    if (!arguments.length) { return margin }
    margin = value
    return gantt
  }

  // --------------------------------------------------------------------------------------------------------------------------

  /**
   * @param {string}
   *                vale The value can be "fit" - the domain fits the data or
   *                "fixed" - fixed domain.
   */

  gantt.taskTypes = function (value) {
    if (!arguments.length) { return eventTypes }
    eventTypes = value
    return gantt
  }

  gantt.eventStyles = function (value) {
    if (!arguments.length) { return eventStyleClasses }
    eventStyleClasses = value
    return gantt
  }

  gantt.tickFormat = function (value) {
    if (!arguments.length) { return tickFormat }
    tickFormat = value
    return gantt
  }

  // function getEndDate () {
  //   var lastEndDate = Date.now()
  //   if (eventList.length > 0) {
  //     lastEndDate = eventList[eventList.length - 1].endDate
  //   }
  //   return lastEndDate
  // }

  //= =========================================================================================================================
  // Draw / ReDraw Code
  // --------------------------------------------------------------------------------------------------------------------------

  function gantt (eventList) {
    initAxis()

    gantt._root = select(config.root)
    gantt._svgRoot = gantt._root
      .append('svg')
      .attr('class', 'chart')
      .attr('id', config.sizing.location + '-ChartId')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)

    gantt._svg = gantt._svgRoot.append('g')
      .attr('class', 'gantt-chart')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')

    gantt._svg.selectAll('.chart')
      .data(eventList, keyFunction).enter()
      .append('rect')
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('data-status', function (d) {
        return d.status
      })
      .attr('class', function (d) {
        var styleId = d.status % eventStyleCount
        if (eventStyleClasses[styleId] == null) {
          return 'bar'
        }
        return eventStyleClasses[styleId]
      })
      .attr('y', 0)
      .attr('transform', rectTransform)
      .attr('height', function (d) {
        return y.bandwidth()
      })
      .attr('width', function (d) {
        return (x(d.endDate) - x(d.startDate))
      })
      .on('mouseover', function (d) {
        if (config.eventSettings.enableToolTips && d.toolTipHTML) {
          tooltipdiv.transition()
            .duration(200)
            .style('opacity', 0.9)
          tooltipdiv.html(d.toolTipHTML)
            .style('left', (event.pageX) + 'px')
            .style('top', (event.pageY - 28) + 'px')
        }
      })
      .on('mouseout', function (d) {
        tooltipdiv.transition()
          .duration(500)
          .style('opacity', 0)
      })
      .on('click', function (d) {

      })

    gantt._x = gantt._svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0, ' + (height - margin.top - margin.bottom) + ')')

    gantt._x
      .transition()
      .call(xAxis)

    gantt._y = gantt._svg.append('g')
      .attr('class', 'y axis')

    gantt._y
      .transition()
      .call(yAxis)

    return gantt
  }

  gantt.redraw = function (eventList) {
    initAxis()

    var rect = this._svg.selectAll('rect').data(eventList, keyFunction)

    rect.enter()
      .insert('rect', ':first-child')
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('class', function (d) {
        if (eventStyleClasses[d.status % eventStyleCount] == null) {
          return 'bar'
        }
        return eventStyleClasses[d.status % eventStyleCount]
      })
      .transition()
      .attr('y', 0)
      .attr('transform', rectTransform)
      .attr('height', function (d) {
        return y.bandwidth()
      })
      .attr('width', function (d) {
        return (x(d.endDate) - x(d.startDate))
      })

    rect.transition()
      .attr('transform', rectTransform)
      .attr('height', function (d) {
        return y.bandwidth()
      })
      .attr('width', function (d) {
        return (x(d.endDate) - x(d.startDate))
      })

    rect.exit().remove()

    this._x.transition().call(xAxis)
    this._y.transition().call(yAxis)

    return gantt
  }

  //= ================================================================================================================
  // Time Domain Code
  // ------------------------------------------------------------------------------------------------------------------
  gantt.zoomInOut = function (inOrOut) {
    if (inOrOut === 'in') {
      if (currentZoomLevel === 0) {
        alert("can't zoom in anymore")
      } else {
        currentZoomLevel--
      }
    } else if (inOrOut === 'out') {
      if (currentZoomLevel === (zoomLevels.length - 1)) {
        alert("Can't zoom out anymore")
      } else {
        currentZoomLevel++
      }
    } else {
      alert("Error: Not sure if you're trying to zoom in or out. Check zoom function call")
    }
    this.setCustomZoom(currentZoomLevel)
  }

  gantt.setCustomZoom = function (zoomLevel) {
    currentZoomLevel = zoomLevel
    var currentCenterTime = this.getCurrentViewCenterTime()
    currentViewBeginTime = timeSecond.offset(currentCenterTime, -this.convertZoomLevelToOffsetSeconds())
    currentViewEndTime = timeSecond.offset(currentCenterTime, this.convertZoomLevelToOffsetSeconds())
    // gantt.timeDomain([currentViewBeginTime, currentViewEndTime]);
    this.tickFormat(this.determineTimeFormat(zoomLevels[currentZoomLevel].split(':')[1]))
    this.redraw(eventList)
  }

  gantt.convertZoomLevelToOffsetSeconds = function () {
    var zoomLevelString = zoomLevels[currentZoomLevel]
    var rangeNumber = zoomLevelString.split(':')[0]
    var rangeScale = zoomLevelString.split(':')[1]
    var secondsResult
    switch (rangeScale) {
      case 'day':
        secondsResult = rangeNumber * 86400
        break
      case 'hr':
        secondsResult = rangeNumber * 3600
        break
      case 'min':
        secondsResult = rangeNumber * 60
        break
      case 'sec':
        secondsResult = rangeNumber
        break
      default:
        secondsResult = 86400
    }
    return Math.round(secondsResult / 2)
  }

  gantt.determineTimeFormat = function (scale) {
    switch (scale) {
      case 'day':
        return '%H:%M'
      case 'hr':
        return '%H:%M'
      case 'min':
        return '%H:%M:%S'
      case 'sec':
        return '%H:%M:%S'
      default:
        return '%H:%M'
    }
  }
  // ------------------------------------------------------------------------------------------------------------------

  gantt.panView = function (direction, percentMove) {
    // gets the length in MS of X% of the current view. This will be used to determine how far to pan at a time
    var shiftTimeLength = ((currentViewEndTime - currentViewBeginTime) * percentMove)
    if (direction === 'left') {
      shiftTimeLength = -shiftTimeLength
    }
    // convert our shift length to Sec and offset our current view start/end times. Once shifted, update the current view to these new times
    var newStartTime = timeSecond.offset(currentViewBeginTime, (shiftTimeLength / 1000))
    var newEndTime = timeSecond.offset(currentViewEndTime, (shiftTimeLength / 1000))
    // this.timeDomain([ newStartTime , newEndTime ]);
    currentViewBeginTime = newStartTime
    currentViewEndTime = newEndTime
    this.redraw(eventList)
  }

  return gantt(eventList)
};
