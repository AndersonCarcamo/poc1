CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE categoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE producto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    categoria_id UUID REFERENCES categoria(id),
    precio DECIMAL(10, 2) NOT NULL CHECK (precio >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE promocion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    descripcion TEXT NOT NULL,
    image_id UUID NOT NULL,
    extension VARCHAR(10),
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP,
    descuento DECIMAL(5, 2) CHECK (descuento > 0 AND descuento <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    points INTEGER DEFAULT 0,
    ubicacion TEXT,
    nombre VARCHAR(255),
    apellido VARCHAR(255),
    telefono VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tienda (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    ubicacion TEXT NOT NULL,
    sede VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    horario_atencion VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventario (
    tienda_id UUID REFERENCES tienda(id),
    producto_id UUID REFERENCES producto(id),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (tienda_id, producto_id)
);

CREATE TABLE compra (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuario(id) NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
    fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'PENDIENTE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE detalle_compra (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    compra_id UUID REFERENCES compra(id) NOT NULL,
    producto_id UUID REFERENCES producto(id) NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10, 2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE delivery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    compra_id UUID REFERENCES compra(id) NOT NULL,
    direccion_envio TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDIENTE',
    tienda_id UUID REFERENCES tienda(id) NOT NULL,
    fecha_entrega_estimada TIMESTAMP,
    fecha_entrega_real TIMESTAMP,
    costo_envio DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE boleta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    compra_id UUID REFERENCES compra(id) NOT NULL,
    tipo_documento VARCHAR(20) NOT NULL,
    serie VARCHAR(10) NOT NULL,
    correlativo INTEGER NOT NULL,
    cliente_id UUID REFERENCES usuario(id) NOT NULL,
    monto_total DECIMAL(10, 2) NOT NULL CHECK (monto_total >= 0),
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (serie, correlativo)
);

-- Tabla promocion_producto (tabla intermedia entre promocion y producto)
CREATE TABLE promocion_producto (
    promocion_id UUID REFERENCES promocion(id),
    producto_id UUID REFERENCES producto(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (promocion_id, producto_id)
);

-- Triggers para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para cada tabla
CREATE TRIGGER update_producto_modtime
BEFORE UPDATE ON producto
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_categoria_modtime
BEFORE UPDATE ON categoria
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_promocion_modtime
BEFORE UPDATE ON promocion
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_usuario_modtime
BEFORE UPDATE ON usuario
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_tienda_modtime
BEFORE UPDATE ON tienda
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_inventario_modtime
BEFORE UPDATE ON inventario
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_compra_modtime
BEFORE UPDATE ON compra
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_detalle_compra_modtime
BEFORE UPDATE ON detalle_compra
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_delivery_modtime
BEFORE UPDATE ON delivery
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_boleta_modtime
BEFORE UPDATE ON boleta
FOR EACH ROW EXECUTE FUNCTION update_modified_column();