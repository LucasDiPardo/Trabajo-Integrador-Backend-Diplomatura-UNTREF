const mongoose = require('mongoose')

// Definir el esquema y el modelo de Mongoose
const granjaSchema = new mongoose.Schema({
  codigo: Number,
  nombre: String,
  precio: Number,
  categoria: String,
})
const Granja = mongoose.model('Granja', granjaSchema)

module.exports = Granja