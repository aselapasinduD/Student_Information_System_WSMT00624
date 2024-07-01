const db = require('./admin/database');

const SendMail = require("./mail");
const WhatsappMsg = require("./whatsapp");

const Mail = new SendMail();
const whatsapp = new WhatsappMsg();

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

        // console.log(`fullname: ${fullname}\nemail: ${email}\nwanumber: ${wanumber}\nreferralwa: ${referralwa}\ndate: ${formattedDatetime}`);
        
        // Add Students to the Database
        const addStudentSQL = `INSERT INTO student(full_name, email, wa_number, register_at) 
        VALUES ('${fullname}', '${email}', ${parseInt(wanumber)}, '${formattedDatetime}')`;

        try {
            [result] = await this.#db.promise().query(addStudentSQL);
            console.log('Added Student Is Success\n', result);

            const sendMail = await Mail.sendMail({to: email, subject: "NodeMailer Testing", text: "Mail Content.", html: `<h1>Hello ${fullname}!</h1>`});
            console.log("Send Mail:\n", sendMail);
            
            const sendWhastappMsg = await whatsapp.send(wanumber, "hello_world");
            console.log("Send Whatsapp Messages:\n", sendWhastappMsg);
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

        return "Added Student Is Success.";
    }
}

module.exports= Create;