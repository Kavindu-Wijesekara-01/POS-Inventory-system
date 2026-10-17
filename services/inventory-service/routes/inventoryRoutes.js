const express = require('express');
const router = express.Router();
const { 
    createCategory, 
    getCategories, 
    updateCategory,
    deleteCategory,
    createProduct, 
    getProducts,
    updateProduct,
    deleteProduct
} = require('../controllers/inventoryController');

// Category Routes
router.post('/categories', createCategory);
router.get('/categories', getCategories);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Product Routes
router.post('/products', createProduct);
router.get('/products', getProducts);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;
