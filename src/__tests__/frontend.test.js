import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const projectRoot = resolve(process.cwd())

const read = (relativePath) => readFileSync(resolve(projectRoot, relativePath), 'utf8')

const navigationSource = read('src/components/Navigation.jsx')
const homeSource = read('src/pages/Home.jsx')
const indexHtml = read('index.html')

test('navigation includes every primary link and join CTA', () => {
  const expectedLinks = ['Home', 'Studies', 'Bible & Search', 'Reader', 'Notes', 'Account', 'Admin']
  expectedLinks.forEach((label) => {
    assert.ok(navigationSource.includes(label), `${label} link should be present in Navigation.jsx`)
  })
  assert.ok(navigationSource.includes('Join'), 'Join CTA is present')
})

test('home hero and studies are defined for rendering', () => {
  const heroCopy = 'Slow down, sip, and sit with Scripture.'
  assert.ok(homeSource.includes(heroCopy), 'Hero copy anchored in Home.jsx')
  ;['Gospel of Matthew', 'Book of Esther', 'Fasting (Topical)'].forEach((title) => {
    assert.ok(homeSource.includes(title), `${title} study listed`)
  })
})

test('index.html contains polished SEO meta tags for deployment domain', () => {
  assert.ok(indexHtml.includes('https://tea-time.shanemichel.net/'), 'Canonical domain is set')
  assert.ok(indexHtml.includes('og:image'), 'Open Graph image meta tag present')
  assert.ok(indexHtml.includes('twitter:card'), 'Twitter card meta tag present')
  assert.ok(/<meta\s+name="description"/i.test(indexHtml), 'Meta description exists')
})
