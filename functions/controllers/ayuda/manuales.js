const { db } = require("../../connectors/dbconnect");
const { formatDateDB } = require("../../helpers/procesaCRUD");
const moment = require("moment");

const collection = "manual";
const campoCollection = "nombre";
const formatDate = "YYYY-MM-DD HH:mm:ss";

//READ OR CONSULT
exports.consultarRegistros = async (req, res) => {
  try {
    let { filtro } = req.params;
    let textoFiltro = filtro;

    let dbConsulta = [{}];
    let filas = [];
    let columnas = [];

    if (filtro) {
      filtro = filtro ? filtro.split("") : [];

      dbConsulta = await db
        .collection(collection)
        .where("estado", "in", filtro)
        .get();

      //Retorna el nuevo json que se pintara en la tabla
      filas = dbConsulta?.docs.map((data) => {
        const element = data.data();
        let fila = {
          ID: data.id,
          NOMBRE: element.nombre,
          DESCRIPCION: element.descripcion || "",
          NOMBRE_ARCHIVO: element.nombreArchivo || "",
          USUARIO_CREACION: element.usuarioCrea,
          FECHA_CREACION: formatDateDB(element.fechaCreacion, formatDate),
          ESTADO: element.estado == "A" ? "Activo" : "Eliminado",
          NOMBREDEL: element.nombre,
        };

        if (textoFiltro.includes("N")) {
          fila = {
            ...fila,
            USUARIO_ELIMINO: element.usuarioElimina,
            FECHA_ELIMINACION: formatDateDB(
              element.fechaEliminacion,
              formatDate
            ),
          };
        }

        return fila;
      });
    }

    //Retornar filas vacias para armar las columnas
    if (dbConsulta.empty) {
      filas = [
        {
          ID: "",
          NOMBRE: "",
          DESCRIPCION: "",
        },
      ];
    }

    columnas = Object.keys(filas[0])
      .filter(
        (key) => key !== "ID" && key !== "NOMBREDEL" && key !== "NOMBRE_ARCHIVO"
      )
      .map((key) => ({
        accessorKey: key, //Debe hacer match con la propiedad de data
        header: key.replace(/_/g, " "), //Titulo para la columna se extrae de la propiedad data
        size: 20,
      }));

    if (dbConsulta.empty) {
      filas = [];
    }

    const json = {
      tabla: {
        data: filas,
        columnas: columnas,
      },
    };

    return res.status(200).json({
      codigo: 200,
      mensaje: "Consulta exitosamente",
      respuesta: json,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      codigo: 500,
      mensaje: `Error: ${error}`,
    });
  }
};
