require('dotenv').config();
const Users = require('../db.handler/user.model');
const Articles = require('../db.handler/article.model');



/* --------------------- WEBSITESI ISLEMLERI ---------------------*/

// Get Articles by pagination
exports.getArticles = async (req, res, next) => {
    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.params.limit) || 10;

    const startIndex = (page - 1) * limit;

    try {
        results = await Articles.find().sort({ createdAt: -1 }).limit(limit).skip(startIndex).exec();
        res.status(200).send({
            data: results,
            message: "Results fetched successfully",
            success: true
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            data: null,
            message: "An error occured",
            success: false
        });
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
