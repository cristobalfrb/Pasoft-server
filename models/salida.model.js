// Funcion response
const { response } = require('express');
// Conexiones a BD 
const { trackapp } = require('../database/db');

const listarSalidas = async (req, res = response) => {
    const { desde, hasta } = req.query;

    let sql = `SELECT sa.nLote, se.nCajon, sa.humedadSalida, de.planta, sa.pesoDinamico, 
               sa.fechaDespacho, sa.horaDespacho, sa.fechaSalida, sa.horaSalida, de.planta,
               SUM(sa.pesoUnitario1 + sa.pesoUnitario2 + sa.pesoUnitario3) AS totalUnitario
               FROM salida sa
               INNER JOIN secado se on se.idSecado = sa.idCajon
               INNER JOIN despelonado de on de.nLote = sa.nLote
               ${(desde != '' && hasta != '') ? "WHERE fechaSalida BETWEEN ? AND ?" : ''}
               GROUP BY sa.idSalida
               ORDER BY sa.fechaSalida DESC, sa.horaSalida DESC`;
    try {
        const [rows] = await trackapp.query(sql, [desde, hasta]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ msg: 'Error interno al listar registros salida.' });
    }
}

const obtenerDatosSalida = async (req, res = response) => {
    const lote = req.params.lote;
    let sql = `SELECT re.nLote, re.nomArticulo, re.nomVariedad, re.nomProductor, re.pesoNeto, 
    re.fechaEntrada, re.horaEntrada, de.planta 
    FROM recepcion re 
    INNER JOIN despelonado de on de.nLote = re.nLote
    WHERE re.nLote = ?`;
    try {
        const [rows] = await trackapp.query(sql, [lote]);
        if (rows.length > 0) {
            const cajones = await obtenerDetalleCajones(lote);
            res.json({ ok: true, lote: rows[0], cajones });
        }
        else res.status(500).json({ msg: 'El lote no esta disponible, verificar que exista en despelonado' });
    } catch (err) {
        res.status(500).json({ msg: 'Error interno al buscar datos del lote.' });
    }
}

async function obtenerDetalleCajones(lote) {
    let sql = ` SELECT se.idSecado, se.nLote, se.nCajon, se.fechaEntradaSec, se.horaEntradaSec, se.cerrado,           
                sa.idSalida, sa.humedadSalida, sa.pesoDinamico, sa.fechaDespacho,  sa.horaDespacho,
                sa.almacenUnitario1, sa.almacenUnitario2, sa.almacenUnitario3,
                sa.envasesUnitario1, sa.envasesUnitario2, sa.envasesUnitario3,
                sa.pesoUnitario1, sa.pesoUnitario2, sa.pesoUnitario3,
                sa.fechaSalida, sa.horaSalida, sa.observacion 
                FROM salida sa
                RIGHT JOIN secado se ON se.idSecado = sa.idCajon
                WHERE se.nLote = ?`
    try {
        const [rows] = await trackapp.query(sql, [lote]);
        return rows;
    } catch (error) {
        return [];
    }
}

