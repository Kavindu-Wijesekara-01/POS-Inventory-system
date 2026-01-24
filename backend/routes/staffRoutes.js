const express = require('express');
const router = express.Router();
const { getAllStaff, addStaff, deleteStaff } = require('../controllers/staffController');

router.get('/', getAllStaff);
router.post('/', addStaff);
router.delete('/:id', deleteStaff);

module.exports = router;