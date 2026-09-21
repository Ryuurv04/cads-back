require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Importar la función migrate desde tu carpeta bd
const { migrate } = require('./bd/migrate');
const login = require('./routes/authRoutes'); 
const cards = require('./routes/cardsRoutes');

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    namedPlaceholders: true
};
const pool = mysql.createPool(dbConfig);

// --- Rutas de la API ---
app.get('/', (req, res) => {
    res.send('API de Cards está funcionando!');
});

app.use('/api/auth', login(pool)); 
app.use('/api/cards', cards(pool));

// --- Arranque seguro: Migraciones -> Conexión -> Listen ---
migrate()
    .then(() => pool.getConnection())
    .then((connection) => {
        console.log('Conexión exitosa a la base de datos MySQL!');
        connection.release();
        app.listen(port, () => {
            console.log(`Servidor backend corriendo en puerto ${port}, Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
        });
    })
    .catch((err) => {
        console.error('Error crítico al inicializar la base de datos o correr migraciones:', err.message);
        process.exit(1);
    });