const insertarSalida = async (req, res = response) => {
    const s = req.body;
    let sql = `INSERT INTO salida(nLote, idCajon, humedadSalida,
               almacenUnitario1, almacenUnitario2, almacenUnitario3,
               envasesUnitario1, envasesUnitario2, envasesUnitario3,
               pesoUnitario1, pesoUnitario2, pesoUnitario3,
               pesoDinamico, fechaDespacho, horaDespacho, observacion)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    try {
        const [rows] = await trackapp.query(sql, [s.nLote, s.idSecado, s.humedadSalida, s.almacenUnitario1, s.almacenUnitario2,
        s.almacenUnitario3, s.envasesUnitario1, s.envasesUnitario2, s.envasesUnitario3, s.pesoUnitario1, s.pesoUnitario2,
        s.pesoUnitario3, s.pesoDinamico, s.fechaDespacho, s.horaDespacho, s.observacion]);
        if (rows.affectedRows > 0) {
            const idSalida = rows.insertId;
            res.json({ ok: true, idSalida, msg: 'Datos guardados.' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Error interno al insertar datos salida' });
    }
}

const editarSalida = async (req, res = response) => {
    const s = req.body;
    let sql = `UPDATE salida SET humedadSalida = ?, observacion = ?, almacenUnitario1 = ?, almacenUnitario2 = ?, 
               almacenUnitario3 = ?, envasesUnitario1 = ?, envasesUnitario2 = ?, envasesUnitario3 = ?,
               pesoUnitario1 = ?, pesoUnitario2 = ?, pesoUnitario3 = ?, pesoDinamico = ?, fechaDespacho = ?, horaDespacho = ?
               WHERE idSalida = ?`;
    try {
        const [rows] = await trackapp.query(sql, [s.humedadSalida, s.observacion, s.almacenUnitario1, s.almacenUnitario2,
        s.almacenUnitario3, s.envasesUnitario1, s.envasesUnitario2, s.envasesUnitario3, s.pesoUnitario1,
        s.pesoUnitario2, s.pesoUnitario3, s.pesoDinamico, s.fechaDespacho, s.horaDespacho, s.idSalida]);
        if (rows.affectedRows > 0) res.json({ ok: true, msg: 'Datos actualizados.' });
    } catch (error) {
        res.status(500).json({ msg: 'Error interno al actualizar datos salida' });
    }
}

const actualizarEstadoCajon = async (req, res = response) => {
    const { idSalida } = req.body;
    let sql = `UPDATE salida, secado SET 
               salida.fechaSalida = CURDATE(), salida.horaSalida = CURTIME(),
               secado.cerrado = true
               WHERE secado.idSecado = salida.idCajon
               AND salida.idSalida = ?`;
    try {
        const [rows] = await trackapp.query(sql, [idSalida]);
        if (rows.affectedRows > 0) {
            const fecha = new Date().toISOString().split('T')[0];;
            const hora = new Date().toString().split(' ')[4]
            const cerrado = true;
            res.json({ ok: true, fecha, hora, cerrado, msg: 'Estado actualizado.' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Error interno al cambiar estado de cajon' });
    }
}

const obtenerCajonesEnUso = async (req, res = response) => {
    let sql = ` SELECT nCajon, nLote, humedad, fechaEntradaSec, horaEntradaSec FROM secado 
                WHERE cerrado = 0
                ORDER BY fechaEntradaSec DESC, horaEntradaSec DESC`;
    try {
        const [rows] = await trackapp.query(sql);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ msg: 'Error interno al buscar datos del secado.' });
    }
}

const eliminarSalida = async (req, res = response) => {
    const { salida, secado } = req.params;
    try {
        let sql = `DELETE FROM salida WHERE idSalida = ?`;
        const [rows] = await trackapp.query(sql, [salida]);
        if (rows.affectedRows > 0) {
            // Cambiamos el estado del cajon
            let sql = `UPDATE secado SET cerrado = false WHERE idSecado = ?`;
            await trackapp.query(sql, [secado]);
            res.json({ ok: true, msg: 'Registro eliminado correctamente.' });
        } else {
            res.status(500).json({ msg: 'No se pudieron eliminar los datos.' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Error interno al eliminar el secado.' });
    }
}

const abrirCajon = async (req, res = response) => {
    const idSecado = req.body.idSecado;
    try {
        let sql = `UPDATE secado SET cerrado = false WHERE idSecado = ?`;
        await trackapp.query(sql, [idSecado]);
        res.json({ msg: 'Cambios realizados correctamente', cerrado: false });
    } catch (error) {
        res.status(500).json({ msg: 'Error interno al cambiar estado.' });
    }
}

module.exports = {
    listarSalidas,
    obtenerDatosSalida,
    insertarSalida,
    eliminarSalida,
    abrirCajon,
    editarSalida,
    actualizarEstadoCajon,
    obtenerCajonesEnUso,
}