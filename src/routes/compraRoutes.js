const express = require('express');
const compraController = require('../controllers/compraController');

const router = express.Router();

// Rutas de compras
router.get('/', compraController.getAllCompras);
router.get('/:id', compraController.getCompraById);

module.exports = router;