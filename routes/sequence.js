const express = require('express');
const router = express.Router();
const seqController = require('../controllers/seqController')

router.post('/newseq', seqController.newSeq);
router.patch('/resetseq', seqController.resetSeq)
router.get('/nano', seqController.nano)

module.exports = router;