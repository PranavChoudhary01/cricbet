const Bet = require('../models/Bet');
const { v4: uuidv4 } = require('uuid');
const redis = require('../config/redis');

exports.place = async (req, res, next) => {
  try {
    const { match_id, selection, odds, stake, idempotency_key } = req.body;

    // Idempotency check — double click se double bet nahi
    const ikey = idempotency_key || uuidv4();
    const existing = await redis.get(`ikey:${req.user.id}:${ikey}`);
    if (existing) return res.status(409).json({ error: 'Duplicate request detected' });

    const MIN = parseFloat(process.env.MIN_BET_AMOUNT || 10);
    const MAX = parseFloat(process.env.MAX_BET_AMOUNT || 100000);
    if (stake < MIN || stake > MAX)
      return res.status(400).json({ error: `Stake must be between ₹${MIN} and ₹${MAX}` });

    const bet = await Bet.place({
      userId: req.user.id,
      matchId: match_id,
      selection,
      oddsValue: odds,
      stake,
    });

    // Idempotency key 10 min ke liye store karo
    await redis.setEx(`ikey:${req.user.id}:${ikey}`, 600, bet.id);

    res.status(201).json({ bet, message: 'Bet placed successfully! Good luck 🏏' });
  } catch (err) {
    const knownErrors = [
      'Insufficient balance',
      'Odds are suspended',
      'Odds have changed',
      'Betting is closed',
    ];
    if (knownErrors.some((msg) => err.message.includes(msg))) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

exports.myBets = async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    const bets = await Bet.getByUser(req.user.id, { page: parseInt(page) });
    res.json(bets);
  } catch (err) { next(err); }
};

// Admin only — match result ke baad call karo
exports.settle = async (req, res, next) => {
  try {
    const { match_id, winning_selection } = req.body;
    await Bet.settle(match_id, winning_selection);
    res.json({ message: `Bets settled. Winner: ${winning_selection}` });
  } catch (err) { next(err); }
};
