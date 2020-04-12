// Este archivo es el punto de entrada para nuestra aplicacion
// Aqui vamos a empezar todo el codigo de JS que basicamente va a inicializar el serivdor express, entre otras cosas, las BD, autenticaciones, rutas, etc

// Requires, esto es una importacion de librerias ya sea de 3eros o personalizdas que ocupamos para que funcione algo
// Cargo la libreria de express
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables, aqui es donde ya vamos a usar las librerias
var app = express();

// Body Parser
// parse application/x-www-form-urlencoded
// Estos son midddleware, son funciones que se van a ejecutar siempre, cuando una peticion entre siempre va a pasar por aca, si hay algo en el body que nosotros estemos enviando el body parser lo va a tomar y nos va a crear el objeto de JS para que lo podamos utililzar en cualquier lugar
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');

// Conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    // En JS cuando ejecutamos esto, se detiene todo el proceso, ya no se ejecuta nada mas, si la BD no funciona ya no se ejecuta nada
    if (err) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
});

// Para usar la libreria server index, esto no lo usaremos, es una forma adicional de como mostrar las imagenes no estan segura porque poniendo la url correcta para ver imagenes el usuario puede ver todas los archivos en este caso de la carpeta uploads
// Server index config
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'))
// app.use('/uploads', serveIndex(__dirname + '/uploads'));


// Rutas
// Defino el middleware
// Cuando cualquier peticion haga match con '/' quiero que use el appRoutes
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/', appRoutes);

// Escuchar peticiones
// listen(Quiero que este escuchando el puerto 3000 o culaquier otro puerto que no usemos, algun mensaje para saber si logro levantar o sucedio algun error)
app.listen(3000, () => {
    // Cambiar a color verde el mensaje, la palabra online
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
})