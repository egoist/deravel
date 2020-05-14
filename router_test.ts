import { assertEquals } from 'https://deno.land/std/testing/asserts.ts'
import { Router } from './router.ts'

Deno.test('router', () => {
  const router = new Router()
  router.add(
    'DELETE',
    '/page/:id',
    () => {},
    () => {}
  )
  const result = router.find('DELETE', '/page/hello')
  assertEquals(result[0].params, {
    id: 'hello',
  })
})
