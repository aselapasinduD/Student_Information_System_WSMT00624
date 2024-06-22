const mysql = require("mysql2");
const SuperAdmin = require("./superAdmin");

const db_connection = () => {
    try{
        const db = mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD_USER,
            database: process.env.MYSQL_DATABASE_NAME
        });

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
        const createAdmin = `CREATE TABLE IF NOT EXISTS super_admin (
            id INT NOT NULL AUTO_INCREMENT,
            username VARCHAR(20) NOT NULL,
            password VARCHAR(64) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        )`;
        db.query(createStudent, (err, result) => {
            try{
                if (err) throw err;
                console.log('Student Table Created.\n', result);
            } catch (error) {
                console.log('Error During Creating student Table.\n', error);
            }
        });
        db.query(createRefersTo, (err, result) => {
            try{
                if (err) throw err;
                console.log('refers_to Table Created.\n', result);
            } catch (error) {
                console.log('Error During Creating refers_to Table.\n', error);
            }
        });
        db.query(createAdmin, (err, result) => {
            try{
                if (err) throw err;
                console.log('super_admin Table Created.\n', result);
            } catch (error) {
                console.log('Error During Creating super_admin Table.\n', error);
            }
        });

        const superAdmin = new SuperAdmin(process.env.SUPER_ADMIN_USERNAME, process.env.SUPER_ADMIN_PASSWORD);
        superAdmin.initSuperAdmin(db);

        console.log('Database connected successfully');
        return db;
    } catch (error) {
        console.log('Error whiel connectiong with the database.');
        return error;
    }
};

class db_class{
    #db;
    constructor(){
        this.#db = db_connection();
    }
    connection(){
        return this.#db;
    }
}

const db = new db_class();

module.exports = db;