// Este archivo va a ser la ruta principal

var express = require('express');

var app = express();

// get(ruta,funcion de callback)
// next -> lo que le dice a express es que cuando se ejecute que siga a la siguiente ejecucion, normalmente no se usan en la peticiones get,post,put etc, estos son bien usados cuando trabajamos con algun middleware
// Con esto defino una ruta
app.get('/', (req, res, next) => {
    // 200 es exitoso, 404 el recurso no fue encontrado, quiero que la respuestat sea un json
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });
});

// Para utilizar cualquier cosa fuera de este lugar, neceisto exportarlo
module.exports = app;