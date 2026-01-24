const express = require('express');
const router = express.Router();
const { 
    createCategory, 
    getCategories, 
    updateCategory, // New
    deleteCategory, // New
    createProduct, 
    getProducts,
    updateProduct, // New
    deleteProduct  // New
} = require('../controllers/inventoryController');

// Category Routes
router.post('/categories', createCategory);
router.get('/categories', getCategories);
router.put('/categories/:id', updateCategory); // Update
router.delete('/categories/:id', deleteCategory); // Delete

// Product Routes
router.post('/products', createProduct);
router.get('/products', getProducts);
router.put('/products/:id', updateProduct); // Update
router.delete('/products/:id', deleteProduct); // Delete

module.exports = router;