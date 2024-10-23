const admin = require("firebase-admin");

const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "grupolotus-gt.appspot.com", // Añade esta línea
});

const db = admin.firestore();
const storage = admin.storage(); // Añade esta línea

module.exports = { db, storage };
