import express from "express"
import { formularioLogin, formularioRegistro, formularioOlvidePassword, formularioRegistrar, confirmar, resetPassword, comprobarToken, nuevoPassword, autenticar, cerrarSesion } from "../controllers/usuarioController.js"


//Crear la app
const router = express.Router()

// Routing
router.get('/login', formularioLogin)
router.post('/login', autenticar)

// Cerrar Sesión
router.post('/cerrar-sesion', cerrarSesion)

router.get('/registro', formularioRegistro)
router.post('/registrar', formularioRegistrar)

router.get('/olvide-password', formularioOlvidePassword)
router.post('/olvide-password', resetPassword)

router.get('/confirmar/:token', confirmar)

// Almacena el nuevo password
router.get('/olvide-password/:token', comprobarToken)
router.post('/olvide-password/:token', nuevoPassword)

export default router