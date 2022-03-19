const {
    Router
} = require('express'); // Manejador de rutas de express
const router = Router();

const {
    body
} = require('express-validator');
// Traer el controllador de usuarios 
const UsuarioModel = require('../models/usuario.model');
// Traer los Middlewares de validacion
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { validarRolSupervisor } = require('../middlewares/validar-roles');

// Peticiones HTTP a /api/usuarios

router.post('/', [
    validarJWT, // valida que el token sea correcto
    validarRolSupervisor, // valida que el usuario sea supervisor o administrador
    body('nombre', 'El nombre es obligatorio').not().isEmpty(),
    body('clave', 'La clave es obligatoria').not().isEmpty(),
    body('rol', 'El rol es obligatorio').not().isEmpty(),
    validarCampos,
],
    UsuarioModel.crearUsuario
) // Crear un usuario simple

router.put('/', [
    validarJWT, 
    validarRolSupervisor,
    body('nombre', 'El nombre es obligatorio').not().isEmpty(),
    body('clave', 'La clave es obligatoria').not().isEmpty(),
    body('rol', 'El rol es obligatorio').not().isEmpty(),
    body('id', 'El id es obligatorio').not().isEmpty(),
    validarCampos,
],
    UsuarioModel.editarUsuario
) // Editar usuario (solo un supervisor puede eliminar supervisores)

router.get('/', [validarJWT],
    UsuarioModel.listarUsuarios
); // Listar todos los usuarios

router.get('/:id', [
    validarJWT, 
    validarRolSupervisor,
],
    UsuarioModel.cargarUsuario
); // Cargan usuario mediante ID

router.delete('/:id', [
    validarJWT, 
    validarRolSupervisor,
],
    UsuarioModel.eliminarUsuario
) // Eliminar usuario mmediante ID (solo un supervisor puede eliminar supervisores)

module.exports = router;