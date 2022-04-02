// Funcion response
const { response } = require('express');
// Conexiones a BD 
const { trackapp, ekilibrio } = require('../database/db');

const obtenerLoteRecepcion = async (req, res = response) => {
    const lote = req.params.lote;
    try {
        // Buscar este lote en la base de trackapp y devolver estos y sus envases.
        let sql = `SELECT nLote, nomArticulo, nomVariedad, nomProductor, pesoBruto, tara, pesoNeto, 
                   patente, chofer, nGuia, fechaEntrada, horaEntrada, 
                   fechaSalida, horaSalida, observacion, estado
                   FROM recepcion WHERE nLote = ?`;
        const [loteTrackapp] = await trackapp.query(sql, [lote]);
        if (loteTrackapp.length > 0) {

            let datosLote = loteTrackapp[0];
            datosLote.estado = (datosLote.estado) ? 'SALIDA' : 'ENTRADA';
            // Buscar los envases
            let sql = `SELECT tipo, cantidad FROM envases WHERE nLote = ?`;
            const [envasesTrackapp] = await trackapp.query(sql, [lote]);
            let datosEnvases = envasesTrackapp || [];
            res.json({
                insertado: false,
                lote: datosLote,
                envases: datosEnvases,
            })
        } else {
            const datosEkilibrio = await obtenerLoteEkilibrio(lote);
            if (datosEkilibrio instanceof Error) return res.status(400).json({ msg: datosEkilibrio.message });

            //Transforma el objeto de envases en arry de arrays (valido para insertar)
            const arrayEnvaseEkilibrio = datosEkilibrio.envasesEkilibrio.map(Object.values);
            // Agregar el lote y los envases
            agregarLote(datosEkilibrio.datosLoteEnvio, arrayEnvaseEkilibrio);
            // Envia la informacion obtenida en ekilibrio
            res.json({ insertado: true, msg: 'Recepcion ingresada correctamente.', lote: datosEkilibrio.datosLoteEnvio, envases: datosEkilibrio.envasesEkilibrio });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Error interno en el servidor, Modulo recepcion.' });
    }
}

async function obtenerLoteEkilibrio(lote) {
    let sql = `SELECT PL.ID_PESAJE, PL.NOMBRE_PRODUCTO, PL.DESCRIPCION_VARIEDAD, P.ESTADO, 
               P.RAZONSOCIAL_CLIENTE,
               P.PESO_BRUTO,
               P.PESO_TARA,
               P.PESO_NETO,
               P.OBSERVACION,
               P.ID_PESAJE,
               PL.NUMERO_LOTE,
               DATE_FORMAT(DATE(P.FECHA_ENTRADA), "%Y/%m/%d") AS FECHA_ENTRADA, 
               TIME_FORMAT(TIME(P.HORA_ENTRADA), "%H:%i") AS HORA_ENTRADA, 
               DATE_FORMAT(DATE(P.FECHA_SALIDA), "%Y/%m/%d") AS FECHA_SALIDA, 
               TIME_FORMAT(TIME(P.HORA_SALIDA), "%H:%i") AS HORA_SALIDA,   
               P.GUIA_DESPACHO, P.PATENTE_CAMION, P.NOMBRE_CHOFER
               FROM pesaje_lote PL 
               INNER JOIN pesaje P ON P.ID_PESAJE = PL.ID_PESAJE
               WHERE PL.NUMERO_LOTE = ?`;
    try {
        const [loteEkilibrio] = await ekilibrio.query(sql, [lote]);
        if (loteEkilibrio.length > 0) {
            // Recibimos el primer resultado del lote
            let datosLote = loteEkilibrio[0];
            // Existe en ekilibrio sacaremos igualmente los envases
            let sql = `SELECT DESCRIPCION_ENVASE as tipo, CANTIDAD_ENVASE as cantidad 
                       FROM pesaje_envase_bruto WHERE ID_PESAJE = ?`;
            const [envasesEkilibrio] = await ekilibrio.query(sql, [datosLote.ID_PESAJE]); // -> los envases pueden ser varios asi que no sacamos el 1ro

            // Como encontro el lote en ekilibrio lo transformamos a objeto para poder estandarizarlo

            const datosLoteEnvio = {
                nLote: datosLote.NUMERO_LOTE,
                nomArticulo: datosLote.NOMBRE_PRODUCTO,
                nomProductor: datosLote.RAZONSOCIAL_CLIENTE,
                nomVariedad: datosLote.DESCRIPCION_VARIEDAD,
                pesoBruto: datosLote.PESO_BRUTO,
                tara: datosLote.PESO_TARA,
                pesoNeto: datosLote.PESO_NETO,
                patente: datosLote.PATENTE_CAMION,
                chofer: datosLote.NOMBRE_CHOFER,
                nGuia: datosLote.GUIA_DESPACHO,
                observacion: datosLote.OBSERVACION,
                fechaEntrada: datosLote.FECHA_ENTRADA,
                horaEntrada: datosLote.HORA_ENTRADA,
                fechaSalida: datosLote.FECHA_SALIDA,
                horaSalida: datosLote.HORA_SALIDA,
                estado: datosLote.ESTADO,
                estadoIng: (datosLote.ESTADO == 'ENTRADA') ? 0 : 1,

            }
            // Agregar el numero de lote a envases equilibrio
            envasesEkilibrio.forEach((envase, index) => { envasesEkilibrio[index].nLote = datosLote.NUMERO_LOTE });
            // Todo terminado enviamos el objeto de lote y el objeto de envases
            return { datosLoteEnvio, envasesEkilibrio };
        } else {
            // No existe en ekilibrio
            return new Error('El lote no esta disponible o no existe.');
        }
    } catch (error) {
        return new Error(error.message);
    }
}

// Funcion de agregar el lote y los envases a la base de datos trackapp
async function agregarLote(l, e) {

    let sql = `INSERT INTO recepcion(nLote, nomArticulo, nomVariedad, nomProductor, pesoBruto, tara, pesoNeto, patente, chofer, nGuia, fechaEntrada, horaEntrada, fechaSalida, horaSalida, observacion, estado) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    try {
        const [rows] = await trackapp.query(sql, [l.nLote, l.nomArticulo, l.nomVariedad, l.nomProductor, l.pesoBruto, l.tara, l.pesoNeto, l.patente, l.chofer, l.nGuia, l.fechaEntrada, l.horaEntrada, l.fechaSalida, l.horaSalida, l.observacion, l.estadoIng]);
        if (rows.affectedRows > 0) {
            // Se agrego ahora agregar los envases
            // los envases son un array de objetos por tanto se deben poder insertar varios a la vez
            let sql = `INSERT INTO envases(tipo, cantidad, nLote) VALUES ?`;
            await trackapp.query(sql, [e]);
        }
    } catch (error) {
        console.log('Agregar Lote', error);
    }
}

const listarRecepciones = async (req, res = response) => {
    const inicio = req.query.ini;
    const termino = req.query.ter;

    let sql = `SELECT nLote, nomArticulo, nomVariedad, nomProductor, pesoBruto, 
               tara, pesoNeto, fechaEntrada, horaEntrada, fechaSalida, horaSalida, estado
               FROM recepcion 
               ${(inicio && termino) ? "WHERE fechaEntrada BETWEEN ? AND ?" : ''}
               ORDER BY fechaEntrada DESC, horaEntrada DESC`;

    try {
        const [rows] = await trackapp.query(sql, [inicio, termino]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ msg: 'Error al recuperar datos de recepciones' });
    }
}

const actualizarLote = async (req, res = response) => {
    const lote = req.params.lote;
    try {
        // Buscar el lote que queremos actualizar en ekilibrio
        const datosEkilibrio = await obtenerLoteEkilibrio(lote);
        if (datosEkilibrio instanceof Error) return res.status(400).json({ msg: datosEkilibrio.message });

        // Query para actualizar los datos dentro de track app
        const l = datosEkilibrio.datosLoteEnvio;

        let sql = `UPDATE recepcion SET nomArticulo = ?, nomVariedad = ?, nomProductor = ?, pesoBruto = ?, tara = ?, 
                   pesoNeto = ?, patente = ?, chofer = ?, nGuia = ?, fechaSalida = ?, horaSalida = ?, observacion = ?, estado = ?  
                   WHERE nLote = ?`;
        const [rows] = await trackapp.query(sql, [l.nomArticulo, l.nomVariedad, l.nomProductor, l.pesoBruto, l.tara, l.pesoNeto, l.patente, l.chofer, l.nGuia, l.fechaSalida, l.horaSalida, l.observacion, l.estadoIng, lote]);
        if (rows.affectedRows > 0) {
            // Si funciono enviar respuesta 
            l.estado = (l.estado) ? 'SALIDA' : 'ENTRADA';
            res.json({ ok: true, lote: l, msg: `Lote ${lote} actualizado correctamente.` });
        } else {
            // No funciona enviar error
            res.status(400).json({ msg: 'El lote buscado no se pudo actualizar' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Error interno al actualizar el lote.' });
    }
}

const eliminarLote = async (req, res = response) => {
    const lote = req.params.lote;
    let sql = `DELETE FROM recepcion WHERE nLote = ?`;
    try {
        const [respRec] = await trackapp.query(sql, [lote]);
        if (respRec.affectedRows > 0) {
            // Si logro eliminarse correctamente, eliminaremos los envases
            let sql = `DELETE FROM envases WHERE nLote = ?`;
            await trackapp.query(sql, [lote]);
            // Luego de esa accion se envia la respuesta
            res.json({ ok: true, msg: `Lote ${lote} eliminado correctamente.` });
        } else {
            res.status(500).json({ msg: 'El lote no pudo ser eliminado' });
        }
    } catch (error) {
        console.log(error)
        if (error.code == 'ER_ROW_IS_REFERENCED_2') return res.status(500).json({ msg: 'El lote esta siendo ocupado en otros procesos' });
        res.status(500).json({ msg: 'Error interno al eliminar el Lote' });
    }
}

const listarLotesEkilibrio = async (req, res = response) => {
    const { desde, hasta, proceso } = req.query;
    let sql = `SELECT PL.NUMERO_LOTE, PL.NOMBRE_PRODUCTO, PL.DESCRIPCION_VARIEDAD, P.ESTADO,
               DATE(P.FECHA_ENTRADA) AS FECHA_ENTRADA,
               TIME(P.HORA_ENTRADA) AS HORA_ENTRADA, 
               DATE(P.FECHA_SALIDA) AS FECHA_SALIDA,
               TIME(P.HORA_SALIDA) AS HORA_SALIDA, 
               P.RAZONSOCIAL_CLIENTE, P.PESO_BRUTO, P.PESO_TARA, P.PESO_NETO
               FROM pesaje_lote PL
               INNER JOIN pesaje P ON PL.ID_PESAJE = P.ID_PESAJE  
               WHERE YEAR(P.FECHA_ENTRADA) = 2022 
               ${(desde && hasta) ? "AND P.FECHA_ENTRADA BETWEEN ? AND ?" : ''}
               ${(proceso == 'proceso') ? "AND LENGTH(PL.NUMERO_LOTE) = 7 AND PL.AÑO = 22" : ''}
               ORDER BY P.FECHA_ENTRADA DESC, P.HORA_ENTRADA DESC;`;
    try {
        const [rows] = await ekilibrio.query(sql, [desde, hasta, proceso]);
        res.json(rows);
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Error interno al listar datos ekilibrio' });
    }
}

const actualizarTodo = async (req, res = response) => {
    console.log()
    let sql = `UPDATE trackapp.recepcion re 
               LEFT JOIN ekilibrio.pesaje_lote pl ON re.nLote = pl.NUMERO_LOTE
               LEFT JOIN ekilibrio.pesaje pe ON pe.ID_PESAJE  = pl.ID_PESAJE
               SET re.nomArticulo = pl.NOMBRE_PRODUCTO,
               re.nomVariedad = pl.DESCRIPCION_VARIEDAD,
               re.nomProductor = pe.RAZONSOCIAL_CLIENTE,
               re.pesoBruto = pe.PESO_BRUTO,
               re.tara = pe.PESO_TARA,
               re.pesoNeto = pe.PESO_NETO,
               re.patente = pe.PATENTE_CAMION,
               re.chofer = pe.NOMBRE_CHOFER,
               re.nGuia = pe.GUIA_DESPACHO,
               re.observacion = pe.OBSERVACION,
               re.estado = IF(pe.ESTADO = 'SALIDA', 1, 0)
               WHERE re.nLote = pl.NUMERO_LOTE;`;
    try {
        const [rows] = await ekilibrio.query(sql);
        console.log(rows);
        res.json({msg: 'Lotes actualizados Correctamente'});
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Error interno al listar datos ekilibrio' });
    }
}

module.exports = {
    obtenerLoteRecepcion,
    listarRecepciones,
    actualizarLote,
    eliminarLote,
    obtenerLoteEkilibrio,
    agregarLote,
    listarLotesEkilibrio,
    actualizarTodo,
}