const express = require('express');
const app = express();
const port = 8080;
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars');
const http = require('http');
const socketIO = require('socket.io');
const server = http.createServer(app);
const productManagerInstance = require('./productManager');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });


const clients = new Set();

// Maneja conexiones WebSocket
wss.on('connection', (ws) => {
  clients.add(ws);
  if (clients.size === 1) {
    console.log('Cliente WebSocket conectado');
  }

  // Maneja el cierre de la conexión WebSocket
  ws.on('close', () => {
    clients.delete(ws);
    if (clients.size === 0) {
      console.log('Cliente WebSocket desconectado');
    }
  });
});


app.engine('handlebars', handlebars.engine({
  defaultLayout: 'main',
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials'
}));

app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

app.use(express.static('public'));
app.use(bodyParser.json());

const io = socketIO(server);
io.on('connection', (socket) => {
  console.log('Cliente conectado');
  io.emit('productosActualizados', productManagerInstance.ObtenerProductos());
});

const productRouter = require('./router');
const carritoRouter = require('./carritoRouter');

app.use('/api/products', productRouter);
app.use('/api/carts', carritoRouter);

app.get('/home', (req, res) => {
  const productos = productManagerInstance.ObtenerProductos();
  res.render('home', { productos });
});


/*
app.get('/home', (req, res) => {
  const productos = productManagerInstance.ObtenerProductos();
  res.render('home', { productos });
});
*/

app.get('/realtimeproducts', (req, res) => {
  const productos = productManagerInstance.ObtenerProductos();
  res.render('realTimeProducts', { productos });
});


server.listen(port, () => {
  console.log('Servidor en ejecución en el puerto 8080');
});
app.set('io', io);

