const Analyze = require('../db.handler/analyze.model');
require('dotenv').config();
const Request = require('request');
const uuid = require('uuid');

/**
 * @swagger
 * analyze/api/analyze:
 *   post:
 *     summary: Analyze text
 *     tags: [Analyze]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Text analyzed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     result:
 *                       type: object
 *                       properties:
 *                        label:
 *                         type: integer
 *                        sentiment:
 *                         type: string
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *       400:
 *         description: An error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: null
 *                 error:
 *                   type: string
 *                 success:
 *                   type: boolean
 */

/**
 * @swagger
 * tags:
 *   name: Analyze
 *   description: Text analysis operations
 */

exports.analyze = async (req, res) => {
    try {
        Request.post({
            url : process.env.ANALYZE_URL,
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify({
                key: "fac5cc77-c065-4c1d-9878-c11acc5e9c30",
                text : req.body.text
            })
        }, async (error, response, body) => {
            if (error) {
                res.status(400).send({error : error});
            }
            body = JSON.parse(body);
            let tempId = uuid.v4();
            await Analyze.create({
                _id: tempId,
                text: req.body.text,
                ownerId: req.session.userId ? req.session.userId : null,
                result: body.result
            });
            body.resultId = tempId;
            res.status(200).send({
                data: body,
                message: "Text analyzed",
                success: true
            });
        });
    } catch (error) {
        res.status(400).send({
            data: null,
            error : error,
            success: false
        });
    }
}

