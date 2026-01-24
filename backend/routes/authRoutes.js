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
router.post('/register', registerUser); // Staff Add කරන්න
router.get('/staff', getAllStaff);      // Staff ලිස්ට් එක ගන්න
router.put('/staff/:id', updateStaff);  // Staff Update කරන්න
router.delete('/staff/:id', deleteStaff); // Staff Delete කරන්න

module.exports = router;