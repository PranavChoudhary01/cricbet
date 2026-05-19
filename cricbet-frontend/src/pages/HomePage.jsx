import { useState, useEffect } from 'react'
import MatchCard from '../components/match/MatchCard'
import BetSlip from '../components/bet/BetSlip'
import { useBetStore } from '../store/betStore'
import api from '../services/api'

const TABS = ['All', 'Live', 'Upcoming', 'IPL 2026', 'International']

const MOCK_MATCHES = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    team_a: 'Mumbai Indians', team_b: 'CSK',
    match_type: 'IPL 2026', venue: 'Wankhede',
    status: 'live', score_a: '128/4 (14.3)', score_b: 'Yet to bat',
    start_time: new Date().toISOString(),
    odds: [
      { selection_type: 'team_a_win', odds_value: '1.82', is_suspended: false },
      { selection_type: 'draw', odds_value: '12.00', is_suspended: false },
      { selection_type: 'team_b_win', odds_value: '2.10', is_suspended: false },
    ],
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    team_a: 'India', team_b: 'Australia',
    match_type: 'Test', venue: 'MCG',
    status: 'live', score_a: '310/6 & 145/3', score_b: '287 all out',
    start_time: new Date().toISOString(),
    odds: [
      { selection_type: 'team_a_win', odds_value: '1.55', is_suspended: false },
      { selection_type: 'draw', odds_value: '4.50', is_suspended: false },
      { selection_type: 'team_b_win', odds_value: '5.80', is_suspended: false },
    ],
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    team_a: 'RCB', team_b: 'KKR',
    match_type: 'IPL 2026', venue: 'Chinnaswamy',
    status: 'upcoming', score_a: null, score_b: null,
    start_time: new Date(Date.now() + 3 * 3600000).toISOString(),
    odds: [
      { selection_type: 'team_a_win', odds_value: '2.20', is_suspended: false },
      { selection_type: 'draw', odds_value: '14.00', is_suspended: false },
      { selection_type: 'team_b_win', odds_value: '1.75', is_suspended: false },
    ],
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    team_a: 'SRH', team_b: 'PBKS',
    match_type: 'IPL 2026', venue: 'Rajiv Gandhi',
    status: 'upcoming', score_a: null, score_b: null,
    start_time: new Date(Date.now() + 26 * 3600000).toISOString(),
    odds: [
      { selection_type: 'team_a_win', odds_value: '1.90', is_suspended: false },
      { selection_type: 'draw', odds_value: '13.00', is_suspended: false },
      { selection_type: 'team_b_win', odds_value: '2.05', is_suspended: false },
    ],
  },
]

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('All')
  const [matches, setMatches] = useState(MOCK_MATCHES)
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [showMobileBetSlip, setShowMobileBetSlip] = useState(false)
  const { slip } = useBetStore()

  // Resize handler
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Auto show betslip on mobile
  useEffect(() => {
    if (slip && isMobile) setShowMobileBetSlip(true)
  }, [slip, isMobile])

  // Backend se matches fetch karo
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true)
        const status = activeTab === 'Live' ? 'live'
                     : activeTab === 'Upcoming' ? 'upcoming'
                     : undefined
        const { data } = await api.get('/matches', { params: { status } })
        if (data && data.length > 0) setMatches(data)
      } catch (err) {
        console.log('Backend nahi mila, mock data use ho raha hai')
      } finally {
        setLoading(false)
      }
    }
    fetchMatches()
  }, [activeTab])

  const liveCount = matches.filter((m) => m.status === 'live').length

  const filteredMatches = matches.filter((m) => {
    if (activeTab === 'Live') return m.status === 'live'
    if (activeTab === 'Upcoming') return m.status === 'upcoming'
    if (activeTab === 'IPL 2026') return m.match_type === 'IPL 2026'
    if (activeTab === 'International') return m.match_type !== 'IPL 2026'
    return true
  })

  return (
    <div style={{
      maxWidth: 1280, margin: '0 auto',
      padding: isMobile ? '16px 12px 100px' : '28px 24px',
      display: 'flex', gap: 28, alignItems: 'flex-start',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 18 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: isMobile ? 22 : 28, fontWeight: 800,
            color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 4,
          }}>
            Cricket Betting
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            {liveCount} live matches · Odds updating in real-time
          </p>
        </div>

        {/* Scrollable tabs */}
        <div style={{ overflowX: 'auto', marginBottom: 14, scrollbarWidth: 'none' }}>
          <div style={{
            display: 'inline-flex', gap: 4, padding: '4px',
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 12,
          }}>
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: isMobile ? '6px 12px' : '7px 16px',
                borderRadius: 9, whiteSpace: 'nowrap',
                fontSize: isMobile ? 12 : 13,
                fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? '#080b0f' : 'var(--text-secondary)',
                background: activeTab === tab ? 'var(--accent)' : 'transparent',
                transition: 'all 0.2s',
                fontFamily: activeTab === tab ? 'var(--font-display)' : 'var(--font-body)',
              }}>
                {tab}
                {tab === 'Live' && liveCount > 0 && (
                  <span style={{
                    marginLeft: 5, fontSize: 10, fontWeight: 700,
                    background: activeTab === tab ? '#080b0f' : 'var(--green)',
                    color: activeTab === tab ? 'var(--accent)' : '#080b0f',
                    padding: '1px 5px', borderRadius: 10,
                  }}>
                    {liveCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Match Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading
            ? Array(3).fill(0).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 180, borderRadius: 'var(--radius-lg)' }} />
              ))
            : filteredMatches.map((match, i) => (
                <div key={match.id} style={{ animationDelay: `${i * 0.06}s` }}>
                  <MatchCard match={match} />
                </div>
              ))
          }
        </div>
      </div>

      {/* Desktop sidebar */}
      {!isMobile && <BetSlip />}

      {/* Mobile: floating pill */}
      {isMobile && slip && !showMobileBetSlip && (
        <button onClick={() => setShowMobileBetSlip(true)} style={{
          position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          zIndex: 200,
          background: 'var(--accent)', color: '#080b0f',
          padding: '14px 28px', borderRadius: 50,
          fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700,
          border: 'none', boxShadow: '0 8px 32px rgba(200,241,53,0.35)',
          whiteSpace: 'nowrap', cursor: 'pointer',
        }}>
          🏏 Bet Slip Dekho ({slip.selectionLabel})
        </button>
      )}

      {/* Mobile: bottom sheet */}
      {isMobile && showMobileBetSlip && (
        <>
          <div onClick={() => setShowMobileBetSlip(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 200,
          }} />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border)',
            borderRadius: '20px 20px 0 0',
            padding: '0 16px 36px',
            maxHeight: '88vh', overflowY: 'auto',
          }}>
            <div style={{
              width: 40, height: 4, borderRadius: 2,
              background: 'var(--border)', margin: '12px auto 16px',
            }} />
            <BetSlip onClose={() => setShowMobileBetSlip(false)} />
          </div>
        </>
      )}
    </div>
  )
}