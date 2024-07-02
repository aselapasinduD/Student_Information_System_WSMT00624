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
            return result;
        } catch (error) {
            console.log("Error While Getting Referral IDs From Database.\n", error);
        }
    }

    async getStudentById(id){
        let result;
        try{
            const getStudentsSQL = `SELECT * FROM student WHERE id = ${id}`;
            [result] = await this.#db.promise().query(getStudentsSQL);
            return result;
        } catch (error) {
            console.log("Error while getting student from database.\n", error);
        }
    }

    async IncrementNumnberOfMails(id) {
        let result;
        const query = `UPDATE student SET number_of_mails = number_of_mails + 1 WHERE id = ${id}`;
        [result] = await this.#db.promise().query(query);
        console.log(result);
    }
}

module.exports= Read;