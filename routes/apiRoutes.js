import express from "express"
import{ propiedades } from '../controllers/apiController.js'

//Crear la app
const router = express.Router()

// Página de inicio
router.get('/propiedades', propiedades)


export default router