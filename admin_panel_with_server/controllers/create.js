const db = require('./admin/database');
const Read = require('./read');
const fs = require("fs").promises;
const path = require("path");
const {v4: uuidv4} = require("uuid");

const SendMail = require("./mail");
const Mail = new SendMail();
const read = new Read();

const mailTemplatePath = "../resources/templates/emails";

/**
 * Handle all the create funtions from CURD
 * 
 * @since 1.0.0
 */
class Create{
    #db;
    constructor(){
        this.#db = db.connection();
    }
    
    /**
     * This funtion is handle adding student data to database.
     * 
     * @param {Array} student - Array Of Valus (fullname, email, wanumber, referralwa)
     * @returns {string} - Success message or error message
     * @version 1.1.0
     * @since 1.0.0
     */
    async addStudent(student){
        const {fullname, email, wanumber, referralwa, googleForm} = student;
        let result;
        const datetime = new Date();
        const formattedDatetime = datetime.toISOString().replace(/T/, ' ').substr(0, 19);
        const referralWA = parseInt(referralwa);
        // console.log(fullname);
        
        // Add Students to the Database
        const addStudentSQL = `INSERT INTO student(full_name, email, wa_number, register_at, google_form_id) 
        VALUES ('${fullname}', '${email}', ${parseInt(wanumber)}, '${formattedDatetime}', ${parseInt(googleForm)})`;

        // console.log(WhatsAppGroupLink);

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
            const sendMail = await Mail.sendMail({to: result.insertId, subject: "Welcome to BinzO Platform!", emailcontent: emailcontent, ishtml: "html"});
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

        return "Adding Student Is Success.";
    }

    /**
     * This funtion is handle adding google form data to database.
     * 
     * @param {Array} googleForm - Array Of Values (title, color, whatsappGroupLink)
     * @returns {string} - Success message or error message
     * @since 1.1.0
     */
    async addGoogleForm(googleForm){
        const {title, color, whatsappGroupLink} = googleForm;
        const slug = uuidv4();
        let result;
        
        // Add Google Form to the Database
        let addStudentSQL = `INSERT INTO google_forms_manage(title, slug${color ? ", color" : ""}${whatsappGroupLink ? ", whatsapp_group_link" : ""}) VALUES (?, ?${color ? ", ?" : ""}${whatsappGroupLink ? ", ?" : ""})`;

        // Prepare the array of values for the placeholders
        const values = [title, slug];
        if (color) values.push(color);
        if (whatsappGroupLink) values.push(whatsappGroupLink);

        // console.log(addStudentSQL);

        try {
            [result] = await this.#db.promise().query(addStudentSQL, values);
            console.log('Added Student Is Success\n', result);
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

        return "Adding Google Form Is Success.";
    }
}

module.exports= Create;