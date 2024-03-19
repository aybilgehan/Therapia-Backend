require('dotenv').config();
const Article = require('../db.handler/article.model');
const uuid = require('uuid');
const AWS = require('aws-sdk');
const fs = require('fs');

var jwt = require('jsonwebtoken');

const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
});

exports.uploadArticle = async (req, res) => {
    const file = req.file;
    const header = req.body.header;

    const upload_params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${req.session.userId}-${file.originalname}`,
        Body: fs.createReadStream(file.path),
        ACL: 'public-read',
        ContentType: file.mimetype
    };

    s3.upload(upload_params, async (err, data) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        await Article.create({
            writerId: req.session.userId,
            header: header,
            content: data.Location
        });

        res.status(200).send({ message: "Article uploaded" });
    });
}

exports.testUpload = async (req, res) => {
    const file = req.file;

    const upload_params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: file.originalname,
        Body: fs.createReadStream(file.path),
        ACL: 'public-read',
        ContentType: file.mimetype
    };

    s3.upload(upload_params, (err, data) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        fs.unlinkSync(file.path);
        res.status(200).send({ message: "File uploaded", url: data.Location });
    });
}
