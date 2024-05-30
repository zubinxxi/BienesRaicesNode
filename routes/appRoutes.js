import express from "express"
import{inicio, categoria, noEncontrado, buscador} from '../controllers/appController.js'
import identificarUsuario from '../middleware/identificarUsuario.js'

//Crear la app
const router = express.Router()

// Página de inicio
router.get('/', identificarUsuario, inicio)

// Categorías
router.get('/categoria/:id', identificarUsuario, categoria)

//Página 404
router.get('/404', noEncontrado)

// Buscador
router.post('/buscador', identificarUsuario, buscador)

export default router