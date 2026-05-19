# CricBet Backend 🏏

Node.js + PostgreSQL + Redis cricket betting platform backend.

## Quick Setup

```bash
# 1. Dependencies install karo
npm install

# 2. .env banao
cp .env.example .env
# .env mein apni DB/Redis credentials bharo

# 3. PostgreSQL mein database banao
createdb cricbet_db

# 4. Migrations run karo (tables banenge)
npm run migrate

# 5. Server start karo
npm run dev
```

## Folder Structure

```
cricbet/
├── src/
│   ├── server.js            ← Entry point
│   ├── config/
│   │   ├── database.js      ← PostgreSQL (Knex)
│   │   ├── redis.js         ← Redis client
│   │   └── logger.js        ← Winston logs
│   ├── middleware/
│   │   ├── auth.js          ← JWT verification
│   │   ├── rateLimiter.js   ← API + bet rate limits
│   │   ├── errorHandler.js  ← Global error handler
│   │   └── validate.js      ← Request validation
│   ├── models/
│   │   ├── User.js          ← User CRUD + password hashing
│   │   └── Bet.js           ← Bet placement + settlement (ACID transactions)
│   ├── services/
│   │   ├── oddsService.js   ← Redis-cached odds + Socket broadcast
│   │   └── walletService.js ← Deposit/withdrawal
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── betController.js
│   │   ├── matchController.js
│   │   └── walletController.js
│   ├── routes/
│   │   ├── auth.js          ← POST /api/auth/register|login
│   │   ├── bets.js          ← POST /api/bets, GET /api/bets/my
│   │   ├── matches.js       ← GET /api/matches
│   │   └── wallet.js        ← GET /api/wallet/balance|history
│   └── socket/
│       └── index.js         ← Socket.io rooms + events
└── scripts/
    └── migrations/
        └── 001_initial.js   ← All DB tables
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | No | New user register |
| POST | /api/auth/login | No | Login → JWT token |
| GET | /api/auth/me | Yes | Apna profile dekho |
| GET | /api/matches | No | Live/upcoming matches |
| GET | /api/matches/:id | No | Single match + odds |
| POST | /api/bets | Yes | Bet place karo |
| GET | /api/bets/my | Yes | Apni bets dekho |
| GET | /api/wallet/balance | Yes | Balance check |
| GET | /api/wallet/history | Yes | Transaction history |

## Socket Events

```js
// Client se
socket.emit('join_match', matchId)   // Match room join karo
socket.emit('leave_match', matchId)  // Room leave karo

// Server se (real-time)
socket.on('odds_update', { matchId, selection, newOdds })
```

## Key Features

- **ACID Transactions** — Bet place karte waqt race conditions nahi
- **Odds Snapshot** — Bet time ki odds save hoti hain permanently
- **Redis Cache** — Odds 5 seconds cache mein, DB load kam
- **Idempotency** — Double click se double bet nahi
- **Rate Limiting** — 1 bet per second per user

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL + Knex.js ORM
- **Cache**: Redis
- **Auth**: JWT + bcrypt
- **Real-time**: Socket.io
- **Validation**: express-validator
- **Logs**: Winston
