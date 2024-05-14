const User = require('../db.handler/user.model');
const Analyze = require('../db.handler/analyze.model');
const Application = require('../db.handler/application.model');


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

exports.apply = async (req, res) => {
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
        files.array.forEach(file => {
            const upload_params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `${req.session.userId}-${file.originalname}`,
                Body: fs.createReadStream(file.path),
                ACL: 'public-read',
                ContentType: file.mimetype
            };
            s3.upload(upload_params, async (err, data) => {
                if (err) {
                    res.status(500).send({data: null, message: "An error occured", success: false});
                    return;
                }
                filePaths.push(data.Location);
            });
        });

        await Application.create({
            userId: req.session.userId,
            information: JSON(req.body.information),
            document: filePaths,
        });

        res.status(200).send({ data: null, message: "Application sent", success: true });
       
    } catch (error) {
        res.status(500).send({ data: null, message: "An error occured", success: false });
    }
}