import { Link, useLocation } from 'react-router-dom'
import { Zap, Wallet, LogOut, Menu, X } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useState, useEffect } from 'react'

const NAV_LINKS = [
  { label: '🏏 Live', href: '/' },
  { label: 'IPL 2026', href: '/ipl' },
  { label: 'International', href: '/international' },
  { label: 'My Bets', href: '/my-bets' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(8,11,15,0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          padding: '0 16px',
          height: 56,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={16} color="#080b0f" strokeWidth={2.5} />
            </div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 18, fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.3px',
            }}>
              Cric<span style={{ color: 'var(--accent)' }}>Bet</span>
            </span>
          </Link>

          {/* Nav links — desktop only */}
          {!isMobile && (
            <div style={{ display: 'flex', gap: 2, flex: 1 }}>
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href
                return (
                  <Link key={link.href} to={link.href} style={{
                    padding: '6px 12px', borderRadius: 8, fontSize: 13,
                    fontWeight: active ? 500 : 400,
                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                    background: active ? 'var(--accent-glow)' : 'transparent',
                    transition: 'all 0.15s', whiteSpace: 'nowrap',
                  }}>
                    {link.label}
                  </Link>
                )
              })}
            </div>
          )}

          {/* Spacer on mobile */}
          {isMobile && <div style={{ flex: 1 }} />}

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {user ? (
              <>
                {/* Wallet — compact on mobile */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: isMobile ? '6px 10px' : '7px 14px',
                }}>
                  <Wallet size={13} color="var(--accent)" />
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500,
                    color: 'var(--text-primary)',
                  }}>
                    ₹{Number(user.wallet_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                  </span>
                </div>

                {!isMobile && (
                  <>
                    <Link to="/wallet" style={{
                      padding: '7px 14px', background: 'var(--accent)', color: '#080b0f',
                      borderRadius: 10, fontSize: 13, fontWeight: 600,
                      fontFamily: 'var(--font-display)',
                    }}>
                      + Deposit
                    </Link>
                    <button onClick={logout} style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text-secondary)',
                    }}>
                      <LogOut size={14} />
                    </button>
                  </>
                )}
              </>
            ) : (
              !isMobile && (
                <>
                  <Link to="/login" style={{
                    padding: '7px 14px', background: 'transparent',
                    border: '1px solid var(--border)', borderRadius: 10,
                    fontSize: 13, color: 'var(--text-secondary)',
                  }}>Login</Link>
                  <Link to="/register" style={{
                    padding: '7px 14px', background: 'var(--accent)', color: '#080b0f',
                    borderRadius: 10, fontSize: 13, fontWeight: 600,
                  }}>Sign Up</Link>
                </>
              )
            )}

            {/* Hamburger — mobile only */}
            {isMobile && (
              <button onClick={() => setMenuOpen(!menuOpen)} style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-primary)',
              }}>
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {isMobile && menuOpen && (
          <div style={{
            background: 'var(--bg-surface)', borderTop: '1px solid var(--border)',
            padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href
              return (
                <Link key={link.href} to={link.href} style={{
                  padding: '12px 14px', borderRadius: 10, fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--accent)' : 'var(--text-primary)',
                  background: active ? 'var(--accent-glow)' : 'transparent',
                  display: 'block',
                }}>
                  {link.label}
                </Link>
              )
            })}
            <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
            {user ? (
              <>
                <Link to="/wallet" style={{
                  padding: '12px 14px', borderRadius: 10, fontSize: 14,
                  color: 'var(--accent)', fontWeight: 600,
                }}>
                  + Deposit / Wallet
                </Link>
                <button onClick={logout} style={{
                  padding: '12px 14px', borderRadius: 10, fontSize: 14,
                  color: '#ef4444', textAlign: 'left', background: 'none', border: 'none',
                }}>
                  Logout
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to="/login" style={{
                  flex: 1, padding: '11px', textAlign: 'center',
                  border: '1px solid var(--border)', borderRadius: 10,
                  fontSize: 14, color: 'var(--text-primary)',
                }}>Login</Link>
                <Link to="/register" style={{
                  flex: 1, padding: '11px', textAlign: 'center',
                  background: 'var(--accent)', borderRadius: 10,
                  fontSize: 14, fontWeight: 700, color: '#080b0f',
                }}>Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  )
}
