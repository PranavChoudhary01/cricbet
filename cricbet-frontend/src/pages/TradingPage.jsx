import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import Chart from 'chart.js/auto'

const generateCandles = (count = 30) => {
  const candles = []
  let price = 2.10
  for (let i = 0; i < count; i++) {
    const open = parseFloat(price.toFixed(2))
    const move = (Math.random() - 0.48) * 0.18
    const close = parseFloat(Math.max(1.20, Math.min(3.50, open + move)).toFixed(2))
    const high = parseFloat((Math.max(open, close) + Math.random() * 0.08).toFixed(2))
    const low = parseFloat((Math.min(open, close) - Math.random() * 0.08).toFixed(2))
    candles.push({ o: open, h: high, l: low, c: close })
    price = close
  }
  return candles
}

const BULL = '#1D9E75'
const BEAR = '#E24B4A'
const WICK = '#888780'

const TF_COUNTS = { '1B': 10, '2B': 15, '5B': 20, '1O': 30 }

export default function TradingPage() {
  const { state } = useLocation()
  const match = state?.match
  const matchName = match ? `${match.team_a} vs ${match.team_b}` : 'MI vs CSK'
  const matchInfo = match ? `${match.match_type} · ${match.venue || ''}` : 'IPL 2026 · Wankhede'
  const teamA = match?.team_a || 'MI'

  const canvasRef = useRef(null)
  const chartRef = useRef(null)
  const candlesRef = useRef(generateCandles())
  const intervalRef = useRef(null)
  const timeframeRef = useRef('1B')

  const [timeframe, setTimeframe] = useState('1B')
  const [currentOdds, setCurrentOdds] = useState(1.82)
  const [change, setChange] = useState('+0.12')
  const [changeUp, setChangeUp] = useState(true)
  const [stake, setStake] = useState(500)
  const [orderOdds, setOrderOdds] = useState(1.82)
  const [stopLoss, setStopLoss] = useState('')
  const [target, setTarget] = useState('')
  const [positions, setPositions] = useState([])
  const [nextId, setNextId] = useState(1)
  const [wallet, setWallet] = useState(10000)
  const [log, setLog] = useState([])
  const isMobile = window.innerWidth < 768

  const payout = parseFloat(((orderOdds - 1) * stake).toFixed(0))

  const addLog = useCallback((msg, color = '#1D9E75') => {
    setLog(prev => [{ msg, color, time: new Date().toLocaleTimeString('en-IN') }, ...prev.slice(0, 9)])
  }, [])

  const getVisibleCandles = useCallback(() => {
    const count = TF_COUNTS[timeframeRef.current] || 10
    return candlesRef.current.slice(-count)
  }, [])

  const refreshChart = useCallback(() => {
    if (!chartRef.current) return
    const visible = getVisibleCandles()
    chartRef.current.data.labels = visible.map((_, i) => `B${i + 1}`)
    chartRef.current.data.datasets[0].data = visible.map(c => c.c)
    chartRef.current.update('none')
  }, [getVisibleCandles])

  const handleTimeframe = (tf) => {
    setTimeframe(tf)
    timeframeRef.current = tf
    refreshChart()
  }

  useEffect(() => {
    if (!canvasRef.current) return

    const plugin = {
      id: 'candlestick',
      afterDatasetsDraw(chart) {
        const { ctx, scales: { x, y } } = chart
        const visible = getVisibleCandles()
        visible.forEach((c, i) => {
          const xPos = x.getPixelForValue(i)
          const oY = y.getPixelForValue(c.o)
          const cY = y.getPixelForValue(c.c)
          const hY = y.getPixelForValue(c.h)
          const lY = y.getPixelForValue(c.l)
          const color = c.c >= c.o ? BULL : BEAR
          const bw = Math.max(6, (x.width / visible.length) * 0.55)
          ctx.save()
          ctx.strokeStyle = WICK
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(xPos, hY)
          ctx.lineTo(xPos, lY)
          ctx.stroke()
          ctx.fillStyle = color
          ctx.fillRect(xPos - bw / 2, Math.min(oY, cY), bw, Math.abs(oY - cY) || 1)
          ctx.restore()
        })
      },
    }

    const visible = getVisibleCandles()
    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      plugins: [plugin],
      data: {
        labels: visible.map((_, i) => `B${i + 1}`),
        datasets: [{ data: visible.map(c => c.c), borderColor: 'transparent', pointRadius: 0 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(136,135,128,0.1)' }, ticks: { color: '#888780', font: { size: 10 }, maxTicksLimit: 8 } },
          y: { position: 'right', grid: { color: 'rgba(136,135,128,0.1)' }, ticks: { color: '#888780', font: { size: 10 }, callback: v => v.toFixed(2) } },
        },
      },
    })

    intervalRef.current = setInterval(() => {
      const last = candlesRef.current[candlesRef.current.length - 1]
      const newClose = parseFloat(Math.max(1.20, Math.min(3.50, last.c + (Math.random() - 0.48) * 0.12)).toFixed(2))
      const newCandle = {
        o: last.c,
        h: parseFloat((Math.max(last.c, newClose) + Math.random() * 0.05).toFixed(2)),
        l: parseFloat((Math.min(last.c, newClose) - Math.random() * 0.05).toFixed(2)),
        c: newClose,
      }
      candlesRef.current = [...candlesRef.current.slice(-59), newCandle]

      setCurrentOdds(prev => {
        const diff = parseFloat((newClose - prev).toFixed(2))
        setChange((diff >= 0 ? '+' : '') + diff.toFixed(2))
        setChangeUp(diff >= 0)
        setOrderOdds(newClose)
        return newClose
      })

      setPositions(prev => {
        const updated = prev.map(p => ({
          ...p,
          pnl: Math.round((newClose - p.entry) * p.stake * (p.type === 'BUY' ? 1 : -1)),
        }))
        const remaining = []
        updated.forEach(p => {
          const sl = parseFloat(p.stopLoss)
          const tgt = parseFloat(p.target)
          const pnl = p.pnl
          if (tgt && pnl >= tgt) {
            setWallet(w => parseFloat((w + p.stake + pnl).toFixed(2)))
            addLog(`✅ Target hit! ${p.type} — +₹${pnl}`, '#1D9E75')
            return
          }
          if (sl && pnl <= -sl) {
            setWallet(w => parseFloat((w + p.stake + pnl).toFixed(2)))
            addLog(`🛑 Stop loss hit! ${p.type} — -₹${Math.abs(pnl)}`, '#E24B4A')
            return
          }
          remaining.push(p)
        })
        return remaining
      })

      refreshChart()
    }, 2000)

    return () => {
      clearInterval(intervalRef.current)
      chartRef.current?.destroy()
    }
  }, [])

  const placeOrder = (type) => {
    if (stake > wallet) {
      addLog('❌ Insufficient wallet balance!', '#E24B4A')
      return
    }
    setWallet(w => parseFloat((w - stake).toFixed(2)))
    setPositions(prev => [...prev, {
      id: nextId, type,
      entry: parseFloat(orderOdds.toFixed(2)),
      stake, pnl: 0,
      stopLoss: stopLoss || null,
      target: target || null,
    }])
    setNextId(n => n + 1)
    addLog(`📈 ${type} @ ${orderOdds.toFixed(2)} | Stake: ₹${stake} | SL: ${stopLoss || 'None'} | TGT: ${target || 'None'}`, type === 'BUY' ? '#1D9E75' : '#E24B4A')
  }

  const exitPosition = (p) => {
    setWallet(w => parseFloat((w + p.stake + p.pnl).toFixed(2)))
    setPositions(prev => prev.filter(pos => pos.id !== p.id))
    addLog(`🚪 Exit ${p.type} | P&L: ${p.pnl >= 0 ? '+' : ''}₹${p.pnl}`, p.pnl >= 0 ? '#1D9E75' : '#E24B4A')
  }

  const totalPnl = positions.reduce((s, p) => s + p.pnl, 0)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '16px 12px' : '28px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? 18 : 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
            {matchName} — Odds Trading
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{matchInfo}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Wallet</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: wallet >= 10000 ? '#1D9E75' : wallet > 5000 ? 'var(--text-primary)' : '#E24B4A' }}>
              ₹{wallet.toLocaleString('en-IN')}
            </span>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(29,158,117,0.12)', color: '#0F6E56', fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20, border: '1px solid rgba(29,158,117,0.25)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1D9E75', display: 'inline-block' }} />
            LIVE
          </span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Current Odds', val: currentOdds.toFixed(2), color: 'var(--text-primary)' },
          { label: 'Change', val: change, color: changeUp ? '#1D9E75' : '#E24B4A' },
          { label: 'Open P&L', val: (totalPnl >= 0 ? '+' : '') + '₹' + Math.abs(totalPnl).toLocaleString('en-IN'), color: totalPnl >= 0 ? '#1D9E75' : '#E24B4A' },
          { label: 'Positions', val: positions.length, color: 'var(--text-primary)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 600, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {teamA} Win Odds — Candlestick
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {['1B', '2B', '5B', '1O'].map((tf) => (
              <button
                key={tf}
                onClick={() => handleTimeframe(tf)}
                style={{
                  fontSize: 11, padding: '4px 10px', borderRadius: 6,
                  border: `1px solid ${timeframe === tf ? 'var(--accent)' : 'var(--border)'}`,
                  background: timeframe === tf ? 'var(--accent)' : 'transparent',
                  color: timeframe === tf ? '#080b0f' : 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: timeframe === tf ? 700 : 400,
                  transition: 'all 0.15s',
                }}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', width: '100%', height: 220 }}>
          <canvas ref={canvasRef} />
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 11, color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: BULL, display: 'inline-block' }} />Odds Badhi
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: BEAR, display: 'inline-block' }} />Odds Giri
          </span>
        </div>
      </div>

      {/* Order + Positions */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 12 }}>

        {/* Order Panel */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 14 }}>
            Place Order — {teamA} Win
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            <button onClick={() => placeOrder('BUY')} style={{ padding: '11px', borderRadius: 10, border: 'none', background: '#1D9E75', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              BUY BACK
            </button>
            <button onClick={() => placeOrder('LAY')} style={{ padding: '11px', borderRadius: 10, border: 'none', background: '#E24B4A', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              LAY
            </button>
          </div>
          {[
            { label: 'Odds', val: orderOdds.toFixed(2), setter: v => setOrderOdds(parseFloat(v)), step: '0.01' },
            { label: 'Stake (₹)', val: stake, setter: v => setStake(parseFloat(v)), step: '100' },
            { label: 'Stop Loss (₹ loss limit)', val: stopLoss, setter: setStopLoss, step: '10', placeholder: 'e.g. 200' },
            { label: 'Target (₹ profit limit)', val: target, setter: setTarget, step: '10', placeholder: 'e.g. 500' },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 5 }}>{f.label}</div>
              <input
                type="number" value={f.val} step={f.step}
                placeholder={f.placeholder || ''}
                onChange={e => f.setter(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 9, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 14, outline: 'none' }}
              />
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Potential P&L</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#1D9E75' }}>+₹{payout.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Positions */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 14 }}>
            Open Positions ({positions.length})
          </div>
          {positions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)', fontSize: 13 }}>
              Koi open position nahi — Buy ya Lay karo!
            </div>
          ) : (
            positions.map(p => (
              <div key={p.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                      {teamA} Win — <span style={{ color: p.type === 'BUY' ? '#1D9E75' : '#E24B4A' }}>{p.type}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                      Entry: {p.entry.toFixed(2)} · Stake: ₹{p.stake.toLocaleString('en-IN')}
                      {p.stopLoss && ` · SL: ₹${p.stopLoss}`}
                      {p.target && ` · TGT: ₹${p.target}`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: p.pnl >= 0 ? '#1D9E75' : '#E24B4A', marginBottom: 4 }}>
                      {p.pnl >= 0 ? '+' : ''}₹{Math.abs(p.pnl).toLocaleString('en-IN')}
                    </div>
                    <button onClick={() => exitPosition(p)} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      Exit
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Activity Log */}
      {log.length > 0 && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 12 }}>
            Activity Log
          </div>
          {log.map((l, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: i < log.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>{l.time}</span>
              <span style={{ fontSize: 12, color: l.color }}>{l.msg}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}