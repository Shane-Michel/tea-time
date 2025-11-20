import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const domain = 'https://tea-time.shanemichel.net'
const today = new Date().toISOString().split('T')[0]
const publicDir = resolve(process.cwd(), 'public')

const routes = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/studies', priority: '0.9', changefreq: 'weekly' },
  { path: '/bible', priority: '0.9', changefreq: 'weekly' },
  { path: '/reader', priority: '0.7', changefreq: 'weekly' },
  { path: '/notes', priority: '0.7', changefreq: 'weekly' },
  { path: '/account', priority: '0.6', changefreq: 'monthly' },
  { path: '/admin', priority: '0.4', changefreq: 'monthly' },
]

mkdirSync(publicDir, { recursive: true })

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${domain}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`

writeFileSync(resolve(publicDir, 'sitemap.xml'), sitemap.trim())

const robots = `User-agent: *
Allow: /
Host: tea-time.shanemichel.net
Sitemap: ${domain}/sitemap.xml
`
writeFileSync(resolve(publicDir, 'robots.txt'), robots)

console.log('Generated sitemap and robots.txt for', domain)
