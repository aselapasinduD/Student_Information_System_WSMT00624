const db = require('./admin/database');

/**
 * Handle all the delete funtions from CURD
 * 
 * @since 1.0.0
 */
class Deleted{
    #db;
    constructor(){
        this.#db = db.connection();
    }
    /**
     * This function is for delete list of student or one student.
     * 
     * @param {Array} studentId - Array of student ids 
     * @returns {string} - Success message or Error message
     * @since 1.0.0
     */
    async deleteStudent(studentId){
        const {listofdelete} = studentId;
        let result;

        // console.log(`listofdelete: ${listofdelete.join(",")}`);

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

    /**
     * This function is for delete list of Google Form or one Google Form.
     * 
     * @param {Array} studentId - Array of Google Form ids 
     * @returns {string} - Success message or Error message
     * @since 1.1.0
     */
    async deleteGoogleForm(ids){
        const {listofdelete} = ids;
        let result;

        console.log(`listofdelete: ${listofdelete.join(",")}`);

        // delete Google Form to the Database
        const deleteStudentSQL = `DELETE FROM google_forms_manage WHERE id IN (${listofdelete.join(",")})`;

        try {
            [result] = await this.#db.promise().query(deleteStudentSQL);
            console.log('Deleted Google Form Is Success\n', result);
        } catch (error) {
            if(error.sqlMessage){
                console.log("Query Exicution Error!: ", error.sqlMessage);
                return "Query Exicution Error!";
            } else {
                console.log("Exicution Error!: ", error);
                return "Exicution Error!";
            }
        }

        return "Deleted Google Form Is Success.";
    }
}

module.exports= Deleted;