process.loadEnvFile()
const express = require ('express')
const { validarGranjaParcialmente, validarGranja } = require('./src/validacion.js')
const app = express()
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const morgan = require('morgan'); 
const { buscarPorNombre } = require('./src/funcionesExternas.js');
const port = process.env.PORT || 3000
const connectDB = require('./src/database.js');


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


  
//2 - Obtener un producto
//Endpoint para obtener un producto por su ID.
//Control de errores para manejar casos en que el producto no se encuentre o la base de datos no esté disponible.
app.get('/frutasyverduras/:id', async (req, res) => {
    const { id } = req.params;
      try {      
          // Verifica que el ID sea un ObjectId valido
          if (!ObjectId.isValid(id)) {
              return res.status(400).send('ID inválido');
          }
          // Convierte el ID a ObjectId
          const objectId = new ObjectId(id);
          const fyv = await req.db.findOne({ _id: objectId });       
  
          if (!fyv) {
              //console.log('id: ', id)
              return res.status(404).json({ error: 'Fruta o verdura no encontrada' });
          }
  
          res.json(fyv);
      } catch (error) {
          console.error('Error al obtener la fruta o verdura por ID:', error);
          res.status(500).send('Error al obtener la fruta o verdura por ID');
      }
  })
  
  // 4 Agregar un nuevo producto
  //Endpoint para agregar un nuevo producto.
  //Validación y control de errores.
  //Generación de un código numérico para el nuevo producto.
  
  app.post('/frutasyverduras' ,async (req, res) => {
      const { nombre} = req.body;
      
      const resultado = validarGranja(req.body)
      
      if (!resultado.success) return res.status(400).json(resultado.error.message)
  
      //verifico si existe fruta o verdura con el mismo nombre
      const existe = await buscarPorNombre(req.db, nombre);
      if (existe) {
          return res.status(400).json({ mensaje: 'El nombre ya existe en la base de datos' });
      }
      
      const nuevaVerdura = {
          // cargar codigo automatico, contando los elemento de la base de datos y sumandole 1
          codigo: await req.db.countDocuments() + 1,      
          ...resultado.data,
      }
  
      try {
          await req.db.insertOne(nuevaVerdura)
          res.status(201).json(nuevaVerdura)
      }catch (error) {
          return res.status(500).json({ message: 'Error al agregar la Frutao Verdura' })
      }
  })
  /*
  5 Modificar el precio de un producto
  Endpoint para cambiar el precio de un producto usando PATCH.
  Control de errores para manejar problemas durante la actualización.
  */
  app.patch('/frutasyverduras/:id', async (req, res) => {
      const resultado = validarGranjaParcialmente(req.body)    
      
      if (!resultado.success) return res.status(400).json(resultado.error.message)
  
      const { id } = req.params
      const objectId = new ObjectId(id)
  
      try {
          const frutaActualizada = await req.db.findOneAndUpdate(
              { _id: objectId },
              { $set: resultado.data },
              { returnDocument: 'after' }
          )
          if (!frutaActualizada) {
              return res.status(404).json({ message: 'Fruta o Verdura no encontrada para Actualizar Precio' })
          }
            res.json({ message: 'Precio de Fruta o Verdura actualizada con exito', frutaActualizada })
      } catch (error) {
          return res.status(500).json({ message: 'Error al actualizar el precio' });
      }
  })
  
  /*
  6 - Borrar un producto
  Endpoint para borrar un producto usando DELETE.
  Control de errores para manejar problemas durante el borrado.
  */
  app.delete('/frutasyverduras/:id', async (req, res) => {
      const { id } = req.params
  
      // Validar el id antes de convertirlo a ObjectId
      if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: 'ID no válido' });
      }
  
      const objectId = new ObjectId(id)
  
      try {
          const { deletedCount } = await req.db.deleteOne({ _id: objectId })
          
          if (deletedCount==0) {
              return res.status(404).json({ message: 'Fruta o Verdura no encontrada para eliminar' })
          }
  
          res.json({ message: 'Fruta o Verdura eliminada con exito' })
          
          } catch (error) {
              return res.status(500).json({ message: 'Error al eliminar la Fruta o Verdura'})
          }
  })
  
// Middleware para manejar rutas no existentes
app.use((req, res) => {
    res.status(404).json({ mensaje: 'Ruta no encontrada' });
});


  
  app.listen(port, () => {
      console.log(`Servidor corriendo en puerto:  ${port}`)
  })
  
