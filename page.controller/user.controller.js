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

/**
 * @swagger
 * user/api/information:
 *   put:
 *     summary: Update user information
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               information:
 *                 type: object
 *                 description: User information to update
 *             required:
 *               - information
 *     responses:
 *       200:
 *         description: Information updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
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
exports.updateInformation = async (req, res) => {
    try {
        await User.findOneAndUpdate(
            { userId: req.session.userId },
            { information: req.body },
            { new: true }
        );

        res.status(200).send({
            data: req.body,
            message: "Information updated",
            success: true
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            data: null,
            message: "An error occurred",
            success: false
        });
    }
}

/**
 * @swagger
 * user/api/results:
 *   get:
 *     summary: Get analysis results
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Results fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
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
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 */
exports.getResults = async (req, res) => {
    try {
        let results = await Analyze.find({ ownerId: req.session.userId }) || [];
        results = results.map(result => {
            return {
                recordId: result._id,
                text: result.text,
                result: result.result,
                date: result.date,
                evaluationPermission: result.evaluationPermission,
                evaluation: result.evaluation
            }
        });
        res.status(200).send({ data: results, message: "Results fetched successfully", success: true });
    } catch (error) {
        res.status(500).send({ message: error, message: "An error occurred", success: false });
    }
}

/**
 * @swagger
 * user/api/result/{id}:
 *   get:
 *     summary: Get analysis results
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Results fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
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
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 */
exports.getResult = async (req, res) => {
    try {
        let result = await Analyze.findOne({ _id: req.params['id'] });
        res.status(200).send({ 
            data: {
                recordId: result._id,
                text: result.text,
                result: result.result,
                date: result.date,
                evaluationPermission: result.evaluationPermission,
                evaluation: result.evaluation
            }, 
            message: "Result fetched successfully", 
            success: true });
    } catch (error) {
        res.status(500).send({ message: error, message: "An error occurred", success: false });
    }
}
/**
 * @swagger
 * user/api/result/permission/{id}:
 *   put:
 *     summary: Update evaluation permission
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the evaluation to update
 *     responses:
 *       200:
 *         description: Evaluation permission granted
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
exports.updateEvaluationPermission = async (req, res) => {
    try {
        if ( await Analyze.exists({ _id: req.params['id'], evaluationPermission: true } != null)){ 
            res.status(400).send({ data: null, message: "Evaluation permission already granted", success: false });
            return;
        }        
        // check evaluationPermission is not already true
        await Analyze.findOneAndUpdate(
            { _id: req.params['id'], evaluationPermission: false },
            { evaluationPermission: true },
            { new: true }
        );
        res.status(200).send({ data: null, message: "Evaluation permission granted", success: true });
    } catch (error) {
        console.log(error);
        res.status(400).send({ data: null, message: "An error occurred", success: false });
    }
}

/**
 * @swagger
 * user/api/apply:
 *   post:
 *     summary: Apply for professional status
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               information:
 *                 type: string
 *                 description: Information related to the application
 *               file:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               photo:
 *                  type: file
 *             required:
 *               - information
 *               - file
 *               - photo
 *     responses:
 *       200:
 *         description: Application sent successfully
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
exports.applyProfessional = async (req, res) => {
    try {
        console.log("geldi")
        if (await Application.findOne({ userId: req.session.userId })) {
            res.status(400).send({ data: null, message: "Application already sent", success: false });
            return;
        }

        const files = req.files;
        //const photo = req.photo;

/*         if (!files) {
            res.status(400).send({ data: null, message: "No files uploaded", success: false });
            return;
        } */
        var filePaths = [];
        var photoPath;
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
                        if (file.fieldname == "file") {
                            filePaths.push(data.Location);
                        } else if (file.fieldname == "photo") {
                            photoPath = data.Location;
                        }
                        fs.unlinkSync(file.path);
                        resolve();
                    }
                });
            });
        };

/*         for (const file of Object.values(files)) {
            await uploadFile(file);
        } */

        console.log(typeof req.body.information);

        await Application.create({
            userId: req.session.userId,
            information: req.body.information,
            document: filePaths || null,
            photo: photoPath || null
        });

        res.status(200).send({ data: null, message: "Application sent", success: true });

    } catch (error) {
        console.log(error);
        res.status(500).send({ data: null, message: "An error occurred", success: false });
    }
}
