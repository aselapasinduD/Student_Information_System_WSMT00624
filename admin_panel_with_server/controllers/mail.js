const nodemailer = require('nodemailer');
const path = require('path');

const Read = require("./read");
const ImageProcess = require("./imageProcess");

const read = new Read();
const imageProcess = new ImageProcess();

/**
 * Email Send Functions.
 * 
 * @since 1.0.0
 */
class SendMail {
    #transporter;
    #hostMail = "mail.innentasolutions.com";
    #mailUser = "admin@innentasolutions.com";
    #mailPort = 587;
    #mailPassword = "yMP@uUf{e7uP";
    #secure = false;
    #ccMail = "admin@innentasolutions.com";
    constructor(){
        this.#transporter = nodemailer.createTransport({
            host: this.#hostMail,
            port: 465,
            secure: true,
            auth: {
                user: this.#mailUser,
                pass: this.#mailPassword
            }
         });
    }

    /**
     * Handle send mail function
     * 
     * @param {Array} options - Array Of Values For Send Emails
     * @returns {String} - Success Message or Error Message
     * @version 1.1.0
     * @since 1.0.0
     */
    async sendMail(options){
        const {to, subject, emailcontent, ishtml, imagePath, textposition, textsize, texttransform} = options;
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

            const cid = "imageid";

            /**
             * Include the Attachment Image in the mail content
             * 
             * @since 1.1.0
             */
            if(imagePath){
                newEmailContent = newEmailContent.replace(/{{image}}/g, `<img src="cid:${cid}" alt="image" />`);
            }

            mailOptions = {
                from: `BinzO <${this.#mailUser}>`,
                to: email,
                cc: this.#ccMail,
                subject: subject,
                html: newEmailContent
            }

            /**
             * Handle Image Attachment
             * 
             * @since 1.1.0
             */
            if(imagePath){
                const imageBuffer = await imageProcess.addName( full_name, path.join(__dirname, "../" , imagePath), textposition, textsize, texttransform);
                mailOptions.attachments =  [
                                                {
                                                    filename: 'certificate.jpg',
                                                    content: imageBuffer,
                                                    cid: cid
                                                }
                                            ];
            }
        } else {
            let newEmailContent = emailcontent.replace(/{{full_name}}/g, full_name).replace(/{{email}}/g, email).replace(/{{wa_number}}/g, wa_number).replace(/{{whatsapp_group_link}}/g,process.env.WHATSAPP_GROUP_LINK);

            mailOptions = {
                from: `BinzO <${this.#mailUser}>`,
                to: email,
                cc: this.#ccMail,
                subject: subject,
                text: newEmailContent
            }

            /**
             * Handle Image Attachment
             * 
             * @since 1.1.0
             */
            if(imagePath){
                const imageBuffer = await imageProcess.addName( full_name, path.join(__dirname, "../" , imagePath), textposition, textsize, texttransform);
                mailOptions.attachments =  [
                                                {
                                                    filename: 'certificate.jpg',
                                                    content: imageBuffer,
                                                }
                                            ];
            }
        }
        
        try{
            const info = await this.#transporter.sendMail(mailOptions);
            // console.log("Send mail:/n", info);
            if(typeof to == 'number'){
                await read.IncrementNumnberOfMails(to);
            }
            return  {error: false , message:`Sending mail to ${email} success.`};
        } catch (error){
            console.log("Error is Counting When try to send the mail: ", error);
            return {error: true , message: `Error is Counting When try to send the mail: ${email}`};
        }
    }
}

module.exports = SendMail;
