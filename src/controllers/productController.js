const productoService = require('../services/productService');
const { AppError, catchAsync } = require('../utils/errorHandler');

class ProductoController {
  constructor() {
    this.getAllProducts = this.getAllProducts.bind(this);
    this.getProductById = this.getProductById.bind(this);
    this.getProductsByCategory = this.getProductsByCategory.bind(this);
    this.getProductByCategoryAndId = this.getProductByCategoryAndId.bind(this);
    this.createProduct = this.createProduct.bind(this);
    this.updateProduct = this.updateProduct.bind(this);
    this.updateStock = this.updateStock.bind(this);
    this.deleteProduct = this.deleteProduct.bind(this);
  }

  getAllProducts(req, res, next) {
    return catchAsync(async (req, res, next) => {
      const name = req.query.name;
      const result = await productoService.findAll(name);
      res.json(result);
    })(req, res, next);
  }

  getProductById(req, res, next) {
    return catchAsync(async (req, res, next) => {
      const { id } = req.params;

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        return next(new AppError('ID de producto inválido', 400));
      }
      
      const result = await productoService.findById(id);
      
      if (!result) {
        return next(new AppError('Producto no encontrado', 404));
      }
      
      res.json(result);
    })(req, res, next);
  }

  getProductsByCategory(req, res, next) {
    return catchAsync(async (req, res, next) => {
      const { categoryName } = req.params;
      const result = await productoService.findByCategory(categoryName);
      res.json(result);
    })(req, res, next);
  }

  getProductByCategoryAndId(req, res, next) {
    return catchAsync(async (req, res, next) => {
      const { categoryName, id } = req.params;
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        return next(new AppError('ID de producto inválido', 400));
      }
      
      const result = await productoService.findByCategoryAndId(categoryName, id);
      
      if (!result) {
        return next(new AppError('Producto no encontrado en esta categoría', 404));
      }
      
      res.json(result);
    })(req, res, next);
  }

  createProduct(req, res, next) {
    return catchAsync(async (req, res, next) => {
      const { nombre, categoria_id, precio, stock } = req.body;
      
      if (!nombre) {
        return next(new AppError('El nombre del producto es obligatorio', 400));
      }
      
      if (!categoria_id) {
        return next(new AppError('La categoría es obligatoria', 400));
      }
      
      if (!precio || isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) {
        return next(new AppError('El precio debe ser un número positivo', 400));
      }
      
      const result = await productoService.create(nombre, categoria_id, precio, stock);
      res.status(201).json(result);
    })(req, res, next);
  }

  updateProduct(req, res, next) {
    return catchAsync(async (req, res, next) => {
      const { id } = req.params;
      const { nombre, categoria_id, precio, stock } = req.body;
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        return next(new AppError('ID de producto inválido', 400));
      }
      
      if (!nombre && !categoria_id && precio === undefined && stock === undefined) {
        return next(new AppError('Se debe proporcionar al menos un campo para actualizar', 400));
      }
      
      const result = await productoService.update(id, { nombre, categoria_id, precio, stock });
      
      if (!result) {
        return next(new AppError('Producto no encontrado', 404));
      }
      
      res.json(result);
    })(req, res, next);
  }

  updateStock(req, res, next) {
    return catchAsync(async (req, res, next) => {
      const { id } = req.params;
      const { stock } = req.body;
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        return next(new AppError('ID de producto inválido', 400));
      }
      
      if (stock === undefined || isNaN(parseInt(stock)) || parseInt(stock) < 0) {
        return next(new AppError('El stock debe ser un número no negativo', 400));
      }
      
      const result = await productoService.updateStock(id, stock);
      
      if (!result) {
        return next(new AppError('Producto no encontrado', 404));
      }
      
      res.json(result);
    })(req, res, next);
  }

  deleteProduct(req, res, next) {
    return catchAsync(async (req, res, next) => {
      const { id } = req.params;
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        return next(new AppError('ID de producto inválido', 400));
      }
      
      const success = await productoService.delete(id);
      
      if (!success) {
        return next(new AppError('Producto no encontrado', 404));
      }
      
      res.status(204).send();
    })(req, res, next);
  }
}

module.exports = new ProductoController();