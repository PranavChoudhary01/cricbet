const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/walletController');

router.get('/balance', auth, ctrl.balance);
router.get('/history', auth, ctrl.history);

module.exports = router;
