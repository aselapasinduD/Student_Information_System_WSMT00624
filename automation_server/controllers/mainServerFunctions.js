
class MainServer{
    constructor(){
    }
    async sendMail(id, mailtype){
        const options = {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'access_key': process.env.SERVER_ACCESS_KEY
            },
            body: JSON.stringify({
                "id": id,
                "mailtype": mailtype
            })
        }

        try{
            const response = await fetch(process.env.SENDMAIL_API, options);
            return response;
        } catch (error){
            return error;
        }
    }
}

module.exports = MainServer;