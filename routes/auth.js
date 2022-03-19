const { Router } = require('express'); // Router de Express
const router = Router(); // variable de router
const { body } = require('express-validator'); // Validacion de campos
const { validarCampos } = require('../middlewares/validar-campos');

const { validarJWT } = require('../middlewares/validar-jwt');
const AuthModel = require('../models/auth.model');

// Inicio de sesion
router.post('/',
    [
        body('nombre', 'El campo nombre es Obligatorio').not().isEmpty(),
        body('clave', 'El campo de clave es Obligatorio').not().isEmpty(),
        validarCampos
    ],
    AuthModel.login
)

// Renovar token en caso de expiracion
router.get('/renew',
    validarJWT,
    AuthModel.renewToken
)

module.exports = router;