const nodemailer = require('nodemailer');

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
        const {to, subject, text, html = null} = options;
        let mailOptions;

        if(html){
            mailOptions = {
                from: 'Project <project@innentasolutions.com>',
                to: to,
                cc: 'project@innentasolutions.com',
                subject: subject,
                html: html
            }
        } else {
            mailOptions = {
                from: 'Project <project@innentasolutions.com>',
                to: to,
                cc: 'project@innentasolutions.com',
                subject: subject,
                text: text
            }
        }
        
        try{
            const info = await this.#transporter.sendMail(mailOptions);
            console.log("Send mail:/n", info);
            return true
        } catch (error){
            console.log("Error is Counting When try to send the mail: ", error);
            return false
        }
    }
}

module.exports = SendMail;
