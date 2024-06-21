const db = require('./admin/database');

class Update{
    #db;
    constructor(){
        this.#db = db.connection();
    }
    udpateStudent(student){
        const {id, fullname, email, wanumber, referralwa} = student;
        const datetime = new Date();

        console.log(`id: ${id}\nfullname: ${fullname}\nemail: ${email}\nwanumber: ${wanumber}\nreferralwa: ${referralwa}\ndate: ${datetime}`);
    }
}

module.exports= Update;