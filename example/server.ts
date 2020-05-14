import { serve, Router } from '../mod.ts'

const router = new Router()

router.get('/', (ctx) => {
  ctx.response.body = 'homepage'
})

router.get('/user/:id', (ctx, next) => {
  next()
}, (ctx) => {
  ctx.response.body = `hello ${ctx.params.id}`
})

serve({
  port: 3000,
  router
})