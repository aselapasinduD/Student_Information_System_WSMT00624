const db = require('./admin/database');

class Deleted{
    #db;
    constructor(){
        this.#db = db.connection();
    }
}

module.exports= Deleted;