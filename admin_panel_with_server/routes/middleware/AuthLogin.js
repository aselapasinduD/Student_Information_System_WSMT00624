const bcrypt = require("bcrypt");

const db = require("../../controllers/admin/database");

const AuthLogin = async (login_username, login_password) => {
    if(login_username && login_password){
        const getSuperAdminSQL = `SELECT username, password FROM super_admin`;
        const getSuperAdmin = await db.connection().promise().query(getSuperAdminSQL)
        const {username, password} = getSuperAdmin[0][0];
        
        if(login_username === username){
            const isPasswordCorrect = await bcrypt.compare(login_password, password);
            if(isPasswordCorrect) {
                return true;
            }
            return false;
        } else {
            return false;
        }
    }
}

module.exports = AuthLogin;