var express = require('express');
var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');

//var SEED = require('../config/config').SEED;

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

// Esto me permite a mi utilizar todos las funciones y lo smetodos que el modelo usuario tiene
var Usuario = require('../models/usuario');

// ==========================================
// Obtener todos los usuarios
// ==========================================

app.get('/', (req, res, next) => {

    // En el find puedo decir que campos quiero mostrar
    // Aca le digo buscate todos los registros en la tabla de usuarios y me interesan solo el nombre email img y role
    Usuario.find({}, 'nombre email img role')
        .exec((err, usuarios) => {
            // Un error de este tipo es un error de base de datos
            if (err) {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Erro cargando usuarios',
                    errors: error
                });
            }

            // Si no sucede ningun error
            return res.status(200).json({
                ok: true,
                mensaje: usuarios
            });
        })


});

// ==========================================
// Actualizar un usuario
// ==========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    // Obtengo el parametro que llegap or la url
    var id = req.params.id;
    var body = req.body;

    // Verifico si un usuario existe con ese id
    Usuario.findById(id, (err, usuario) => {
        // Pongo error 500, porque en el metodo findById nunca debe de existir un error, no puedo ver un error de usuario
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        // Si el parametro usuario viene nulo
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        // Actualiza el usuario
        usuario.nombre = body.nombre;
        usuario.correo = body.correo;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                // Aqui seria un error 400 px puede ser que noeste mandando el nombre, o que no venga el nombre o correo, o que el correo sea igual a otro, etc
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)'; // Ojo que no estoy guardando la constraseña

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        })

    });

});

// ==========================================
// Crear un nuevo usuario
// ==========================================
// Si nosotros necesitamos ejecutar cualquier funcion o cualquier autnticacion simplemente se puede poner como 2do parametro
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    // body-parser : Es una libreria que toma la infomracion del post y nos crea un objeto de JS que ya podemos utilizar sin hacer nada nosotros
    var body = req.body; // Esto va a funcionar solo si tenemos el body parse, sino vamos a tener un unfined

    // Definicion para crear un nuevo usuario
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10), // Para hacer encriptacionde una sola via uso el hashSync
        img: body.img,
        role: body.role
    });

    // Para guardarlo
    //save(aqui yo recibo un callback)
    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });

});

// ==========================================
// Borrar un usuario por el id
// ==========================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    // Hacemos referencia a nuestro modelo
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        // Verifico si no viene un usuario
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });

});

// Para utilizar cualquier cosa fuera de este lugar, neceisto exportarlo
module.exports = app;