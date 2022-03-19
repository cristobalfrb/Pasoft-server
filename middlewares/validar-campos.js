
/*
    Middleware para validacion de campos
*/

// Traer response para ayudar a la sintaxis
const {
    response
} = require('express');

// Traer los resultados de la validacion de campos
const {
    validationResult
} = require('express-validator')

const validarCampos = (req, res = response, next) => {

    // Validar errores y datos
    const errores = validationResult(req);
    if (!errores.isEmpty()) { // si hay errores devuelve el mensaje
        return res.status(400).json({
            ok: false,
            errors: 'Existen campos incorrectos',
        });
    }

    next(); // Pasa al siguiente middleware
}

module.exports = {
    validarCampos
}