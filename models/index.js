import Propiedad from './propiedad.js'
import Precio from './precio.js'
import Categoria from './categoria.js'
import Usuario from './Usuario.js'
import Mensaje from './mensaje.js'


//Precio.hasOne(Propiedad) // Relacion uno a uno, pero se le de derecha a izquierda.
Propiedad.belongsTo(Precio)
Propiedad.belongsTo(Categoria)
Propiedad.belongsTo(Usuario)

Mensaje.belongsTo(Propiedad, {foreignKey: 'propiedadId'})
Mensaje.belongsTo(Usuario, {foreignKey: 'usuarioId'})


export {
    Propiedad,
    Precio,
    Categoria,
    Usuario,
    Mensaje
}