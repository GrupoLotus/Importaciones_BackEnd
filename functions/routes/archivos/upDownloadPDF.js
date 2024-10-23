const { Router } = require("express"); // Importa la clase Router del módulo express para crear nuevas rutas
const { check } = require("express-validator"); // Importa la función check del módulo express-validator para validar campos en las peticiones HTTP
const {
  cargaPDFManual,
  eliminaPDFManual,
  recuperaPDFManual,
} = require("../../controllers/archivos/upDownloadPDF"); // Importa las funciones del controlador usuarios.js para procesar las peticiones HTTP
const { validarJWT, validarCampos } = require("../../middlewares"); // Importa los middlewares para validar campos y tokens JWT

const router = Router(); // Crea una instancia de la clase Router

//Este segmento está temporal, para capturar lo que se recibe
router.use((req, res, next) => {
  console.log("recibe: ", req.body, "parametros ", req.params);
  next();
});

router.post("/PDFManual", [validarJWT], cargaPDFManual);

router.delete(
  "/PDFManual/:id",
  [
    validarJWT,
    check("id", "Por favor envie el id de la region a eliminar")
      .not()
      .isEmpty(),
    validarCampos,
  ],
  eliminaPDFManual
);

router.get(
  "/PDFManual/:id",
  [
    validarJWT,
    check("id", "Por favor envie el id de la region a eliminar")
      .not()
      .isEmpty(),
    validarCampos,
  ],
  recuperaPDFManual
);

module.exports = router; // Exporta el router para ser utilizado por la aplicación principal.
