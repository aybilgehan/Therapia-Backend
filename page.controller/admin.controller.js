const Application = require('../db.handler/application.model');
const User = require('../db.handler/user.model');

exports.getApplicants = async (req, res) => {
    try {
        let applicants = await Application.find({ approved: { $exists: false } });
        res.status(200).send(applicants);
        return;
    } catch (error) {
        res.status(500).send({ message: error });
        return;
    }
}

exports.approveApplicant = async (req, res) => {
    try {
        await Application.findOneAndUpdate(
            { userId: req.params.id },
            { approved: req.body.approved },
            { new: true }
        );

        await User.findOneAndUpdate(
            { _id: req.params.id },
            { role: "mhp" },
            { new: true }
        );

        res.status(200).send({ message: "Applicant approved" });
    } catch (error) {
        res.status(500).send({ message: error });
    }
}

