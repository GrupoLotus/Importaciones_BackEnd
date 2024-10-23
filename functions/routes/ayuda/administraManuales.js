const { Router } = require("express");
const { check } = require("express-validator");
const { validarCampos, validarJWT } = require("../../middlewares");
const { validaNoExistaDatoDuplicado } = require("../../helpers/validacionesDB");
const {
  nuevoRegistro,
  consultarRegistros,
  modificarRegistro,
  eliminarRegistro,
  consultarRegPorID,
} = require("../../controllers/ayuda/administraManuales");

const router = Router();
const collection = "manual";
const nombreCampo = "nombre";

//Este segmento está temporal, para capturar lo que se recibe
router.use((req, res, next) => {
  console.log("recibe", req.body);
  next();
});

//Insertar
router.post(
  "/",
  [
    validarJWT,
    check(nombreCampo, "Por favor envie el nombre").not().isEmpty(),
    check("descripcion", "Por favor envie la descripcion").not().isEmpty(),
    check(nombreCampo).custom(async (infoCampo, { req }) => {
      await validaNoExistaDatoDuplicado(
        collection,
        nombreCampo,
        infoCampo,
        req.body
      );
    }),
    //check(nombreCampo).custom(async (infoCampo) => {
    //  await validaUnaPalabraSinEspacios(infoCampo, nombreCampo);
    //}),
    validarCampos,
  ],
  nuevoRegistro
);

//Listar
router.get("/filtro/:filtro", [validarJWT], consultarRegistros);

//Listar por ID
router.get(
  "/:id",
  [
    validarJWT,
    check("id", "Por favor envie el id del registro").not().isEmpty(),
    validarCampos,
  ],
  consultarRegPorID
);

//Modificar
router.put(
  "/",
  [
    validarJWT,
    check("id", "Por favor envie el id del registro").not().isEmpty(),
    check("descripcion", "Por favor envie la descripcion").not().isEmpty(),
    validarCampos,
  ],
  modificarRegistro
);

//Eliminar
router.delete(
  "/:id",
  [
    validarJWT,
    check("id", "Por favor envie el id del registro").not().isEmpty(),
    validarCampos,
  ],
  eliminarRegistro
);

router.meta = {
  Modulo: "[Ayuda]",
  IconoModulo: "[bi bi-question-circle]",
  Titulo: "Administracion Manuales",
  Descripcion: "Administración de los manuales",
  Ruta: "/menu/AdministraManual",
  Icono: "bi bi-gear",
  Orden: "[5,1]",
};

module.exports = router;
