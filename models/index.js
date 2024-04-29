import Propiedad from './propiedad.js'
import Precio from './precio.js'
import Categoria from './categoria.js'
import Usuario from './Usuario.js'

//Precio.hasOne(Propiedad) // Relacion uno a uno, pero se le de derecha a izquierda.
Propiedad.belongsTo(Precio)
Propiedad.belongsTo(Categoria)
Propiedad.belongsTo(Usuario)


export {
    Propiedad,
    Precio,
    Categoria,
    Usuario
}