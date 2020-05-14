import { serve } from 'http://deno.land/std/http/server.ts'
import { join } from './deps.ts'
import { Router, RouteHandler, RouteHandlerFunction } from './router.ts'

export type ListenOptions = {
  port: number
  hostname?: string
}

interface Controller {
  new (): any
}

export class Application extends Router {
  controllers: Map<string, Controller> = new Map()

  constructor(public baseDir: string = Deno.cwd()) {
    super()
  }

  async listen(options: ListenOptions) {
    const conDir = join(this.baseDir, 'controllers')
    for await (const dirEntry of Deno.readDir(conDir)) {
      const path = join(conDir, dirEntry.name)
      this.controllers.set(
        dirEntry.name.replace(/\.[a-z]+$/, ''),
        await import(path).then(res => res.default)
      )
    }

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
      const ctx: HttpServerContext = {
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
            let handler: RouteHandlerFunction | undefined
            if (typeof m.handler === 'string') {
              const [controllerName, methodName] = m.handler.split('.')
              const _Controller = this.controllers.get(controllerName)
              if (_Controller) {
                const controller = new _Controller()
                handler = (ctx, next) => controller[methodName](ctx, next)
              }
            } else {
              handler = m.handler
            }
            if (handler) {
              await handler(ctx, next)
            }
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

export interface HttpServerContext {
  params: {
    [k: string]: string
  }
  response: {
    body: string
  }
}
