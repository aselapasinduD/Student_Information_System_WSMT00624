const nodemailer = require('nodemailer');

const Read = require("./read");

const read = new Read();

// mail - nodemail@project.innentasolutions.com
// pass - qKjmBX8Z&]P=

// mail - project@innentasolutions.com
// pass - +=DC5mFhIlGi

class SendMail {
    #transporter;
    constructor(){
        this.#transporter = nodemailer.createTransport({
            host: "mail.innentasolutions.com",
            port: 465,
            secure: true,
            auth: {
             user: "project@innentasolutions.com",
             pass: "+=DC5mFhIlGi"
            }
         });
    }

    async sendMail(options){
        const {to, subject, emailcontent, ishtml} = options;
        let mailOptions;

        let full_name, email, wa_number;
        try{
            [{full_name, email, wa_number}] = await read.getStudentById(to);
        } catch {
            full_name = "";
            email = to;
            wa_number = "";
        }

        if(ishtml === "html"){
            let newEmailContent = emailcontent.replace(/{{full_name}}/g, full_name).replace(/{{email}}/g, email).replace(/{{wa_number}}/g, wa_number).replace(/{{whatsapp_group_link}}/g,process.env.WHATSAPP_GROUP_LINK);

            mailOptions = {
                from: 'BinzO <project@innentasolutions.com>',
                to: email,
                cc: 'project@innentasolutions.com',
                subject: subject,
                html: newEmailContent
            }
        } else {
            let newEmailContent = emailcontent.replace(/{{full_name}}/g, full_name).replace(/{{email}}/g, email).replace(/{{wa_number}}/g, wa_number).replace(/{{whatsapp_group_link}}/g,process.env.WHATSAPP_GROUP_LINK);

            mailOptions = {
                from: 'BinzO <project@innentasolutions.com>',
                to: email,
                cc: 'project@innentasolutions.com',
                subject: subject,
                text: newEmailContent
            }
        }
        
        try{
            const info = await this.#transporter.sendMail(mailOptions);
            console.log("Send mail:/n", info);
            if(typeof to == 'number'){
                await read.IncrementNumnberOfMails(to);
            }
            return `Sending mail to ${email} success.`;
        } catch (error){
            console.log("Error is Counting When try to send the mail: ", error);
            return `Error is Counting When try to send the mail: ${email}`;
        }
    }
}

module.exports = SendMail;
