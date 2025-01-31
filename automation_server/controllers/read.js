const db_connection = require("./helper/database");

/**
 * Handle all the read funtions from CURD
 * 
 * @since 1.0.2
 */
class Read {
    #db;
    constructor() {
        this.#db = db_connection();
    }

    async getGoogleFormFromSlug(slug) {
        let result;
        try {
            const getStudentsSQL = `SELECT id, isAddressHas, isReferralHas, canUploadaReceipt  FROM google_forms_manage WHERE slug='${slug}'`;
            [result] = await this.#db.promise().query(getStudentsSQL);
            return { error: false, result: result };
        } catch (error) {
            const message = "Error While Getting Google Forms From Database.\n" + error;
            console.log(message);
            return { error: true, result: message };
        }
    }
}

module.exports = Read;
