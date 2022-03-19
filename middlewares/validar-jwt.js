const { response } = require('express');
const jwt = require('jsonwebtoken');

const validarJWT = (req, res = response, next) => {
    // Leer el token desde el header
    const token = req.header('x-token');
    if(!token){
        return res.status(401).json({
            ok: false,
            msg: 'No hay token en la peticion'
        })
    }

    try{
        const { id } = jwt.verify(token, process.env.JWT_SECRET) // Desencripta el token
        req.id = id; // Graba el uid del usuario para saber cual esta logeado
        next(); // siguiente meddleware
    }catch(error){
        res.status(401).json({
            ok: false,
            msg: 'Token incorrecto'
        })
    }
}

// TODO: Crear la funcion de validar rol == Para los 3 Distintos Roles y Con capacidad de expanderse.



module.exports = {
    validarJWT
}