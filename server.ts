import { serve } from 'http://deno.land/std/http/server.ts'
import { Router } from './router.ts'

export type ListenOptions = {
  port: number
  hostname?: string
}

export class Server extends Router {
  constructor() {
    super()
  }

  async listen(options: ListenOptions) {
    const hostname = options.hostname || '0.0.0.0'
    const s = serve({
      port: options.port,
      hostname,
    })
    console.log(
      `ready - http://${hostname === '0.0.0.0' ? 'localhost' : hostname}:${
        options.port
      }`
    )
    for await (const req of s) {
      const ctx: ServerHandlerContext = {
        params: {},
        response: {
          body: '',
        },
      }
      const matched = this.find(req.method as any, req.url)
      if (matched.length > 0) {
        let i = 0
        const next = async (error?: Error) => {
          const m = matched[i++]
          if (m) {
            ctx.params = m.params
            await m.handler(ctx, next)
          }
        }
        await next()
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
