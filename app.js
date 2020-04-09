// Este archivo es el punto de entrada para nuestra aplicacion
// Aqui vamos a empezar todo el codifo de JS que basicamente va a iniciallizar el serivdor express, entre otras cosas, las BD, autenticaciones, rutas, etc

// Requires, esto es una importacion de librerias ya sea de 3eros o personalizdas que ocupamos para que funcione algo
// Cargo la libreria de express
var express = require('express');
var mongoose = require('mongoose');

// Inicializar variables, aqui es donde ya vamos a usar las librerias
var app = express();

// Conexion a la base de datos
//openUri(password de la BD)
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    // En JS cuando ejecutamos esto, se detiene todo el proceso, ya no se ejecuta nada mas, si la BD no funciona ya no se ejecuta nada
    if (err) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
});

// Rutas
// get(ruta,funcion de callback)
// next -> lo que le dice a express es que cuando se ejecute que siga a la siguiente ejecucion, normalmente no se usan en la peticiones get,post,put etc, estos son bien usados cuando trabajamos con algun middleware
// Con esto defino una ruta
app.get('/', (req, res, next) => {
    // 200 es exitoso, 404 el recurso no fue encontrado, quiero que la respuestat sea un json
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });
})

// Escuchar peticiones
// listen(Quiero que este escuchando el puerto 3000 o culaquier otro puerto que no usemos, algun mensaje para saber si logro levantar o sucedio algun error)
app.listen(3000, () => {
    // Cambiar a color verde el mensaje, la palabra online
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
})