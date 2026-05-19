require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./config/logger');
const redis = require('./config/redis');

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(apiLimiter);

app.use('/api/auth',    require('./routes/auth'));
app.use('/api/bets',    require('./routes/bets'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/wallet',  require('./routes/wallet'));

app.get('/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

require('./socket')(io);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const start = async () => {
  await redis.connect();

  // Auto migrate on startup
  const db = require('./config/database')
  await db.migrate.latest()
  logger.info('Database migrations complete ✅')

  httpServer.listen(PORT, () => {
    logger.info(`🏏 CricBet server running on http://localhost:${PORT}`);
  });
};

start().catch((err) => {
  console.error('Startup failed:', err);
  process.exit(1);
});