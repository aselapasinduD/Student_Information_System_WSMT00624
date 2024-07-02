
class MainServer{
    constructor(){
    }
    async sendMail(id){
        const options = {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'access_key': process.env.SERVER_ACCESS_KEY
            },
            body: JSON.stringify({
                "id": id
            })
        }

        try{
            const response = await fetch(process.env.SENDMAIL_API, options);
            return response;
        } catch (error){
            return error;
        }
    }
    // async sendWhastappMsg(to_phonenumber){
    //     const options = {
    //         method: 'POST',
    //         mode: 'cors',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'access_key': process.env.SERVER_ACCESS_KEY
    //         },
    //         body: JSON.stringify({
    //             'to_phonenumber':  to_phonenumber,
    //         })
    //     }

    //     try{
    //         const response = await fetch(process.env.SEND_WHATSPAPP_MSG, options);
    //         return response;
    //     } catch (error) {
    //         return error;
    //     }
    // }
}

module.exports = MainServer;