import express from 'express'
import csrf from 'csurf'
import cookieParser from 'cookie-parser'
import usuarioRoutes from './routes/usuarioRoutes.js'
import propiedadesRoutes from './routes/propiedadesRoutes.js'
import appRoutes from './routes/appRoutes.js'
import apiRoutes from './routes/apiRoutes.js'
import db from './config/db.js'

//Crear la app
const app = express()

// Habilitar lectura de datos del form
app.use(express.urlencoded({extended: true}))

// Habilitar cookie-parser
app.use(cookieParser())

// Habilitar CSRF
app.use(csrf({cookie: true}))

// Conexión a la DB
try {
    await db.authenticate();
    db.sync()
    console.log('Conexión correcta a MariaDB!!')
} catch (error) {
    console.log(error)
}

// Habilitar Pug
app.set('view engine', 'pug')
app.set('views', './views')


// Carpeta Pública
app.use(express.static('public'))

// Routing
app.use('/', usuarioRoutes)
app.use('/', propiedadesRoutes)
app.use('/', appRoutes)
app.use('/api', apiRoutes)



// Definir un puerto y arrancar el proyecto
const port = process.env.PORT || 3000
app.listen(port, ()=>{
    console.log(`El servidor está funcionando: https://localhost:${port}`)
})