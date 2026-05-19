import { useState, useEffect } from 'react'
import { Trophy, XCircle, Clock, ChevronRight, TrendingUp } from 'lucide-react'
import api from '../services/api'

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Clock },
  won:     { label: 'Won',     color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   icon: Trophy },
  lost:    { label: 'Lost',    color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   icon: XCircle },
  void:    { label: 'Void',    color: '#7a8fa8', bg: 'rgba(122,143,168,0.1)', icon: XCircle },
}

// Mock data — backend se aayega baad mein
const MOCK_BETS = [
  { id: '1', team_a: 'Mumbai Indians', team_b: 'CSK', match_type: 'IPL 2026',
    selection: 'team_a_win', odds_at_placement: 1.82, stake_amount: 500, potential_payout: 910,
    status: 'pending', created_at: new Date().toISOString() },
  { id: '2', team_a: 'India', team_b: 'Australia', match_type: 'Test',
    selection: 'team_a_win', odds_at_placement: 1.55, stake_amount: 1000, potential_payout: 1550,
    status: 'won', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', team_a: 'RCB', team_b: 'KKR', match_type: 'IPL 2026',
    selection: 'team_b_win', odds_at_placement: 1.75, stake_amount: 250, potential_payout: 437.5,
    status: 'lost', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: '4', team_a: 'SRH', team_b: 'PBKS', match_type: 'IPL 2026',
    selection: 'team_a_win', odds_at_placement: 1.90, stake_amount: 750, potential_payout: 1425,
    status: 'won', created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: '5', team_a: 'DC', team_b: 'GT', match_type: 'IPL 2026',
    selection: 'draw', odds_at_placement: 13.00, stake_amount: 100, potential_payout: 1300,
    status: 'lost', created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
]

const FILTER_TABS = ['All', 'Pending', 'Won', 'Lost']

export default function MyBetsPage() {
  const [bets, setBets] = useState(MOCK_BETS)
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Uncomment when backend ready:
    // const fetch = async () => {
    //   setLoading(true)
    //   const { data } = await api.get('/bets/my')
    //   setBets(data)
    //   setLoading(false)
    // }
    // fetch()
  }, [])

  const filtered = bets.filter((b) =>
    filter === 'All' ? true : b.status === filter.toLowerCase()
  )

  const totalStaked = bets.reduce((s, b) => s + Number(b.stake_amount), 0)
  const totalWon = bets.filter((b) => b.status === 'won').reduce((s, b) => s + Number(b.potential_payout), 0)
  const totalLost = bets.filter((b) => b.status === 'lost').reduce((s, b) => s + Number(b.stake_amount), 0)
  const pnl = totalWon - totalLost

  const selectionLabel = (bet) => {
    if (bet.selection === 'team_a_win') return `${bet.team_a} Win`
    if (bet.selection === 'team_b_win') return `${bet.team_b} Win`
    return 'Draw'
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800,
        color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: 6,
      }}>
        My Bets
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
        Apni saari bets ka history dekho
      </p>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Total Bets', value: bets.length, mono: false },
          { label: 'Total Staked', value: `₹${totalStaked.toLocaleString('en-IN')}`, mono: true },
          { label: 'Total Won', value: `₹${totalWon.toLocaleString('en-IN')}`, mono: true, color: '#22c55e' },
          { label: 'Net P&L', value: `${pnl >= 0 ? '+' : ''}₹${Math.abs(pnl).toLocaleString('en-IN')}`, mono: true, color: pnl >= 0 ? '#22c55e' : '#ef4444' },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '16px 18px',
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{stat.label}</div>
            <div style={{
              fontFamily: stat.mono ? 'var(--font-mono)' : 'var(--font-display)',
              fontSize: 22, fontWeight: 700,
              color: stat.color || 'var(--text-primary)',
            }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 16,
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 12, padding: 4, width: 'fit-content',
      }}>
        {FILTER_TABS.map((tab) => (
          <button key={tab} onClick={() => setFilter(tab)} style={{
            padding: '7px 18px', borderRadius: 9, fontSize: 13,
            fontWeight: filter === tab ? 600 : 400,
            color: filter === tab ? '#080b0f' : 'var(--text-secondary)',
            background: filter === tab ? 'var(--accent)' : 'transparent',
            fontFamily: filter === tab ? 'var(--font-display)' : 'var(--font-body)',
            transition: 'all 0.2s',
          }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Bets list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading
          ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 88, borderRadius: 14 }} />
            ))
          : filtered.length === 0
            ? (
              <div style={{
                textAlign: 'center', padding: '60px 24px',
                background: 'var(--bg-surface)', border: '1px dashed var(--border)',
                borderRadius: 16,
              }}>
                <TrendingUp size={36} color="var(--text-muted)" style={{ marginBottom: 12 }} />
                <p style={{ color: 'var(--text-secondary)' }}>Koi bet nahi mili</p>
              </div>
            )
          : filtered.map((bet, i) => {
              const cfg = STATUS_CONFIG[bet.status] || STATUS_CONFIG.pending
              const Icon = cfg.icon
              return (
                <div key={bet.id} className="card" style={{
                  padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: 16,
                  animation: 'fade-up 0.3s ease',
                  animationDelay: `${i * 0.04}s`,
                  animationFillMode: 'both',
                }}>
                  {/* Status icon */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={18} color={cfg.color} />
                  </div>

                  {/* Match info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600,
                      color: 'var(--text-primary)', marginBottom: 3,
                    }}>
                      {bet.team_a} vs {bet.team_b}
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                      <span>{bet.match_type}</span>
                      <span>· {selectionLabel(bet)}</span>
                      <span>· Odds {parseFloat(bet.odds_at_placement).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 600,
                      color: bet.status === 'won' ? '#22c55e' : 'var(--text-primary)',
                      marginBottom: 3,
                    }}>
                      {bet.status === 'won'
                        ? `+₹${Number(bet.potential_payout).toLocaleString('en-IN')}`
                        : `₹${Number(bet.stake_amount).toLocaleString('en-IN')}`
                      }
                    </div>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: 11, fontWeight: 500,
                      color: cfg.color, background: cfg.bg,
                      padding: '2px 8px', borderRadius: 20,
                    }}>
                      {cfg.label}
                    </div>
                  </div>

                  {/* Date */}
                  <div style={{
                    fontSize: 12, color: 'var(--text-muted)', flexShrink: 0,
                    minWidth: 70, textAlign: 'right',
                  }}>
                    {new Date(bet.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </div>
                </div>
              )
            })
        }
      </div>
    </div>
  )
}
