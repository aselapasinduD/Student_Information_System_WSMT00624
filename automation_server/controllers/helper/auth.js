const Auth = (req,res,next) => {
    if(req.headers.auth == 'false'){
        console.log("Auth Processing");
        const {systemuser, password} = req.headers;
        if(systemuser === process.env.SYSTEM_USER && password === process.env.PASSWORD){
            console.log("Authentication Is Successful");
            req.headers.auth = true;
            next();
        } else {
            console.log("Authentication Is Unsuccessful");
            res.status(401).send("Authentication Unsuccessful");
        }
    } else {
        console.log("Authentication Is Unsuccessful");
        res.status(401).send("Authentication Unsuccessful");
    }
}

module.exports = Auth;