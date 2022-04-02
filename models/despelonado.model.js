// Funcion response
const { response } = require('express');
// Conexiones a BD 
const { trackapp } = require('../database/db');
// Funciones de Recepcion
const { obtenerLoteEkilibrio, agregarLote } = require('./recepcion.models');

const obtenerLoteDespelonado = async (req, res = response) => {
    const lote = req.params.lote;
    let sql = `SELECT d.idDespelonado, d.nLote, d.fechaEntradaDes, d.horaEntradaDes, d.planta, d.horaSalidaDes, d.fechaSalidaDes, d.turno, d.observacion,
               r.nomArticulo, r.nomVariedad, r.nomProductor, r.pesoNeto, r.fechaEntrada, r.horaEntrada 
               FROM despelonado d
               RIGHT JOIN recepcion r ON r.nLote = d.nLote
               WHERE r.nLote = ?`;
    try {
        const [loteDespelonado] = await trackapp.query(sql, [lote]);
        if (loteDespelonado.length > 0) {
            const datosDespelonado = loteDespelonado[0];
            // Opcionalmente podemos traer los envases (aunque no es parte de despelonado)
            let sql = `SELECT tipo, cantidad FROM envases WHERE nLote = ?`;
            const [envases] = await trackapp.query(sql, [lote]);
            res.json({ datosDespelonado, envases });
        } else {
            // No existe en la base de datos habra que agregarlo de ekilibrio.
            const datosEkilibrio = await obtenerLoteEkilibrio(lote);
            if (datosEkilibrio instanceof Error) return res.status(400).json({ msg: datosEkilibrio.message });

            //Transforma el objeto de envases en array de arrays (valido para insertar)
            const arrayEnvaseEkilibrio = datosEkilibrio.envasesEkilibrio.map(Object.values);
            // Agregar el lote y los envases
            agregarLote(datosEkilibrio.datosLoteEnvio, arrayEnvaseEkilibrio);
            // Envia la informacion obtenida en ekilibrio
            res.json({ insertado: true, datosDespelonado: datosEkilibrio.datosLoteEnvio, envases: datosEkilibrio.envasesEkilibrio });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Error interno en el servidor, Modulo despelonado' });
    }
}

const agregarDespelonado = async (req, res = response) => {
    const { lote, fechaEntrada, horaEntrada, fechaSalida, horaSalida, turno, planta, observacion } = req.body;
    try {
        let sql = "INSERT INTO despelonado(nLote, fechaEntradaDes, horaEntradaDes, fechaSalidaDes, horaSalidaDes, planta, turno, observacion) VALUES(?,?,?,?,?,?,?,?)";
        const [rows] = await trackapp.query(sql, [lote, fechaEntrada, horaEntrada, fechaSalida, horaSalida, planta, turno, observacion]);

        if (rows.affectedRows > 0) res.json({ ok: true, msg: `Lote ${lote} ingresado a despelonado.` });
        else res.status(500).json({ msg: 'No se pudo ingresar el lote a despelonado' });

    } catch (error) {
        if (error.code == 'ER_DUP_ENTRY') return res.status(500).json({ msg: 'El lote a ingresar ya existe en despelonado' });
        res.status(500).json({ msg: 'Error interno al ingresar al despelonado' });
    }
}

const actualizarDespelonado = async (req, res = response) => {
    const { fechaEntrada, horaEntrada, fechaSalida, horaSalida, observacion, id } = req.body;
    try {
        let sql = `UPDATE despelonado SET fechaEntradaDes = ?, horaEntradaDes = ?, fechaSalidaDes = ?, 
                   horaSalidaDes = ?, observacion = ?  WHERE idDespelonado = ?`;
        const [rows] = await trackapp.query(sql, [fechaEntrada, horaEntrada, fechaSalida, horaSalida, observacion, id]);
        if (rows.affectedRows > 0) res.json({ ok: true, msg: 'Lote actualizado correctamente' });
        else res.status(500).json({ msg: 'No se pudo actualizar el registro' });

    } catch (error) {
        res.status(500).json({ msg: 'Error interno al actualizar en despelonado' });
    }
}

const eliminarDespelonado = async (req, res = response) => {
    const id = req.params.id;
    try {
        let sql = "DELETE FROM despelonado WHERE idDespelonado = ?";
        const [rows] = await trackapp.query(sql, [id]);
        if (rows.affectedRows > 0) return res.json({ ok: true, msg: 'Lote eliminado correctamente' });
        else res.status(500).json({ msg: 'No se pudo eliminar el lote' });
    } catch (error) {
        res.status(500).json({ msg: 'Error interno al eliminar en despelonado' });
    }
}

/* Verificar que la funcion funciona de buena manera **/
const listarDespelonado = async (req, res = response) => {
    const { desde, hasta, turno, planta } = req.query;

    let params = [];

    (desde && hasta) ? params.push(desde, hasta) : null;
    (turno) ? params.push(turno) : null;
    (planta) ? params.push(planta) : null;

    let sql = `SELECT de.nLote, de.fechaEntradaDes, de.horaEntradaDes, de.fechaSalidaDes, de.horaSalidaDes, de.observacion, 
               de.planta, de.turno, re.pesoNeto, re.nomProductor, re.nomVariedad, re.tara, re.pesoBruto, en.tipo, en.cantidad
               FROM despelonado de
               INNER JOIN recepcion re on re.nLote = de.nLote
               INNER JOIN envases en on en.nLote = de.nLote
               WHERE de.fechaEntradaDes
               ${(desde && hasta) ? " BETWEEN ? AND ?" : ""}
               ${(turno) ? "AND de.turno = ?" : ""}
               ${(planta) ? "AND de.planta = ?" : ""}
               GROUP BY de.nLote
               ORDER BY de.fechaEntradaDes DESC, de.horaEntradaDes DESC`;
    try {
        const [rows] = await trackapp.query(sql, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ msg: 'Error interno al listar despelonado' });
    }
}

const listarLotesPendientesDes = async (req, res = response) => {
    let sql = `SELECT PL.NOMBRE_PRODUCTO, PL.DESCRIPCION_VARIEDAD, PL.NUMERO_LOTE, 
               P.RAZONSOCIAL_CLIENTE, DATE(P.FECHA_ENTRADA) AS FECHA, TIME(P.HORA_ENTRADA) AS HORA, P.PESO_BRUTO, P.PESO_NETO 
               FROM ekilibrio.pesaje_lote PL 
               INNER JOIN ekilibrio.pesaje P on PL.ID_PESAJE = P.ID_PESAJE 
               LEFT JOIN trackapp.despelonado DES on PL.NUMERO_LOTE = DES.nLote 
               WHERE DES.nLote IS NULL AND YEAR(P.FECHA_ENTRADA) = 2022 AND LENGTH(NUMERO_LOTE) = 7`;
    try {
        const [rows] = await trackapp.query(sql);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ msg: 'Error al listar datos despelonado' });
    }
}



module.exports = {
    obtenerLoteDespelonado,
    agregarDespelonado,
    listarDespelonado,
    actualizarDespelonado,
    eliminarDespelonado,
    listarLotesPendientesDes,
}