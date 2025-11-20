import { Children, createContext, useContext, useEffect, useMemo, useState } from 'react'

/* eslint-disable react-refresh/only-export-components */
const RouterContext = createContext({
  location: { pathname: '/' },
  navigate: () => {},
})

const getInitialPath = () => {
  if (typeof window === 'undefined') return '/'
  return window.location?.pathname || '/'
}

export function BrowserRouter({ children }) {
  const [location, setLocation] = useState({ pathname: getInitialPath() })

  useEffect(() => {
    const handlePopState = () => {
      setLocation({ pathname: window.location.pathname })
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (to) => {
    if (typeof window === 'undefined' || to === location.pathname) return
    window.history.pushState({}, '', to)
    setLocation({ pathname: to })
  }

  return <RouterContext.Provider value={{ location, navigate }}>{children}</RouterContext.Provider>
}

export function Routes({ children }) {
  const { location } = useContext(RouterContext)
  const routes = useMemo(() => {
    return Children.toArray(children).filter((child) => child?.type?.displayName === 'Route')
  }, [children])

  let element = null

  for (const route of routes) {
    const { path, element: routeElement } = route.props
    if (path === location.pathname || path === '*') {
      element = routeElement
      if (path !== '*') break
    }
  }

  return element
}

export function Route() {
  return null
}
Route.displayName = 'Route'

export function Link({ to, className, children, ...rest }) {
  const { navigate } = useContext(RouterContext)

  const handleClick = (event) => {
    event.preventDefault()
    navigate(to)
  }

  return (
    <a href={to} className={className} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}

export function NavLink({ to, className, children, ...rest }) {
  const { location, navigate } = useContext(RouterContext)
  const isActive = location.pathname === to
  const computedClass = typeof className === 'function' ? className({ isActive }) : className

  const handleClick = (event) => {
    event.preventDefault()
    if (!isActive) navigate(to)
  }

  return (
    <a href={to} className={computedClass} onClick={handleClick} {...rest}>
      {typeof children === 'function' ? children({ isActive }) : children}
    </a>
  )
}

export function useNavigate() {
  const { navigate } = useContext(RouterContext)
  return navigate
}

export function useLocation() {
  const { location } = useContext(RouterContext)
  return location
}

export const Outlet = ({ children }) => children ?? null
