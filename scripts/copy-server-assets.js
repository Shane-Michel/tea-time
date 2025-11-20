import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const projectRoot = process.cwd()
const apiSource = resolve(projectRoot, 'api')
const apiDestination = resolve(projectRoot, 'dist/api')

if (!existsSync(apiSource)) {
  console.warn('No api directory found, skipping server asset copy.')
  process.exit(0)
}

rmSync(apiDestination, { recursive: true, force: true })
mkdirSync(apiDestination, { recursive: true })

cpSync(apiSource, apiDestination, { recursive: true })
console.log(`Copied server assets from "${apiSource}" to "${apiDestination}".`)
