import { serve } from 'http://deno.land/std/http/server.ts'
import { Router } from './router.ts'

export type ServerOptions = {
  port: number
  router: Router
}

export class Server {
  options: ServerOptions

  constructor(options: ServerOptions) {
    this.options = options
  }

  static create(options: ServerOptions) {
    return new Server(options)
  }

  async start() {
    const s = serve({
      port: this.options.port,
    })
    console.log(`ready - http://localhost:${this.options.port}`)
    for await (const req of s) {
      const ctx: ServerHandlerContext = {
        params: {},
        response: {
          body: '',
        },
      }
      const matched = this.options.router.find(req.method as any, req.url)
      if (matched.length > 0) {
        for (const m of matched) {
          ctx.params = m.params
          for (const handle of m.route.handlers) {
            handle(ctx)
          }
        }
        req.respond({
          body: ctx.response.body,
        })
      }
    }
  }
}

export type ServerHandlerContext = {
  params: {
    [k: string]: string
  }
  response: {
    body: string
  }
}
