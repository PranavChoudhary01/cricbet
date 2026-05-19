const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/betController');
const auth = require('../middleware/auth');
const { betLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');

// Place a bet
router.post('/',
  auth,
  betLimiter,
  [
    body('match_id').isUUID().withMessage('Valid match_id chahiye'),
    body('selection').isIn(['team_a_win', 'draw', 'team_b_win']).withMessage('Invalid selection'),
    body('odds').isFloat({ min: 1.01, max: 1000 }).withMessage('Valid odds chahiye'),
    body('stake').isFloat({ min: 10 }).withMessage('Minimum stake ₹10 hai'),
  ],
  validate,
  ctrl.place
);

// My bet history
router.get('/my', auth, ctrl.myBets);

// Admin: settle bets after match result
router.post('/settle', auth, ctrl.settle);

module.exports = router;
