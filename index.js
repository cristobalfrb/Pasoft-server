// Traer las variables globales
require('dotenv').config();

// Requerir express
const express = require('express');

//TODO: Asignar la conexion a base de datos (express)

// Habilitar cors
const cors = require('cors');

// Crear el servidor de express
const app = express();

// Configurar Cors
app.use(cors());

// Lectura y parceo del body
app.use(express.urlencoded({extended: false}));
app.use(express.json())

// Directorio Publico
app.use(express.static('public'));

// Todas las rutas del server 
app.use('/api/usuarios', require('./routes/usuarios')); // todas las rutas relacionadas a usuarios
app.use('/api/auth', require('./routes/auth')); // las rutas de autenticacion
app.use('/api/recepcion', require('./routes/recepcion')); // las rutas de recepcion
app.use('/api/despelonado', require('./routes/despelonado')); // las rutas de despelonado
app.use('/api/secado', require('./routes/secado')); // las rutas de secado
app.use('/api/salida', require('./routes/salida')); // las rutas de salida
app.use('/api/informe', require('./routes/informe')); // las rutas de informes


// Asignar un puerto
app.listen(process.env.PORT, () => {
    console.log('Servidor corriendo en el puerto ' + process.env.PORT);
})