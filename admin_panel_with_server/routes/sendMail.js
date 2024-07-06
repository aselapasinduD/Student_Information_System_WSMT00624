const express = require("express");
const fs = require("fs").promises;
const path = require('path');
const router = express.Router();

const SendMail = require("../controllers/mail");

const mailTemplatePath = "../resources/templates/emails";

const Mail = new SendMail();

router.post('/', async (req, res)=>{
    const {id, subject, emailcontent, ishtml} = req.body;
    const result = await Mail.sendMail({to: parseInt(id.split(",")[0]), subject: subject, emailcontent: emailcontent, ishtml: ishtml});
    res.status(200).json({message: result, from: 'Main Server'});
});

router.post('/whenregister', async (req, res)=>{
    const {id, mailtype} = req.body;
    let emailcontent;
    let result;
    switch(mailtype){
        case "Success_Registration":
            const welcomeMail = path.join(__dirname, mailTemplatePath, "welcome_mail.html");
            try{
                emailcontent = await fs.readFile(welcomeMail, 'utf8');
            } catch {
                emailcontent = "<h3>Hi {{full_name}}</h3><br><p>You’re successfully registered for the BinzO Platform.</p><br><p>Join our WhatsApp group to get the Zoom link and updates:<br>WhatsApp Group Link: {{whatsapp_group_link}}</p><br><p>For more information WhatsApp Us -0784151403<br>See you soon!</p>";
            }
            result = await Mail.sendMail({to: id, subject: "Welcome to BinzO Platform!", emailcontent: emailcontent, ishtml: "html"});
            break;
        case "ER_DUP_ENTRY":
            const duplicateNumberErrorMail = path.join(__dirname, mailTemplatePath, "phone_number_duplicate_error.html");
            try{
                emailcontent = await fs.readFile(duplicateNumberErrorMail, 'utf8');
            } catch {
                emailcontent = "<h2>Hi</h2><br><p>The phone number you used for the <strong>BinzO Platform</strong> is registered multiple times.<br>Please confirm or provide a different number.</p><br><p><strong>Thanks!</strong></p>";
            }
            result = await Mail.sendMail({to: id, subject: "Duplicate Phone Number Alert!", emailcontent: emailcontent, ishtml: "html"});
            break;
        default:
            const unknownErrorMail = path.join(__dirname, mailTemplatePath, "unknown_error.html");
            try{
                emailcontent = await fs.readFile(unknownErrorMail, 'utf8');
            } catch {
                emailcontent = "<h2>Hi,</h2><p>We encountered an unknown error with your registration in <strong>BinzO Platform</strong>.<br>Please contact our support team for assistance:</p><p>Email: binzoeducation@gmail.com<br>Phone: 0784151403</p><p>Thank you for your understanding.</p>";
            }
            result = await Mail.sendMail({to: id, subject: "Unknown Error - Please Contact Support", emailcontent: emailcontent, ishtml: "html"});
    }
    res.status(200).json({isMailSend: result});
});

module.exports = router;