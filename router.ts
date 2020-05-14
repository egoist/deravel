import {
  pathToRegexp,
  Key as PathKey,
} from 'https://denopkg.com/pillarjs/path-to-regexp@v6.1.0/src/index.ts'
import { ServerHandlerContext } from './server.ts'

export type NextFunction = (error?: Error) => void

export type RouteHandler = (ctx: ServerHandlerContext, next: NextFunction) => void | Promise<void>

export type Route = {
  path: string
  regexp: RegExp
  keys: PathKey[]
  handlers: RouteHandler[]
  method: RouteMethod
}

export type RouteParams = {
  [k: string]: string
}

export type RouteMethod =
  | 'ALL'
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS'
  | 'CONNECT'
  | 'HEAD'
  | 'TRACE'

function execPathRegexp(path: string, regexp: RegExp, keys: PathKey[]) {
  let i = 0
  const matches = regexp.exec(path)
  if (matches) {
    const out: { [k: string]: string } = {}
    while (i < keys.length) {
      const name = keys[i].name
      const value = matches[++i]
      if (value !== undefined) {
        out[name] = value
      }
    }
    return out
  }
}

export class Router {
  routes: Route[]

  // Shorthand methods
  all = this.add.bind(this, 'ALL')
  get = this.add.bind(this, 'GET')
  head = this.add.bind(this, 'HEAD')
  patch = this.add.bind(this, 'PATCH')
  options = this.add.bind(this, 'OPTIONS')
  connect = this.add.bind(this, 'CONNECT')
  delete = this.add.bind(this, 'DELETE')
  trace = this.add.bind(this, 'TRACE')
  post = this.add.bind(this, 'POST')
  put = this.add.bind(this, 'PUT')

  constructor() {
    this.routes = []
  }

  add(method: RouteMethod, path: string, ...handlers: RouteHandler[]) {
    const keys: PathKey[] = []
    const regexp = pathToRegexp(path, keys)
    this.routes.push({
      path,
      regexp,
      keys,
      handlers,
      method,
    })
    return this
  }

  use(path: string, ...handlers: RouteHandler[]) {
    this.add('ALL', path, ...handlers)
    return this
  }

  find(method: RouteMethod, url: string) {
    const results: Array<{ params: RouteParams; handler: RouteHandler }> = []
    for (const route of this.routes) {
      if (method === route.method || route.method === 'ALL') {
        const params = execPathRegexp(url, route.regexp, route.keys)
        if (params) {
          for (const handler of route.handlers) {
            results.push({
              params,
              handler,
            })
          }
        }
      }
    }
    return results
  }
}
