import { X, TrendingUp, Loader } from 'lucide-react'
import { useBetStore } from '../../store/betStore'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'

const QUICK_STAKES = [100, 250, 500, 1000, 2000, 5000]

export default function BetSlip({ onClose }) {
  const { slip, stake, placing, setStake, clearSlip, placeBet, getPayout } = useBetStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const payout = getPayout()

  return (
    <aside style={{
      width: 290,
      flexShrink: 0,
      position: 'sticky',
      top: 76,
      height: 'fit-content',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 13, fontWeight: 600,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          color: 'var(--text-secondary)',
        }}>
          Bet Slip {slip ? '(1)' : ''}
        </span>
        {slip && (
          <button onClick={clearSlip} style={{ color: 'var(--text-muted)', transition: 'color 0.15s' }}>
            <X size={16} />
          </button>
        )}
      </div>

      {!slip ? (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px dashed var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px 24px',
          textAlign: 'center',
        }}>
          <TrendingUp size={28} color="var(--text-muted)" style={{ marginBottom: 12 }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Koi match card pe odds click karo
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
            Bet slip yahan aayega
          </p>
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}>
          {/* Selection */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--accent-glow)',
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
              {slip.matchName}
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 15, fontWeight: 600,
              color: 'var(--text-primary)',
            }}>
              {slip.selectionLabel}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 20, fontWeight: 500,
              color: 'var(--accent)',
              marginTop: 4,
            }}>
              {slip.odds}
            </div>
          </div>

          {/* Stake input */}
          <div style={{ padding: '14px 16px' }}>
            <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
              Stake Amount (₹)
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                fontFamily: 'var(--font-mono)', fontSize: 14,
                color: 'var(--text-secondary)',
              }}>₹</span>
              <input
                type="number"
                value={stake}
                min={10}
                onChange={(e) => setStake(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 28px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 15, fontWeight: 500,
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Quick stakes */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 6, marginTop: 10,
            }}>
              {QUICK_STAKES.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setStake(amt)}
                  style={{
                    padding: '6px 4px',
                    background: stake === amt ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                    border: `1px solid ${stake === amt ? 'var(--border-accent)' : 'var(--border)'}`,
                    borderRadius: 8,
                    fontSize: 12,
                    color: stake === amt ? 'var(--accent)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    transition: 'all 0.15s',
                  }}
                >
                  ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              ))}
            </div>

            {/* Payout summary */}
            <div style={{
              marginTop: 14, padding: 12,
              background: 'var(--bg-elevated)',
              borderRadius: 10,
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Stake</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                  ₹{stake.toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Odds</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                  × {slip.odds}
                </span>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                paddingTop: 8, borderTop: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Potential Win</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600,
                  color: 'var(--accent)',
                }}>
                  ₹{payout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* CTA */}
            {user ? (
              <button
                onClick={placeBet}
                disabled={placing || stake < 10}
                style={{
                  width: '100%', marginTop: 12,
                  padding: '13px',
                  background: placing ? 'var(--accent-dim)' : 'var(--accent)',
                  border: 'none',
                  borderRadius: 12,
                  fontFamily: 'var(--font-display)',
                  fontSize: 15, fontWeight: 700,
                  color: '#080b0f',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'opacity 0.2s, transform 0.1s',
                  opacity: placing || stake < 10 ? 0.6 : 1,
                  cursor: placing || stake < 10 ? 'not-allowed' : 'pointer',
                }}
              >
                {placing ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                {placing ? 'Placing...' : `Place Bet — ₹${stake.toLocaleString('en-IN')}`}
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                style={{
                  width: '100%', marginTop: 12, padding: '13px',
                  background: 'transparent',
                  border: '1px solid var(--accent)',
                  borderRadius: 12,
                  color: 'var(--accent)',
                  fontFamily: 'var(--font-display)',
                  fontSize: 14, fontWeight: 600,
                }}
              >
                Login to Bet
              </button>
            )}

            <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
              18+ · Gamble responsibly
            </p>
          </div>
        </div>
      )}
    </aside>
  )
}
