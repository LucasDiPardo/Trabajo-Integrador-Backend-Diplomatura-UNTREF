process.loadEnvFile()

const mongoose = require('mongoose');

async function buscarPorNombre(db, nombre) {
  try {
    const resultado = await db.findOne({ nombre });
    return resultado;
  } catch (error) {
    console.log(error);
    throw new Error('Error al buscar por nombre en la base de datos');
  }
}

module.exports = { buscarPorNombre };

