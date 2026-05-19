import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'

import Navbar from './components/layout/Navbar'
import ProtectedRoute from './components/layout/ProtectedRoute'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MyBetsPage from './pages/MyBetsPage'
import WalletPage from './pages/WalletPage'

import { useAuthStore } from './store/authStore'

// Pages without Navbar (auth pages)
const AUTH_ROUTES = ['/login', '/register']

export default function App() {
  const location = useLocation()
  const { token, fetchMe } = useAuthStore()
  const isAuthPage = AUTH_ROUTES.includes(location.pathname)

  useEffect(() => {
    if (token) fetchMe()
  }, [token])

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: 'var(--accent)', secondary: '#080b0f' },
          },
        }}
      />

      {!isAuthPage && <Navbar />}

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/ipl" element={<HomePage />} />
        <Route path="/international" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route path="/my-bets" element={
          <ProtectedRoute><MyBetsPage /></ProtectedRoute>
        } />
        <Route path="/wallet" element={
          <ProtectedRoute><WalletPage /></ProtectedRoute>
        } />

        {/* 404 fallback */}
        <Route path="*" element={
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            height: '60vh', gap: 16,
          }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 72, fontWeight: 800,
              color: 'var(--accent)', lineHeight: 1,
            }}>404</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
              Yeh page nahi mila bhai
            </p>
            <a href="/" style={{
              padding: '10px 24px', background: 'var(--accent)', color: '#080b0f',
              borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 600,
            }}>
              Home pe jao
            </a>
          </div>
        } />
      </Routes>
    </>
  )
}
