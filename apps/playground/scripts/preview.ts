// Serves dist/client the way GitHub Pages does, so the built site can be tried locally.
// Unlike `vike preview`, it serves unknown URLs with the styled 404.html, as Pages does.
import { createServer } from 'node:http'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const BASE = '/password-strength-meter/'
const ROOT = resolve(fileURLToPath(new URL('../dist/client', import.meta.url)))
const PORT = Number(process.env.PORT ?? 4173)

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
}

const isFile = (path: string) => existsSync(path) && statSync(path).isFile()
const isDir = (path: string) => existsSync(path) && statSync(path).isDirectory()

const send = (res: import('node:http').ServerResponse, status: number, path: string) => {
  res.writeHead(status, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' })
  res.end(readFileSync(path))
}

createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const pathname = decodeURIComponent(url.pathname)

  if (pathname === BASE.slice(0, -1)) {
    res.writeHead(301, { location: BASE + url.search }).end()
    return
  }

  if (pathname.startsWith(BASE)) {
    const file = normalize(join(ROOT, pathname.slice(BASE.length)))
    // never leave dist/client
    if (file === ROOT || file.startsWith(ROOT + sep)) {
      // same lookup order as Pages: the file, then `<path>.html`, then the folder's index.html
      if (isFile(file)) {
        send(res, 200, file)
        return
      }
      if (isFile(`${file}.html`)) {
        send(res, 200, `${file}.html`)
        return
      }
      if (isDir(file)) {
        if (!pathname.endsWith('/')) {
          res.writeHead(301, { location: pathname + '/' + url.search }).end()
          return
        }
        if (isFile(join(file, 'index.html'))) {
          send(res, 200, join(file, 'index.html'))
          return
        }
      }
    }
  }

  const notFound = join(ROOT, '404.html')
  if (isFile(notFound)) {
    send(res, 404, notFound)
    return
  }
  res.writeHead(404).end('Not found')
}).listen(PORT, () => {
  console.log(`Serving dist/client like GitHub Pages: http://localhost:${PORT}${BASE}`)
})
