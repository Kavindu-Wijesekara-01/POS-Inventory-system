const express = require('express');
const router = express.Router();
const { 
    checkLoyalty, 
    addLoyaltyMember, 
    getAllMembers, // New
    updateMember,  // New
    deleteMember   // New
} = require('../controllers/loyaltyController');

router.post('/check', checkLoyalty);
router.post('/add', addLoyaltyMember);
router.get('/', getAllMembers);        // Get All List
router.put('/:id', updateMember);      // Edit
router.delete('/:id', deleteMember);   // Delete

module.exports = router;