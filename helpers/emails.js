import nodemailer from 'nodemailer'


const emailRegistro = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    const { email, nombre, token } = datos

    // Enviar el correo
    await transport.sendMail({
        from: 'Bienes Raices Node',
        to: email,
        subject: 'Confirma tu Cuenta en Bienes Raices Node',
        text: 'Confirma tu Cuenta en Bienes Raices Node',
        html: `
                <p>Hola ${nombre}, comprueba tu cuenta en Bienes Raices Node.</p>

                <p>Tu cuenbta ya está lista, sólo debes confirmarla en el siguente enlace:
                <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/confirmar/${token}">Confirmar Cuenta</a></p>

                <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje.</p>
        `

    })
}

const emailOlvidePassword = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    const { email, nombre, token } = datos

    // Enviar el correo
    await transport.sendMail({
        from: 'Bienes Raices Node',
        to: email,
        subject: 'Reestablece tu Contraseña en Bienes Raices Node',
        text: 'Reestablece tu Contraseña en Bienes Raices Node',
        html: `
                <p>Hola ${nombre}, has solicitado reestablecer tu contranseña en Bienes Raices Node.</p>

                <p>Sigue el siguente enlace para generar una nueva contraseña:
                <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/olvide-password/${token}">Reestablecer Contraseña</a></p>

                <p>Si tu no solicitaste el cambio de contraseña, puedes ignorar el mensaje.</p>
        `

    })
}

export {
    emailRegistro,
    emailOlvidePassword
}