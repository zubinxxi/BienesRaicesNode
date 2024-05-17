import { unlink } from 'node:fs/promises'
import { validationResult } from 'express-validator'
import { Categoria, Precio, Propiedad, Mensaje } from '../models/index.js'
import { esVendedor } from '../helpers/index.js'


const admin = async (req, res) =>{

    // Leer QueryString
    const {pagina: paginaActual} = req.query
    console.log(paginaActual)


    const expresion = /^[1-9]$/

    if(!expresion.test(paginaActual)){
        return res.redirect('mis-propiedades?pagina=1')
    }

    try {
        const {id} = req.usuario

        // Limites y Offset para el paginador
        const limit = 4

        const offset = ((paginaActual * limit) - limit)

        const [propiedades, total ] = await Promise.all([
            
            Propiedad.findAll({
                limit,
                offset,
                where: {
                    usuarioId: id
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
                    usuarioId: id
                }
            })

        ])

        res.render('propiedades/admin', {
            pagina:'Mis Propiedades',
            csrfToken:req.csrfToken(),
            propiedades,
            paginas: Math.ceil(total / limit),
            paginaActual: +paginaActual,
            total,
            offset,
            limit
        })
    } catch (error) {
        console.log(error)
    }


    
}

const crear = async (req, res) => {

    // Consultar Modelo de Precio y Categoría
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    res.render('propiedades/crear', {
        pagina:'Crear Propiedad',
        csrfToken:req.csrfToken(),
        categorias:categorias,
        precios:precios,
        datos: {}
    })
}

const guardar = async (req, res) => {

    // Validación
    let resultado = validationResult(req)

    if(!resultado.isEmpty()){

        // Consultar Modelo de Precio y Categorías
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])

        return res.render('propiedades/crear', {
            pagina: 'Crear Propiedad',
            csrfToken:req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body

        })
    }

    // Crear un registro
    const { titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio, categoria } = req.body

    const {id: usuario} = req.usuario

    try {
        const propiedadGuardada = await Propiedad.create({
            titulo: titulo,
            descripcion: descripcion,
            habitaciones: habitaciones,
            estacionamiento: estacionamiento,
            wc: wc,
            calle: calle,
            lat: lat,
            lng: lng,
            precioId: precio,
            categoriaId: categoria,
            usuarioId: usuario,
            imagen: ''
        })

        const {id} = propiedadGuardada

        res.redirect(`/propiedades/agregar-imagen/${id}`)



    } catch (error) {
        console.log(error)
    }

}

const agregarImagen = async (req, res) => {

    const { id } = req.params

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad) {
        return res.redirect('/mis-propiedades')
    }


    // Validar que la propiedad no este publicada
    if(propiedad.publicado) {
        return res.redirect('/mis-propiedades')
    }


    // Validadr que la propiedad pertenece a quien visita esta pagina
    if(req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect('/mis-propiedades')
    }

    res.render('propiedades/agregar-imagen', {
        pagina: `Agregar Imagen: ${propiedad.titulo}`,
        propiedad,
        csrfToken:req.csrfToken()
        //categorias,
        //precios,
        //errores: resultado.array(),
        //datos: req.body

    })

}

const almacenarImagen = async (req, res, next) => {

    const { id } = req.params

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad) {
        return res.redirect('/mis-propiedades')
    }


    // Validar que la propiedad no este publicada
    if(propiedad.publicado) {
        return res.redirect('/mis-propiedades')
    }


    // Validadr que la propiedad pertenece a quien visita esta pagina
    if(req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
        return res.redirect('/mis-propiedades')
    }

    try {
        
        //Almacenar la imagen y publicar la propiedad
        propiedad.imagen = req.file.filename

        propiedad.publicado = 1

        await propiedad.save()
        
        next()
        
    } catch (error) {
        console.log(error)
    }

}

const editar = async (req, res) => {

    const {id} = req.params

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    // Revisar que quien visite la URL, es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }


    // Consultar Modelo de Precio y Categoría
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    res.render('propiedades/editar', {
        pagina:`Editar Propiedad: ${propiedad.titulo}`,
        csrfToken:req.csrfToken(),
        categorias:categorias,
        precios:precios,
        datos: propiedad,
        
    })

}

const guardarCambios = async (req, res) => {

    // Verificar la validaión

    let resultado = validationResult(req)

    if(!resultado.isEmpty()){

        // Consultar Modelo de Precio y Categorías
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])

        res.render('propiedades/editar', {
            pagina:`Editar Propiedad`,
            csrfToken:req.csrfToken(),
            categorias:categorias,
            precios:precios,
            errores: resultado.array(),
            datos: req.body
            
        })
    }

    const {id} = req.params

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    // Revisar que quien visite la URL, es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    // Reescribir el objeto
    try {
        const { titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio, categoria } = req.body

        propiedad.set({
            titulo: titulo,
            descripcion: descripcion,
            habitaciones: habitaciones,
            estacionamiento: estacionamiento,
            wc: wc,
            calle: calle,
            lat: lat,
            lng: lng,
            precioId: precio,
            categoriaId: categoria
        })

        await propiedad.save()

        res.redirect('/mis-propiedades')
        

    } catch (error) {
        console.log(error)
    }

}

const eliminar = async (req, res) =>{

    const {id} = req.params

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    // Revisar que quien visite la URL, es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    // Eliminar imagen asociada
    await unlink(`public/uploads/${propiedad.imagen}`)

    // Eliminar la propiedad
    await propiedad.destroy()
    res.redirect('/mis-propiedades')
    

}

// Muestra una propiedad
const mostrarPropiedad = async (req, res) =>{

    const categorias = await Categoria.findAll()
    const {id} = req.params


    // Comprobar que la propiedad exista
    const propiedad  = await Propiedad.findByPk(id, {
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
    })

    if(!propiedad){
        return res.redirect('/404')
    }


   

    res.render('propiedades/mostrar', {
        propiedad,
        pagina: propiedad.titulo,
        categorias,
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId)
        
    })
}

// Enviar mensje
const enviarMensaje = async (req, res) =>{
    
    const categorias = await Categoria.findAll()
    const { id } = req.params


    // Comprobar que la propiedad exista
    const propiedad  = await Propiedad.findByPk(id, {
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
    })

    if(!propiedad){
        return res.redirect('/404')
    }

    // Renderizar los errores

    let resultado = validationResult(req)

    if(!resultado.isEmpty()){

        return res.render('propiedades/mostrar', {
            propiedad,
            pagina: propiedad.titulo,
            categorias,
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
            errores: resultado.array()
            

        })
    }


    // Almacenar los mensajes
    const { mensaje } = req.body
    const { id: propiedadId } = req.params
    const { id: usuarioId} = req.usuario
    
    
    await Mensaje.create({
        mensaje: mensaje,
        propiedadId: propiedadId,
        usuarioId: usuarioId
    })

    res.redirect('/')

    /*res.render('propiedades/mostrar', {
        propiedad,
        pagina: propiedad.titulo,
        categorias,
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
        enviado: true
        
    })*/

}

export{
    admin,
    crear,
    guardar, 
    agregarImagen,
    almacenarImagen,
    editar, 
    guardarCambios,
    eliminar,
    mostrarPropiedad,
    enviarMensaje
}