const db = require('../config/database');
const OddsService = require('../services/oddsService');

exports.list = async (req, res, next) => {
  try {
    const { status = 'live' } = req.query;
    const matches = await db('matches')
      .where({ status })
      .orderBy('start_time', 'asc');

    const matchesWithOdds = await Promise.all(
      matches.map(async (m) => ({
        ...m,
        odds: await OddsService.getForMatch(m.id),
      }))
    );
    res.json(matchesWithOdds);
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const match = await db('matches').where({ id: req.params.id }).first();
    if (!match) return res.status(404).json({ error: 'Match not found' });

    const odds = await OddsService.getForMatch(match.id);
    res.json({ ...match, odds });
  } catch (err) { next(err); }
};
