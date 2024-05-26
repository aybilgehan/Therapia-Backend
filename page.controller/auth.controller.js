require('dotenv').config();
const Users = require('../db.handler/user.model');
const transporter = require('../services/mail.service');
const uuid = require('uuid');

var jwt = require('jsonwebtoken');

var temp_users = [];

// Clear expired temp users
setInterval(() => {
    temp_users = temp_users.filter(u => u.date > Date.now() - 5 * 60 * 1000);
}, 1000 * 60 * 3);

/**
 * @swagger
 * api/auth/verify/{code}:
 *   get:
 *     summary: Verify user account
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Verification code
 *     responses:
 *       200:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Invalid Verification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *       500:
 *         description: An error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 */
exports.verify = async (req, res) => {
    try {
        let user = temp_users.find(u => u.code === req.params["code"] && u.date > Date.now() - 5 * 60 * 1000);
        if (user) {
            const index = temp_users.indexOf(user);
            if (index !== -1) {
                temp_users.splice(index, 1);
            }
            await Users.create({
                _id: uuid.v4(),
                email: user.email,
                password: user.password
            });
            res.status(200).send({ 
                data: null,
                message: "User created",
                success: true
            });
            return;
        } else {
            res.status(400).send({
                data: null,
                message: "Invalid Verification",
                success: false
            });
            return;
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ 
            data: null,
            message: "An error occurred",
            success: false    
        });
        return;
    }
}

/**
 * @swagger
 * api/auth/signup:
 *   post:
 *     summary: Sign up a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Verification email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Email already exists or verification email already sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *       500:
 *         description: An error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 */
exports.signup = async (req, res) => {
    try {
        let checkEmail = await Users.findOne({ "email": req.body.email });

        if (temp_users.find(u => u.email === req.body.email)) {
            res.status(400).send({ 
                data: null,
                message: "Verification email already sent",
                success: true
            });
            return;
        }

        if (checkEmail) {
            res.status(400).send({ 
                data: null,
                message: "Email already exists",
                success: false
            });
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
                    console.log(error)
                    res.status(500).send({
                        data: null,
                        message: "An error occurred",
                        success: false
                    });
                } else {
                    temp_users.push({
                        email: req.body.email,
                        password: req.body.password,
                        code: code,
                        date: Date.now()
                    });
                    res.status(200).send({
                        data: null,
                        message: "Verification email sent",
                        success: true
                    });
                }
            });
            return;
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({
            data: null,
            message: "An error occurred",
            success: false
        });
        return;
    }
};

/**
 * @swagger
 * api/auth/signin:
 *   post:
 *     summary: Sign in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: User logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: string
 *                     role:
 *                       type: string
 *                     token:
 *                       type: string
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Invalid username or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *       500:
 *         description: An error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 */
exports.signin = async (req, res) => {
    try {
        let user = await Users.findOne({ "email": req.body.email });
        if (!user) { res.status(401).send({ data: null, message: "User not found", success: false }); return; }
        if (user.password != req.body.password) {
            res.status(401).send({data: null, message: "Invalid username or password", success: false});
            return;
        } else {
            const token = await jwt.sign(
                {
                    userId: user._id,
                    role: user.role
                },
                process.env.JWT_SECRET,
                {
                    algorithm: "HS256",
                    allowInsecureKeySizes: true,
                    expiresIn: 86400,
                });
            res.status(200).send({
                data: {
                    id: user._id,
                    user: {
                        email: user.email,
                        information: user.information
                    },
                    role: user.role,
                    token: token
                },
                message: "User logged in",
                success: true
            });
            return;
        }
    } catch (error) {
        res.status(500).send({ 
            data: null, 
            message: "An error occurred",
            success: false 
        });
        return;
    }
};

/**
 * @swagger
 * api/auth/logout:
 *   post:
 *     summary: Log out a user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *       500:
 *         description: An error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 */
exports.logout = async (req, res) => {
    try {
        // make token invalid
    
        req.session = null;
        res.status(200).send({ 
            data: null,
            message: "Logged out",
            success: true
        });
        return;
    } catch (error) {
        res.status(500).send({ 
            data: null,
            message: "An error occurred",
            success: false    
        });
        return;
    }
}
