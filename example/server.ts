import { Application } from '../mod.ts'

const app = new Application()

app.get('/', (ctx) => {
  ctx.response.body = 'homepage'
})

app.get(
  '/user/:id',
  (ctx, next) => {
    next()
  },
  (ctx) => {
    ctx.response.body = `hello ${ctx.params.id}`
  }
)

await app.listen({
  port: 3000,
})
