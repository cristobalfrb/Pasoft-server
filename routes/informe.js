const {
    Router
} = require('express'); // Manejador de rutas de express
const router = Router();

const {
    body
} = require('express-validator');
const { validarJWT } = require('../middlewares/validar-jwt');

const InformeModel = require('../models/informe.model');

router.get('/general', [validarJWT], InformeModel.listarInformeGeneral);
router.get('/secado', [validarJWT], InformeModel.listarInformeSecado);

module.exports = router;