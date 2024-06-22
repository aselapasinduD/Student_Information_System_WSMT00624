const mysql = require("mysql2");

const db_connection = () => {
    try{
        const db = mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD_USER,
            database: process.env.MYSQL_DATABASE_NAME
        });
        console.log('Database connected successfully');

        const createStudent = `CREATE TABLE IF NOT EXISTS student (
            id INT NOT NULL AUTO_INCREMENT,
            full_name VARCHAR(50) NOT NULL,
            email VARCHAR(320) NOT NULL,
            wa_number BIGINT(12) UNIQUE NOT NULL,
            register_at DATETIME,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        )`;
        const createRefersTo = `CREATE TABLE IF NOT EXISTS refers_to (
            id INT NOT NULL AUTO_INCREMENT,
            student_id INT NOT NULL,
            referral_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            FOREIGN KEY (student_id) REFERENCES student(id)
        )`;
        db.query(createStudent, (err, result) => {
            if (err) throw err;
            console.log('student Table Created.\n', result);
        });
        db.query(createRefersTo, (err, result) => {
            if (err) throw err;
            console.log('refers_to Table Created.\n', result);
        });

        return db;
    } catch (error) {
        console.log('Error whiel connectiong with the database.');
        throw error;
    }
};

module.exports = db_connection;