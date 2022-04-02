// Funcion response
const { response } = require('express');
// Conexion a BD 
const { trackapp } = require('../database/db');

// Crear un usuario
const crearUsuario = async (req, res = response) => {
    const { nombre, clave, rol, usuarios, recepcion, nueces, almendras } = req.body; // Recibir los datos desde el cliente
    try {
        let sql = 'INSERT INTO usuarios(nombre, clave, rol, usuarios, recepcion, nueces, almendras) VALUES (?,?,?,?,?,?,?)'
        const [rows] = await trackapp.query(sql, [nombre, clave, rol, usuarios, recepcion, nueces, almendras]);
        // responder con accion realizada y el nuevo usuario
        res.json({
            msg: 'Usuario creado correctamente',
        })
    } catch (error) {
        if (error.code == 'ER_DUP_ENTRY') return res.status(500).json({ msg: 'El usuario a ingresar ya existe' });
        res.status(500).json({ msg: 'Error interno al ingresar usuario' })
    }
}

const listarUsuarios = async (req, res = response) => {
    try {
        let sql = 'SELECT id, nombre, rol FROM usuarios WHERE rol != "Administrador"';
        const [rows] = await trackapp.query(sql);
        res.json(rows) // -> listado de usuarios
    } catch (error) {
        res.status(500).json({ msg: 'Error interno al obtener usuarios' })
    }
}

const cargarUsuario = async (req, res = response) => {
    const { id } = req.params; // -> obtener el id de usuario por parametro
    try {
        let sql = 'SELECT id, nombre, rol, clave, usuarios, recepcion, nueces, almendras FROM usuarios WHERE id = ?';
        const [rows] = await trackapp.query(sql, [id]);
        res.json(rows[0]) // -> datos del usuario
    } catch (error) {
        res.status(500).json({ msg: 'Error interno al obtener usuario' })
    }
}

const editarUsuario = async (req, res = response) => {
    const { nombre, clave, rol, id, usuarios, recepcion, nueces, almendras } = req.body;
    console.log(req.body);
    try {
        let sql = 'UPDATE usuarios SET nombre = ?, clave = ?, rol = ?, usuarios= ?, recepcion = ?, nueces = ?, almendras = ? WHERE id = ?';
        await trackapp.query(sql, [nombre, clave, rol, usuarios, recepcion, nueces, almendras, id]);
        res.json({
            msg: 'Usuario editado correctamente'
        })
    } catch (error) {
        if (error.code == 'ER_DUP_ENTRY') return res.status(500).json({ msg: 'Existen campos duplicados' });
        res.status(500).json({ msg: 'Error interno al editar usuario' })
    }
}

const eliminarUsuario = async (req, res = response) => {
    const { id } = req.params;
    try {
        let sql = 'DELETE FROM usuarios WHERE id = ?';
        await trackapp.query(sql, [id]);
        res.json({
            msg: 'Usuario eliminado correctamente',
            id, // -> id del usuario eliminado
        })
    } catch (err) {
        res.status(500).json({ msg: 'Error interno al eliminar usuario' })
    }
}

module.exports = {
    crearUsuario,
    listarUsuarios,
    cargarUsuario,
    editarUsuario,
    eliminarUsuario,
}