import express from "express"
import{inicio, categoria, noEncontrado, buscador} from '../controllers/appController.js'

//Crear la app
const router = express.Router()

// Página de inicio
router.get('/', inicio)

// Categorías
router.get('/categoria/:id', categoria)

//Página 404
router.get('/404', noEncontrado)

// Buscador
router.post('/buscador', buscador)

export default router