const nodemailer = require('nodemailer');
const path = require('path');

const Read = require("./read");
const Update = require("../controllers/update");
const ImageProcess = require("./imageProcess");

const read = new Read();
const update = new Update();
const imageProcess = new ImageProcess();

/**
 * Email Send Functions.
 * 
 * @since 1.0.0
 */
class SendMail {
    #transporter;
    #mailUser = process.env.MAIL_USERNAME;
    #ccMail = process.env.MAIL_CC_ADDRESS;
    constructor(){
        this.#transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: process.env.MAIL_SECURE,
            auth: {
                user: this.#mailUser,
                pass: process.env.MAIL_PASSWORD
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
        const {to, subject, emailcontent, ishtml, imagePath, textposition, textsize, texttransform, enableCertificateEmailed} = options;
        let mailOptions;

        let full_name, email, wa_number, waGroupLink;
        try{
            [{full_name, email, wa_number}] = await read.getStudentById(to);
            [{waGroupLink}] = await read.getGoogleFormWhatsappGroupLinkByStudent(to);

            if(enableCertificateEmailed){
                if(enableCertificateEmailed === "on"){
                    const result = await update.udpateStudentStatus({id: to, status: "cm"});
                    // console.log(result);
                }
            }
        } catch {
            full_name = "";
            email = to;
            wa_number = "";
            waGroupLink="";
        }

        if(ishtml === "html"){
            let newEmailContent = emailcontent.replace(/{{full_name}}/g, full_name).replace(/{{email}}/g, email).replace(/{{wa_number}}/g, wa_number).replace(/{{whatsapp_group_link}}/g, waGroupLink );

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
            let newEmailContent = emailcontent.replace(/{{full_name}}/g, full_name).replace(/{{email}}/g, email).replace(/{{wa_number}}/g, wa_number).replace(/{{whatsapp_group_link}}/g, waGroupLink );

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
