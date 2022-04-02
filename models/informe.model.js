// Funcion response
const { response } = require('express');
// Conexiones a BD 
const { trackapp } = require('../database/db');

const listarInformeGeneral = async (req, res = response) => {
    const { desde, hasta } = req.query;
    let sql = `SELECT 
               re.nLote, 
               re.nomVariedad, 
               re.nomProductor, 
               nomArticulo,
               re.pesoBruto, 
               re.tara,
               re.pesoNeto,
               re.fechaEntrada,
               re.horaEntrada,
               re.observacion,
               de.fechaEntradaDes, 
               de.horaEntradaDes, 
               de.fechaSalidaDes, 
               de.horaSalidaDes, 
               de.planta,
               de.turno,
               COUNT(se.idSecado) AS 'cajonesSecado',
               COUNT(sa.idSalida) AS 'cajonesSalida', 
               CAST(SUM(sa.pesoUnitario1+sa.pesoUnitario2+sa.pesoUnitario3) AS SIGNED) AS pesoTotalUnitario,
               CAST(SUM(sa.pesoDinamico) AS SIGNED) AS pesoDinamico
               FROM recepcion re 
               LEFT JOIN despelonado de ON re.nLote = de.nLote
               LEFT JOIN secado se ON re.nLote = se.nLote
               LEFT join salida sa ON se.idSecado = sa.idCajon 
               ${(desde != '' && hasta != '') ? "WHERE fechaEntrada BETWEEN ? AND ?" : ''}
               GROUP BY nLote
               ORDER BY re.fechaEntrada DESC, re.horaEntrada DESC`;
    try {
        const [rows] = await trackapp.query(sql, [desde, hasta]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ msg: 'Error interno al recibir datos gereral' });
    }
}

const listarInformeSecado = async (req, res = response) => {
    const { desde, hasta } = req.query;
    let sql = `SELECT se.nLote, se.nCajon, se.humedad, 
               de.turno, de.planta,
               re.nomProductor, re.nomVariedad, re.nomArticulo,
               se.fechaEntradaSec, 
               se.horaEntradaSec,
               se.cerrado,
               sa.almacenUnitario1,
               sa.almacenUnitario2,
               sa.almacenUnitario3,
               sa.envasesUnitario1,
               sa.envasesUnitario2,
               sa.envasesUnitario3,
               sa.humedadNSC, sa.humedadNCC, 
               sa.descarga, sa.turnoSalida, sa.observacion,
               sa.pesoUnitario1,
               sa.pesoUnitario2,
               sa.pesoUnitario3,
               sa.pesoDinamico,
               sa.fechaDespacho,
               sa.horaDespacho,
               sa.fechaSalida,
               sa.horaSalida
               FROM secado se 
               LEFT JOIN salida sa on se.idSecado = sa.idCajon
               LEFT JOIN recepcion re on re.nLote = se.nLote
               LEFT JOIN despelonado de on de.nLote = se.nLote
               ${(desde != '' && hasta != '') ? "WHERE fechaEntradaSec BETWEEN ? AND ?" : ''}
               ORDER BY fechaEntradaSec DESC, horaEntradaSec DESC;`;
    try {
        const [rows] = await trackapp.query(sql, [desde, hasta]);
        res.json(rows);
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Error interno al recibir datos gereral' });
    }
}

module.exports = {
    listarInformeGeneral,
    listarInformeSecado,
}