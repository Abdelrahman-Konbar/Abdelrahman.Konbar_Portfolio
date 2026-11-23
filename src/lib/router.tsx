import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

// Minimal hash router: works on any static host without server rewrites.
type Route = { path: string; section: string | null }

function parse(): Route {
  const raw = window.location.hash.replace(/^#/, '') || '/'
  const [path, query] = raw.split('?')
  const section = new URLSearchParams(query ?? '').get('s')
  return { path: path || '/', section }
}

type Ctx = Route & { navigate: (path: string, section?: string) => void }
const RouterContext = createContext<Ctx | null>(null)

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(parse)

  useEffect(() => {
    const onHash = () => setRoute(parse())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = useCallback((path: string, section?: string) => {
    const current = parse()
    if (current.path === path && section) {
      document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      history.replaceState(null, '', `#${path}?s=${section}`)
      return
    }
    window.location.hash = section ? `${path}?s=${section}` : path
  }, [])

  return <RouterContext.Provider value={{ ...route, navigate }}>{children}</RouterContext.Provider>
}

export function useRouter() {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useRouter outside RouterProvider')
  return ctx
}

export function hrefFor(path: string, section?: string) {
  return section ? `#${path}?s=${section}` : `#${path}`
}

type LinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to: string
  section?: string
}

export function Link({ to, section, onClick, ...rest }: LinkProps) {
  const { navigate } = useRouter()
  return (
    <a
      href={hrefFor(to, section)}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        e.preventDefault()
        navigate(to, section)
      }}
      {...rest}
    />
  )
}
