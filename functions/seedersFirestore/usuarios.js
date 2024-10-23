// firestoreSeeder.js
const { db } = require("../connectors/dbconnect");
const moment = require("moment");
const bcryptjs = require("bcryptjs");

const collection = "usuario";

const registrosAInsertar = [
  {
    rol: "ROL0",
    usuario: "ADMIN",
    clave: bcryptjs.hashSync("admin", bcryptjs.genSaltSync()),
    nombre: "Usuario",
    apellidos: "Administrador",
    puesto: "Administrador",
    correo: "noResponderInde@outlook.com",
    fechaCreacion: moment(),
    usuarioCrea: "ADMIN",
    estado: "A",
  },
  {
    rol: "ROL0",
    usuario: "GMARROQUIN",
    clave: bcryptjs.hashSync("admin", bcryptjs.genSaltSync()),
    nombre: "Gilberto",
    apellidos: "Marroquin",
    puesto: "Administrador",
    correo: "gmarroquina1@miumg.edu.gt",
    fechaCreacion: moment(),
    usuarioCrea: "ADMIN",
    estado: "A",
  },
  {
    rol: "ROL0",
    usuario: "RRUIZ",
    clave: bcryptjs.hashSync("admin", bcryptjs.genSaltSync()),
    nombre: "RICARDO",
    apellidos: "RUIZ",
    puesto: "Administrador",
    correo: "rruizv@miumg.edu.gt",
    fechaCreacion: moment(),
    usuarioCrea: "ADMIN",
    estado: "A",
  },
  {
    rol: "ROL0",
    usuario: "MLOPEZ",
    clave: bcryptjs.hashSync("admin", bcryptjs.genSaltSync()),
    nombre: "MARCOS",
    apellidos: "LOPEZ",
    puesto: "Administrador",
    correo: "mlopezg13@miumg.edu.gt",
    fechaCreacion: moment(),
    usuarioCrea: "ADMIN",
    estado: "A",
  },
  {
    rol: "ROL0",
    usuario: "HCACERES",
    clave: bcryptjs.hashSync("admin", bcryptjs.genSaltSync()),
    nombre: "HIENNER",
    apellidos: "CACERES",
    puesto: "Administrador",
    correo: "hcaceress2@miumg.edu.gt",
    fechaCreacion: moment(),
    usuarioCrea: "ADMIN",
    estado: "A",
  },
];

async function seedUsers() {
  const batch = db.batch();
  const usuariosRef = db.collection(collection);

  for (const usuario of registrosAInsertar) {
    // Generar un nuevo documento con ID automático
    const newUserRef = usuariosRef.doc();

    batch.set(newUserRef, usuario);
  }

  try {
    await batch.commit();
    console.log(
      `${registrosAInsertar.length} usuarios insertados correctamente`
    );
  } catch (error) {
    console.error("Error al insertar usuarios:", error);
  }
}

async function deleteUsers() {
  const batch = db.batch();
  const snapshot = await db
    .collection("usuario")
    .where("idUsuarioCreacion", "==", 1)
    .get();

  if (snapshot.empty) {
    console.log("No se encontraron usuarios para eliminar");
    return;
  }

  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  try {
    await batch.commit();
    console.log(`${snapshot.size} usuarios eliminados correctamente`);
  } catch (error) {
    console.error("Error al eliminar usuarios:", error);
  }
}

// Función para verificar usuarios existentes
async function checkExistingUsers() {
  for (const usuario of registrosAInsertar) {
    const snapshot = await db
      .collection(collection)
      .where("usuario", "==", usuario.usuario)
      .get();

    if (!snapshot.empty) {
      console.log(
        `Advertencia: Ya existe un usuario con el nombre '${usuario.usuario}'`
      );
    }
  }
}

// Función para ejecutar el seeder
async function runSeeder() {
  try {
    await checkExistingUsers();
    await seedUsers();
    // Si quieres eliminar los usuarios después, descomenta la siguiente línea:
    // await deleteUsers();
  } catch (error) {
    console.error("Error durante la ejecución del seeder:", error);
  }
}

runSeeder();
