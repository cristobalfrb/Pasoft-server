const {
    Router
} = require('express'); // Manejador de rutas de express
const router = Router();

const { validarJWT } = require('../middlewares/validar-jwt');
// Traer el controllador de usuarios 
const RecepcionModel = require('../models/recepcion.models');

// Funcion para traer y actualizar un lote
router.get('/ekilibrio/', [validarJWT], RecepcionModel.listarLotesEkilibrio);

router.get('/:lote', [ validarJWT], RecepcionModel.obtenerLoteRecepcion);

router.get('/', [validarJWT], RecepcionModel.listarRecepciones);

router.put('/:lote', [validarJWT], RecepcionModel.actualizarLote);

router.delete('/:lote', [validarJWT], RecepcionModel.eliminarLote);

module.exports = router;