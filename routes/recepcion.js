const {
    Router
} = require('express'); // Manejador de rutas de express
const router = Router();

const { validarJWT } = require('../middlewares/validar-jwt');
const { validarSoloLectura } = require('../middlewares/validar-roles');
// Traer el controllador de usuarios 
const RecepcionModel = require('../models/recepcion.models');

// Funcion para traer y actualizar un lote
router.get('/ekilibrio/', [validarJWT], RecepcionModel.listarLotesEkilibrio);

router.get('/actualizar/', [validarJWT], RecepcionModel.actualizarTodo);

router.get('/:lote', [ validarJWT], RecepcionModel.obtenerLoteRecepcion);

router.get('/', [validarJWT], RecepcionModel.listarRecepciones);

router.put('/:lote', [validarJWT, validarSoloLectura], RecepcionModel.actualizarLote);

router.delete('/:lote', [validarJWT, validarSoloLectura], RecepcionModel.eliminarLote);

module.exports = router;