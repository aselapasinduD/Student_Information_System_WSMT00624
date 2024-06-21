
class MainServer{
    constructor(){
    }
    async sendMail(fullname, email){
        const options = {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'access_key': process.env.SERVER_ACCESS_KEY
            },
            body: JSON.stringify({
                'fullname':  fullname,
                'email': email
            })
        }

        try{
            const response = await fetch(process.env.SENDMAIL_API, options);
            return response;
        } catch (error){
            return error;
        }
    }
    async sendWhastappMsg(to_phonenumber){
        const options = {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'access_key': process.env.SERVER_ACCESS_KEY
            },
            body: JSON.stringify({
                'to_phonenumber':  to_phonenumber,
            })
        }

        try{
            const response = await fetch(process.env.SEND_WHATSPAPP_MSG, options);
            return response;
        } catch (error) {
            return error;
        }
    }
}

module.exports = MainServer;