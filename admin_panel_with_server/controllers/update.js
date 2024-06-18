const db = require('./admin/database');

class Update{
    #db;
    constructor(){
        this.#db = db.connection();
    }
}

module.exports= Update;