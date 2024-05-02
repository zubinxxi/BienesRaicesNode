import {Sequelize} from 'sequelize'
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
        departamentos,
        csrfToken: req.csrfToken()
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
        total,
        csrfToken: req.csrfToken()
    })

    
}

const noEncontrado = async (req, res) =>{

    // traer las categorías par el menú de categorías
    const categorias = await Categoria.findAll({raw: true})

    res.render('404', {
        pagina: '¡Página no encontrada!',
        categorias,
        csrfToken: req.csrfToken()
    })
}

const buscador = async (req, res) =>{
    // traer las categorías par el menú de categorías
    const categorias = await Categoria.findAll({raw: true})

    const { termino } = req.body 

    // Validar qu termino no este vacio
    if(!termino){
        return res.redirect('back')
    }

    //Consultar las propiedades
    
    const propiedades = await Propiedad.findAll({
        where: {
            titulo: {
                [Sequelize.Op.like]: '%' + termino + '%'
            }
        },
        include: [
            {
                model: Precio,
                as: 'precio'
            }
        ]
    })

    res.render('busqueda', {
        pagina: 'Resultado de la busqueda',
        propiedades,
        categorias,
        csrfToken: req.csrfToken()
    })

}

export {
    inicio,
    categoria,
    noEncontrado,
    buscador
}