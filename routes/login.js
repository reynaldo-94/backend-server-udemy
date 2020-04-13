var express = require('express');
// Usamos esto px vamos a confirmar si la contraseña ingresada hace match con la base de datos
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// ==========================================
// AUTENTICACION DE GOOGLE
// ==========================================
// Una funcion async, es simplemente una funcion que regresa una promesa
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload(); // Aqui esta la informacion del usuario
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,
        payload
    }
}
// Normalmente google recomienda que las peticiones o validaciones se hagan mediante un post
app.post('/google', async(req, res) => {

    var token = req.body.token;
    // wait: Espera la respuesta de esta funcion, esta funcion regresa una promesa y le mando un token, si no es valido el token me gresa un catch
    // Para poder usar el await es obligatorio que se ejece dentro de una funcion asyn
    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no válido'
            });
        });

    // Verificar si el correo ya lo tengo almacenado en mi base de datos
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        // Compruebo
        if (usuarioDB) {
            //Si el usuario no ha sido autentificado por google
            if (usuarioDB.google === false) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Debe de usar su autentificación normal',
                });
                // Aqui ya existe el usuario y fue antentifcado por google
            } else {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }) // 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            }
        } else {
            // El usuario no existe, hay que crearlo
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.nombre = googleUser.nombre;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al crear un usuario',
                        errors: err
                    });
                }
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }) // 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            });
        }

    });

    // return res.status(200).json({
    //     ok: true,
    //     mensaje: 'OK!!!',
    //     googleUser: googleUser,
    // });
});

// ==========================================
// AUTENTICACION NORMAL
// ==========================================
app.post('/', (req, res) => {

    // Necesoti recibir el correo y la contraseña
    var body = req.body;

    // Verifico si existe un usuario con el correo electronico
    // Pongo findOne porque hay corres unicos, osea 2 correos con el mismo nombre no puede ver
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        // Si no existe un usuario con ese correo electronico
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        // Verificar contraseña
        /// comapreSync este nos permite tomar el string que nosotros queremos verificiar contr otr string que ya ha sido pasado por el hash, eso me devuelve un valor booleano, true si es correcto, false si es incorrecto
        if (bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        usuarioDB.password = ':)';
        //  Crear un token!!!
        //sign como firmar(la data que yo quiero colocar en el token esto se conoce como el payload, la semilaa o el seed es algo que nosotros tenemos que definir de forma unica, la fecha de expiracion del token)
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }) // 4 horas

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    });

});

module.exports = app;