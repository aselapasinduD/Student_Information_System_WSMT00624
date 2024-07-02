const db_connection = require("./helper/database");
const Helper = require("./helper/helperFunctions");
const MainServer = require("./mainServerFunctions");

const help = new Helper();
const mainServer = new MainServer();

class create{
    #db;

    constructor(){
        this.#db = db_connection();
    }

    async addStudent(student){
        const {FullName, Email, WANumber, ReferralWA, RegisterAt} = student;
        let result;
        const referralWA = parseInt(ReferralWA);
        const timestampfromatted = help.formatTimestamp(RegisterAt);
        
        // Add Students to the Database
        const addStudentSQL = `INSERT INTO student(full_name, email, wa_number, register_at) 
        VALUES ('${FullName}', '${Email}', ${parseInt(WANumber)}, '${timestampfromatted}')`;

        try {
            [result] = await this.#db.promise().query(addStudentSQL);
            console.log('Added Student Is Success\n', result.insertId);
            const sendMail = await mainServer.sendMail(result.insertId);
            console.log("Send Mail:\n", sendMail);
            // const sendWhastappMsg = await mainServer.sendWhastappMsg(WANumber);
            // console.log("Send Whatsapp Messages:\n", sendWhastappMsg);
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY'){
                console.log("Phone Number Duplicate Error!:", error.sqlMessage);
                return "Phone Number Duplicate Error!";
            } else {
                if(error.sqlMessage){
                    console.log("Query Exicution Error!: ", error.sqlMessage);
                    return "Query Exicution Error!";
                } else {
                    console.log("Exicution Error!: ", error);
                    return "Exicution Error!";
                }
                
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

                const addReferralIdSQL = `INSERT INTO refers_to(student_id,referral_id) VALUE (${studentId}, ${referralId})`;
                const [rows1, field1] = await this.#db.promise().query(addReferralIdSQL);
                console.log("Referral Added Successful\n", rows1);
            } catch {
                console.log("Can't match with ReferralWA number with the WANumber.");
            }
        }

        return "Added Student Is Success";
    }
}

module.exports = create;