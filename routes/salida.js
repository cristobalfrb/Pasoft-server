const {
    Router
} = require('express'); // Manejador de rutas de express
const router = Router();

const {
    body
} = require('express-validator');
const { validarJWT } = require('../middlewares/validar-jwt');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarRolSupervisor, validarSoloLectura } = require('../middlewares/validar-roles');

const SalidaModel = require('../models/salida.model');

router.get('/cajones/', [validarJWT], SalidaModel.obtenerCajonesEnUso);

router.get('/', [validarJWT], SalidaModel.listarSalidas);

router.get('/:lote', [validarJWT], SalidaModel.obtenerDatosSalida);

router.post('/', [validarJWT, validarSoloLectura], SalidaModel.insertarSalida);

router.put('/abrir/', [validarJWT, validarRolSupervisor], SalidaModel.abrirCajon);

router.put('/enviar/', [validarJWT, validarSoloLectura], SalidaModel.actualizarEstadoCajon);

router.put('/', [validarJWT, validarSoloLectura], SalidaModel.editarSalida);

router.delete('/:salida/:secado', [validarJWT, validarRolSupervisor], SalidaModel.eliminarSalida);



module.exports = router;