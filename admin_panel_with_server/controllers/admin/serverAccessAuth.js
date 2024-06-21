const serverAccess = (req, res, next) => {
    if(req.headers.access_key = process.env.SERVER_ACCESS_KEY){
        console.log("Server Access is True.");
        return next();
    }
    res.status(403).send("can't connect to the server");
}

module.exports = serverAccess;