const db = require('../config/database');

class Bet {
  static async place({ userId, matchId, selection, oddsValue, stake }) {
    const potentialPayout = parseFloat((stake * oddsValue).toFixed(2));

    return db.transaction(async (trx) => {
      // 1. Lock odds row + check suspended
      const odds = await trx('odds')
        .where({ match_id: matchId, selection_type: selection })
        .forUpdate()
        .first();

      if (!odds || odds.is_suspended) throw new Error('Odds are suspended');

      // Odds changed check (user ke paas stale odds hain toh reject)
      if (parseFloat(odds.odds_value) !== parseFloat(oddsValue))
        throw new Error('Odds have changed, please refresh and try again');

      // 2. Match open hai?
      const match = await trx('matches').where({ id: matchId }).first();
      if (!['upcoming', 'live'].includes(match.status))
        throw new Error('Betting is closed for this match');

      // 3. Lock user wallet + balance check
      const user = await trx('users').where({ id: userId }).forUpdate().first();
      if (user.wallet_balance < stake) throw new Error('Insufficient balance');

      // 4. Deduct stake
      await trx('users').where({ id: userId }).decrement('wallet_balance', stake);

      // 5. Bet record
      const [bet] = await trx('bets')
        .insert({
          user_id: userId,
          match_id: matchId,
          selection,
          odds_at_placement: oddsValue,   // snapshot — baad mein change ho sakti hai
          stake_amount: stake,
          potential_payout: potentialPayout,
          status: 'pending',
        })
        .returning('*');

      // 6. Transaction audit log
      await trx('transactions').insert({
        user_id: userId,
        type: 'bet_placed',
        amount: -stake,
        reference_id: bet.id,
        balance_before: user.wallet_balance,
        balance_after: parseFloat(user.wallet_balance) - stake,
      });

      return bet;
    });
  }

  static async getByUser(userId, { page = 1, limit = 20 } = {}) {
    return db('bets')
      .where({ 'bets.user_id': userId })
      .join('matches', 'bets.match_id', 'matches.id')
      .select(
        'bets.*',
        'matches.team_a',
        'matches.team_b',
        'matches.match_type',
        'matches.start_time'
      )
      .orderBy('bets.created_at', 'desc')
      .limit(limit)
      .offset((page - 1) * limit);
  }

  // Match result aane ke baad settle karo
  static async settle(matchId, winningSelection) {
    const pending = await db('bets').where({ match_id: matchId, status: 'pending' });

    for (const bet of pending) {
      await db.transaction(async (trx) => {
        const won = bet.selection === winningSelection;

        await trx('bets').where({ id: bet.id }).update({
          status: won ? 'won' : 'lost',
          settled_at: new Date(),
        });

        if (won) {
          const user = await trx('users').where({ id: bet.user_id }).first();
          await trx('users')
            .where({ id: bet.user_id })
            .increment('wallet_balance', bet.potential_payout);

          await trx('transactions').insert({
            user_id: bet.user_id,
            type: 'bet_won',
            amount: bet.potential_payout,
            reference_id: bet.id,
            balance_before: user.wallet_balance,
            balance_after: parseFloat(user.wallet_balance) + parseFloat(bet.potential_payout),
          });
        }
      });
    }
  }
}

module.exports = Bet;
