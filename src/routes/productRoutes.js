const express = require('express');
const productoController = require('../controllers/productController');

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: API para gestionar productos
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Producto:
 *       type: object
 *       required:
 *         - nombre
 *         - categoria_id
 *         - precio
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: UUID autogenerado del producto
 *         nombre:
 *           type: string
 *           description: Nombre del producto
 *         categoria_id:
 *           type: string
 *           format: uuid
 *           description: ID de la categoría a la que pertenece
 *         precio:
 *           type: number
 *           format: float
 *           description: Precio del producto
 *         stock:
 *           type: integer
 *           description: Cantidad en stock
 *           default: 0
 *         categoria_nombre:
 *           type: string
 *           description: Nombre de la categoría (solo en respuestas)
 *       example:
 *         id: 123e4567-e89b-12d3-a456-426614174000
 *         nombre: Camisa de Algodón
 *         categoria_id: 123e4567-e89b-12d3-a456-426614174001
 *         precio: 29.99
 *         stock: 100
 *         categoria_nombre: Ropa
 */

/**
 * @swagger
 * /products/category/{categoryName}/{id}:
 *   get:
 *     summary: Obtiene un producto específico dentro de una categoría
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: categoryName
 *         schema:
 *           type: string
 *         required: true
 *         description: Nombre de la categoría
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: UUID del producto
 *     responses:
 *       200:
 *         description: Detalles del producto en la categoría
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       404:
 *         description: Producto no encontrado en esta categoría
 *       500:
 *         description: Error del servidor
 */
router.get('/category/:categoryName/:id', productoController.getProductByCategoryAndId);

/**
 * @swagger
 * /products/category/{categoryName}:
 *   get:
 *     summary: Obtiene productos por categoría
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: categoryName
 *         schema:
 *           type: string
 *         required: true
 *         description: Nombre de la categoría
 *     responses:
 *       200:
 *         description: Lista de productos en la categoría
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Producto'
 *       500:
 *         description: Error del servidor
 */
router.get('/category/:categoryName', productoController.getProductsByCategory);

/**
 * @swagger
 * /products/{id}/stock:
 *   patch:
 *     summary: Actualiza solo el stock de un producto
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: UUID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stock
 *             properties:
 *               stock:
 *                 type: integer
 *                 description: Nuevo valor del stock
 *     responses:
 *       200:
 *         description: Stock actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       400:
 *         description: Datos inválidos o faltantes
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.patch('/:id/stock', productoController.updateStock);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Obtiene un producto por su ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: UUID del producto
 *     responses:
 *       200:
 *         description: Detalles del producto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', productoController.getProductById);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Actualiza un producto existente
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: UUID del producto a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               categoria_id:
 *                 type: string
 *                 format: uuid
 *               precio:
 *                 type: number
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       400:
 *         description: Datos inválidos o ningún campo para actualizar
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', productoController.updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Elimina un producto
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: UUID del producto a eliminar
 *     responses:
 *       204:
 *         description: Producto eliminado exitosamente
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', productoController.deleteProduct);

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Obtiene todos los productos o filtra por nombre
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filtro por nombre del producto
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Producto'
 *       500:
 *         description: Error del servidor
 */
router.get('/', productoController.getAllProducts);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Crea un nuevo producto
 *     tags: [Productos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - categoria_id
 *               - precio
 *             properties:
 *               nombre:
 *                 type: string
 *               categoria_id:
 *                 type: string
 *                 format: uuid
 *               precio:
 *                 type: number
 *               stock:
 *                 type: integer
 *                 default: 0
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       400:
 *         description: Datos inválidos o faltantes
 *       500:
 *         description: Error del servidor
 */
router.post('/', productoController.createProduct);

module.exports = router;