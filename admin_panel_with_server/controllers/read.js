const db = require('./admin/database');

class Read{
    #db;
    constructor(){
        this.#db = db.connection();
    }

    async getStudents(){
        let result;
        try{
            const getStudentsSQL = `SELECT * FROM student`;
            [result] = await this.#db.promise().query(getStudentsSQL);
            console.log("Showing Students\n");
            return result;
        } catch (error) {
            console.log("Error While Getting Student From Database.\n", error);
        }
    }
    async getReferralStudents(id){
        let result;
        try{
            const getStudentsSQL = `SELECT student.* FROM student JOIN refers_to ON student.id = refers_to.student_id WHERE refers_to.referral_id = ${id}`;
            [result] = await this.#db.promise().query(getStudentsSQL);
            // console.log("Showing referral IDs\n");
            return result;
        } catch (error) {
            console.log("Error While Getting Referral IDs From Database.\n", error);
        }
    }
}

module.exports= Read;