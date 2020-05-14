import { serve, Router } from '../mod.ts'

const router = new Router()

router.use('/:id', (ctx) => {
  ctx.response.body = `hello ${ctx.params.id}`
})

serve({
  port: 3000,
  router
})