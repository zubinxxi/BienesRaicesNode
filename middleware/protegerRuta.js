import jwt from 'jsonwebtoken'
import { Usuario } from '../models/index.js'

const protegerRuta = async (req, res, next) => {

    // Verificar si hay un token
    const { _token } = req.cookies

    if(!_token){

        return res.redirect('/login')
    }

    // Comprobar el token
    try {

        const decoded = jwt.verify(_token, process.env.JWT_SECRET)
        const usuario = await Usuario.scope('eliminarPassword').findByPk(decoded.id)
        
        // Almacenar el usuario al Req
        if(usuario){
            req.usuario = usuario
            return next()
        }else{
            return res.redirect('/login')
        }

        
    } catch (error) {
        
        return res.clearCookie('_token').redirect('/login')

    }


   
}

export default protegerRuta
