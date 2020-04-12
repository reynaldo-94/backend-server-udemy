var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

// ==========================================
// Verificar token
// ==========================================

// Aca yo quiero hacer es, Leer el token que yo quiero recibir de la url, procesarlo, ver si es valido, que no ha expirado y si funciona, si es valido, quiero continuar
// Yo pongo el middleware aca, px despues de aca viene todas las peticiones que va a requerir autenticacion

exports.verificaToken = function(req, res, next) {

    // Recibo el token por la url
    var token = req.query.token;

    // Verifico si el token es valido
    // verify(token que yo recibo de la peticion, en este caso lo recibo por la url; el seed; el callback)
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            // El 401 es un error qu eno se encuentra autorizado
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        // Con esto, en cualquier lugar que llamo al middleware voy a tener la respuesta del usuario que hizo la solicitud
        req.usuario = decoded.usuario;

        // Con el next le decimos que continue a la siguiente funcion
        next();

    });

}