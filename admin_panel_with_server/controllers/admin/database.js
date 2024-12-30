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

        /**
         * Create student Table If Not Exists.
         * 
         * @since: 1.0.0v
         */
        const createStudent = `CREATE TABLE IF NOT EXISTS student (d
            id INT NOT NULL AUTO_INCREMENT,
            full_name VARCHAR(50) NOT NULL,
            email VARCHAR(320) NOT NULL,
            number_of_mails INT NOT NULL DEFAULT 0,
            wa_number BIGINT(12) UNIQUE NOT NULL,
            register_at DATETIME,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        )`;

        /**
         * Alter The Table student
         * Added new columns:
         *      google_form_id
         *      status
         * 
         * Create Foreign Key for google_form_id.
         * 
         * @since: 1.1.0v
         */
        const alterStudentTable = `ALTER TABLE student
            ADD COLUMN IF NOT EXISTS google_form_id INT NULL,
            ADD COLUMN IF NOT EXISTS status JSON NULL,
            ADD CONSTRAINT fk_google_form_id FOREIGN KEY (google_form_id) REFERENCES google_forms_manage(id)
        `;

        /**
         * Create refers_to Table If Not Exists.
         * 
         * @since: 1.0.0v
         */
        const createRefersTo = `CREATE TABLE IF NOT EXISTS refers_to (
            id INT NOT NULL AUTO_INCREMENT,
            student_id INT NOT NULL,
            referral_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            FOREIGN KEY (student_id) REFERENCES student(id)
        )`;

        /**
         * Create super_admin Table If Not Exists.
         * 
         * @since: 1.0.0v
         */
        const createAdmin = `CREATE TABLE IF NOT EXISTS super_admin (
            id INT NOT NULL AUTO_INCREMENT,
            username VARCHAR(20) NOT NULL,
            password VARCHAR(64) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        )`;

        /**
         * Create google_forms_manage Table If Not Exists.
         * 
         * @since: 1.1.0v
         */
        const createGoogleFormsManage = `CREATE TABLE IF NOT EXISTS google_forms_manage (
            id INT NOT NULL AUTO_INCREMENT,
            title VARCHAR(50) NOT NULL,
            slug VARCHAR(36) NOT NULL,
            color VARCHAR(7) NULL,
            whatsapp_group_link VARCHAR(100) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        )`;

        /**
         * Exicute SQL query for student Table
         * 
         * @since: 1.0.0v
         */
        db.query(createStudent, (err, result) => {
            try{
                if (err) throw err;
                console.log('Student Table Created.\n', result);
            } catch (error) {
                console.log('Error During Creating student Table.\n', error);
            }
        });

        /**
         * Exicute SQL query for refers_to Table
         * 
         * @since: 1.0.0v
         */
        db.query(createRefersTo, (err, result) => {
            try{
                if (err) throw err;
                console.log('refers_to Table Created.\n', result);
            } catch (error) {
                console.log('Error During Creating refers_to Table.\n', error);
            }
        });

        /**
         * Exicute SQL query for super_admin Table
         * 
         * @since: 1.0.0v
         */
        db.query(createAdmin, (err, result) => {
            try{
                if (err) throw err;
                console.log('super_admin Table Created.\n', result);
            } catch (error) {
                console.log('Error During Creating super_admin Table.\n', error);
            }
        });

        /**
         * Exicute SQL query for google_forms_manage Table
         * 
         * @since: 1.1.0v
         */
        db.query(createGoogleFormsManage, (err, result) => {
            try{
                if (err) throw err;
                console.log('google_forms_manage Table Created.\n', result);
            } catch (error) {
                console.log('Error During Creating google_forms_manage Table.\n', error);
            }
        });

        /**
         * Exicute SQL query for Student Table Alter
         * 
         * @since: 1.1.0v
         */
        db.query(alterStudentTable, (err, result) => {
            try{
                if (err) throw err;
                console.log('Student Table Altered.\n', result);
            } catch (error) {
                console.log('Error During Altering student Table.\n', error);
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