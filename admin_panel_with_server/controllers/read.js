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
    async getReferralIDs(){
        let result;
        try{
            const getStudentsSQL = `SELECT * FROM refers_to`;
            [result] = await this.#db.promise().query(getStudentsSQL);
            console.log("Showing referral IDs\n");
            return result;
        } catch (error) {
            console.log("Error While Getting Referral IDs From Database.\n", error);
        }
    }
}

module.exports= Read;