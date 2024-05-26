require('dotenv').config();
const Users = require('../db.handler/user.model');
const Articles = require('../db.handler/article.model');



/* --------------------- WEBSITESI ISLEMLERI ---------------------*/

/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: Get paginated articles
 *     description: Retrieve a paginated list of articles
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of articles per page
 *     responses:
 *       200:
 *         description: Successfully retrieved articles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       writerId:
 *                         type: string
 *                         format: uuid
 *                       header:
 *                         type: string
 *                       content:
 *                         type: string
 *                       image:
 *                         type: string
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: string
 *                   nullable: true
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 */

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
            message: error,
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
