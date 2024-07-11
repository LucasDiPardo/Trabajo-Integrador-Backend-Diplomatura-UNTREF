// src/mongoose.js
//require('dotenv').config();
process.loadEnvFile()


const mongoose = require('mongoose')

//Obtenemos la URI desde las variables de entorno
const URI = process.env.MONGODB_URLSTRING
const DATABASE_NAME = process.env.DATABASE_NAME
// Conectar a MongoDB usando Mongoose
const connectDB = () => {
  return mongoose
    .connect(URI + DATABASE_NAME)
    .then(() => console.log('Conectado a MongoDB'))
    .catch((err) => console.log('Error al conectarse : ', err))
}

/*
async function disconnectFromMongoDB() {
  try {
    if (client) {
      await client.close()
      console.log('Desconectandose de mongoDB')
    }
  } catch (error) {
    console.error('Error al desconectar de MongoDB')
  }
}
*/

module.exports = connectDB