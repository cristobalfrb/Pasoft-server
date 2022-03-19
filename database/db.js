// traer el paquete de conexion
const mysql = require('mysql2/promise');

// Create the connection pool. The pool-specific settings are the defaults
const trackapp = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    dateStrings: true,
});

const ekilibrio = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    database: process.env.DATABASEEKI,
    password: process.env.PASSWORD,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    dateStrings: true,
});

module.exports = {
    trackapp,
    ekilibrio,
}