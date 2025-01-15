const db_connection = require("./helper/database");
const Helper = require("./helper/helperFunctions");
const MainServer = require("./mainServerFunctions");
const Read = require("./read");

const help = new Helper();
const mainServer = new MainServer();
const read = new Read();

/**
 * Handle all the create funtions from CRUD
 * 
 * @version 1.1.0
 * @since 1.0.0
 */
class create{
    #db;

    constructor(){
        this.#db = db_connection();
    }

    async addStudent(student, GoogleFormSlug){
        const {FullName, Email, WANumber, ReferralWA, RegisterAt, Address, ReceiptURL} = student;
        let result;
        const referralWA = parseInt(ReferralWA);
        const timestampfromatted = help.formatTimestamp(RegisterAt);

        const GetGoogleForm = await read.getGoogleFormFromSlug(GoogleFormSlug);
        if(GetGoogleForm.error){
            return "Didn't find the google from the server.";
        }
        const GoogleFormID = GetGoogleForm.result[0].id;
        const ReferralHas = Boolean(GetGoogleForm.result[0].isReferralHas);
        const AddressHas = Boolean(GetGoogleForm.result[0].isAddressHas);
        const canUploadaReceipt = Boolean(GetGoogleForm.result[0].canUploadaReceipt);

        // Add Students to the Database
        const addStudentSQL = `INSERT INTO student
                                (full_name, email, wa_number, register_at, status, google_form_id${AddressHas && Address? ", address" : ""}${canUploadaReceipt && ReceiptURL? ", receiptURL" : ""}) 
                                VALUES (?, ?, ?, ?, ?, ?${AddressHas && Address? ", ?" : ""}${canUploadaReceipt && ReceiptURL? ", ?" : ""})`;

        const duplicatePhoneNumberCheck = `SELECT EXISTS ( SELECT 1 FROM student WHERE google_form_id=? AND wa_number=? GROUP BY google_form_id, wa_number HAVING COUNT(*) > 0) AS has_duplicates`;

        const values = [FullName, Email, parseInt(WANumber), timestampfromatted, JSON.stringify(["gf"]), GoogleFormID];
        if(AddressHas && Address) values.push(Address);
        if(canUploadaReceipt && ReceiptURL) values.push(ReceiptURL);

        try {
            const [check_duplicates] = await this.#db.promise().query(duplicatePhoneNumberCheck, [GoogleFormID, WANumber]);
            if (Boolean(check_duplicates[0].has_duplicates)){
                const error = new Error('ER_DUP_ENTRY');
                error.code = 'ER_DUP_ENTRY';
                throw error;
            }
            
            [result] = await this.#db.promise().query(addStudentSQL, values);
            console.log('Student Registration is success.\n', result.insertId);
            const sendMail = await mainServer.sendMail(result.insertId, "Success_Registration");
            console.log("Send Mail:\n", sendMail);
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY'){
                console.log("Phone Number Duplicate Error!");
                const sendMail = await mainServer.sendMail(Email, "ER_DUP_ENTRY");
                console.log("Send Mail:\n", sendMail);
                return "Phone Number Duplicate Error!";
            } else {
                if(error.sqlMessage){
                    console.log("Query Exicution Error!: ", error.sqlMessage);
                    const sendMail = await mainServer.sendMail(Email, "Unknown");
                    console.log("Send Mail:\n", sendMail);
                    return "Query Exicution Error!";
                } else {
                    console.log("Exicution Error!: ", error);
                    const sendMail = await mainServer.sendMail(Email, "Unknown");
                    console.log("Send Mail:\n", sendMail);
                    return "Exicution Error!";
                }
                
            };
        }

        if(referralWA && ReferralHas) {
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