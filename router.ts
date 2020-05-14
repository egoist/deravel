import {
  pathToRegexp,
  Key as PathKey,
} from 'https://denopkg.com/pillarjs/path-to-regexp@v6.1.0/src/index.ts'
import { ServerHandlerContext } from './server.ts'

export type RouteHandler = (ctx: ServerHandlerContext) => void | Promise<void>

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
    const results: Array<{ params: RouteParams; route: Route }> = []
    for (const route of this.routes) {
      if (method === route.method || route.method === 'ALL') {
        const params = execPathRegexp(url, route.regexp, route.keys)
        if (params) {
          results.push({
            params,
            route,
          })
        }
      }
    }
    return results
  }
}
