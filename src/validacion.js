
//Zod es una libreria para validacion
const z = require('zod')

//Definis Schema y validacion
const granjaSchema = z.object({
  nombre: z.string("No es un String").min(1,"El nombre es obligatorio"),
  categoria: z.enum(['Fruta', 'Verdura']),
  precio: z.number("No es un numero").positive({message:'El precio no puede ser menor a 0.1'}),
})

function validarGranja(campos){
  return granjaSchema.safeParse(campos)
}
function validarGranjaParcialmente(campos){
  return granjaSchema.partial().safeParse(campos)
}

module.exports = {
  validarGranja,
  validarGranjaParcialmente
}