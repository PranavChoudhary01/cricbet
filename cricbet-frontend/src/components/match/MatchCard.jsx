import { useState, useEffect } from 'react'
import { TrendingUp, Clock } from 'lucide-react'
import { useBetStore } from '../../store/betStore'
import { onOddsUpdate, offOddsUpdate, joinMatch, leaveMatch } from '../../services/socket'

const SELECTION_LABELS = {
  team_a_win: null,  // filled dynamically
  draw: 'Draw / No Result',
  team_b_win: null,
}

export default function MatchCard({ match }) {
  const { addToSlip, slip } = useBetStore()
  const [odds, setOdds] = useState(match.odds || [])
  const [flashOdd, setFlashOdd] = useState(null)

  useEffect(() => {
    joinMatch(match.id)

    const handler = (data) => {
      if (data.matchId !== match.id) return
      setOdds((prev) =>
        prev.map((o) =>
          o.selection_type === data.selection ? { ...o, odds_value: data.newOdds } : o
        )
      )
      // Flash animation when odds change
      setFlashOdd(data.selection)
      setTimeout(() => setFlashOdd(null), 800)
    }

    onOddsUpdate(handler)
    return () => {
      leaveMatch(match.id)
      offOddsUpdate(handler)
    }
  }, [match.id])

  const getOdd = (type) => odds.find((o) => o.selection_type === type)

  const handleOddClick = (type, oddVal) => {
    if (!oddVal || oddVal.is_suspended) return
    const labels = {
      team_a_win: `${match.team_a} Win`,
      draw: 'Draw / No Result',
      team_b_win: `${match.team_b} Win`,
    }
    addToSlip({
      matchId: match.id,
      matchName: `${match.team_a} vs ${match.team_b}`,
      selection: type,
      selectionLabel: labels[type],
      odds: parseFloat(oddVal.odds_value),
    })
  }

  const isLive = match.status === 'live'
  const isSelected = (type) => slip?.matchId === match.id && slip?.selection === type

  return (
    <div className="card animate-fade-up" style={{ padding: '18px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 11, color: 'var(--text-secondary)',
            background: 'var(--bg-elevated)', padding: '3px 10px',
            borderRadius: 20,
          }}>
            {match.match_type} {match.venue ? `· ${match.venue}` : ''}
          </span>
        </div>
        {isLive ? (
          <span className="badge badge-live">
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--green)',
              animation: 'pulse-dot 1.5s ease-in-out infinite',
              display: 'inline-block',
            }} />
            LIVE
          </span>
        ) : (
          <span className="badge badge-upcoming">
            <Clock size={10} />
            {new Date(match.start_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Teams */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700,
            color: 'var(--text-primary)', marginBottom: 3,
          }}>
            {match.team_a}
          </div>
          {match.score_a && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)' }}>
              {match.score_a}
            </div>
          )}
        </div>

        <div style={{
          width: 36, height: 36,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: 11, fontWeight: 700,
          color: 'var(--text-muted)',
        }}>
          VS
        </div>

        <div style={{ flex: 1, textAlign: 'right' }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700,
            color: 'var(--text-primary)', marginBottom: 3,
          }}>
            {match.team_b}
          </div>
          {match.score_b && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)' }}>
              {match.score_b}
            </div>
          )}
        </div>
      </div>

      {/* Odds buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {['team_a_win', 'draw', 'team_b_win'].map((type) => {
          const odd = getOdd(type)
          const label = type === 'team_a_win' ? match.team_a : type === 'team_b_win' ? match.team_b : 'Draw'
          const selected = isSelected(type)
          const flashing = flashOdd === type

          return (
            <button
              key={type}
              onClick={() => handleOddClick(type, odd)}
              disabled={!odd || odd.is_suspended}
              style={{
                padding: '10px 8px',
                background: selected ? 'var(--accent-glow)' : flashing ? 'rgba(200,241,53,0.06)' : 'var(--bg-elevated)',
                border: `1px solid ${selected ? 'var(--border-accent)' : flashing ? 'rgba(200,241,53,0.2)' : 'var(--border)'}`,
                borderRadius: 10,
                textAlign: 'center',
                cursor: !odd || odd.is_suspended ? 'not-allowed' : 'pointer',
                opacity: !odd || odd.is_suspended ? 0.4 : 1,
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
                {label}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 17, fontWeight: 600,
                color: selected ? 'var(--accent)' : flashing ? 'var(--accent)' : 'var(--text-primary)',
                transition: 'color 0.2s',
              }}>
                {odd ? parseFloat(odd.odds_value).toFixed(2) : '—'}
              </div>
            </button>
          )
        })}
      </div>

      {/* More markets */}
      <button style={{
        width: '100%', marginTop: 10,
        padding: '7px',
        background: 'transparent',
        border: '1px solid var(--border)',
        borderRadius: 8,
        fontSize: 12, color: 'var(--text-secondary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        transition: 'border-color 0.15s, color 0.15s',
      }}
        onMouseEnter={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.color = 'var(--text-primary)' }}
        onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-secondary)' }}
      >
        <TrendingUp size={13} /> More Markets
      </button>
    </div>
  )
}
