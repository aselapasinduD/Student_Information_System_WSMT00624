const db = require('./admin/database');

class Deleted{
    #db;
    constructor(){
        this.#db = db.connection();
    }
    async deleteStudent(studentId){
        const {listofdelete} = studentId;
        let result;

        console.log(`listofdelete: ${listofdelete.join(",")}`);

        // delete Students to the Database
        const deleteStudentSQL = `DELETE FROM student WHERE id IN (${listofdelete.join(",")})`;
        const deleteReferralSQL = `DELETE FROM refers_to WHERE student_id IN (${listofdelete.join(",")})`;
        const deleteRefersStudentSQL = `DELETE FROM refers_to WHERE referral_id IN (${listofdelete.join(",")})`;

        try {
            [result] = await this.#db.promise().query(deleteRefersStudentSQL);
            console.log('Deleted Student Is Success\n', result);
            try {
                [result] = await this.#db.promise().query(deleteReferralSQL);
                console.log('Deleted Student Is Success\n', result);
                try {
                    [result] = await this.#db.promise().query(deleteStudentSQL);
                    console.log('Deleted Student Is Success\n', result);
                } catch (error) {
                    console.log("Query Exicution Error!: ", error.sqlMessage);
                    return "Query Exicution Error!";
                }
            } catch (error) {
                console.log("Query Exicution Error!: ", error.sqlMessage);
                return "Query Exicution Error!";
            }
        } catch (error) {
            if(error.sqlMessage){
                console.log("Query Exicution Error!: ", error.sqlMessage);
                return "Query Exicution Error!";
            } else {
                console.log("Exicution Error!: ", error);
                return "Exicution Error!";
            }
        }

        return "Deleted Student Is Success.";
    }
}

module.exports= Deleted;