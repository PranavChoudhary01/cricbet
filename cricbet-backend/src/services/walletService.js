const db = require('../config/database');

class WalletService {
  static async deposit(userId, amount, paymentRef) {
    return db.transaction(async (trx) => {
      const user = await trx('users').where({ id: userId }).forUpdate().first();

      await trx('users').where({ id: userId }).increment('wallet_balance', amount);

      await trx('transactions').insert({
        user_id: userId,
        type: 'deposit',
        amount,
        reference_id: paymentRef,
        balance_before: user.wallet_balance,
        balance_after: parseFloat(user.wallet_balance) + amount,
      });
    });
  }

  static async getHistory(userId) {
    return db('transactions')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .limit(50);
  }
}

module.exports = WalletService;
