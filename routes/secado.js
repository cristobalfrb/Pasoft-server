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

// Funcion para traer y actualizar un lote
router.get('/', [validarJWT], SecadoModel.listarSecado);

router.post('/', [
    validarJWT,
    body('lote', 'El campo lote es obigatorio').not().isEmpty(),
    body('cajon', 'El campo cajon es obigatorio').not().isEmpty(),
    body('planta', 'El campo planta es obigatorio').not().isEmpty(),
    body('humedad', 'El campo humedad es obigatorio').not().isEmpty(),
    validarCampos,
], SecadoModel.agregarCajon);

router.put('/', [
    validarJWT,
    body('id', 'El id del registro es obligatorio').not().isEmpty(),
    validarCampos,
], SecadoModel.actualizarCajon);

// router.get('/:lote', validarJWT, SecadoModel.listarCajones);

router.get('/:lote', validarJWT, SecadoModel.cargarDatosLote);

router.delete('/:id', validarJWT, SecadoModel.eliminarCajon);

module.exports = router;