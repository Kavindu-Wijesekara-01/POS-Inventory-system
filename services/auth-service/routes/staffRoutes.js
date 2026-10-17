const express = require('express');
const router = express.Router();
const { getAllStaff, deleteStaff } = require('../controllers/authController');

// Staff Routes (under /api/staff prefix)
// Frontend StaffManagement.jsx calls GET /api/staff and DELETE /api/staff/:id
router.get('/', getAllStaff);
router.delete('/:id', deleteStaff);

module.exports = router;
