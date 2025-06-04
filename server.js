// server.js

const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializa Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  universe_domain: "googleapis.com"
};


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const alumnosCollection = db.collection('alumnos');

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); 

// Rutas CRUD

// Obtener todos
app.get('/alumnos', async (req, res) => {
  const snapshot = await alumnosCollection.get();
  const alumnos = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
  res.json(alumnos);
});

// Obtener uno
app.get('/alumnos/:id', async (req, res) => {
  const doc = await alumnosCollection.doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: 'Alumno no encontrado' });
  res.json({ _id: doc.id, ...doc.data() });
});

// Crear
app.post('/alumnos', async (req, res) => {
  const newDoc = await alumnosCollection.add(req.body);
  res.json({ _id: newDoc.id });
});

// Actualizar
app.put('/alumnos/:id', async (req, res) => {
  await alumnosCollection.doc(req.params.id).update(req.body);
  res.json({ success: true });
});

// Eliminar
app.delete('/alumnos/:id', async (req, res) => {
  await alumnosCollection.doc(req.params.id).delete();
  res.json({ success: true });
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

