import { useState, useEffect } from 'react'
import { Wallet, ArrowDownLeft, ArrowUpRight, Plus, Minus } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'
import toast from 'react-hot-toast'

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000]

const TXN_CONFIG = {
  deposit:    { label: 'Deposit',    color: '#22c55e', icon: ArrowDownLeft, sign: '+' },
  withdrawal: { label: 'Withdrawal', color: '#ef4444', icon: ArrowUpRight,  sign: '-' },
  bet_placed: { label: 'Bet Placed', color: '#f59e0b', icon: Minus,         sign: '-' },
  bet_won:    { label: 'Bet Won',    color: '#22c55e', icon: Plus,           sign: '+' },
  bet_refund: { label: 'Refund',     color: '#3b82f6', icon: ArrowDownLeft,  sign: '+' },
}

const MOCK_TXN = [
  { id: '1', type: 'bet_won',    amount: 1550,  created_at: new Date().toISOString(),          balance_after: 2450 },
  { id: '2', type: 'bet_placed', amount: -1000, created_at: new Date(Date.now()-3600000).toISOString(), balance_after: 900 },
  { id: '3', type: 'deposit',    amount: 2000,  created_at: new Date(Date.now()-86400000).toISOString(), balance_after: 1900 },
  { id: '4', type: 'bet_placed', amount: -500,  created_at: new Date(Date.now()-90000000).toISOString(), balance_after: 200 },
  { id: '5', type: 'deposit',    amount: 1000,  created_at: new Date(Date.now()-180000000).toISOString(), balance_after: 700 },
]

