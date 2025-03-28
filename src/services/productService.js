const db = require('../config/database');
const { AppError } = require('../utils/errorHandler');

class ProductoService {
  async findAll(name = null) {
    try {
      let query, params;
      
      if (name) {
        query = `
          SELECT p.*, c.nombre as categoria_nombre 
          FROM producto p 
          JOIN categoria c ON p.categoria_id = c.id 
          WHERE p.nombre ILIKE $1
        `;
        params = [`%${name}%`];
      } else {
        query = `
          SELECT p.*, c.nombre as categoria_nombre 
          FROM producto p 
          JOIN categoria c ON p.categoria_id = c.id
        `;
        params = [];
      }
      
      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw new AppError(`Error al obtener productos: ${error.message}`, 500);
    }
  }

  async findById(id) {
    try {
      const query = `
        SELECT p.*, c.nombre as categoria_nombre 
        FROM producto p 
        JOIN categoria c ON p.categoria_id = c.id 
        WHERE p.id = $1
      `;
      
      const result = await db.query(query, [id]);
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      throw new AppError(`Error al obtener producto: ${error.message}`, 500);
    }
  }

  async findByCategory(categoryName) {
    try {
      const query = `
        SELECT p.*, c.nombre as categoria_nombre 
        FROM producto p 
        JOIN categoria c ON p.categoria_id = c.id 
        WHERE c.nombre ILIKE $1
      `;
      
      const result = await db.query(query, [`%${categoryName}%`]);
      return result.rows;
    } catch (error) {
      throw new AppError(`Error al obtener productos por categoría: ${error.message}`, 500);
    }
  }

  async findByCategoryAndId(categoryName, id) {
    try {
      const query = `
        SELECT p.*, c.nombre as categoria_nombre 
        FROM producto p 
        JOIN categoria c ON p.categoria_id = c.id 
        WHERE c.nombre ILIKE $1 AND p.id = $2
      `;
      
      const result = await db.query(query, [`%${categoryName}%`, id]);
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      throw new AppError(`Error al obtener producto de la categoría: ${error.message}`, 500);
    }
  }

  async create(nombre, categoria_id, precio, stock = 0) {
    try {
      const categoriaCheck = await db.query('SELECT id FROM categoria WHERE id = $1', [categoria_id]);
      
      if (categoriaCheck.rows.length === 0) {
        throw new AppError('La categoría especificada no existe', 400);
      }
      
      const query = `
        INSERT INTO producto (nombre, categoria_id, precio, stock) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
      `;
      
      const result = await db.query(query, [nombre, categoria_id, precio, stock || 0]);
      
      // Obtener el nombre de la categoría para el producto recién creado
      const categoriaQuery = 'SELECT nombre FROM categoria WHERE id = $1';
      const categoriaResult = await db.query(categoriaQuery, [categoria_id]);
      
      const producto = result.rows[0];
      producto.categoria_nombre = categoriaResult.rows[0].nombre;
      
      return producto;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error al crear el producto: ${error.message}`, 500);
    }
  }

  async update(id, { nombre, categoria_id, precio, stock }) {
    try {
      // Verificar si el producto existe
      const productoCheck = await db.query('SELECT id FROM producto WHERE id = $1', [id]);
      
      if (productoCheck.rows.length === 0) {
        return null;
      }
      
      if (categoria_id) {
        const categoriaCheck = await db.query('SELECT id FROM categoria WHERE id = $1', [categoria_id]);
        
        if (categoriaCheck.rows.length === 0) {
          throw new AppError('La categoría especificada no existe', 400);
        }
      }
      
      let query = 'UPDATE producto SET ';
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
      
      if (updateFields.length === 0) {
        throw new AppError('No se proporcionaron campos para actualizar', 400);
      }
      
      query += updateFields.join(', ');
      values.push(id);
      query += ` WHERE id = $${values.length} RETURNING *`;
      
      const result = await db.query(query, values);
      
      const categoriaQuery = 'SELECT nombre FROM categoria WHERE id = $1';
      const categoriaResult = await db.query(categoriaQuery, [result.rows[0].categoria_id]);
      
      const producto = result.rows[0];
      producto.categoria_nombre = categoriaResult.rows[0].nombre;
      
      return producto;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error al actualizar el producto: ${error.message}`, 500);
    }
  }

  async updateStock(id, stock) {
    try {
      const productoCheck = await db.query('SELECT id FROM producto WHERE id = $1', [id]);
      
      if (productoCheck.rows.length === 0) {
        return null;
      }
      
      const query = `
        UPDATE producto 
        SET stock = $1 
        WHERE id = $2 
        RETURNING *
      `;
      
      const result = await db.query(query, [stock, id]);
      
      const categoriaQuery = 'SELECT nombre FROM categoria WHERE id = $1';
      const categoriaResult = await db.query(categoriaQuery, [result.rows[0].categoria_id]);
      
      const producto = result.rows[0];
      producto.categoria_nombre = categoriaResult.rows[0].nombre;
      
      return producto;
    } catch (error) {
      throw new AppError(`Error al actualizar el stock: ${error.message}`, 500);
    }
  }

  async delete(id) {
    try {
      const productoCheck = await db.query('SELECT id FROM producto WHERE id = $1', [id]);
      
      if (productoCheck.rows.length === 0) {
        return false;
      }
      
      await db.query('DELETE FROM producto WHERE id = $1', [id]);
      return true;
    } catch (error) {
      throw new AppError(`Error al eliminar el producto: ${error.message}`, 500);
    }
  }
}

module.exports = new ProductoService();