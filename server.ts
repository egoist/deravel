import { serve } from 'http://deno.land/std/http/server.ts'

export type ServerOptions = {
  port: number
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
      req.respond({
        body: `hello`,
      })
    }
  }
}
