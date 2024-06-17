const express = require("express");
const routes = express.Router();

const create = require("../controllers/create");

const create_ = new create();

routes.get("/:access_key", (req,res,next) => {
    const AccessKey = req.params.access_key;

    if(process.env.ACCESS_KEY == AccessKey){
        res.send(`Automation Apis Working fine with user:${process.env.SYSTEM_USER}`);
    } else {
        res.send("user didn't find.");
    }
});

routes.post("/:access_key/student", async (req, res, next) => {
    const AccessKey = req.params.access_key;
    console.log(req.body.student);

    if (process.env.ACCESS_KEY === AccessKey){
        const resluts = await create_.addStudent(req.body.student);
        res.status(200).json({message: "Success!", result: resluts});
        return
    }
    res.status(403).send("You Don't Have Access for this Api.");
});

module.exports = routes;