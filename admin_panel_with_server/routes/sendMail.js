const express = require("express");
const router = express.Router();

const SendMail = require("../controllers/mail");

const Mail = new SendMail();

router.post('/', async (req, res)=>{
    const {id, subject, emailcontent, ishtml} = req.body;
    console.log(req.body);
    const result = await Mail.sendMail({to: parseInt(id.split(",")[0]), subject: subject, emailcontent: emailcontent, ishtml: ishtml});
    res.status(200).json({message: result, from: 'Main Server'});
});

router.post('/whenregister', async (req, res)=>{
    const {id} = req.body;
    console.log(req.body);
    const emailcontent = "<h1>Hello {{full_name}}</h1>";
    const result = await Mail.sendMail({to: id, subject: "NodeMailer Testing", emailcontent: emailcontent, ishtml: "html"});
    res.status(200).json({isMailSend: result});
});

module.exports = router;