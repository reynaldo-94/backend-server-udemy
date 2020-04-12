var express = require('express');

var app = express();

const path = require('path'); // Con esto obtengo el path de la imagen
const fs = require('fs'); // fs->filesystem

// get(ruta,funcion de callback)
// next -> lo que le dice a express es que cuando se ejecute que siga a la siguiente ejecucion, normalmente no se usan en la peticiones get,post,put etc, estos son bien usados cuando trabajamos con algun middleware
// Con esto defino una ruta
app.get('/:tipo/:img', (req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    // Creo un path para verificar si la imagen existe, sino existe voy a mostrar una imagen por defecto

    // resolve: Esto me ayuda a mi a resolver este path para que siempre quede correcto
    // resolve( Ahora yo tengo que especificar toda la ruta de la imagen, __dirname: Con esto siempre tengo toda la ruta de donde me encuentro en este momento, tengo que hacer referencia a la imagen que tengo aca)
    var pathImagen = path.resolve(__dirname, `../uploads/${ tipo }/${ img }`); // Lo que va dentro de l parentecis,seria la direccion completa de la imagen

    // Verificamos si el path es valido, osea si la imagen existe
    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        // Si la imagen no existe
        var pathNoImagen = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImagen);
    }

});

// Para utilizar cualquier cosa fuera de este lugar, neceisto exportarlo
module.exports = app;