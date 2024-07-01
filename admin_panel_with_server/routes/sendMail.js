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
    const {fullname, email} = req.body;
    console.log(req.body);
    const result = await Mail.sendMail({to: email, subject: "NodeMailer Testing", text: "Mail Content.", html: `<h1>Hello ${fullname}!</h1>`});
    res.status(200).json({isMailSend: result});
});

module.exports = router;