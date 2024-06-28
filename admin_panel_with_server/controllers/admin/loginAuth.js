const AuthLogin = (req, res, next) => {
    if(req.session.authenticated){
        console.log("Auth is Success.");
        return res.status(200).redirect("/admin-panel");
    }
    return next();
}

module.exports = AuthLogin;