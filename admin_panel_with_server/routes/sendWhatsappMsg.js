const express = require("express");
const router = express.Router();

const WhatsappMsg = require("../controllers/whatsapp");

const whatsapp = new WhatsappMsg();

router.post('/', async (req, res) => {
    const {to_phonenumber} = req.body;
    const result = await whatsapp.send(to_phonenumber, "hello_world");
    res.status(200).json({isWhatsappMsgSend: result});
});

module.exports = router;