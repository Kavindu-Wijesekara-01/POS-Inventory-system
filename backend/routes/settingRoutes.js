const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingController');

router.get('/', getSettings);
router.put('/', updateSettings);

module.exports = router;