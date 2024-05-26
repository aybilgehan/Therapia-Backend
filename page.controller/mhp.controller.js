require('dotenv').config();
const Article = require('../db.handler/article.model');
const Analyze = require('../db.handler/analyze.model');
const uuid = require('uuid');
const AWS = require('aws-sdk');
const fs = require('fs');

var jwt = require('jsonwebtoken');

const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
});


/**
 * @swagger
 * mhp/api/results/evaluation:
 *   get:
 *     summary: Get evaluation results
 *     tags: 
 *       - MHP
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
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
 *                       _id:
 *                         type: string
 *                       text:
 *                         type: string
 *                       ownerId:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       result:
 *                         type: number
 *                       evaluationPermission:
 *                         type: boolean
 *                       evaluation:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             mhpId:
 *                               type: string
 *                             evaluation:
 *                               type: number
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
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 */

exports.getEvaluationResults = async (req, res) => {
    try {
        let results = await Analyze.find({ evaluationPermission: true, evaluation: { $not: { $elemMatch: { mhpId: req.session.userId } } } });
        res.status(200).send({
            data: results,
            message: "Results fetched successfully",
            success: true
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            data: null,
            message: "An error occurred",
            success: false
        });
    }
}


/**
 * @swagger
 * mhp/api/results/evaluation:
 *   post:
 *     summary: Evaluate a result
 *     tags: [MHP]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resultID:
 *                 type: string
 *               evaluation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Result evaluated successfully
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
exports.evaluateResult = async (req, res) => {
    try {
        await Analyze.findOneAndUpdate({ resultId: req.body.resultID }, { $push: { evaluation: { mhpId: req.session.userId, evaluation: req.body.evaluation } } });
        res.status(200).send({ data: null, message: "Result evaluated", success: true });
    } catch (error) {
        console.log(error);
        res.status(400).send({ data: null, message: "An error occurred", success: false });
    }
}

/**
 * @swagger
 * mhp/api/upload-article:
 *   post:
 *     summary: Upload an article
 *     tags: [MHP]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               header:
 *                 type: string
 *               content:
 *                 type: string
 *                 format: binary
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Article uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     content:
 *                       type: string
 *                     image:
 *                       type: string
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
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 */
exports.uploadArticle = async (req, res) => {
    try {
        const files = req.files;
        var contentPath;
        var imagePath;

        // Fonksiyonu promise döndüren bir yardımcı fonksiyon
        const uploadFile = async (file) => {
            return new Promise((resolve, reject) => {
                const upload_params = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: file.originalname,
                    Body: fs.createReadStream(file.path),
                    ACL: 'public-read',
                    ContentType: file.mimetype
                };

                s3.upload(upload_params, (err, data) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        if (file.fieldname == "content") {
                            contentPath = data.Location;
                        } else if (file.fieldname == "image") {
                            imagePath = data.Location;
                        }
                        fs.unlinkSync(file.path);
                        resolve();
                    }
                });
            });
        };

        // Dosyaları sırayla yükle ve her yükleme işlemini bekleyerek devam et
        for (const file of Object.values(files)) {
            await uploadFile(file[0]);
        }

        await Article.create({
            writerId: req.session.userId,
            header: req.body.header,
            content: contentPath,
            image: imagePath
        });

        res.status(200).json({ data: { content: contentPath, image: imagePath }, message: "Files uploaded", success: true });
    } catch (error) {
        console.log(error);
        res.status(400).json({ data: null, message: "An error occurred", success: false });
    }
}

/**
 * @swagger
 * /api/mhp/test-upload:
 *   post:
 *     summary: Test file upload
 *     tags: [MHP]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 format: binary
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     content:
 *                       type: string
 *                     image:
 *                       type: string
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
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 */

exports.testUpload = async (req, res) => {
    console.log("geldi")
    try {
        const files = req.files;
        var contentPath;
        var imagePath;

        // Fonksiyonu promise döndüren bir yardımcı fonksiyon
        const uploadFile = async (file) => {
            return new Promise((resolve, reject) => {
                const upload_params = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: file.originalname,
                    Body: fs.createReadStream(file.path),
                    ACL: 'public-read',
                    ContentType: file.mimetype
                };

                s3.upload(upload_params, (err, data) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        if (file.fieldname == "content") {
                            contentPath = data.Location;
                        } else if (file.fieldname == "image") {
                            imagePath = data.Location;
                        }
                        fs.unlinkSync(file.path);
                        resolve();
                    }
                });
            });
        };

        // Dosyaları sırayla yükle ve her yükleme işlemini bekleyerek devam et
        for (const file of Object.values(files)) {
            await uploadFile(file[0]);
        }

        console.log(contentPath, imagePath);

        res.status(200).json({ data: { content: contentPath, image: imagePath }, message: "Files uploaded", success: true });
    } catch (error) {
        console.log(error);
        res.status(400).json({ data: null, message: "An error occured", success: false });
    }
}

