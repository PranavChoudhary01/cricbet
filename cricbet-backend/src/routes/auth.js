const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const auth = require('../middleware/auth');

router.post('/register',
  authLimiter,
  [
    body('username').trim().isLength({ min: 3, max: 20 }).withMessage('Username 3-20 chars hona chahiye'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email chahiye'),
    body('password').isLength({ min: 8 }).withMessage('Password min 8 chars'),
  ],
  validate,
  ctrl.register
);

router.post('/login',
  authLimiter,
  [
    body('email').isEmail(),
    body('password').notEmpty(),
  ],
  validate,
  ctrl.login
);

router.get('/me', auth, ctrl.me);

module.exports = router;
