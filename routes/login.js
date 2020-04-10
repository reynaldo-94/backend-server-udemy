var express = require('express');
// Usamos esto px vamos a confirmar si la contraseña ingresada hace match con la base de datos
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

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