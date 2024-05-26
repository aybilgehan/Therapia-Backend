const jwt = require('jsonwebtoken');

// Check if user is logged in then next, if not check if analyze count is exists check is greater than 0 then next,
// if not return register to access unlimited analyze, if analyze count is not exist set it to 3
exports.checkAnalyzeCount = async (req, res, next) => {
    try {
        if (req.session.userId) {
            next();
        } else {
            if (req.session.analyzeCount) {
                if (req.session.analyzeCount > 0) {
                    next();
                } else {
                    res.send({ error: "You have reached the limit of free analyzes, please register to access unlimited analyzes" })
                }
            } else {
                req.session.analyzeCount = 3;
                next();
            }
        }
    } catch (error) {
        res.send({ error: "An error occured" });
    }
}

// Check the text is greater than 100 characters and less than 1000 characters then next, if not return error
exports.checkTextLength = async (req, res, next) => {
    try {
        if (req.body.text.length > 100 && req.body.text.length < 1000) {
            next();
        } else {
            res.status(400).send({ error: "Text length must be greater than 100 and less than 1000 characters" });
        }
    } catch (error) {
        res.status(400).send({ error: error });
    }
}

exports.verifyJWT = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        if (!token) {
            next();
        } else {
            req.session.token = token;
            const verified = jwt.verify(token, process.env.JWT_SECRET);
            req.session.userId = verified.userId;
            req.session.role = verified.role;
            next();
        }
    } catch (error) {
        res.status(401).send({ message: error });
        return;
    }
}   
