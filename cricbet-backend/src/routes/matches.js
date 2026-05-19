const router = require('express').Router();
const ctrl = require('../controllers/matchController');

router.get('/', ctrl.list);       // GET /api/matches?status=live
router.get('/:id', ctrl.getOne);  // GET /api/matches/:id

module.exports = router;
