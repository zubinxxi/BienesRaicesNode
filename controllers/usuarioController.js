import { check, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Usuario from '../models/Usuario.js'
import { generarId, generarJWT } from '../helpers/tokens.js'
import { emailRegistro, emailOlvidePassword } from '../helpers/emails.js'

const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar Sesión',
        csrfToken: req.csrfToken()
    })

}

const formularioRegistro = (req, res) => {

    res.render('auth/registro', {
        pagina: 'Crear Cuenta',
        csrfToken: req.csrfToken()
    })

}

const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password', {
        pagina: 'Recupera tu acceso a Bienes Raices',
        csrfToken: req.csrfToken()
    })

}

const resetPassword = async (req, res) => {

    // Validaciones
    await check('email').isEmail().withMessage('Eso no parece un email').run(req)

    let resultado = validationResult(req)
     
    // Verificar que resultado esté vacio
    if(!resultado.isEmpty()){

        // Errores
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    // Buscar el usuario
    const { email } = req.body
    const usuario = await Usuario.findOne({where: {email}})

    if(!usuario){
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: {msg: 'El e-mail no pertenece a ningún usuario'}
        })
    }

    // Generar un token y enviar el email
    usuario.token = generarId()
    await usuario.save()

    //enviar un email
    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    })

    // Renderizar un mensaje
    res.render('templates/mensaje', {
        pagina: 'Reestablece tu Contraseña',
        mensaje: 'Hemos enviado un e-mail con las instucciones, presiona en el enlace para ',
        //csrfToken: req.csrfToken()
    })
}

const formularioRegistrar = async (req, res) => {

    // Validaciones
    await check('nombre').notEmpty().withMessage('El nombre es obligatorio').run(req)
    await check('email').isEmail().withMessage('Eso no parece un email').run(req)
    await check('password').isLength({min: 6}).withMessage('La contraseña debe ser de al menos 6 caracteres').run(req)
    await check('repetir_password').equals('password').withMessage('Las contraseñas no son iguales').run(req)

    let resultado = validationResult(req)
    

    // Verificar que resultado esté vacio
    if(!resultado.isEmpty()){

        // Errores
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            errores: resultado.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
                
            },
            csrfToken: req.csrfToken()
        })
    }

    // Extraer los datos
    const { nombre, email, password } = req.body

    // Verificar que el usuario no este duplicado
    const existeUsuario = await Usuario.findOne({where : { email }})

    if(existeUsuario){
        // Errores
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            errores: [{msg: 'El usuario ya está registrado'}],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            },
            csrfToken: req.csrfToken()
        })
    }


    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })

    // Envia email de confirmación
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })

    // Mostrar mensaje de confirmación de la cuenta
    res.render('templates/mensaje', {
        pagina: 'Cuenta Creada Correctamente',
        mensaje: 'Hemos enviado un e-mail de confirmación, presiona en el enlace para ',
        csrfToken: req.csrfToken()
    })

}

const confirmar = async (req, res) => {

    const { token } = req.params
    
    // Verificar si el token es válido
    const usuario = await Usuario.findOne({where: {token}})
    
    if(!usuario){
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo.',
            error: true,
            csrfToken: req.csrfToken()
        })
    }

    // Confirmar la cuenta
    usuario.token = null
    usuario.confirmado = true
    await usuario.save()

    res.render('auth/confirmar-cuenta', {
        pagina: 'Cuenta Confirmada',
        mensaje: 'La cuenta se confirmó correctamente.',
        csrfToken: req.csrfToken()
    })
    DGGM_banner_medium
    
}

const comprobarToken = async (req, res) =>{
    
    // Validamos el token de el usuario
    const {token} = req.params

    const usuario = await Usuario.findOne({where: {token}})

    if(!usuario){
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Restablece tu password',
            mensaje: 'Hubo un error al validar tu información, intenta de nuevo.',
            error: true,
            csrfToken: req.csrfToken()
        })
    }
    

    // Mostrar formulario para modificar el password
    res.render('auth/reset-password', {
        pagina: 'Restablece tu password',
        csrfToken: req.csrfToken()
    })

}

const nuevoPassword = async (req, res) =>{

    // Validaciones del formulario
    await check('password').isLength({min: 6}).withMessage('La contraseña debe ser de al menos 6 caracteres').run(req)

    let resultado = validationResult(req)
    

    // Verificar que resultado esté vacio
    if(!resultado.isEmpty()){

        // Errores
        return res.render('auth/reset-password', {
            pagina: 'Restablece tu password',
            errores: resultado.array(),
            csrfToken: req.csrfToken()
        })
    }



    // Identificar quien hace el cambio de contraseña
    const {token} = req.params
    const {password} = req.body

    const usuario = await Usuario.findOne({where: {token}})

    // Hash de el nuevo password
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token = null
    await usuario.save()


    res.render('auth/confirmar-cuenta', {
        pagina: 'Contraseña Reestablecida',
        mensaje: 'La contraseña se guardó correctamente',
        csrfToken: req.csrfToken()
    })


}

const autenticar = async (req, res) => {
    // Validación del formulario
    await check('email').isEmail().withMessage('El email es obligatorio').run(req)
    await check('password').notEmpty().withMessage('El password es obligatorio').run(req)

    let resultado = validationResult(req)

    // Verificar que resultado esté vacio
    if(!resultado.isEmpty()){

        // Errores
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            errores: resultado.array(),
            usuario: {
                email: req.body.email
                
            },
            csrfToken: req.csrfToken()
        })
    }

    // Comprobar si el usuario existe
    const {email, password} = req.body

    const usuario = await Usuario.findOne({where: {email}})

    if(!usuario){
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            errores: [{msg: 'El usuario no existe'}],
            usuario: {
                email: req.body.email
                
            },
            csrfToken: req.csrfToken()
        })
    }

    // Comprobar que el usuario esté confirmado
    if(!usuario.confirmado){
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            errores: [{msg: 'Tu cuenta no ha sido confirmada'}],
            usuario: {
                email: req.body.email
                
            },
            csrfToken: req.csrfToken()
        })
    }

    // Revisar el password
    if(!usuario.verificarPassword(password)){
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            errores: [{msg: 'Tu contraseña es incorrecta'}],
            usuario: {
                email: req.body.email
                
            },
            csrfToken: req.csrfToken()
        })
    }

    // Autenticar al usuario
    const token = generarJWT({id: usuario.id, nombre: usuario.nombre})
    
    // Almacenar el token en un cookie
    return res.cookie('_token', token, {
        httpOnly: true,
        //secure: true,
        //sameSite: true
    }).redirect('/mis-propiedades')



}

export {
    formularioLogin,
    formularioRegistro,
    formularioRegistrar,
    formularioOlvidePassword,  
    resetPassword,  
    confirmar,
    comprobarToken,
    nuevoPassword,
    autenticar
}