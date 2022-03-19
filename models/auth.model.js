// Funcion response
const { response } = require('express');
// Conexion a BD 
const { trackapp } = require('../database/db');
// Generacion de JWT
const { generarJWT } = require('../helpers/jwt');

const login = async (req, res = response) => {
    const { nombre, clave } = req.body;
    try {
        // Obtener el usuario correcto
        let sql = 'SELECT id, rol FROM usuarios WHERE nombre = ? and clave = ?';
        const [rows] = await trackapp.query(sql, [nombre, clave]);
        // Usuario incorrecto
        if (rows.length == 0) return res.status(400).json({ msg: 'El usuario con los datos ingresados no existe' });
        // Usuario correcto
        const token = await generarJWT(rows[0].id);
        res.json({
            ok: true,
            token,
            usuarioId: rows[0].id
        })
    } catch (error) {
        res.status(500).json({ msg: 'Error interno al iniciar sesion'});
    }
}

const renewToken = async (req, res = response) => {
    const id = req.id;
    // Generar nuevo token
    const token = await generarJWT(id)
    // Devolver el usuario segun el UID
    let sql = 'SELECT id, nombre, rol, recepcion, usuarios, nueces, almendras FROM usuarios WHERE id = ?';
    const [rows] = await trackapp.query(sql, [id]);

    res.json({
        ok: true,
        token,
        usuario: rows[0]
    })
}

module.exports = {
    login,
    renewToken,
}