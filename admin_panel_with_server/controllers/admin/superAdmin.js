const bcrypt = require("bcrypt");
const db = require("./database");

class SuperAdmin{
    #db;
    #superAdminUsername;
    #superAdminPassword;

    constructor(superAdminUsername, superAdminPassword){
        this.#superAdminUsername = superAdminUsername;
        this.#superAdminPassword = superAdminPassword;
    }

    connectDB(){
        this.#db = db.connection();
    }

    // when the system start if superAdmin not exist in the system will create a super admin.
    async initSuperAdmin(db){
        const saltRound = 10;

        if(!this.#superAdminUsername && !this.#superAdminPassword) {
            console.log("You Need to provide the Super Admin username & password in the env variable.");
            return
        }

        const isSuperAdminExistSQL = `SELECT COUNT(id) AS superAdminCount FROM super_admin`;
        const isSuperAdminExist = await db.promise().query(isSuperAdminExistSQL);

        if(isSuperAdminExist[0][0].superAdminCount >= 1){
            console.log("Super admin alread exist.");
            return
        }

        try{
            const salt = await bcrypt.genSalt(saltRound);
            // Hash the password with the salt
            try{
                const hash = await bcrypt.hash(this.#superAdminPassword, salt);
                const addSuperAdminSQL = `INSERT INTO super_admin(username, password) VALUES ('${this.#superAdminUsername}', '${hash}')`;
                db.query(addSuperAdminSQL, (err, result)=>{
                    try{
                        if(err) throw err
                        console.log("Super Admin is created success!\n", result);
                    } catch (error) {
                        console.log("Error while creating the super admin.\n", error);
                    }
                });
            } catch (error) {
                console.log("Error while Hashing the password.\n", error);
            }
        } catch (error){
            console.log("Error while generating salt.\n", error);
        }
    }

    changeUsername(){
        pass
    }
    changePassword(){
        pass
    }
}

module.exports = SuperAdmin;