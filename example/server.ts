import { Server } from '../mod.ts'

const server = new Server()

server.get('/', (ctx) => {
  ctx.response.body = 'homepage'
})

server.get(
  '/user/:id',
  (ctx, next) => {
    next()
  },
  (ctx) => {
    ctx.response.body = `hello ${ctx.params.id}`
  }
)

await server.listen({
  port: 3000,
})
