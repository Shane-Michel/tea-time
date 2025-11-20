import Footer from './Footer'
import Navigation from './Navigation'

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <Navigation />
      <main className="app-content">{children}</main>
      <Footer />
    </div>
  )
}
