const {
    Router
} = require('express'); // Manejador de rutas de express
const router = Router();

const {
    body
} = require('express-validator');
const { validarJWT } = require('../middlewares/validar-jwt');
const { validarCampos } = require('../middlewares/validar-campos');
// Traer el controllador de usuarios 
const DespelonadoModel = require('../models/despelonado.model');
const { validarSoloLectura } = require('../middlewares/validar-roles');

// Funcion para traer y actualizar un lote
router.get('/pendientes/', [validarJWT] ,DespelonadoModel.listarLotesPendientesDes);
router.get('/:lote', [validarJWT], DespelonadoModel.obtenerLoteDespelonado);
router.get('/', [validarJWT], DespelonadoModel.listarDespelonado);
router.post('/', [
    validarJWT,
    validarSoloLectura,
    body('lote', 'El campo lote es obligatorio').not().isEmpty(),
    body('fechaEntrada', 'El campo fecha entrada es obligatorio').not().isEmpty(),
    body('horaEntrada', 'El campo hora entrada es obligatorio').not().isEmpty(),
    body('turno', 'El campo turno es obligatorio').not().isEmpty(),
    body('planta', 'El campo planta es obligatorio').not().isEmpty(),
    validarCampos
], DespelonadoModel.agregarDespelonado);

router.put('/', [
    validarJWT,
    validarSoloLectura,
    body('id', 'El campo id es obligatorio').not().isEmpty(),
    body('fechaEntrada', 'El campo fecha entrada es obligatorio').not().isEmpty(),
    body('horaEntrada', 'El campo hora entrada es obligatorio').not().isEmpty(),
    validarCampos
], DespelonadoModel.actualizarDespelonado);

router.delete('/:id', [validarJWT, validarSoloLectura], DespelonadoModel.eliminarDespelonado)

module.exports = router;