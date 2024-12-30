const mysql = require("mysql2");

/**
 * Init Database Connection.
 * 
 * @returns {object} - mysql database connection object.
 * @version 1.1.0
 * @since 1.0.0
 */
const db_connection = () => {
    try{
        const db = mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD_USER,
            database: process.env.MYSQL_DATABASE_NAME
        });
        console.log('Database connected successfully');

        return db;
    } catch (error) {
        console.log('Error whiel connectiong with the database.');
        throw error;
    }
};

module.exports = db_connection;