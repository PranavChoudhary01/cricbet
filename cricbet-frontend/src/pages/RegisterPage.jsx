import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Eye, EyeOff, Loader } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const { register, loading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      toast.error('Passwords match nahi kar rahe')
      return
    }
    if (form.password.length < 8) {
      toast.error('Password minimum 8 characters ka hona chahiye')
      return
    }
    try {
      await register(form.username, form.email, form.password)
      toast.success('Account ban gaya! Welcome to CricBet 🏏')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    }
  }

  const strength = (() => {
    const p = form.password
    if (!p) return 0
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })()
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', '#ef4444', '#f59e0b', '#22c55e', 'var(--accent)'][strength]

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(200,241,53,0.07) 0%, transparent 70%)',
    }}>
      <div style={{ width: '100%', maxWidth: 420, animation: 'fade-up 0.4s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
          }}>
            <Zap size={24} color="#080b0f" strokeWidth={2.5} />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800,
            color: 'var(--text-primary)', letterSpacing: '-0.5px',
          }}>
            Account banao
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>
            Free mein join karo, koi fees nahi
          </p>
        </div>

        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 20, padding: '28px',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <Field label="Username">
              <input
                type="text" required
                placeholder="aapka_naam"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                minLength={3} maxLength={20}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </Field>

            <Field label="Email Address">
              <input
                type="email" required
                placeholder="aap@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </Field>

            <Field label="Password">
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} required
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: i <= strength ? strengthColor : 'var(--bg-elevated)',
                        transition: 'background 0.2s',
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: strengthColor, marginTop: 4, display: 'block' }}>
                    {strengthLabel}
                  </span>
                </div>
              )}
            </Field>

            <Field label="Confirm Password">
              <input
                type="password" required
                placeholder="Password dobara daalo"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                style={{
                  ...inputStyle,
                  borderColor: form.confirm && form.confirm !== form.password ? '#ef4444' : 'var(--border)',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor =
                  form.confirm && form.confirm !== form.password ? '#ef4444' : 'var(--border)'}
              />
              {form.confirm && form.confirm !== form.password && (
                <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>Passwords match nahi kar rahe</p>
              )}
            </Field>

            <div style={{
              background: 'var(--bg-elevated)', borderRadius: 10, padding: '12px 14px',
              fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6,
            }}>
              Register karke aap hamari{' '}
              <span style={{ color: 'var(--accent)' }}>Terms of Service</span> aur{' '}
              <span style={{ color: 'var(--accent)' }}>Privacy Policy</span> se agree karte ho.
              18+ only.
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px',
              background: loading ? 'var(--accent-dim)' : 'var(--accent)',
              border: 'none', borderRadius: 12,
              fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
              color: '#080b0f',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading && <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              {loading ? 'Creating account...' : 'Create Account — Free'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
            Already account hai?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Login karo</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{
        fontSize: 12, color: 'var(--text-secondary)',
        display: 'block', marginBottom: 8, fontWeight: 500,
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '11px 14px',
  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
  borderRadius: 10, color: 'var(--text-primary)',
  fontSize: 14, outline: 'none', transition: 'border-color 0.15s',
}
