class WhatsappMsg{

    constructor(){

    }
    async send(to_phonenumber, template_name){
        const whatsAppCloudApi = `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.WHATSAPP_CLOUD_API_AUTHORIZATION
            },
            body: JSON.stringify({
                "messaging_product": "whatsapp",
                "to": to_phonenumber,
                "type": "template",
                "template": {
                    "name": template_name,
                    "language": {
                        "code": "en_US"
                    }
                }
            })
        }

        const response = await fetch(whatsAppCloudApi, options);
        return response;
    }
}

module.exports = WhatsappMsg;