const Auth = (req, res, next) => {
    if(req.session.authenticated){
        console.log("Auth is Success.");
        return next();
    }
    res.status(200).redirect("/admin-login");
}

module.exports = Auth;