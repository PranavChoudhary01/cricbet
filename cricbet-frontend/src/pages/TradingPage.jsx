import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Chart from 'chart.js/auto'

const generateCandles = (count = 24) => {
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

const candlestickPlugin = {
  id: 'candlestick',
  afterDatasetsDraw(chart, _, { candles }) {
    const { ctx, scales: { x, y } } = chart
    candles.forEach((c, i) => {
      const xPos = x.getPixelForValue(i)
      const oY = y.getPixelForValue(c.o)
      const cY = y.getPixelForValue(c.c)
      const hY = y.getPixelForValue(c.h)
      const lY = y.getPixelForValue(c.l)
      const color = c.c >= c.o ? BULL : BEAR
      const bw = Math.max(6, (x.width / candles.length) * 0.55)

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

export default function TradingPage() {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)
  const candlesRef = useRef(generateCandles())
  const intervalRef = useRef(null)

  const [currentOdds, setCurrentOdds] = useState(1.82)
  const [change, setChange] = useState('+0.12')
  const [changeUp, setChangeUp] = useState(true)
  const [stake, setStake] = useState(500)
  const [orderOdds, setOrderOdds] = useState(1.82)
  const [positions, setPositions] = useState([
    { id: 1, type: 'BUY', entry: 2.10, stake: 500, pnl: -140 },
    { id: 2, type: 'LAY', entry: 2.30, stake: 300, pnl: 230 },
  ])
  const [nextId, setNextId] = useState(3)
  const isMobile = window.innerWidth < 768

  const payout = parseFloat(((orderOdds - 1) * stake).toFixed(0))

  useEffect(() => {
    if (!canvasRef.current) return

    const plugin = {
      ...candlestickPlugin,
      afterDatasetsDraw(chart) {
        candlestickPlugin.afterDatasetsDraw(chart, null, { candles: candlesRef.current })
      },
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      plugins: [plugin],
      data: {
        labels: candlesRef.current.map((_, i) => `B${i + 1}`),
        datasets: [{
          data: candlesRef.current.map(c => c.c),
          borderColor: 'transparent',
          pointRadius: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { color: 'rgba(136,135,128,0.1)' },
            ticks: { color: '#888780', font: { size: 10 }, maxTicksLimit: 8 },
          },
          y: {
            position: 'right',
            grid: { color: 'rgba(136,135,128,0.1)' },
            ticks: { color: '#888780', font: { size: 10 }, callback: v => v.toFixed(2) },
          },
        },
      },
    })

    intervalRef.current = setInterval(() => {
      const last = candlesRef.current[candlesRef.current.length - 1]
      const newClose = parseFloat(
        Math.max(1.20, Math.min(3.50, last.c + (Math.random() - 0.48) * 0.12)).toFixed(2)
      )
      const newCandle = {
        o: last.c,
        h: parseFloat((Math.max(last.c, newClose) + Math.random() * 0.05).toFixed(2)),
        l: parseFloat((Math.min(last.c, newClose) - Math.random() * 0.05).toFixed(2)),
        c: newClose,
      }
      candlesRef.current = [...candlesRef.current.slice(-29), newCandle]

      setCurrentOdds(prev => {
        const diff = parseFloat((newClose - prev).toFixed(2))
        setChange((diff >= 0 ? '+' : '') + diff.toFixed(2))
        setChangeUp(diff >= 0)
        setOrderOdds(newClose)
        return newClose
      })

      setPositions(prev =>
        prev.map(p => ({
          ...p,
          pnl: Math.round((newClose - p.entry) * p.stake * (p.type === 'BUY' ? 1 : -1)),
        }))
      )

      if (chartRef.current) {
        chartRef.current.data.labels = candlesRef.current.map((_, i) => `B${i + 1}`)
        chartRef.current.data.datasets[0].data = candlesRef.current.map(c => c.c)
        chartRef.current.update('none')
      }
    }, 2000)

    return () => {
      clearInterval(intervalRef.current)
      chartRef.current?.destroy()
    }
  }, [])

  const placeOrder = (type) => {
    const newPos = {
      id: nextId,
      type,
      entry: parseFloat(orderOdds.toFixed(2)),
      stake,
      pnl: 0,
    }
    setPositions(prev => [...prev, newPos])
    setNextId(n => n + 1)
  }

  const exitPosition = (id) => {
    setPositions(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '16px 12px' : '28px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? 18 : 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
            MI vs CSK — Odds Trading
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            IPL 2026 · Over 14.3 · MI 128/4
          </p>
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(29,158,117,0.12)', color: '#0F6E56',
          fontSize: 12, fontWeight: 600, padding: '5px 12px',
          borderRadius: 20, border: '1px solid rgba(29,158,117,0.25)',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1D9E75', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
          LIVE
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Current Odds', val: currentOdds.toFixed(2), color: 'var(--text-primary)' },
          { label: 'Change', val: change, color: changeUp ? '#1D9E75' : '#E24B4A' },
          { label: 'Session High', val: '2.40', color: '#1D9E75' },
          { label: 'Session Low', val: '1.55', color: '#E24B4A' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 600, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Candlestick Chart */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            MI Win Odds — Candlestick
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {['1B', '2B', '5B', '1O'].map((tf, i) => (
              <button key={tf} style={{
                fontSize: 11, padding: '3px 8px', borderRadius: 6,
                border: '1px solid var(--border)',
                background: i === 0 ? 'var(--bg-elevated)' : 'transparent',
                color: i === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}>{tf}</button>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', width: '100%', height: 220 }}>
          <canvas ref={canvasRef} />
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 11, color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: BULL, display: 'inline-block' }} />
            Odds Badhi (Bullish)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: BEAR, display: 'inline-block' }} />
            Odds Giri (Bearish)
          </span>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>

        {/* Order Panel */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 14 }}>
            Place Order
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            <button onClick={() => placeOrder('BUY')} style={{
              padding: '11px', borderRadius: 10, border: 'none',
              background: '#1D9E75', color: '#fff',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'var(--font-display)',
            }}>
              BUY BACK
            </button>
            <button onClick={() => placeOrder('LAY')} style={{
              padding: '11px', borderRadius: 10, border: 'none',
              background: '#E24B4A', color: '#fff',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'var(--font-display)',
            }}>
              LAY
            </button>
          </div>

          {[
            { label: 'Odds', val: orderOdds.toFixed(2), setter: v => setOrderOdds(parseFloat(v)), step: '0.01' },
            { label: 'Stake (₹)', val: stake, setter: v => setStake(parseFloat(v)), step: '100' },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 5 }}>{f.label}</div>
              <input
                type="number" value={f.val} step={f.step}
                onChange={e => f.setter(e.target.value)}
                style={{
                  width: '100%', padding: '9px 12px',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  borderRadius: 9, color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)', fontSize: 14, outline: 'none',
                }}
              />
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Potential P&L</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#1D9E75' }}>
              +₹{payout.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Positions */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBott