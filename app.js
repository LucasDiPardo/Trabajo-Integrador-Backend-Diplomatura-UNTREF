process.loadEnvFile()
const express = require ('express')
const { validarGranjaParcialmente, validarGranja } = require('./src/validacion.js')
const app = express()
const connectDB = require('./src/database.js');
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


//--------A PARTIR DE ACA CRUD----------

//home de la pagina
app.get('/',  (req, res) => {  
    res.send('Hola Mundo!')
})


//1 - Obtener todos los productos
//Endpoint para leer todos los productos de la colección.
//Control de errores para manejar la indisponibilidad de la base de datos.
// 3 - Filtrar productos
//Endpoint para filtrar productos por nombre (búsqueda parcial).
//Control de errores para manejar coincidencias no encontradas o problemas de conexión.
app.get('/frutasyverduras', async (req, res) => {
    /*
    try{
      const frutasyverduras = await req.db.find().toArray()
        res.json({frutasyverduras})
      }catch(error){
        res.status(500).send('Error al obtener las frutas y verduras');      
    }
        */
    const { nombre } = req.query;
    try {
        const fyv = !nombre
            ? await req.db.find().toArray()
            : await req.db
                .find({ nombre: { $regex: nombre, $options: 'i' } })
                .toArray();
  
        res.json(fyv);
    } catch (error) {
        res.status(500).send('Error al obtener las frutas y verduras');
    }
  });
  