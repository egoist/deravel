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
        let i = 0
        const next = (error?: Error) => {
          const m = matched[i++]
          if (m) {
            ctx.params = m.params
            m.handler(ctx, next)
          }
        }
        next()
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
