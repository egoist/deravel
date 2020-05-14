import { ServerOptions, Server } from './server.ts'
import { Router } from './router.ts'

export async function serve(options: ServerOptions) {
  const server = Server.create(options)
  await server.start()
  return server
}

export {
  Router
}