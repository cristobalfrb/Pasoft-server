const jwt = require('jsonwebtoken');

const generarJWT = (id) => {
    // Retornar una promesa
    return new Promise((resolve, reject) => {
        // Grabar los datos que se enviaran al front
        const payload = { id }

        // Generar la firma
        jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '12h',
        }, (err, token) => {
            if (err) {
                reject('Error al generar el JWT ', err);
            } else {
                resolve(token);
            }
        });
    })
}

module.exports = {
    generarJWT,
}