export default function WalletPage() {
  const { user } = useAuthStore()
  const [depositAmt, setDepositAmt] = useState(1000)
  const [transactions, setTransactions] = useState(MOCK_TXN)
  const [activeTab, setActiveTab] = useState('deposit')

  const balance = Number(user?.wallet_balance || 2450)

  const handleDeposit = async () => {
    // Razorpay integration aayegi — next step
    toast.success(`Razorpay payment window khulega (₹${depositAmt.toLocaleString('en-IN')})`)
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800,
        color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: 28,
      }}>
        Wallet
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
        {/* Balance card */}
        <div style={{
          background: 'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(200,241,53,0.06) 100%)',
          border: '1px solid var(--border-accent)',
          borderRadius: 20, padding: '28px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -20, right: -20, width: 120, height: 120,
            borderRadius: '50%', background: 'rgba(200,241,53,0.04)',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: 'var(--accent-glow)',
              border: '1px solid var(--border-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Wallet size={18} color="var(--accent)" />
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Available Balance</span>
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 700,
            color: 'var(--accent)', letterSpacing: '-1px',
          }}>
            ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            Instant withdrawal available
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Total Deposited', value: '₹3,000', color: 'var(--text-primary)' },
            { label: 'Total Withdrawn', value: '₹0', color: 'var(--text-primary)' },
            { label: 'Total Won', value: '₹1,550', color: '#22c55e' },
          ].map((s) => (
            <div key={s.label} style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '14px 18px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 600, color: s.color }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 20,
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 12, padding: 4, width: 'fit-content',
      }}>
        {['deposit', 'withdraw', 'history'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '7px 20px', borderRadius: 9,
            fontWeight: activeTab === tab ? 600 : 400, fontSize: 13,
            color: activeTab === tab ? '#080b0f' : 'var(--text-secondary)',
            background: activeTab === tab ? 'var(--accent)' : 'transparent',
            fontFamily: activeTab === tab ? 'var(--font-display)' : 'var(--font-body)',
            transition: 'all 0.2s',
            textTransform: 'capitalize',
          }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Deposit tab */}
      {activeTab === 'deposit' && (
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 20, padding: '28px', maxWidth: 480,
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700,
            color: 'var(--text-primary)', marginBottom: 20,
          }}>
            Add Money
          </h2>

          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
            Amount (₹)
          </label>
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <span style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--text-secondary)',
            }}>₹</span>
            <input
              type="number" value={depositAmt}
              onChange={(e) => setDepositAmt(Number(e.target.value))}
              min={100}
              style={{
                width: '100%', padding: '13px 14px 13px 34px',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: 12, color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600, outline: 'none',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Quick amounts */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {QUICK_AMOUNTS.map((amt) => (
              <button key={amt} onClick={() => setDepositAmt(amt)} style={{
                padding: '7px 16px',
                background: depositAmt === amt ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                border: `1px solid ${depositAmt === amt ? 'var(--border-accent)' : 'var(--border)'}`,
                borderRadius: 20, fontSize: 13,
                color: depositAmt === amt ? 'var(--accent)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)', transition: 'all 0.15s',
              }}>
                ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
              </button>
            ))}
          </div>

          {/* Payment methods */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>Payment Method</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['UPI', 'Net Banking', 'Card'].map((method, i) => (
                <div key={method} style={{
                  flex: 1, padding: '10px 8px', textAlign: 'center',
                  background: i === 0 ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                  border: `1px solid ${i === 0 ? 'var(--border-accent)' : 'var(--border)'}`,
                  borderRadius: 10, fontSize: 12, cursor: 'pointer',
                  color: i === 0 ? 'var(--accent)' : 'var(--text-secondary)',
                }}>
                  {method}
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleDeposit} style={{
            width: '100%', padding: '13px',
            background: 'var(--accent)', border: 'none', borderRadius: 12,
            fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
            color: '#080b0f', cursor: 'pointer',
          }}>
            Deposit ₹{depositAmt.toLocaleString('en-IN')} via Razorpay
          </button>

          <div style={{ display: 'flex', gap: 12, marginTop: 14, justifyContent: 'center' }}>
            {['100% Secure', 'Instant Credit', 'No Fees'].map((tag) => (
              <span key={tag} style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                ✓ {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Withdraw tab */}
      {activeTab === 'withdraw' && (
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 20, padding: '28px', maxWidth: 480,
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700,
            color: 'var(--text-primary)', marginBottom: 6,
          }}>
            Withdraw Money
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
            Available: <strong style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
              ₹{balance.toLocaleString('en-IN')}
            </strong>
          </p>

          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
            Amount (₹)
          </label>
          <input type="number" placeholder="Kitna withdraw karna hai?" max={balance} style={{
            width: '100%', padding: '13px 14px', marginBottom: 14,
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 12, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
            fontSize: 16, outline: 'none',
          }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />

          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
            UPI ID
          </label>
          <input type="text" placeholder="yourname@upi" style={{
            width: '100%', padding: '11px 14px', marginBottom: 20,
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 12, color: 'var(--text-primary)', fontSize: 14, outline: 'none',
          }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />

          <button onClick={() => toast.success('Withdrawal request submit ho gayi!')} style={{
            width: '100%', padding: '13px',
            background: 'transparent', border: '1px solid var(--accent)',
            borderRadius: 12, fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
            color: 'var(--accent)', cursor: 'pointer',
          }}>
            Request Withdrawal
          </button>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
            Processing time: 24-48 hours · Min withdrawal ₹500
          </p>
        </div>
      )}

      {/* Transaction History */}
      {activeTab === 'history' && (
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 20, overflow: 'hidden',
        }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              Transaction History
            </h2>
          </div>
          {transactions.map((txn, i) => {
            const cfg = TXN_CONFIG[txn.type]
            const Icon = cfg?.icon || Plus
            return (
              <div key={txn.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 22px',
                borderBottom: i < transactions.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                  background: `${cfg?.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={17} color={cfg?.color || 'var(--text-secondary)'} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>
                    {cfg?.label || txn.type}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {new Date(txn.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 600,
                    color: txn.amount > 0 ? '#22c55e' : '#ef4444',
                    marginBottom: 2,
                  }}>
                    {txn.amount > 0 ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Bal: ₹{Number(txn.balance_after).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
