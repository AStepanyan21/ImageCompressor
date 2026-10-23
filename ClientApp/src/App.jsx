import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Register } from './pages/Register'
import { Login } from './pages/Login'
import { Upload } from './pages/Upload'
import { Result } from './pages/Result'
import { Layout } from './components/Layout'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><div><h1>Welcome to ImageCompressor</h1><p><a href="/login">Login</a> or <a href="/register">Register</a></p></div></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />
        <Route path="/upload" element={<Layout><Upload /></Layout>} />
        <Route path="/result" element={<Layout><Result /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
