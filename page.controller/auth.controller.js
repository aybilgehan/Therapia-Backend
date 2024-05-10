require('dotenv').config();
const Users = require('../db.handler/user.model');
const transporter = require('../services/mail.service');
const uuid = require('uuid');

var jwt = require('jsonwebtoken');

var temp_users = [];


setInterval(() => {
    temp_users = temp_users.filter(u => u.date > Date.now() - 5 * 60 * 1000);
}, 1000 * 60 * 3);


exports.verify = async (req, res) => {
    try {
        let user = temp_users.find(u => u.code === req.params["code"] && u.date > Date.now() - 5 * 60 * 1000);
        if (user) {
            const index = temp_users.indexOf(user);
            if (index !== -1) {
                temp_users.splice(index, 1);
            }
            await Users.create({
                email: user.email,
                password: user.password
            });
            res.status(200).send({ message: "User created" });
            return;
        } else {
            res.status(400).send({ message: "Invalid Verification" });
            return;
        }
    } catch (error) {
        res.status(500).send({ message: error });
        return;
    }
}


exports.signup = async (req, res) => {
    try {
        let checkEmail = await Users.findOne({ "email": req.body.email })

        if (temp_users.find(u => u.email === req.body.email)) {
            res.status(400).send({ message: "Verification email already sent" });
            return;
        }

        if (checkEmail) {
            res.status(400).send({ message: "Email already exists" });
            return;
        } else {
            let code = uuid.v4();
            await transporter.sendMail({
                from: process.env.EMAIL,
                to: req.body.email,
                subject: "Therapia Account Verification",
                text: `Please click the link to verify your account: ${process.env.APP_URL}/api/auth/verify/${code}`
            }, (error, info) => {
                if (error) {
                    res.status(500).send({ message: error });
                } else {
                    temp_users.push({
                        email: req.body.email,
                        password: req.body.password,
                        code: code,
                        date: Date.now()
                    });
                    res.status(200).send({ message: "Verification email sent" });
                }
            });
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
            req.session.userId = user._id;
            req.session.role = user.role;
            res.status(200).send({
                data: {
                    user: user.information ? user.information : user.email,
                    role: user.role,
                    token: token
                },
                message: "Success"});
        return;
    }
    } catch (error) {
    res.status(500).send({ data: {}, message: error });
    return;
}
};

exports.logout = async (req, res) => {
    try {
        req.session = null;
        res.status(200).send({ message: "Logged out" });
        return;
    } catch (error) {
        res.status(500).send({ message: error });
        return;
    }
}