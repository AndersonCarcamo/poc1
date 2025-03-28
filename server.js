const express = require('express');
require('dotenv').config();

// server.js
const { AppError, globalErrorHandler } = require('./src/utils/errorHandler');
const compraRoutes = require('./src/routes/compraRoutes');

const app = express();

// Middlewares
app.use(express.json());

// Rutas
app.use('/compras', compraRoutes);

// Manejador de rutas no encontradas
app.all('*', (req, res, next) => {
  next(new AppError(`No se puede encontrar ${req.originalUrl} en este servidor`, 404));
});

// Manejador global de errores
app.use(globalErrorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});