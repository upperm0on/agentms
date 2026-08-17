import { useEffect, useState } from 'react'

export function usePath() {
  const routePath = (value: string) => {
    const pathname = new URL(value, window.location.origin).pathname
    return pathname === '/index.html' ? '/' : pathname
  }
  const [path, setPath] = useState(routePath(window.location.href))
  useEffect(() => {
    const onPop = () => setPath(routePath(window.location.href))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  const navigate = (next: string) => {
    window.history.pushState({}, '', next)
    setPath(routePath(next))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  return { path, navigate }
}
