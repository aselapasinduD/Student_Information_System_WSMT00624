const db_connection = require("./helper/database");
const Helper = require("./helper/helperFunctions");

const help = new Helper();

class create{
    #db;

    constructor(){
        this.#db = db_connection();
    }

    async addStudent(student){
        let result;
        const referralWA = parseInt(student.ReferralWA);
        const timestampfromatted = help.formatTimestamp(student.RegisterAt);
        console.log(timestampfromatted);
        
        // Add Students to the Database
        const addStudentSQL = `INSERT INTO student(full_name, email, wa_number, register_at) 
        VALUES ('${student.FullName}', '${student.Email}', ${parseInt(student.WANumber)}, '${timestampfromatted}')`;

        try {
            [result] = await this.#db.promise().query(addStudentSQL);
            console.log('Added Student Is Success\n', result);
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY'){
                console.log("Phone Number Duplicate Error!:", error.sqlMessage);
                return "Phone Number Duplicate Error!";
            } else {
                console.log("Query Exicution Error!: ", error.sqlMessage);
                return "Query Exicution Error!";
            };
        }

        if(referralWA) {
            const studentId = result.insertId;
            let referralId;

            try{
                // find the referral_id from new student referralWA
                const getReferralIdSQL = `SELECT id FROM student WHERE wa_number=${referralWA}`;
                const [rows, field] = await this.#db.promise().query(getReferralIdSQL);
                referralId = rows[0].id;

                // get the number of referral_id in the system for this referralID
                const checkReferralIdSQL = `SELECT COUNT(id) AS NumberOfRefers FROM refers_to WHERE referral_id=${referralId}`;
                const [rows2, field2] = await this.#db.promise().query(checkReferralIdSQL);
                const NumberOfRefers = rows2[0].NumberOfRefers;

                // check the referral limit reach or not. if not then add the referral ids to the table.
                if(NumberOfRefers < process.env.REFEREL_MEMBERS){
                    const addReferralIdSQL = `INSERT INTO refers_to(student_id,referral_id) VALUE (${studentId}, ${referralId})`;
                    const [rows, field] = await this.#db.promise().query(addReferralIdSQL);
                    console.log("Referral Added Successful\n", rows);
                } else {
                    console.log("Reach the Referral Member Limit Which Is ", process.env.REFEREL_MEMBERS);
                }
            } catch {
                console.log("Can't match with ReferralWA number with the WANumber.");
            }
        }

        return "Added Student Is Success";
    }
}

module.exports = create;