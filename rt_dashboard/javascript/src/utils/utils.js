import { Date, Number } from 'sugar'

export const duration = (start, end) => {
  return `${Number(end - start).duration()}`
}

export const relative = (start) => {
  return `${Date(start).relative().toString()}`
}
