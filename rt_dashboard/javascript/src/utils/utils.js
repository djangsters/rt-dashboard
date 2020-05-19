import { formatDistanceStrict, parseISO } from 'date-fns'

export const duration = (start, end) => {
  return `${formatDistanceStrict(start, end)}`
}

export const relative = (startDate) => {
  let start = startDate
  if (typeof startDate === 'string') {
    start = parseISO(startDate)
  }
  return `${formatDistanceStrict(start, new Date(), { addSuffix: true })}`
}
