import * as path from 'https://deno.land/std/path/mod.ts'
import { Application } from '../mod.ts'

const app = new Application(path.dirname(path.fromFileUrl(import.meta.url)))

app.get('/', (ctx) => {
  ctx.response.body = 'homepage'
})

app.get(
  '/user/:user',
  'UserController.show'
)

await app.listen({
  port: 3000,
})
