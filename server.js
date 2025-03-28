const express = require("express");
const { Pool } = require("pg");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const compraRoutes = require("./src/routes/compraRoutes");
const productRoutes = require("./src/routes/productRoutes");
const { AppError, globalErrorHandler } = require("./src/utils/errorHandler");

const app = express();
app.use(express.json());

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
  apis: ["./server.js", "./src/routes/*.js"], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("/compras", compraRoutes); 
app.use("/products", productRoutes);

app.all("*", (req, res, next) => {
  next(
    new AppError(
      `No se puede encontrar ${req.originalUrl} en este servidor`,
      404
    )
  );
});

app.use(globalErrorHandler);

const PORT = 3000;
app.listen(PORT, "localhost", () => {
  console.log(`Servidor corriendo localmente en puerto ${PORT}`);
  console.log(`Documentación Swagger disponible en: http://localhost:${PORT}/api-docs`);
});