import { HttpServerContext } from '../../mod.ts'

export default class UserController {
  show(ctx: HttpServerContext) {
    ctx.response.body = `user: ${ctx.params.user}`
  }
}
