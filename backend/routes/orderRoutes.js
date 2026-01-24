const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getAnalytics, deleteOrder } = require('../controllers/orderController');

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/analytics', getAnalytics);
router.delete('/:id', deleteOrder); // <--- මේක අලුතෙන් දැම්මේ

module.exports = router;