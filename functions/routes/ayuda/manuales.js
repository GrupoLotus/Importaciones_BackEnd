const { Router } = require("express");
const { validarJWT } = require("../../middlewares");
const { consultarRegistros } = require("../../controllers/ayuda/manuales");

const router = Router();

//Este segmento está temporal, para capturar lo que se recibe
router.use((req, res, next) => {
  console.log("recibe", req.body);
  next();
});

//Listar
router.get("/filtro/:filtro", [validarJWT], consultarRegistros);

router.meta = {
  Modulo: "[Ayuda]",
  IconoModulo: "[bi bi-question-circle]",
  Titulo: "Manuales",
  Descripcion: "Visualiza los manuales",
  Ruta: "/menu/Manuales",
  Icono: "bi bi-info-circle-fill",
  Orden: "[5,2]",
};

module.exports = router;
