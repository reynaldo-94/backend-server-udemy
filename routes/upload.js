var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs'); // Para eliminar imagenes

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

app.use(fileUpload());

// get(ruta,funcion de callback)
// next -> lo que le dice a express es que cuando se ejecute que siga a la siguiente ejecucion, normalmente no se usan en la peticiones get,post,put etc, estos son bien usados cuando trabajamos con algun middleware
// Con esto defino una ruta
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de coleccion
    var tiposValido = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValido.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            errors: { message: 'Tipo de colección no es válida' }
        });
    }

    // Pregunto si en el request vienen archivos(files)
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una imange' }
        });
    }

    // Verificamos si el archivo efectivamente es una imagen
    // Obtener el nombre del archivo
    var archivo = req.files.imagen;
    // Extraigo la extension del archivo
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Solo estas extensiones aceptamos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    // Si eso regresa -1, quiere decir que no lo encuentra
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            //extensionesValidas.join(', '): las unimos con una coma y un espacio
            errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
        });
    }

    // Creo un nombre de archivo persoalizado, en este caso el id del usuriario-numeroRandom
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    // mv: mover
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo'
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

    });

});

// subirPorTipo(tipoColeccion,id del medico o hospital o usuario, el nombre de la imagen, la repsuesto que obtengo arriba px yo quiero sacar la respuesta en formato json desde esta funcion)
function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }
            // En este punto puedo tomar ese error y regresarlo en caso sea un problema, en este ejm no lo hago, pero si deseas ponlo

            // Obtengo el nombre viejo que teniamos en el registro del usuario
            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe una imagen, yo tengo que borrarla para ese importo la libreria fs
            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            // Subo la imagen nueva
            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                // 200 es exitoso, 404 el recurso no fue encontrado, quiero que la respuesta sea un json
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuario.img
                });
            })
        });
    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            if (!medico) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Medico no existe',
                    errors: { message: 'Medico no existe' }
                });
            }
            var pathViejo = './uploads/medicos/' + medico.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                medicoActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizado',
                    medico: medico.img
                });
            });
        });
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (!hospital) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Hospital no existe',
                    errors: { message: 'Hospital no existe' }
                });
            }
            var pathViejo = './uploads/hospitales/' + hospital.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                hospitalActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizado',
                    hospital: hospital.img
                });
            });
        });
    }
}

// Para utilizar cualquier cosa fuera de este lugar, neceisto exportarlo
module.exports = app;