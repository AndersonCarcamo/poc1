const db = require('../config/database');
const { AppError } = require('../utils/errorHandler');

class CompraService {
  async findAll(page = 1, limit = 10, estado = null) {
    try {
      const offset = (page - 1) * limit;
      
      // Construcción dinámica de filtro de estado
      const whereClause = estado ? `WHERE estado = $3` : '';
      
      const countQuery = `
        SELECT COUNT(*) as total_compras 
        FROM compra
        ${whereClause}
      `;
      
      const query = `
        SELECT 
          id, 
          usuario_id,
          metodo_pago,
          total_price, 
          fecha_compra,
          estado
        FROM compra
        ${whereClause}
        ORDER BY fecha_compra DESC
        LIMIT $1 OFFSET $2
      `;

      // Preparar parámetros dinámicamente
      const countParams = estado ? [estado] : [];
      const queryParams = estado 
        ? [limit, offset, estado] 
        : [limit, offset];

      const [comprasResult, countResult] = await Promise.all([
        db.query(query, queryParams),
        db.query(countQuery, countParams)
      ]);

      return {
        compras: comprasResult.rows,
        totalCompras: parseInt(countResult.rows[0].total_compras),
        paginaActual: page,
        totalPaginas: Math.ceil(countResult.rows[0].total_compras / limit)
      };
    } catch (error) {
      // Lanzar error personalizado
      throw new AppError(`Error al obtener compras: ${error.message}`, 500);
    }
  }

  async findById(id) {
    try {
      const compraQuery = `
        SELECT 
          c.id, 
          c.usuario_id,
          u.nombre AS nombre_usuario,
          u.email AS email_usuario,
          c.metodo_pago,
          c.total_price, 
          c.fecha_compra,
          c.estado,
          c.created_at,
          c.updated_at
        FROM compra c
        JOIN usuario u ON c.usuario_id = u.id
        WHERE c.id = $1
      `;

      const productosQuery = `
        SELECT 
          p.id AS producto_id,
          p.nombre AS nombre_producto,
          dc.cantidad,
          dc.precio_unitario,
          dc.subtotal
        FROM detalle_compra dc
        JOIN producto p ON dc.producto_id = p.id
        WHERE dc.compra_id = $1
      `;

      const [compraResult, productosResult] = await Promise.all([
        db.query(compraQuery, [id]),
        db.query(productosQuery, [id])
      ]);

      if (compraResult.rows.length === 0) {
        return null;
      }

      return {
        compra: compraResult.rows[0],
        productos: productosResult.rows
      };
    } catch (error) {
      // Lanzar error personalizado
      throw new AppError(`Error al obtener compra: ${error.message}`, 500);
    }
  }
}

module.exports = new CompraService();