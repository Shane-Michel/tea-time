import { Link, NavLink } from 'react-router-dom'
import Button from './Button'

const links = [
  { to: '/', label: 'Home' },
  { to: '/studies', label: 'Studies' },
  { to: '/bible', label: 'Bible & Search' },
  { to: '/reader', label: 'Reader' },
  { to: '/notes', label: 'Notes' },
  { to: '/account', label: 'Account' },
  { to: '/admin', label: 'Admin' },
]

export default function Navigation() {
  return (
    <header className="nav" aria-label="Primary">
      <Link className="nav__brand" to="/">
        <span role="img" aria-label="tea mug">
          🍵
        </span>
        Tea Time Devotional
      </Link>
      <nav className="nav__links">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav__link${isActive ? ' is-active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
        <Button as="a" href="#join" variant="primary">
          Join
        </Button>
      </nav>
    </header>
  )
}
