// Funcion response
const { response } = require('express');
// Conexiones a BD 
const { trackapp } = require('../database/db');

const listarSecado = async (req, res = response) => {
    const { desde, hasta, planta, turno } = req.query;

    let params = [];

    (desde && hasta) ? params.push(desde, hasta) : null;
    (turno) ? params.push(turno) : null;
    (planta) ? params.push(planta) : null;

    let sql = `SELECT se.nLote, se.fechaEntradaSec, se.horaEntradaSec, se.nCajon, de.planta, de.turno, se.humedad, se.cerrado,
               re.nomProductor, re.nomArticulo, re.nomVariedad
               FROM secado se
               INNER JOIN despelonado de on de.nLote = se.nLote 
               INNER JOIN recepcion re on re.nLote = se.nLote
               WHERE se.fechaEntradaSec
               ${(desde && hasta) ? " BETWEEN ? AND ?" : ""}
               ${(turno) ? "AND de.turno = ?" : ""}
               ${(planta) ? "AND de.planta = ?" : ""}
               ORDER BY se.fechaEntradaSec DESC, se.horaEntradaSec DESC`;
    try {
        const [rows] = await trackapp.query(sql, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ msg: 'Error interno al listar registros secado.' });
    }
}

const agregarCajon = async (req, res = response) => {
    const { lote, cajon, planta, humedad } = req.body;

    let [valido, cantidad] = await Promise.all([validarCajon(cajon, planta), validarCantidadCajones(lote)]);

    if (valido.length > 0) return res.status(500).json({ msg: 'El cajon esta ocupado con el lote ' + valido[0].nLote })
    if (cantidad > 10) return res.status(500).json({ msg: 'Numero maximo de cajones excedido' });

    // Enviar los parametros y validar que sean correctos
    let sql = "INSERT INTO secado (nLote, nCajon, humedad, fechaEntradaSec, horaEntradaSec) VALUES (?,?,?,CURDATE(),CURTIME())";
    try {
        const [rows] = await trackapp.query(sql, [lote, cajon, humedad]);
        if (rows.affectedRows > 0) {
            const fecha = new Date().toISOString().split('T')[0];;
            const hora = new Date().toString().split(' ')[4]
            const cerrado = false;

            const registro = { lote, cajon, humedad, id: rows.insertId, fecha, hora, cerrado }
            res.json({ ok: true, registro, msg: 'Cajon ingresado.' });
        }
        else res.status(500).json({ msg: 'No se puedo agregar el cajon' });
    } catch (error) {
        console.log(error)
        if (error.code == 'ER_DUP_ENTRY') return res.status(500).json({ msg: 'El lote y cajon ya existen' });
        res.status(500).json({ msg: 'Error interno al agregar el cajon de secado.' });
    }

}

const actualizarCajon = async (req, res = response) => {
    const { cajon, planta, id, humedad } = req.body;
    const resp = await validarCajon(cajon, planta, id);
    if (resp.length > 0) return res.status(500).json({ msg: 'El cajon esta ocupado con el lote ' + valido[0].nLote });

    let sql = `UPDATE secado SET nCajon = ?, humedad = ? WHERE idSecado = ? AND cerrado = FALSE`;
    try {
        const [rows] = await trackapp.query(sql, [cajon, humedad, id]);
        const registro = { cajon, humedad, id };
        if (rows.affectedRows > 0) res.json({ ok: true, registro, msg: 'Cajon actualizado' });
    } catch (error) {
        res.status(500).json({ msg: 'Error interno al agregar el cajon de secado.' });
    }
}

const eliminarCajon = async (req, res = response) => {
    const id = req.params.id;
    let sql = 'DELETE FROM secado WHERE idSecado = ?';
    try {
        const [rows] = await trackapp.query(sql, [id]);
        if (rows.affectedRows > 0) res.json({ ok: true, msg: 'Cajon eliminado correctamente.' });
        else res.status(500).json({ msg: 'No se pudo eliminar el cajon de secado' });
    } catch (error) {
        if (error.code == 'ER_ROW_IS_REFERENCED_2') return res.status(500).json({ msg: 'No se puede eliminar cajon si esta ocupado en salida.' });
        res.status(500).json({ msg: 'Error interno al eliminar el cajon de secado.' });
    }
}

async function listarCajones(lote) {
    let sql = `SELECT idSecado, nLote, nCajon, humedad, fechaEntradaSec, horaEntradaSec, cerrado
               FROM secado s
               WHERE s.nLote = ?`;
    try {
        const [rows] = await trackapp.query(sql, [lote]);
        return rows;
    } catch (error) {
        return [];
    }
}

const cargarDatosLote = async (req, res = response) => {
    const lote = req.params.lote;
    let sql = `SELECT re.nLote, re.nomArticulo, re.nomVariedad, re.nomProductor, re.pesoNeto, 
               re.fechaEntrada, re.horaEntrada, de.planta 
               FROM recepcion re 
               INNER JOIN despelonado de on de.nLote = re.nLote
               WHERE re.nLote = ?`;
    try {
        const [rows] = await trackapp.query(sql, [lote]);
        if (rows.length > 0) {
            const cajones = await listarCajones(lote);
            res.json({ ok: true, lote: rows[0], cajones: cajones });
        }
        else res.status(500).json({ msg: 'El lote no esta disponible, verificar que exista en despelonado' });
    } catch (err) {
        res.status(500).json({ msg: 'Error interno al buscar datos del lote.' });
    }
}

async function validarCajon(cajon, planta, id = '') {

    let sql = `SELECT s.nLote FROM secado s INNER JOIN despelonado d ON s.nLote = d.nLote WHERE s.nCajon = ? 
               AND s.cerrado = false AND d.planta = ? ${(id) ? ' AND idSecado != ? ' : ''}`;
    try {
        const [rows] = await trackapp.query(sql, [cajon, planta, id]);
        return rows;
    } catch (err) {
        return new Error(err.message)
    }
}

async function validarCantidadCajones(lote) {

    let sql = `SELECT COUNT(*) as cantidad from secado WHERE nLote = ?`;
    try {
        const [rows] = await trackapp.query(sql, lote);
        return rows[0];
    } catch (err) {
        return new Error(err.message);
    }
}


module.exports = {
    listarSecado,
    agregarCajon,
    actualizarCajon,
    eliminarCajon,
    cargarDatosLote,
}