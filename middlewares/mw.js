exports.checkUserLoggedIn = async(req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect("/");
    }
}

exports.checkUserNotLoggedIn = async(req, res, next) => {
    if (req.session.user) {
        res.redirect("/");
    } else {
        next();
    }
}