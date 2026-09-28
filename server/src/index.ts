import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'HNQXmRwPPbKXaKsdj8#';

console.log('🔑 Contraseña leída del .env:', ADMIN_PASSWORD);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../dist')));

const dbPath = path.join(__dirname, 'database.sqlite');
console.log('💾 Ruta de la base de datos:', dbPath);

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS audio_profiles (
    id TEXT PRIMARY KEY,
    user_id INTEGER,
    name TEXT NOT NULL,
    eq_bands TEXT,
    bass_intensity REAL,
    master_volume REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

const adminExists = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');

if (!adminExists) {
  const hashedPassword = bcrypt.hashSync(ADMIN_PASSWORD, 10);
  db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', hashedPassword);
  console.log('✅ Usuario admin CREADO con la contraseña del .env');
} else {
  console.log('⚠️ El usuario admin YA EXISTÍA en la base de datos (no se sobrescribió).');
}

const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};


app.post('/api/login', (req, res) => {
  const { password } = req.body;

  console.log('🔍 Intento de login. Contraseña recibida del frontend:', password);

  if (!password) {
    return res.status(400).json({ error: 'Contraseña requerida' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
  
  if (!user) {
    console.log('❌ Error crítico: No se encontró el usuario "admin" en la DB');
    return res.status(401).json({ error: 'Usuario no encontrado' });
  }

  const isMatch = bcrypt.compareSync(password, (user as any).password);
  console.log('🔐 ¿La contraseña coincide según bcrypt?', isMatch);

  if (!isMatch) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }

  const token = jwt.sign(
    { id: (user as any).id, username: (user as any).username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  console.log('✅ Login exitoso. Token generado.');
  res.json({ token, message: 'Login exitoso' });
});

app.get('/api/verify', authenticateToken, (req: any, res) => {
  res.json({ valid: true, user: req.user });
});

app.post('/api/profiles', authenticateToken, (req: any, res) => {
  const { id, name, eqBands, bassIntensity, masterVolume } = req.body;
  try {
    db.prepare(`INSERT OR REPLACE INTO audio_profiles (id, user_id, name, eq_bands, bass_intensity, master_volume) VALUES (?, ?, ?, ?, ?, ?)`).run(id, req.user.id, name, JSON.stringify(eqBands), bassIntensity, masterVolume);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar perfil' });
  }
});

app.get('/api/profiles', authenticateToken, (req: any, res) => {
  const profiles = db.prepare('SELECT * FROM audio_profiles WHERE user_id = ?').all(req.user.id);
  res.json(profiles);
});

app.delete('/api/profiles/:id', authenticateToken, (req: any, res) => {
  db.prepare('DELETE FROM audio_profiles WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor AudioX Pro corriendo en http://localhost:${PORT}`);
});