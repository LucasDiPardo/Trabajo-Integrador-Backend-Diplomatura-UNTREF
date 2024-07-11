process.loadEnvFile()
const express = require ('express')
const { validarGranjaParcialmente, validarGranja } = require('./src/validacion.js')
const app = express()
const connectDB = require('./src/mongoose.js');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const morgan = require('morgan'); 
const { buscarPorNombre } = require('./src/funcionesExternas.js');
const port = process.env.PORT || 3000


// Funcion para conectarse a la base de datos
connectDB();

//Middleware solicitudes entrantes con cuerpos JSON
app.use(express.json());

//Middleware de registro de solicitudes HTTP en node
app.use(morgan('dev'))

//Middleware para conectar la base de datos a la solicitud
app.use((req, res, next) => {
  req.db = mongoose.connection.collection('frutasyverduras'); 
  next();
});

// Middleware para manejar rutas no existentes
app.use((req, res) => {
    res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

