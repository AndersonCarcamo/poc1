const express = require("express");

const cors = require("cors");

const { Pool } = require("pg");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const compraRoutes = require("./src/routes/compraRoutes");
const productRoutes = require("./src/routes/productRoutes");
const { AppError, globalErrorHandler } = require("./src/utils/errorHandler");


const connectDB = require("./config/db"); // Para MongoDB
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;
// Conectar a MongoDB
connectDB();

app.use(express.json());

// cors
app.use(cors({
  origin: "http://127.0.0.1:8080",
  credentials: true
}));

const swaggerOptions = {
    swaggerDefinition: {
      openapi: "3.0.0",
      info: {
        title: "API de Farmacia",
        description: "API para gestión de compras y productos",
        version: "1.0.0",
        contact: {
          name: "Soporte Técnico",
          email: "soporte@mfarma.com",
        },
        servers: [
          {
            url: "http://localhost:3000",
            description: "Servidor de desarrollo",
          },
        ],
      },
      components: {
        schemas: {
          Compra: {
            type: "object",
            properties: {
              id: {
                type: "string",
                format: "uuid"
              },
              usuario_id: {
                type: "string",
                format: "uuid"
              },
              metodo_pago: {
                type: "string"
              },
              total_price: {
                type: "number",
                format: "decimal"
              },
              fecha_compra: {
                type: "string",
                format: "date-time"
              },
              estado: {
                type: "string"
              }
            }
          },
          CompraDetalle: {
            type: "object",
            properties: {
              id: {
                type: "string",
                format: "uuid"
              },
              usuario_id: {
                type: "string",
                format: "uuid"
              },
              nombre_usuario: {
                type: "string"
              },
              email_usuario: {
                type: "string",
                format: "email"
              },
              metodo_pago: {
                type: "string"
              },
              total_price: {
                type: "number",
                format: "decimal"
              },
              fecha_compra: {
                type: "string",
                format: "date-time"
              },
              estado: {
                type: "string"
              }
            }
          },
          ProductoCompra: {
            type: "object",
            properties: {
              producto_id: {
                type: "string",
                format: "uuid"
              },
              nombre_producto: {
                type: "string"
              },
              cantidad: {
                type: "integer"
              },
              precio_unitario: {
                type: "number",
                format: "decimal"
              },
              subtotal: {
                type: "number",
                format: "decimal"
              }
            }
          }
        },
        responses: {
          BadRequest: {
            description: "Parámetros inválidos",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string"
                    },
                    message: {
                      type: "string"
                    }
                  },
                  example: {
                    status: "fail",
                    message: "Error de validación"
                  }
                }
              }
            }
          },
          NotFound: {
            description: "Recurso no encontrado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string"
                    },
                    message: {
                      type: "string"
                    }
                  },
                  example: {
                    status: "fail",
                    message: "Compra no encontrada"
                  }
                }
              }
            }
          },
          ServerError: {
            description: "Error interno del servidor",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string"
                    },
                    message: {
                      type: "string"
                    }
                  },
                  example: {
                    status: "error",
                    message: "Error interno del servidor"
                  }
                }
              }
            }
          }
        }
      }
    },
    apis: ["./server.js", "./src/routes/*.js"],
  };

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("/compras", compraRoutes); 
app.use("/products", productRoutes);

app.use('/api/auth', authRoutes);

app.all("*", (req, res, next) => {
  next(
    new AppError(
      `No se puede encontrar ${req.originalUrl} en este servidor`,
      404
    )
  );
});

app.use(globalErrorHandler);

app.listen(PORT, "localhost", () => {
  console.log(`Servidor corriendo localmente en puerto ${PORT}`);
  console.log(`Documentación Swagger disponible en: http://localhost:${PORT}/api-docs`);
});