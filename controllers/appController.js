import {Categoria, Precio, Propiedad} from '../models/index.js'



const inicio = async (req, res) =>{

    const [categorias, precios, casas, departamentos] = await Promise.all([
        Categoria.findAll({raw: true}),
        Precio.findAll({raw: true}),
        Propiedad.findAll({
            limit:3,
            where: {
                categoriaId: 11
            },
            include:[
                {
                    model: Precio,
                    as: 'precio'
                }
            ],
            order: [
                ['createdAt', 'DESC']
            ]
        }),
        Propiedad.findAll({
            limit:3,
            where: {
                categoriaId: 12
            },
            include:[
                {
                    model: Precio,
                    as: 'precio'
                }
            ],
            order: [
                ['createdAt', 'DESC']
            ]
        })
    ])

    res.render('inicio', {
        pagina: 'Inicio',
        categorias,
        precios, 
        casas,
        departamentos
    })
}

const categoria = async (req, res) =>{

    const { id } = req.params

    // Comprobar que exista la categoría
    const categoria = await Categoria.findByPk(id)

    if(!categoria){
        return res.redirect('/404')
    }

    // Obtener las propiedades de la categoría

    

    const [categorias, propiedades, total ] = await Promise.all([
        Categoria.findAll({raw: true}), 
        Propiedad.findAll({
            where: {
                categoriaId: id
            },
            include: [
                {
                    model: Categoria, 
                    as: 'categoria'
                },
                {
                    model: Precio,
                    as: 'precio'
                }
            ]
        }),
        Propiedad.count({
            where: {
                categoriaId: id
            }
        })

    ])

    res.render('categoria', {
        pagina: `${categoria.nombre}s en Venta`,
        categorias,
        propiedades,
        total
    })

    
}

const noEncontrado = (req, res) =>{
    
}

const buscador = (req, res) =>{
    
}

export {
    inicio,
    categoria,
    noEncontrado,
    buscador
}