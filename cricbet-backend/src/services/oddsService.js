const redis = require('../config/redis');
const db = require('../config/database');

const ODDS_TTL = 5; // seconds

class OddsService {
  // Redis cache se odds fetch karo
  static async getForMatch(matchId) {
    const cacheKey = `odds:${matchId}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const odds = await db('odds')
      .where({ match_id: matchId })
      .select('selection_type', 'odds_value', 'is_suspended');

    await redis.setEx(cacheKey, ODDS_TTL, JSON.stringify(odds));
    return odds;
  }

  // Odds update + cache invalidate + socket broadcast
  static async update(matchId, selection, newOdds, io) {
    await db('odds')
      .where({ match_id: matchId, selection_type: selection })
      .update({ odds_value: newOdds, updated_at: new Date() });

    await redis.del(`odds:${matchId}`);

    if (io) {
      io.to(`match:${matchId}`).emit('odds_update', {
        matchId,
        selection,
        newOdds,
        timestamp: Date.now(),
      });
    }
  }

  // Match shuru hone pe ya kisi event pe odds suspend karo
  static async suspend(matchId) {
    await db('odds').where({ match_id: matchId }).update({ is_suspended: true });
    await redis.del(`odds:${matchId}`);
  }

  static async resume(matchId) {
    await db('odds').where({ match_id: matchId }).update({ is_suspended: false });
    await redis.del(`odds:${matchId}`);
  }
}

module.exports = OddsService;
