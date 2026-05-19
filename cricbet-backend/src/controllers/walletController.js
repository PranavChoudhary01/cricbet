const WalletService = require('../services/walletService');
const User = require('../models/User');

exports.balance = async (req, res) => {
  const balance = await User.getBalance(req.user.id);
  res.json({ balance });
};

exports.history = async (req, res, next) => {
  try {
    const history = await WalletService.getHistory(req.user.id);
    res.json(history);
  } catch (err) { next(err); }
};
