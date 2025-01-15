const db = require('./admin/database');

/**
 * Handle all the read funtions from CURD
 * 
 * @since 1.0.0
 */
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
    /**
     * Get student status function
     * 
     * @returns {object} - student Status
     * @since 1.1.0
     */
    async getStudentStatus(id){
        let result;
        try{
            const getStudentsSQL = `SELECT status AS currentStatus FROM student WHERE id=${id}`;
            [result] = await this.#db.promise().query(getStudentsSQL);
            return result;
        } catch (error) {
            console.log("Error While Getting Student Status From Database.\n", error);
        }
    }

    /**
     * Google Form Read Functions.
     * 
     * @returns {string} - Success Message
     * @since 1.1.0
     */
    async getGoogleForms(){
        let result;
        try{
            const getStudentsSQL = `SELECT * FROM google_forms_manage`;
            [result] = await this.#db.promise().query(getStudentsSQL);
            return result;
        } catch (error) {
            const message = "Error While Getting Google Forms From Database.\n" + error
            console.log(message);
            result = message;
        }
        return result;
    }
    async getGoogleFormsTitles(){
        let result;
        try{
            const getStudentsSQL = `SELECT id, title FROM google_forms_manage`;
            [result] = await this.#db.promise().query(getStudentsSQL);
            return result;
        } catch (error) {
            const message = "Error While Getting Google Forms From Database.\n" + error
            console.log(message);
            result = message;
        }
        return result;
    }
    async getGoogleFormsColor(id){
        let result;
        try{
            const getStudentsSQL = `SELECT G.color FROM student AS S JOIN google_forms_manage AS G ON G.id = S.google_form_id WHERE S.id = ${id}`;
            [result] = await this.#db.promise().query(getStudentsSQL);
            if(!result[0].color){
                return false;
            }
            return result[0].color;
        } catch (error) {
            console.log("Error While Getting Google From Database.\n", error);
        }
    }
    async getGoogleFormSlug(id){
        let result;
        try{
            const getStudentsSQL = `SELECT * FROM google_forms_manage WHERE id=${id}`;
            [result] = await this.#db.promise().query(getStudentsSQL);
            return result[0].slug;
        } catch (error) {
            const message = "Error While Getting Google Form Slug From Database.\n" + error
            console.log(message);
            result = message;
        }
        return result;
    }
    async getGoogleFormWhatsappGroupLinkByStudent(id){
        let result;
        try{
            const getStudentsSQL = `SELECT g.whatsapp_group_link AS waGroupLink FROM student AS s JOIN google_forms_manage AS g ON g.id = s.google_form_id WHERE s.id=${id}`;
            [result] = await this.#db.promise().query(getStudentsSQL);
            return result;
        } catch (error) {
            const message = "Error While Getting Google Form Slug From Database.\n" + error
            console.log(message);
            result = message;
        }
        return result;
    }
}

module.exports= Read;