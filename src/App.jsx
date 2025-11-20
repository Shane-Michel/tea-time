import './App.css'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Account from './pages/Account'
import Admin from './pages/Admin'
import Home from './pages/Home'
import Notes from './pages/Notes'
import NotFound from './pages/NotFound'
import Reader from './pages/Reader'
import Studies from './pages/Studies'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/studies" element={<Studies />} />
        <Route path="/reader" element={<Reader />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/account" element={<Account />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}

export default App
