// Conexion a BD 
const { response } = require('express');
const { trackapp } = require('../database/db');

// Funcion se encarga de ver el rol que tiene el usuario que realiza el cambio
const validarRolSupervisor = async (req, res = response, next) => {

    const id = req.id;

    try {
        // Consulta a la base de datos
        let sql = 'SELECT rol FROM usuarios WHERE id = ?';
        const [rows] = await trackapp.query(sql, [id]);

        // Preguntar si existe el usuario
        if (rows.length === 0) return res.status(401).json({ msg: 'El usuario registrado no pudo ser comprobado' });

        const usuario = rows[0];

        // Ver si el usuario tiene el rol necesario con un IF
        if (usuario.rol == 'Administrador' || usuario.rol == 'Supervisor') {
            next(); // todo correcto
        } else {
            res.status(403).json({ msg: 'El usuario no tiene acceso para realizar esta accion' });
        }
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error en el servidor al validar el Rol'
        })
    }
}

const validarSoloLectura = async (req, res = response, next) => {
    const id = req.id;
    try {
        // Consulta a la base de datos
        let sql = 'SELECT rol FROM usuarios WHERE id = ?';
        const [rows] = await trackapp.query(sql, [id]);
        // Preguntar si existe el usuario
        if (rows.length === 0) return res.status(401).json({ msg: 'El usuario registrado no pudo ser comprobado' });
        const usuario = rows[0];
        // Ver si el usuario tiene el rol necesario con un IF
        if (usuario.rol == 'Lectura') {
            res.status(403).json({ msg: 'El usuario no tiene acceso para realizar esta accion' });
        } else {
            next(); // todo correcto
        }
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error en el servidor al validar el Rol'
        })
    }
}


module.exports = {
    validarRolSupervisor,
    validarSoloLectura,
}