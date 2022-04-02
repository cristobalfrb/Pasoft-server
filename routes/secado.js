const {
    Router
} = require('express'); // Manejador de rutas de express
const router = Router();

const {
    body
} = require('express-validator');
const { validarJWT } = require('../middlewares/validar-jwt');
const { validarCampos } = require('../middlewares/validar-campos');

const SecadoModel = require('../models/secado.model');
const { validarSoloLectura } = require('../middlewares/validar-roles');

// Funcion para traer y actualizar un lote
router.get('/', [validarJWT], SecadoModel.listarSecado);

router.get('/:lote', validarJWT, SecadoModel.cargarDatosLote);

router.post('/', [
    validarJWT,
    validarSoloLectura,
    body('lote', 'El campo lote es obigatorio').not().isEmpty(),
    body('cajon', 'El campo cajon es obigatorio').not().isEmpty(),
    body('planta', 'El campo planta es obigatorio').not().isEmpty(),
    body('humedad', 'El campo humedad es obigatorio').not().isEmpty(),
    validarCampos,
], SecadoModel.agregarCajon);

router.put('/', [
    validarJWT,
    validarSoloLectura,
    body('id', 'El id del registro es obligatorio').not().isEmpty(),
    validarCampos,
], SecadoModel.actualizarCajon);

router.delete('/:id', [validarJWT, validarSoloLectura], SecadoModel.eliminarCajon);

module.exports = router;