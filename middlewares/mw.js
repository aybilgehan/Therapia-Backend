const jwt = require('jsonwebtoken');
require('dotenv').config();


exports.checkUserLoggedIn = async (req, res, next) => {
    if (req.session.token) {
        next();
    } else {
        res.status(401).send({ message: "Unauthorized" });
        return;
    }
}

exports.checkUserNotLoggedIn = async (req, res, next) => {
    if (!req.session.token) {
        res.status(401).send({ message: "Unauthorized" });
        return;
    } else {
        next();
    }
}

exports.checkIsAdmin = async (req, res, next) => {
    if (req.session.role == "admin") {
        next();
    } else {
        res.status(401).send({ message: "Unauthorized" });
        return;
    }
}

exports.checkIsMHP = async (req, res, next) => {
    if (req.session.role == "mhp") {
        next();
    } else {
        res.status(401).send({ message: "Unauthorized" });
        return;
    }
}

exports.checkIsUser = async (req, res, next) => {
    if (req.session.role == "user") {
        next();
    } else {
        res.status(401).send({ message: "Unauthorized" });
        return;
    }
}

exports.verifyJWT = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        if (!token) {
            res.status(401).send({ message: "Unauthorized" });
            return;
        }
        req.session.token = token;
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.session.userId = verified.userId;
        req.session.role = verified.role;
        next();
    } catch (error) {
        res.status(401).send({ message: "Unauthorized" });
        return;
    }
}   
