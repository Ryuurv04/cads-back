require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');


const app = express();
const port = process.env.PORT || 5000;

const login = require('./routes/authRotes'); 


app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000' // Puedes especificar dominios si es necesario en producción
}));
app.use(express.json());

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true, // Esperar si la conexión no está disponible
    connectionLimit: 10,     // Limitar el número de conexiones en el pool
    queueLimit: 0,            // No limitar la cola de conexiones
    namedPlaceholders: true   // Habilitar named placeholders para consultas
};
const pool = mysql.createPool(dbConfig);

// Test de conexión a la base de datos al inicio
pool.getConnection()
    .then(connection => {
        console.log('Conexión exitosa a la base de datos MySQL!');
        connection.release(); // Libera la conexión de vuelta al pool
    })
    .catch(err => {
        console.error('Error al conectar a la base de datos MySQL:', err.message);
        // Considerar salir del proceso o intentar reconectar si la base de datos es crítica
    });



// --- Rutas de la API ---
// Ruta de prueba simple
app.get('/', (req, res) => {
    res.send('API de Inventario está funcionando!');
});

app.use('/api/auth', login(pool)); 


app.listen(port, () => {
    console.log(`Servidor backend corriendo en puerto ${port}, ${process.env.FRONTEND_URL}`);
});