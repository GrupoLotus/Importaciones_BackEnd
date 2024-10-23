const { db, storage } = require("../../connectors/dbconnect");
const busboy = require("busboy");

exports.cargaPDFManual = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      codigo: 405,
      mensaje: `Método incorrecto`,
    });
  }

  const processForm = async () => {
    return new Promise((resolve, reject) => {
      const fields = {};
      let fileBuffer = null;
      let fileName = "";
      let fileInfo = null;

      const bb = busboy({ headers: req.headers });

      bb.on("file", (name, file, info) => {
        const { filename, encoding, mimeType } = info;
        if (mimeType !== "application/pdf") {
          return reject(
            new Error("El archivo debe ser un documento PDF válido.")
          );
        }
        fileInfo = info;
        const chunks = [];
        file.on("data", (data) => {
          chunks.push(data);
        });
        file.on("end", () => {
          fileBuffer = Buffer.concat(chunks);
          const extension = filename.split(".").pop();
          const baseName = filename.split(".")[0];
          fileName = `${baseName}_${Date.now()}.${extension}`;
        });
      });

      bb.on("field", (name, val) => {
        fields[name] = val;
      });

      bb.on("finish", () => {
        resolve({ fields, fileBuffer, fileName, fileInfo });
      });

      bb.on("error", (error) => {
        reject(error);
      });

      if (req.rawBody) {
        bb.end(req.rawBody);
      } else {
        req.pipe(bb);
      }
    });
  };

  try {
    const { fields, fileBuffer, fileName } = await processForm();

    if (!fileBuffer) {
      throw new Error("No se ha subido ningún archivo");
    }

    // Referencia a Firebase Storage
    const bucket = storage.bucket();

    // Ruta del archivo en Firebase Storage
    const filePath = `${fields.path}/${fileName}`;

    // Subir el archivo a Firebase Storage
    const file = bucket.file(filePath);
    await file.save(fileBuffer, {
      metadata: { contentType: "application/pdf" },
    });

    const dbSaveFile = db.collection("manual").doc(fields.id);
    const dbSaveFileVal = await dbSaveFile.get();

    if (!dbSaveFileVal.exists || dbSaveFileVal.data().estado === "N") {
      await file.delete(); // Elimina el archivo de Storage si el documento no existe
      return res.status(400).json({
        codigo: 400,
        mensaje: `Registro no encontrado, favor recargue la página`,
      });
    }

    const jsonSave = {
      nombreCarpeta: fields.path,
      nombreArchivo: fileName,
      rutaArchivo: filePath, // Guardamos la ruta del archivo en lugar de una URL
    };

    await dbSaveFile.update(jsonSave);

    return res.status(200).json({
      codigo: 200,
      mensaje: "Archivo guardado con éxito",
      rutaArchivo: filePath,
    });
  } catch (error) {
    console.error("Error en la función cargaPDFManual:", error);
    return res.status(500).json({
      codigo: 500,
      mensaje: `Error al procesar el archivo: ${error.message}`,
    });
  }
};

exports.eliminaPDFManual = async (req, res) => {
  try {
    const { id } = req.params;
    const dbEliminaManual = db.collection("manual").doc(id);
    const dbEliminaValManual = await dbEliminaManual.get();

    if (
      !dbEliminaValManual.exists ||
      dbEliminaValManual.data().estado === "N"
    ) {
      return res.status(400).json({
        codigo: 400,
        mensaje: `Registro no encontrado, favor recargue la página`,
      });
    }

    const dbElliminaData = dbEliminaValManual.data();
    const rutaArchivo = dbElliminaData.rutaArchivo || "";

    if (!rutaArchivo) {
      return res.status(400).json({
        codigo: 400,
        mensaje: `No se encontró la ruta del archivo a eliminar`,
      });
    }

    // Referencia al bucket de Firebase Storage
    const bucket = storage.bucket();

    // Referencia al archivo en Storage
    const file = bucket.file(rutaArchivo);

    // Eliminar el archivo de Storage
    await file.delete();

    // Actualizar el documento en Firestore
    const jsonUpdate = {
      nombreCarpeta: "",
      nombreArchivo: "",
      rutaArchivo: "",
    };

    await dbEliminaManual.update(jsonUpdate);

    return res.status(200).json({
      codigo: 200,
      mensaje: `Archivo eliminado exitosamente`,
    });
  } catch (error) {
    console.error("Error al eliminar el archivo:", error);
    return res.status(500).json({
      codigo: 500,
      mensaje: `Error al eliminar el archivo: ${error.message}`,
    });
  }
};

exports.recuperaPDFManual = async (req, res) => {
  try {
    const { id } = req.params;
    const dbRecuperaManual = db.collection("manual").doc(id);
    const dbRecuperaManualVal = await dbRecuperaManual.get();

    if (
      !dbRecuperaManualVal.exists ||
      dbRecuperaManualVal.data().estado === "N"
    ) {
      return res.status(400).json({
        codigo: 400,
        mensaje: `Registro no encontrado, favor recargue la página`,
      });
    }

    const dbRecuperaManualData = dbRecuperaManualVal.data();
    const rutaArchivo = dbRecuperaManualData.rutaArchivo || "";

    if (!rutaArchivo) {
      return res.status(400).json({
        codigo: 400,
        mensaje: `No se encontró la ruta del archivo`,
      });
    }

    console.log("Ruta del archivo:", rutaArchivo);

    // Referencia al bucket de Firebase Storage
    const bucket = storage.bucket();

    // Referencia al archivo en Storage
    const file = bucket.file(rutaArchivo);

    // Verificar si el archivo existe
    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({
        codigo: 404,
        mensaje: `El archivo no existe en el almacenamiento`,
      });
    }

    // Configurar los headers de la respuesta
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${dbRecuperaManualData.nombreArchivo}"`
    );

    // Crear un stream de lectura del archivo
    const readStream = file.createReadStream();

    // Manejar errores en el stream
    readStream.on("error", (err) => {
      console.error("Error al leer el archivo:", err);
      res.status(500).json({
        codigo: 500,
        mensaje: `Error al leer el archivo: ${err.message}`,
      });
    });

    // Enviar el archivo al cliente
    readStream.pipe(res);
  } catch (error) {
    console.error("Error al recuperar el archivo:", error);
    res.status(500).json({
      codigo: 500,
      mensaje: `Error: ${error.message}`,
    });
  }
};
