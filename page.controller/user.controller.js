const User = require('../db.handler/user.model');
const Analyze = require('../db.handler/analyze.model');
const Application = require('../db.handler/application.model');
const fs = require('fs');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
});



exports.updateInformation = async (req, res) => {
    try {
        await User.findOneAndUpdate(
            { userId: req.session.userId },
            { information: JSON(req.body) },
            { new: true }
        );

        res.status(200).send({
            data: JSON(req.body),
            message: "Information updated",
            success: true
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            data: null,
            message: "An error occured",
            success: false
        });
    }
}

exports.getResults = async (req, res) => {
    try {
        let results = await Analyze.findOne({ ownerId: req.session.userId });
        res.status(200).send({ data: results, message: "Results fetched successfully", success: true });
    } catch (error) {
        res.status(500).send({ message: error, message: "An error occured", success: false });
    }
}

exports.updateEvaluationPermission = async (req, res) => {
    try {
        // check evaluationPermission is not already true
        await Analyze.findOneAndUpdate(
            { _id: req.params['id'], evaluationPermission: false },
            { evaluationPermission: true },
            { new: true }
        );
        res.status(200).send({ data: null, message: "Evaluation permission granted", success: true });
    } catch (error) {
        console.log(error);
        res.status(400).send({ data: null, message: "An error occured", success: false });
    }
}

exports.applyProfessional = async (req, res) => {
    try {
        if (await Application.findOne({ userId: req.session.userId })) {
            res.status(400).send({ data: null, message: "Application already sent", success: false });
            return;
        }

        const files = req.files;

        if (!files) {
            res.status(400).send({ data: null, message: "No files uploaded", success: false });
            return;
        }

        var filePaths = [];
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
                    }
                    filePaths.push(data.Location);
                    fs.unlinkSync(file.path);
                    resolve();
                });
            });
        };

        for (const file of Object.values(files)) {
            await uploadFile(file);
        }

        await Application.create({
            userId: req.session.userId,
            information: JSON(req.body.information),
            document: filePaths,
        });

        res.status(200).send({ data: null, message: "Application sent", success: true });

    } catch (error) {
        console.log(error);
        res.status(500).send({ data: null, message: "An error occured", success: false });
    }
}
