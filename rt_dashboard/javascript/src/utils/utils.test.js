/* globals describe, test, expect */
import { duration, relative } from './utils'

describe('duration', () => {
  test('handles miliseconds args ', () => {
    const interval = 5 * 1000
    const start = new Date().getTime() - interval
    const end = new Date().getTime()

    expect(duration(start, end)).toBe('5 seconds')
  })

  test('handles Date args ', () => {
    const start = new Date()
    const end = new Date()

    expect(duration(start, end)).toBe('0 milliseconds')
  })
})

describe('relative', () => {
  test('handles miliseconds arg', () => {
    const interval = 5 * 1000
    const start = new Date().getTime() - interval

    expect(relative(start)).toBe('5 seconds ago')
  })

  test('handles Date arg', () => {
    const start = new Date()

    expect(relative(start)).toBe('1 second ago')
  })

  test('handles ISO string arg', () => {
    const start = new Date().toISOString()

    expect(relative(start)).toBe('1 second ago')
  })
})
