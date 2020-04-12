var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// ==========================================
// Busqueda por coleccion
// ==========================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    // Recibo los parametros por la url
    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');

    // Esta variable es la promesa que yo quiero ejecutar
    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son: usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla/colección no válido' }
            });
    }

    // Ejecuta la promesa
    promesa.then(data => {
        // Mi respuesta va a ser
        return res.status(200).json({
            ok: true,
            // En el enctscript 6 incluye lo que se conoce como propiedades de objeto computadas o procesadas, simplemente lo ponemos entre llave, ahora le decimos a JS que no es la palabra tabla la quiero poner ahi, es el resultado de lo que tenga esa variable
            [tabla]: data
        });
    });

});

// ==========================================
// Busqueda general
// ==========================================

app.get('/todo/:busqueda', (req, res, next) => {

    // Esta busqueda e slo que la persona escribe
    var busqueda = req.params.busqueda;
    // Creo uan expresion regular para poder pasar busqueda a la funcion find, al poner i le digo que es insesibles a la mayusculas y minusculas
    var regex = new RegExp(busqueda, 'i');

    // El all nos permite mandar un arreglo de promesas, ejecutarlas y si todas respondadn correctamente podemos disparar un the y si una falla ejecutamos el catch

    Promise.all([buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        // Recibimos un arreglo con los varoes o respuestas, cada una de las rspuestas de esas promesas va a venir dentro del arreglo por posicion
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        })

});

function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {

        // find(busco por el nombre), si pongo i, con eso me dice que es insesible a las mayusculas o minusculas, al poner slash es como si pusiera un like 
        Hospital.find({ nombre: regex })
            // Tenemso que usuario ha creado el hospital
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    //resolve(Mando la dato de los hospitales)
                    resolve(hospitales);
                }

            });

    });
}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {

        // find(busco por el nombre), si pongo i, con eso me dice que es insesible a las mayusculas o minusculas, al poner slash es como si pusiera un like 
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    //resolve(Mando la dato de los hospitales)
                    resolve(medicos);
                }

            });

    });
}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        // Buscar en 2 columnas
        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios')
                } else {
                    resolve(usuarios);
                }
            });

    });
}

module.exports = app;