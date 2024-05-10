require('dotenv').config();
const Users = require('../db.handler/user.model');
const Articles = require('../db.handler/article.model');



/* --------------------- WEBSITESI ISLEMLERI ---------------------*/

// Get home page
exports.getMainPage = async (req, res, next) => {
    try {
        res.status(200).render("main", {
            user: req.session.user,
            role: req.session.role
        });
    } catch (error) {
        res.send(error);
    }
}

// Get login page
exports.getLoginPage = async (req, res, next) => {
    try {
        res.status(200).render("login");
    } catch (error) {
        res.send(error);
    }
};

exports.postLoginPage = async (req, res, next) => {
    try {
        let user = await Users.findOne({ "email": req.body.email });
        if (!user || user.password != req.body.password) {
            res.render("error", { error: "Invalid username or password", redirect: "/login" })
        } else {
            req.session.userId = user._id;
            req.session.user = user.email;
            req.session.role = user.role;
            res.redirect("/")
        }
    } catch (error) {
        console.log(error);
    }
}

exports.getRegisterPage = async (req, res, next) => {
    try {
        res.status(200).render("register");

    } catch (error) {
        console.log(error);
    }
};

exports.postRegisterPage = async (req, res, next) => {
    try {
        let checkEmail = await Users.findOne({ "email": req.body.email })
        let checkUsername = await Users.findOne({ "username": req.body.username })

        if (checkEmail) {
            res.render("error", { error: "Email has already been registered", redirect: "/register" })
        } else if (checkUsername) {
            res.render("error", { error: "Username has already been registered", redirect: "/register" })
        }
        else {
            await Users.create(req.body);
            res.render("success", { success: "Registration successful", redirect: "/login" })
        }
    } catch (error) {
        console.log(error);
    }
};

exports.getLogoutPage = async (req, res, next) => {
    try {
        req.session = null;
        res.redirect("/");
    } catch (error) {
        console.log(error);
    }
};

// Get Articles by pagination
exports.getArticles = async (req, res, next) => {
    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.params.limit) || 10;

    const startIndex = (page - 1) * limit;

    try {
        results = await Articles.find().sort({ createdAt: -1 }).limit(limit).skip(startIndex).exec();
        res.json(results);
    } catch (error) {
        res.send(error);
    }
}



exports.testArticle = async (req, res, next) => {
    try {
        await Articles.create({
            writerId: req.session.userId,
            header: req.body.header,
            content: req.body.content,
        });
        res.send("Success");
    }
    catch (error) {
        res.send(error);
    }
}
