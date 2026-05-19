const jwt = require('jsonwebtoken');

module.exports = (io) => {
  // Socket auth middleware — logged in users ke liye userId attach karo
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
      }
      next(); // Guest bhi connect kar sakte hain (read-only)
    } catch {
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (user: ${socket.userId || 'guest'})`);

    // User match room mein join karta hai live odds ke liye
    socket.on('join_match', (matchId) => {
      socket.join(`match:${matchId}`);
    });

    socket.on('leave_match', (matchId) => {
      socket.leave(`match:${matchId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

// Frontend usage example:
// const socket = io('http://localhost:3000', { auth: { token: 'Bearer ...' } });
// socket.emit('join_match', 'match-uuid-here');
// socket.on('odds_update', ({ selection, newOdds }) => { updateUI(selection, newOdds); });
