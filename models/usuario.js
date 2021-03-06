var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

// Creo un objeto que me permita controlar cuales son los roles que voy a permitir
var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

// Defino lo que es el usuario esquema
// Esto es una funcion que recibe un objeto de JS con la configuracion del registro que nosostros queremos hacer o la configuracion del esquema que nosostros vamos a definir en este momento
var usuarioSchema = new Schema({
    // Dentro de este esquema van cada uno de los campos de la Base de datos
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    email: { type: String, unique: true, required: [true, 'El correo es necesario'] },
    password: { type: String, required: [true, 'La contraseña es necesaria'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos }, // Default: Valor por defecto
    // Si es true quiere decir que el usuario se creo por google, si es false quiere decir que el usuario no puede antenticarse por google px ya previamente el mismo uso su correo para autenticar en nuestra aplicacion
    google: { type: Boolean, default: false }

});

// Con el path lee la propiedad del campo
usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

// Necesito utilizar este esquema fuera de este archivo y para eso lo exporto
//model(nombreque yo quiero que tenga este modelo, el objeto que yo quiero que relacione)
module.exports = mongoose.model('Usuario', usuarioSchema);