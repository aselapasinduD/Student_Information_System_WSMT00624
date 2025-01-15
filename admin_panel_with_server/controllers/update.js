const db = require('./admin/database');
const Read = require('./read');

const read = new Read();

/**
 * Handle all the update funtions from CURD
 * 
 * @version 1.1.0
 * @since 1.0.0
 */
class Update{
    #db;
    constructor(){
        this.#db = db.connection();
    }
    async udpateStudent(student){
        const {id, fullname, email, wanumber, address, googleForm, receiptLink} = student;
        let result;
        const datetime = new Date();
        const formattedDatetime = datetime.toISOString().replace(/T/, ' ').substr(0, 19);

        // console.log(`id: ${id}\nfullname: ${fullname}\nemail: ${email}\nwanumber: ${wanumber}\ndate: ${formattedDatetime}`);

        // Update Students to the Database
        const updateStudentSQL = `UPDATE student SET full_name='${fullname}', email='${email}', wa_number=${parseInt(wanumber)}, address='${address}', google_form_id=${parseInt(googleForm)}, receiptURL='${receiptLink}' WHERE id=${id}`;

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
    async udpateStudentDetailsCheck(request){
        const {stduentID, status} = request;
        let result;

        const query = `UPDATE student SET isDetailsChecked = IF(ISNULL(isDetailsChecked), ?, NOT isDetailsChecked) WHERE id=?`;

        try {
            [result] = await this.#db.promise().query(query,[status, stduentID]);
            console.log('Check Student Details Success\n', result);
        } catch (error) {
            if(error.sqlMessage){
                console.log("Query Exicution Error!: ", error.sqlMessage);
                return "Query Exicution Error!";
            } else {
                console.log("Exicution Error!: ", error);
                return "Exicution Error!";
            }
        }
        return "Check Student Details Success.";
    }

    /**
     * Funtion for update Student Status.
     * 
     * @param {*} statuses 
     * @returns 
     * @since 1.1.0
     */
    async udpateStudentStatus(statuses){
        const {id, status} = statuses;
        let result;
        let updateStatusSQL;

        // Update Student Status to the Database
        const [{currentStatus}] = await read.getStudentStatus(id);
        if(currentStatus){
            const currentStatusList = JSON.parse(currentStatus);
            if(!currentStatusList.includes(status)){
                currentStatusList.push(status);
                // console.log(currentStatusList);
                updateStatusSQL = `UPDATE student SET status='${JSON.stringify(currentStatusList)}' WHERE id=${id}`;
            }
        } else {
            // console.log(currentStatus);
            updateStatusSQL = `UPDATE student SET status='${JSON.stringify([status])}' WHERE id=${id}`;
        }

        if(updateStatusSQL){
            try {
                [result] = await this.#db.promise().query(updateStatusSQL);
                console.log('Update Student Status Is Success\n', result);
                return "Update student status is success.";
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
        }

        return "Already Have That Status.";
    }

    /**
     * 
     * @param {array} GoogleForm - Array of edited details
     * @returns {string} - Success message or error message
     * @since 1.1.0
     */
    async udpateGoogleForm(GoogleForm){
        const {id, title, color, whatsappGroupLink, hasReferral, hasAddress, canUploadaReceipt} = GoogleForm;
        let result;
        
        // console.log(`id: ${id}\nfullname: ${fullname}\nemail: ${email}\nwanumber: ${wanumber}\ndate: ${formattedDatetime}`);

        // Update Students to the Database
        const updateStudentSQL = `UPDATE google_forms_manage SET 
                                    title=?
                                    , color=?
                                    ${whatsappGroupLink ? ", whatsapp_group_link=?" : ""}
                                    , isReferralHas=?
                                    , isAddressHas=?
                                    , canUploadaReceipt=?
                                  WHERE id=${id}`;

        const values = [title, color];
        if (whatsappGroupLink) values.push(whatsappGroupLink);
        hasReferral? values.push(true) : values.push(false);
        hasAddress? values.push(true) : values.push(false);
        canUploadaReceipt? values.push(true) : values.push(false);

        try {
            [result] = await this.#db.promise().query(updateStudentSQL, values);
            console.log('Update Google From Is Success\n', result);
        } catch (error) {
            if(error.sqlMessage){
                console.log("Query Exicution Error!: ", error.sqlMessage);
                return "Query Exicution Error!";
            } else {
                console.log("Exicution Error!: ", error);
                return "Exicution Error!";
            }
        }
        return "Update Google From Is Success.";
    }
}

module.exports= Update;