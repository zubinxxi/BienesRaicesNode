import categorias from './categorias.js'
import precios from './precios.js'
import usuarios from './usuarios.js'
//import Categoria from '../models/categoria.js'
//import Precio from '../models/precio.js'
import db from '../config/db.js'
import { Categoria, Precio, Usuario } from '../models/index.js' //Import para traer los modelos con sus relaciones

const importarDatos = async ()=>{
    try {

        // Autenticar
        await db.authenticate()

        // Generar las columnas
        await db.sync()

        // Insertar datos
        await Promise.all([
            Categoria.bulkCreate(categorias),
            Precio.bulkCreate(precios),
            Usuario.bulkCreate(usuarios)
        ])

        console.log('Datos Importados con Éxito')
        process.exit()
        
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

const eliminarDatos = async ()=>{
    await Promise.all([
        Categoria.destroy({where: {}, }),
        Precio.destroy({where: {},}),
        Usuario.destroy({where: {},}),

    ])
    console.log('Datos Eliminados con Éxito')
    process.exit()
}

if (process.argv[2] === '-i'){
    importarDatos()
}

if(process.argv[2] === '-e'){
    eliminarDatos()
}