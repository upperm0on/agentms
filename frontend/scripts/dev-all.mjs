import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const frontendDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(frontendDir, '..', '..')
const viteArgs = process.argv.slice(2)
const children = []

function run(name, command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    env: process.env,
  })
  children.push(child)
  child.on('exit', (code, signal) => {
    if (shuttingDown) return
    console.error(`${name} exited${signal ? ` with ${signal}` : ` with code ${code}`}.`)
    shutdown(code || 1)
  })
  return child
}

let shuttingDown = false

function shutdown(code = 0) {
  if (shuttingDown) return
  shuttingDown = true
  for (const child of children) {
    if (!child.killed) child.kill('SIGINT')
  }
  setTimeout(() => process.exit(code), 300)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

run('django', path.join(projectRoot, 'red', 'bin', 'python'), ['backend/manage.py', 'runserver', '127.0.0.1:8001'], projectRoot)
run('vite', path.join(projectRoot, 'frontend', 'node_modules', '.bin', 'vite'), viteArgs.length ? viteArgs : ['--host', '0.0.0.0'], path.join(projectRoot, 'frontend'))
