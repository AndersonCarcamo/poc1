const express = require('express');
const compraController = require('../controllers/compraController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Compras
 *   description: Gestión de compras
 */

/**
 * @swagger
 * /compras:
 *   get:
 *     summary: Obtiene lista paginada de compras
 *     tags: [Compras]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Límite de resultados por página
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *         description: Filtro por estado de compra
 *     responses:
 *       200:
 *         description: Lista de compras paginada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 compras:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Compra'
 *                 totalCompras:
 *                   type: integer
 *                 paginaActual:
 *                   type: integer
 *                 totalPaginas:
 *                   type: integer
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', compraController.getAllCompras);

/**
 * @swagger
 * /compras/{id}:
 *   get:
 *     summary: Obtiene una compra por su ID
 *     tags: [Compras]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID UUID de la compra
 *     responses:
 *       200:
 *         description: Detalle completo de la compra
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 compra:
 *                   $ref: '#/components/schemas/CompraDetalle'
 *                 productos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProductoCompra'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', compraController.getCompraById);

module.exports = router;