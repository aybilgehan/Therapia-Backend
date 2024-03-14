exports.checkUserLoggedIn = async(req, res, next) => {
    if (req.session.token) {
        next();
    } else {
        res.status(401).send({ message: "Unauthorized" });
        return;
    }
}

exports.checkUserNotLoggedIn = async(req, res, next) => {
    if (req.session.token) {
        res.status(401).send({ message: "Unauthorized" });
        return;
    } else {
        next();
    }
}