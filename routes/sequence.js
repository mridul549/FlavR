const express = require('express');
const router = express.Router();
const seqController = require('../controllers/seqController')

router.post('/newseq', seqController.newSeq);


module.exports = router;