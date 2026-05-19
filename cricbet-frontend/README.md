# CricBet Frontend 🏏

React + Vite | Dark Premium Theme

## Quick Start

```bash
npm install
npm run dev
# Opens on http://localhost:5173
```

## Pages

| Route | Page | Auth |
|---|---|---|
| `/` | Live Matches + Bet Slip | No |
| `/ipl` | IPL Matches | No |
| `/login` | Login | No |
| `/register` | Register | No |
| `/my-bets` | Bet History | Yes |
| `/wallet` | Wallet & Transactions | Yes |

## Folder Structure

```
src/
├── App.jsx                     ← Router + Toaster
├── main.jsx                    ← Entry point
├── index.css                   ← Design tokens + global styles
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx          ← Sticky navbar + wallet balance
│   │   └── ProtectedRoute.jsx  ← Auth guard
│   ├── match/
│   │   └── MatchCard.jsx       ← Match card with live odds (Socket.io)
│   └── bet/
│       └── BetSlip.jsx         ← Bet slip sidebar
├── pages/
│   ├── HomePage.jsx            ← Match listing + filters
│   ├── LoginPage.jsx           ← Login form
│   ├── RegisterPage.jsx        ← Register + password strength
│   ├── MyBetsPage.jsx          ← Bet history + P&L stats
│   └── WalletPage.jsx          ← Balance, Deposit, Withdraw, History
├── store/
│   ├── authStore.js            ← Zustand: user auth state
│   └── betStore.js             ← Zustand: bet slip state
└── services/
    ├── api.js                  ← Axios with JWT interceptors
    └── socket.js               ← Socket.io client (live odds)
```

## Backend Connect Karna

1. `src/services/api.js` — baseURL already `/api` pe hai, Vite proxy forward karega
2. `vite.config.js` — proxy `http://localhost:3000` pe set hai (backend port)
3. `src/pages/HomePage.jsx` — commented `useEffect` uncomment karo (mock data hata do)
4. `src/pages/MyBetsPage.jsx` — same, useEffect uncomment karo

## Design System

```css
--accent:       #c8f135   /* Electric lime */
--bg-base:      #080b0f   /* Near black */
--bg-surface:   #0e1318
--bg-elevated:  #141b22
--font-display: 'Syne'    /* Headers */
--font-body:    'DM Sans' /* Body text */
--font-mono:    'DM Mono' /* Numbers/odds */
```

## Next Step — Razorpay

`WalletPage.jsx` mein `handleDeposit()` function mein Razorpay integration add karna hai.
Uske liye `cricbet-backend` wala ZIP dekho.
