import { formatDistanceStrict, parseISO } from 'date-fns'

export const duration = (startDate, endDate) => {
  let start = startDate
  let end = endDate
  if (typeof startDate === 'string') {
    start = parseISO(startDate)
  }
  if (typeof endDate === 'string') {
    end = parseISO(endDate)
  }
  return `${formatDistanceStrict(start, end)}`
}

export const relative = (startDate) => {
  let start = startDate
  if (typeof startDate === 'string') {
    start = parseISO(startDate)
  }
  return `${formatDistanceStrict(start, new Date(), { addSuffix: true })}`
}
