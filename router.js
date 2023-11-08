const express = require('express');
const router = express.Router();
const productManagerInstance = require('./productManager');

// Lógica para obtener todos los productos
router.get('/', (req, res) => {
  const productos = productManagerInstance.ObtenerProductos();

  // Verificar si se proporciona el parámetro de consulta "limit"
  const limit = parseInt(req.query.limit);

  if (!isNaN(limit) && limit > 0) {
    // Si se proporciona un valor válido para "limit", ajusta la lista de productos
    const productosLimitados = productos.slice(0, limit);
    res.json(productosLimitados);
  } else {
    // Si no se proporciona "limit" o no es un valor válido, muestra todos los productos
    res.json(productos);
  }
});

router.get('/realtimeproducts', (req, res) => {
  const productos = productManagerInstance.ObtenerProductos();
  res.render('realTimeProducts', { productos });
});

router.get('/home', (req, res) => {
  const productos = productManagerInstance.ObtenerProductos();
  res.render('home', { productos });
});


router.get('/:cid', (req, res) => {
  const productId = parseInt(req.params.cid);
  const producto = productManagerInstance.obtenerProductoPorID(productId);

  if (producto) {
    res.json(producto);
  } else {
    res.status(404).json({ error: 'Producto no encontrado' });
  }
});

router.post('/', (req, res) => {
  const { Titulo, Descripcion, Precio, Miniatura, Codigo, Cantidad } = req.body;
  if (!Titulo || !Descripcion || !Precio || !Miniatura || !Codigo || !Cantidad) {
    return res.status(400).json({ error: 'Se requieren todos los campos para agregar un producto.' });
  }

  const productoExistente = productManagerInstance.ObtenerProductos().find((producto) => producto.Codigo === Codigo);

  if (productoExistente) {
    productoExistente.Cantidad += Cantidad;
    res.status(200).json(productoExistente);
  } else {
    productManagerInstance.agregarProducto(Titulo, Descripcion, Precio, Miniatura, Codigo, Cantidad);
    const nuevoProducto = productManagerInstance.ObtenerProductos().find((producto) => producto.Codigo === Codigo);
    res.status(201).json(nuevoProducto);
    
    const io = req.app.get('io');
    io.emit('productoCambiado', nuevoProducto);
  }

  res.status(201).json(nuevoProducto);
});

router.put('/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const { Titulo, Descripcion, Precio, Miniatura, Codigo, Cantidad } = req.body;
  const productoExistente = productManagerInstance.obtenerProductoPorID(productId);

  if (!productoExistente) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  if (Titulo) {
    productoExistente.Titulo = Titulo;
  }
  if (Descripcion) {
    productoExistente.Descripcion = Descripcion;
  }
  if (Precio) {
    productoExistente.Precio = Precio;
  }
  if (Miniatura) {
    productoExistente.Miniatura = Miniatura;
  }
  if (Codigo) {
    productoExistente.Codigo = Codigo;
  }
  if (Cantidad) {
    productoExistente.Cantidad = Cantidad;
  }

  res.json(productoExistente);
});

router.delete('/:pid', (req, res) => {
  const productId = parseInt(req.params.pid);
  const productoEliminado = productManagerInstance.eliminarProducto(productId);

  if (productoEliminado) {
    res.json({ message: 'Producto eliminado con éxito', productoEliminado });
  } else {
    res.status(404).json({ error: 'Producto no encontrado' });
  }

  const io = req.app.get('io');
  io.emit('productoCambiado', productoEliminado);
});


module.exports = router;
