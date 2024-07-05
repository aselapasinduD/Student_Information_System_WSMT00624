const db = require('./admin/database');
const fs = require("fs").promises;
const path = require("path");

const SendMail = require("./mail");

const mailTemplatePath = "../resources/templates/emails";

const Mail = new SendMail();

class Create{
    #db;
    constructor(){
        this.#db = db.connection();
    }
    
    async addStudent(student){
        const {fullname, email, wanumber, referralwa} = student;
        let result;
        const datetime = new Date();
        const formattedDatetime = datetime.toISOString().replace(/T/, ' ').substr(0, 19);
        const referralWA = parseInt(referralwa);
        
        // Add Students to the Database
        const addStudentSQL = `INSERT INTO student(full_name, email, wa_number, register_at) 
        VALUES ('${fullname}', '${email}', ${parseInt(wanumber)}, '${formattedDatetime}')`;

        try {
            [result] = await this.#db.promise().query(addStudentSQL);
            console.log('Added Student Is Success\n', result);

            const welcomeMail = path.join(__dirname, mailTemplatePath, "welcome_mail.html");
            let emailcontent;
            try{
                emailcontent = await fs.readFile(welcomeMail, 'utf8');
            } catch {
                emailcontent = "<h3>Hi {{full_name}}</h3><br><p>You’re successfully registered for the BinzO Platform.</p><br><p>Join our WhatsApp group to get the Zoom link and updates:<br>WhatsApp Group Link: {{whatsapp_group_link}}</p><br><p>For more information WhatsApp Us -0784151403<br>See you soon!</p>";
            }
            const sendMail = await Mail.sendMail({to: result.insertId, subject: "Welcome to BinzO Free Course!", emailcontent: emailcontent, ishtml: "html"});
            console.log("Send Mail:\n", sendMail);

        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY'){
                console.log("Phone Number Duplicate Error!:", error.sqlMessage);
                return error.code;
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

        return "Added Student Is Success.";
    }
}

module.exports= Create;