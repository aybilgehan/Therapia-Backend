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
            message: "An error occured",
            success: false
        });
    }
}

exports.evaluateResult = async (req, res) => {
    try {
        await Analyze.findOneAndUpdate({ resultId: req.body.resultID }, { $push: { evaluation: { mhpId: req.session.userId, evaluation: req.body.evaluation } } });
        res.status(200).send({ data: null, message: "Result evaluated", success: true });
    } catch (error) {
        console.log(error);
        res.status(400).send({ data: null, message: "An error occured", success: false });
    }
}

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

        Article.create({
            writerId: req.session.userId,
            header: req.body.header,
            content: contentPath,
            image: imagePath
        });
        
        res.status(200).json({ data: { content: contentPath, image: imagePath }, message: "Files uploaded", success: true });
    } catch (error) {
        console.log(error);
        res.status(400).json({ data: null, message: "An error occured", success: false });
    }
}

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

