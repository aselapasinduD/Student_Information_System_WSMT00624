const db = require('./admin/database');

class Deleted{
    #db;
    constructor(){
        this.#db = db.connection();
    }
    deleteStudent(studentId){
        const {id} = studentId;

        console.log(`id: ${id}`);
    }
}

module.exports= Deleted;