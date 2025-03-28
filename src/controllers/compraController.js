const compraService = require('../services/compraService');
const { AppError, catchAsync } = require('../utils/errorHandler');

class CompraController {
  constructor() {
    // Bind methods to ensure correct context
    this.getAllCompras = this.getAllCompras.bind(this);
    this.getCompraById = this.getCompraById.bind(this);
  }

  // Envolver método con catchAsync
  getAllCompras(req, res, next) {
    return catchAsync(async (req, res, next) => {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const estado = req.query.estado;

      // Validaciones
      if (page < 1) {
        return next(new AppError('El número de página debe ser mayor a 0', 400));
      }

      if (limit < 1 || limit > 100) {
        return next(new AppError('Límite de página debe estar entre 1 y 100', 400));
      }

      const result = await compraService.findAll(page, limit, estado);
      res.json(result);
    })(req, res, next);
  }

  // Método similar para getCompraById
  getCompraById(req, res, next) {
    return catchAsync(async (req, res, next) => {
      const { id } = req.params;

      // Validar formato UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        return next(new AppError('ID de compra inválido', 400));
      }

      const result = await compraService.findById(id);

      if (!result) {
        return next(new AppError('Compra no encontrada', 404));
      }

      res.json(result);
    })(req, res, next);
  }
}

module.exports = new CompraController();