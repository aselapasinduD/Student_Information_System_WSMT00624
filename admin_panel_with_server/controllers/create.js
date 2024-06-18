const db = require('./admin/database');

class Create{
    #db;
    constructor(){
        this.#db = db.connection();
    }
    
    async addStudent(student){
        const {fullname, email, wanumber} = student;
        const datetime = new Date();

        console.log(`fullname: ${fullname}\nemail: ${email}\nwanumber: ${wanumber}\ndate: ${datetime}`);
        // const addStudentSQL = `INSERT INTO student(full_name, email, wa_number, register_at) 
        // VALUES ('${fullname}', '${email}', ${wanumber}, '${datetime}')`;
    }
}

module.exports= Create;