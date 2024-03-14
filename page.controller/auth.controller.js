require('dotenv').config();
const Users = require('../db.handler/user.model');

var jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    try {
        let checkEmail = await Users.findOne({ "email": req.body.email })

        if (checkEmail) {
            res.status(400).send({ message: "Email already exists" });
            return;
        } else {
            await Users.create(req.body);
            res.status(200).send({ message: "User created" });
            return;
        }
    } catch (error) {
        res.status(500).send({ message: error });
        return;
    }
};

exports.signin = async (req, res) => {
    try {
        let user = await Users.findOne({ "email": req.body.email });
        if (!user || user.password != req.body.password) {
            res.status(401).send({ message: "Invalid username or password" });
            return;
        } else {
            const token = await jwt.sign(
                { userId: user._id }, 
                process.env.JWT_SECRET,
                {
                    algorithm: "HS256",
                    allowInsecureKeySizes: true,
                    expiresIn: 86400,
                });
            req.session.token = token;
            res.status(200).send({ 
                user: user.information ? user.information : user.email,
                role: user.role
             });
            return;
        }
    } catch (error) {
        res.status(500).send({ message: error });
        return;
    }
};

exports.logout = async (req, res) => {
    try {
        req.session.token = null;
        res.status(200).send({ message: "Logged out" });
        return;
    } catch (error) {
        res.status(500).send({ message: error });
        return;
    }
}