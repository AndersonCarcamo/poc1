const express = require("express");

const { Pool } = require("pg");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const compraRoutes = require("./src/routes/compraRoutes");

const app = express();
app.use(express.json());

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Manejador global de errores
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: process.env.NODE_ENV === "development" ? err.stack : {},
  });
};

// Rutas
app.use("/compras", compraRoutes);
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "API de Productos",
      description: "API para gestionar productos y categorías",
      version: "1.0.0",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Servidor de desarrollo",
        },
      ],
    },
  },
  apis: ["./server.js"], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Manejador de rutas no encontradas
app.all("*", (req, res, next) => {
  next(
    new AppError(
      `No se puede encontrar ${req.originalUrl} en este servidor`,
      404
    )
  );
});

// Manejador global de errores
app.use(globalErrorHandler);

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
 * tags:
 *   name: Productos
 *   description: API para gestionar productos
 */

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
app.get("/products", async (req, res) => {
  try {
    // Si hay un parámetro de búsqueda por nombre
    if (req.query.name) {
      const { rows } = await pool.query(
        "SELECT p.*, c.nombre as categoria_nombre FROM producto p " +
          "JOIN categoria c ON p.categoria_id = c.id " +
          "WHERE p.nombre ILIKE $1",
        [`%${req.query.name}%`]
      );
      return res.json(rows);
    }

    // Si no hay parámetros, devolver todos los productos
    const { rows } = await pool.query(
      "SELECT p.*, c.nombre as categoria_nombre FROM producto p " +
        "JOIN categoria c ON p.categoria_id = c.id"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

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
app.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      "SELECT p.*, c.nombre as categoria_nombre FROM producto p " +
        "JOIN categoria c ON p.categoria_id = c.id " +
        "WHERE p.id = $1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    res.status(500).json({ error: "Error al obtener el producto" });
  }
});

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
app.get("/products/category/:categoryName", async (req, res) => {
  try {
    const { categoryName } = req.params;
    const { rows } = await pool.query(
      "SELECT p.*, c.nombre as categoria_nombre FROM producto p " +
        "JOIN categoria c ON p.categoria_id = c.id " +
        "WHERE c.nombre ILIKE $1",
      [`%${categoryName}%`]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener productos por categoría:", error);
    res.status(500).json({ error: "Error al obtener productos por categoría" });
  }
});

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
app.get("/products/category/:categoryName/:id", async (req, res) => {
  try {
    const { categoryName, id } = req.params;
    const { rows } = await pool.query(
      "SELECT p.*, c.nombre as categoria_nombre FROM producto p " +
        "JOIN categoria c ON p.categoria_id = c.id " +
        "WHERE c.nombre ILIKE $1 AND p.id = $2",
      [`%${categoryName}%`, id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Producto no encontrado en esta categoría" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener el producto de la categoría:", error);
    res
      .status(500)
      .json({ error: "Error al obtener el producto de la categoría" });
  }
});

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
app.post("/products", async (req, res) => {
  try {
    const { nombre, categoria_id, precio, stock } = req.body;

    if (!nombre || !categoria_id || !precio) {
      return res
        .status(400)
        .json({ error: "Nombre, categoría y precio son campos obligatorios" });
    }

    const categoriaCheck = await pool.query(
      "SELECT id FROM categoria WHERE id = $1",
      [categoria_id]
    );
    if (categoriaCheck.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "La categoría especificada no existe" });
    }

    const { rows } = await pool.query(
      "INSERT INTO producto (nombre, categoria_id, precio, stock) VALUES ($1, $2, $3, $4) RETURNING *",
      [nombre, categoria_id, precio, stock || 0]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error al crear el producto:", error);
    res.status(500).json({ error: "Error al crear el producto" });
  }
});

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
app.put("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, categoria_id, precio, stock } = req.body;

    const productoCheck = await pool.query(
      "SELECT id FROM producto WHERE id = $1",
      [id]
    );
    if (productoCheck.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    if (categoria_id) {
      const categoriaCheck = await pool.query(
        "SELECT id FROM categoria WHERE id = $1",
        [categoria_id]
      );
      if (categoriaCheck.rows.length === 0) {
        return res
          .status(400)
          .json({ error: "La categoría especificada no existe" });
      }
    }

    let query = "UPDATE producto SET ";
    const values = [];
    const updateFields = [];

    if (nombre !== undefined) {
      values.push(nombre);
      updateFields.push(`nombre = $${values.length}`);
    }

    if (categoria_id !== undefined) {
      values.push(categoria_id);
      updateFields.push(`categoria_id = $${values.length}`);
    }

    if (precio !== undefined) {
      values.push(precio);
      updateFields.push(`precio = $${values.length}`);
    }

    if (stock !== undefined) {
      values.push(stock);
      updateFields.push(`stock = $${values.length}`);
    }

    // Si no hay campos para actualizar
    if (updateFields.length === 0) {
      return res
        .status(400)
        .json({ error: "No se proporcionaron campos para actualizar" });
    }

    query += updateFields.join(", ");
    values.push(id);
    query += ` WHERE id = $${values.length} RETURNING *`;

    const { rows } = await pool.query(query, values);
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
});

/**
 * @swagger
 * /products/{id}/stock:
 *   patch:
 *     summary: Actualiza soo el stock de un producto
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: UUID d producto
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
app.patch("/products/:id/stock", async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined) {
      return res
        .status(400)
        .json({ error: "El stock es un campo obligatorio" });
    }

    //Verificar si producto existe
    const productoCheck = await pool.query(
      "SELECT id FROM producto WHERE id = $1",
      [id]
    );
    if (productoCheck.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const { rows } = await pool.query(
      "UPDATE producto SET stock = $1 WHERE id = $2 RETURNING *",
      [stock, id]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al actualizar el stock:", error);
    res.status(500).json({ error: "Error al actualizar el stock" });
  }
});

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
app.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el producto existe
    const productoCheck = await pool.query(
      "SELECT id FROM producto WHERE id = $1",
      [id]
    );
    if (productoCheck.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    await pool.query("DELETE FROM producto WHERE id = $1", [id]);
    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
});

const PORT = 3000;
app.listen(PORT, "localhost", () => {
  console.log(`Servidor corriendo localmente en puerto ${PORT}`);
  console.log(`Documentación Swagger disponible en: http://localhost:${PORT}/api-docs`);

});
