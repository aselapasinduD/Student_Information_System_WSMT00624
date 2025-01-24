const db = require('./admin/database');
const Read = require('./read');
const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const SendMail = require("./mail");
const Mail = new SendMail();
const read = new Read();

const mailTemplatePath = "../resources/templates/emails";

/**
 * Handle all the create funtions from CURD
 * 
 * @since 1.0.0
 */
class Create {
    #db;
    constructor() {
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
    async addStudent(student) {
        const { fullname, email, wanumber, address, referralwa, googleForm } = student;
        let result;
        const datetime = new Date();
        const formattedDatetime = datetime.toISOString().replace(/T/, ' ').substr(0, 19);
        const referralWA = parseInt(referralwa);
        // console.log(fullname);

        // Add Students to the Database
        const addStudentSQL = `INSERT INTO student(full_name, email, wa_number, address, register_at, google_form_id) 
        VALUES ('${fullname}', '${email}', ${parseInt(wanumber)}, '${address}', '${formattedDatetime}', ${parseInt(googleForm)})`;

        try {
            [result] = await this.#db.promise().query(addStudentSQL);
            console.log('Added Student Is Success\n', result);

            const welcomeMail = path.join(__dirname, mailTemplatePath, "welcome_mail.html");
            let emailcontent;
            try {
                emailcontent = await fs.readFile(welcomeMail, 'utf8');
            } catch {
                emailcontent = "<h3>Hi {{full_name}}</h3><br><p>You’re successfully registered for the BinzO Platform.</p><br><p>Join our WhatsApp group to get the Zoom link and updates:<br>WhatsApp Group Link: {{whatsapp_group_link}}</p><br><p>For more information WhatsApp Us -0784151403<br>See you soon!</p>";
            }
            const sendMail = await Mail.sendMail({ to: result.insertId, subject: "Welcome to BinzO Platform!", emailcontent: emailcontent, ishtml: "html" });
            console.log("Send Mail:\n", sendMail);
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                console.log("Phone Number Duplicate Error!:", error.sqlMessage);
                return error.code;
            } else {
                if (error.sqlMessage) {
                    console.log("Query Exicution Error!: ", error.sqlMessage);
                    return "Query Exicution Error!";
                } else {
                    console.log("Exicution Error!: ", error);
                    return "Exicution Error!";
                }
            };
        }

        if (referralWA) {
            const studentId = result.insertId;
            let referralId;

            try {
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
     * This funtion is handle adding student data to database.
     * 
     * @param {Array} student - Array Of Valus (fullname, email, wanumber, referralwa)
     * @returns {string} - Success message or error message
     * @since 1.1.0
     */
    addFromBundleStudent(student) {
        return new Promise(async (resolve, reject) => {
            const { full_name, email, address, wa_number, referral_number, register_at, receipt_url, googleFormID, sendWelcomeEmail, registerDateToday } = student;
            let result, formattedDatetime;
            if (Boolean(register_at) && !Boolean(registerDateToday)) {
                const datetime = new Date(register_at);
                formattedDatetime = datetime.toISOString().replace(/T/, ' ').substr(0, 19);
            } else {
                const currentDate = new Date(new Date().toLocaleDateString());
                formattedDatetime = currentDate.toISOString().replace(/T/, ' ').substr(0, 19);
            }
            const referralWA = parseInt(referral_number);

            // Add Students to the Database
            const addStudentSQL = `INSERT INTO student(full_name, email, wa_number, register_at, google_form_id, status${address ? ", address" : ""}${receipt_url ? ", receiptURL" : ""}) 
                                    VALUES (?, ?, ?, ?, ?, ?${address ? ", ?" : ""}${receipt_url ? ", ?" : ""})`;

            const values = [full_name, email, wa_number, formattedDatetime, parseInt(googleFormID), JSON.stringify(["ib"])];
            if (address) values.push(address);
            if (receipt_url) values.push(receipt_url);

            console.log(addStudentSQL);
            console.log(values);

            this.#db.promise().query(addStudentSQL, values)
                .then(async ([result]) => {
                    console.log('Added Student Is Success\n', result);

                    if (Boolean(sendWelcomeEmail)) {
                        const welcomeMail = path.join(__dirname, mailTemplatePath, "welcome_mail.html");
                        let emailcontent;
                        try {
                            emailcontent = await fs.readFile(welcomeMail, 'utf8');
                        } catch {
                            emailcontent = "<h3>Hi {{full_name}}</h3><br><p>You’re successfully registered for the BinzO Platform.</p><br><p>Join our WhatsApp group to get the Zoom link and updates:<br>WhatsApp Group Link: {{whatsapp_group_link}}</p><br><p>For more information WhatsApp Us -0784151403<br>See you soon!</p>";
                        }
                        const sendMail = await Mail.sendMail({ to: result.insertId, subject: "Welcome to BinzO Platform!", emailcontent: emailcontent, ishtml: "html" });
                        console.log("Send Mail:\n", sendMail);
                    }

                    if (referralWA) {
                        const studentId = result.insertId;
                        let referralId;

                        const getReferralIdSQL = `SELECT id FROM student WHERE wa_number=${referralWA}`;
                        this.#db.promise().query(getReferralIdSQL)
                            .then((rows) => {
                                if (rows.length > 0) {
                                    referralId = rows[0].id;

                                    const addReferralIdSQL = `INSERT INTO refers_to(student_id,referral_id) VALUE (${studentId}, ${referralId})`;
                                    this.#db.promise().query(addReferralIdSQL)
                                        .then((rows1) => {
                                            console.log("Referral Added Successful\n", rows1);
                                            resolve("Adding student is success.");
                                        })
                                        .catch(error => {
                                            console.log("Can't match with ReferralWA number with the WANumber.");
                                            resolve("Adding Student Is Success with no referral.");
                                        });
                                } else {
                                    console.log("Referral WA number not found.");
                                    resolve("Adding student is success with no referral.");
                                }
                            })
                            .catch(error => {
                                console.log("Error fetching referral: ", error);
                                resolve("Adding student is Success with no referral.");
                            });
                    } else {
                        resolve("Adding student is success.");
                    }
                })
                .catch(error => {
                    if (error.code === 'ER_DUP_ENTRY') {
                        console.log("Phone Number Duplicate Error!:", error.sqlMessage);
                        reject(error.code);
                    } else {
                        if (error.sqlMessage) {
                            console.log("Query Exicution Error!: ", error.sqlMessage);
                            reject("Query Exicution Error!");
                        } else {
                            console.log("Exicution Error!: ", error);
                            reject("Exicution Error!");
                        }
                    };
                });
        });
    }

    /**
     * This funtion is handle adding google form data to database.
     * 
     * @param {Array} googleForm - Array Of Values (title, color, whatsappGroupLink, hasReferral, hasAddress)
     * @returns {string} - Success message or error message
     * @since 1.1.0
     */
    async addGoogleForm(googleForm) {
        const { title, color, whatsappGroupLink, hasReferral, hasAddress, canUploadaReceipt } = googleForm;
        const slug = uuidv4();
        let result;

        let addStudentSQL = `INSERT INTO google_forms_manage
                            (title, slug${color ? ", color" : ""}${whatsappGroupLink ? ", whatsapp_group_link" : ""}${hasReferral ? ", isReferralHas" : ""}${hasAddress ? ", isAddressHas" : ""}${canUploadaReceipt ? ", canUploadaReceipt" : ""}) 
                            VALUES (?, ?${color ? ", ?" : ""}${whatsappGroupLink ? ", ?" : ""}${hasReferral ? ", ?" : ""}${hasAddress ? ", ?" : ""}${canUploadaReceipt ? ", ?" : ""})`;

        const values = [title, slug];
        if (color) values.push(color);
        if (whatsappGroupLink) values.push(whatsappGroupLink);
        if (hasReferral) values.push(true);
        if (hasAddress) values.push(true);
        if (canUploadaReceipt) values.push(true);

        try {
            [result] = await this.#db.promise().query(addStudentSQL, values);
            console.log('Added Student Is Success\n', result);
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                console.log("Phone Number Duplicate Error!:", error.sqlMessage);
                return error.code;
            } else if (error.sqlMessage) {
                console.log("Query Exicution Error!: ", error.sqlMessage);
                return "Query Exicution Error!";
            } else {
                console.log("Exicution Error!: ", error);
                return "Exicution Error!";
            };
        }

        return "Adding Google Form Is Success.";
    }
}

module.exports = Create;
