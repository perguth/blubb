// utils/display_test.ts
import { formatCurrency, timeAgo } from './display.ts'
import { DAY, HOUR, MINUTE, SECOND } from '$std/datetime/constants.ts'
import { assertEquals, assertThrows } from '$std/assert/mod.ts'

Deno.test('[display] timeAgo()', () => {
  assertEquals(timeAgo(new Date(Date.now())), 'just now')
  assertEquals(timeAgo(new Date(Date.now() - SECOND * 30)), '30 seconds ago')
  assertEquals(timeAgo(new Date(Date.now() - MINUTE)), '1 minute ago')
  assertEquals(timeAgo(new Date(Date.now() - MINUTE * 2)), '2 minutes ago')
  assertEquals(timeAgo(new Date(Date.now() - MINUTE * 59)), '59 minutes ago')
  assertEquals(timeAgo(new Date(Date.now() - HOUR)), '1 hour ago')
  assertEquals(
    timeAgo(new Date(Date.now() - HOUR - MINUTE * 35)),
    '1 hour ago',
  )
  assertEquals(timeAgo(new Date(Date.now() - HOUR * 2)), '2 hours ago')
  assertEquals(timeAgo(new Date(Date.now() - DAY)), '1 day ago')
  assertEquals(timeAgo(new Date(Date.now() - DAY - HOUR * 12)), '1 day ago')
  assertEquals(timeAgo(new Date(Date.now() - DAY * 5)), '5 days ago')
  assertThrows(
    () => timeAgo(new Date(Date.now() + 1)),
    Error,
    'Timestamp must be in the past',
  )
})

Deno.test('[display] formatCurrency()', () => {
  assertEquals(formatCurrency(5, 'USD'), '$5')
})
