const db = require('./admin/database');

class Update{
    #db;
    constructor(){
        this.#db = db.connection();
    }
    async udpateStudent(student){
        const {id, fullname, email, wanumber, referralwa} = student;
        let result;
        const datetime = new Date();
        const formattedDatetime = datetime.toISOString().replace(/T/, ' ').substr(0, 19);

        console.log(`id: ${id}\nfullname: ${fullname}\nemail: ${email}\nwanumber: ${wanumber}\ndate: ${formattedDatetime}`);

        // Update Students to the Database
        const updateStudentSQL = `UPDATE student SET full_name='${fullname}', email='${email}', wa_number=${parseInt(wanumber)} WHERE id=${id}`;

        try {
            [result] = await this.#db.promise().query(updateStudentSQL);
            console.log('Update Student Is Success\n', result);
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY'){
                console.log("Phone Number Duplicate Error!: ", error.sqlMessage);
                return "Phone Number Duplicate Error!";
            } else {
                if(error.sqlMessage){
                    console.log("Query Exicution Error!: ", error.sqlMessage);
                    return "Query Exicution Error!";
                } else {
                    console.log("Exicution Error!: ", error);
                    return "Exicution Error!";
                }
                
            };
        }

        return "Update Student Is Success.";
    }
}

module.exports= Update;