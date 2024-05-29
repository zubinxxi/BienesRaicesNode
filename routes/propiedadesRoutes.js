import express from "express"
import { body } from 'express-validator'
import { admin, crear, guardar, agregarImagen, almacenarImagen, editar, guardarCambios, cambiarEstado, eliminar, mostrarPropiedad, enviarMensaje, verMensajes } from "../controllers/propiedadesController.js"
import protegerRuta from '../middleware/protegerRuta.js'
import upload from '../middleware/subirImagen.js'
import identificarUsuario from '../middleware/identificarUsuario.js'

//Crear la app
const router = express.Router()

// Routing
router.get('/mis-propiedades', protegerRuta, admin)
router.get('/propiedades/crear', protegerRuta, crear)
router.post('/propiedades/crear', 
    protegerRuta,
    body('titulo').notEmpty().withMessage('El titulo del anuncio es obligatorio'),
    body('descripcion').notEmpty().withMessage('La descripción no puede ir vacia').isLength({max: 200}).withMessage('La descripción es muy larga'),
    body('categoria').isNumeric().withMessage('Selecciona una categoría'),
    body('precio').isNumeric().withMessage('Selecciona un rango de precios'),
    body('habitaciones').isNumeric().withMessage('Selecciona la cantidad de habitacines'),
    body('wc').isNumeric().withMessage('Selecciona la cantidad de baños'),
    body('estacionamiento').isNumeric().withMessage('Selecciona la cantidad de estacionamientos'),
    body('lat').notEmpty().withMessage('Ubica la propiedad en el mapa'),
    guardar
)

router.get('/propiedades/agregar-imagen/:id', protegerRuta, agregarImagen)

router.post('/propiedades/agregar-imagen/:id', protegerRuta, upload.single('imagen'), almacenarImagen)

router.get('/propiedades/editar/:id', protegerRuta, editar)

router.post('/propiedades/editar/:id', 
    protegerRuta,
    body('titulo').notEmpty().withMessage('El titulo del anuncio es obligatorio'),
    body('descripcion').notEmpty().withMessage('La descripción no puede ir vacia').isLength({max: 200}).withMessage('La descripción es muy larga'),
    body('categoria').isNumeric().withMessage('Selecciona una categoría'),
    body('precio').isNumeric().withMessage('Selecciona un rango de precios'),
    body('habitaciones').isNumeric().withMessage('Selecciona la cantidad de habitacines'),
    body('wc').isNumeric().withMessage('Selecciona la cantidad de baños'),
    body('estacionamiento').isNumeric().withMessage('Selecciona la cantidad de estacionamientos'),
    body('lat').notEmpty().withMessage('Ubica la propiedad en el mapa'),
    guardarCambios
)

router.post(
    '/propiedades/eliminar/:id', 
    protegerRuta, 
    eliminar
)

router.put(
    '/propiedades/:id',
    protegerRuta,
    cambiarEstado
)

// Área pública
router.get(
    '/propiedad/:id', 
    identificarUsuario, 
    mostrarPropiedad
)

// Almacenar los mensajes
router.post(
    '/propiedad/:id', 
    identificarUsuario, 
    body('mensaje').isLength({min: 10}).withMessage('El mensaje no puede ir vacio o es muy corto.'),
    enviarMensaje
)

router.get('/mensajes/:id', protegerRuta, verMensajes)

export default router 