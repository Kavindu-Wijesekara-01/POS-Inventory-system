const express = require('express');
const router = express.Router();
const { 
    loginUser, 
    registerUser, 
    getAllStaff, 
    updateStaff, 
    deleteStaff 
} = require('../controllers/authController');

// Routes
router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/staff', getAllStaff);
router.put('/staff/:id', updateStaff);
router.delete('/staff/:id', deleteStaff);

module.exports = router;
