import bcrypt from 'bcrypt'

const usuarios = [
    {
        nombre: 'Zubin Juarez',
        email: 'zubinxxi@yahoo.com',
        confirmado: 1,
        password: bcrypt.hashSync('password', 10)
    }
]

export default usuarios